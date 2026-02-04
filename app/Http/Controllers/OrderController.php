<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Table;
use App\Models\Bill;
use App\Models\OrderNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['table', 'orderItems.menuItem', 'bill']);
        
        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->byStatus($request->status);
        }
        
        // Filter by table
        if ($request->has('table_id') && $request->table_id) {
            $query->where('table_id', $request->table_id);
        }
        
        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('order_time', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('order_time', '<=', $request->date_to);
        }
        
        $orders = $query->orderBy('order_time', 'desc')->paginate(20);
        $tables = Table::where('is_active', true)->get();
        
        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'tables' => $tables,
            'filters' => $request->only(['status', 'table_id', 'date_from', 'date_to']),
        ]);
    }

    public function create()
    {
        $tables = Table::where('is_active', true)->get();
        $menuItems = MenuItem::available()->get();
        
        // Group menu items by category
        $menuItemsByCategory = $menuItems->groupBy('category');
        
        // Get table status information
        $tablesWithStatus = $tables->map(function ($table) {
            // Check if table has active orders
            $activeOrder = Order::where('table_id', $table->id)
                ->active()
                ->first();
            
            return [
                'id' => $table->id,
                'table_number' => $table->table_number,
                'name' => $table->name,
                'capacity' => $table->capacity,
                'status' => $table->status,
                'has_active_order' => $activeOrder !== null,
                'active_order' => $activeOrder ? [
                    'id' => $activeOrder->id,
                    'order_number' => $activeOrder->order_number,
                    'status' => $activeOrder->status,
                ] : null,
            ];
        });
        
        return Inertia::render('Orders/Create', [
            'tables' => $tablesWithStatus,
            'menuItemsByCategory' => $menuItemsByCategory,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id' => 'required|exists:tables,id',
            'priority' => 'required|in:low,normal,high',
            'special_instructions' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.special_instructions' => 'nullable|string',
        ]);

        // Handle camelCase to snake_case conversion for frontend compatibility
        $validated['special_instructions'] = $validated['special_instructions'] ?? null;
        
        // Convert items array special_instructions from camelCase to snake_case
        if (isset($validated['items'])) {
            $validated['items'] = array_map(function ($item) {
                $item['special_instructions'] = $item['special_instructions'] ?? null;
                return $item;
            }, $validated['items']);
        }

        $table = Table::findOrFail($validated['table_id']);
        
        // Check if table has active orders
        $activeOrder = Order::where('table_id', $table->id)
            ->active()
            ->first();
            
        if ($activeOrder) {
            return back()->with('error', 'Table already has an active order.');
        }

        $order = Order::create([
            'table_id' => $validated['table_id'],
            'priority' => $validated['priority'],
            'special_instructions' => $validated['special_instructions'],
            'status' => 'pending',
            'subtotal' => 0,
            'tax_amount' => 0,
            'total_amount' => 0,
            'discount_amount' => 0,
            'created_by' => auth()->id(),
        ]);

        // Create order items
        foreach ($validated['items'] as $item) {
            $menuItem = MenuItem::findOrFail($item['menu_item_id']);
            $totalPrice = $menuItem->price * $item['quantity'];
            
            OrderItem::create([
                'order_id' => $order->id,
                'menu_item_id' => $item['menu_item_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $menuItem->price,
                'total_price' => $totalPrice,
                'subtotal' => $totalPrice,
                'special_instructions' => $item['special_instructions'] ?? null,
            ]);
        }

        // Update order totals
        $order->updateTotals();

        // Update table status
        $table->status = 'occupied';
        $table->has_active_order = true;
        $table->save();

        // Send notifications to kitchen and reception
        OrderNotification::notifyNewOrder($order);

        return redirect()->route('orders.show', $order)
            ->with('success', 'Order created successfully.');
    }

    public function show(Order $order)
    {
        $order->load(['table', 'orderItems.menuItem', 'bill']);
        
        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    public function edit(Order $order)
    {
        $order->load(['table', 'orderItems.menuItem']);
        $tables = Table::where('is_active', true)->get();
        $menuItems = MenuItem::available()->get();
        $menuItemsByCategory = $menuItems->groupBy('category');
        
        return Inertia::render('Orders/Edit', [
            'order' => $order,
            'tables' => $tables,
            'menuItemsByCategory' => $menuItemsByCategory,
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,served,completed,cancelled',
            'priority' => 'required|in:low,normal,high',
            'special_instructions' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.special_instructions' => 'nullable|string',
        ]);

        // Only allow item modification if order is still pending
        if ($order->status === 'pending' && isset($validated['items'])) {
            // Delete existing order items
            $order->orderItems()->delete();
            
            // Create new order items
            foreach ($validated['items'] as $item) {
                $menuItem = MenuItem::findOrFail($item['menu_item_id']);
                $totalPrice = $menuItem->price * $item['quantity'];
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $menuItem->price,
                    'total_price' => $totalPrice,
                    'subtotal' => $totalPrice,
                    'special_instructions' => $item['special_instructions'] ?? null,
                ]);
            }
            
            // Update order totals
            $order->updateTotals();
        }

        // Update order basic info
        $order->update([
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'special_instructions' => $validated['special_instructions'],
        ]);

        // Set timestamps based on status
        if ($validated['status'] === 'ready' && !$order->ready_time) {
            $order->ready_time = now();
            $order->save();
        }
        
        if ($validated['status'] === 'served' && !$order->served_time) {
            $order->served_time = now();
            $order->save();
        }

        return redirect()->route('orders.show', $order)
            ->with('success', 'Order updated successfully.');
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return redirect()->route('orders.index')
            ->with('success', 'Order deleted successfully.');
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,served,completed,cancelled',
        ]);

        $oldStatus = $order->status;
        $order->status = $validated['status'];
        
        if ($validated['status'] === 'ready' && !$order->ready_time) {
            $order->ready_time = now();
        }
        
        if ($validated['status'] === 'served' && !$order->served_time) {
            $order->served_time = now();
        }
        
        $order->save();

        // Create notification for status change
        OrderNotification::notifyStatusChange($order, $oldStatus, $validated['status']);
        
        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'order' => $order->fresh(['table', 'createdBy']),
        ]);
    }

    public function generateBill(Order $order)
    {
        if ($order->bill) {
            return back()->with('error', 'Bill already exists for this order.');
        }

        // Get active tax rate from TaxSetting
        $activeTax = \App\Models\TaxSetting::getActive();
        $serviceChargeRate = $activeTax ? ($activeTax->type === 'free' ? 0 : (float) $activeTax->tax_rate / 100) : 0.1;

        $bill = Bill::create([
            'order_id' => $order->id,
            'table_id' => $order->table_id,
            'subtotal' => $order->subtotal,
            'tax_amount' => $order->tax_amount,
            'service_charge' => (string) ((float) $order->subtotal * $serviceChargeRate),
            'discount_amount' => $order->discount_amount,
            'total_amount' => (string) ((float) $order->subtotal + (float) $order->tax_amount + ((float) $order->subtotal * $serviceChargeRate) - (float) $order->discount_amount),
            'payment_status' => 'pending',
        ]);

        return redirect()->route('bills.show', $bill)
            ->with('success', 'Bill generated successfully.');
    }
}
