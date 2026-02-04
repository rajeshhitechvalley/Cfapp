<?php

namespace App\Http\Controllers;

use App\Models\Table;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\TaxSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class QuickTableBookController extends Controller
{
    /**
     * Display the quick table booking interface
     */
    public function index()
    {
        $tables = Table::with(['tableType', 'orders' => function($query) {
            $query->where('status', '!=', 'completed')
                  ->orderBy('created_at', 'desc');
        }])
        ->where('is_active', true)
        ->orderBy('table_number')
        ->get();

        $menuItems = MenuItem::where('is_available', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->groupBy('category');

        $taxSetting = TaxSetting::where('is_active', true)->first();

        // Load advanced data
        $menuCombos = \App\Models\MenuCombo::with('combo_items.menu_item')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $promotions = \App\Models\Promotion::where('is_active', true)
            ->where('start_time', '<=', now())
            ->where('end_time', '>=', now())
            ->get();

        $reservations = \App\Models\TableReservation::with('table')
            ->where('reservation_time', '>=', now())
            ->whereIn('status', ['pending', 'confirmed'])
            ->orderBy('reservation_time')
            ->get();

        return Inertia::render('QuickTableBook/Index', [
            'tables' => $tables,
            'menuItems' => $menuItems,
            'menuCombos' => $menuCombos,
            'promotions' => $promotions,
            'taxSetting' => $taxSetting,
            'reservations' => $reservations,
        ]);
    }

    /**
     * Book a table for customers
     */
    public function bookTable(Request $request, Table $table): JsonResponse
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'number_of_guests' => 'required|integer|min:1|max:' . $table->capacity,
            'special_requests' => 'nullable|string|max:1000',
            'estimated_duration' => 'nullable|integer|min:30|max:240',
        ]);

        try {
            DB::beginTransaction();

            if ($table->status !== 'available') {
                return response()->json([
                    'success' => false,
                    'message' => 'Table is not available for booking',
                ], 422);
            }

            $table->update([
                'status' => 'reserved',
                'description' => $request->special_requests,
            ]);

            $order = $table->orders()->create([
                'order_number' => 'BOOK-' . time() . '-' . $table->id,
                'status' => 'pending',
                'priority' => 'normal',
                'order_time' => now(),
                'created_by' => auth()->id(),
                'subtotal' => 0,
                'tax_amount' => 0,
                'total_amount' => 0,
                'special_instructions' => "Customer: {$request->customer_name}\n" .
                                       "Phone: {$request->customer_phone}\n" .
                                       "Email: {$request->customer_email}\n" .
                                       "Guests: {$request->number_of_guests}\n" .
                                       "Duration: {$request->estimated_duration} minutes\n" .
                                       "Requests: {$request->special_requests}",
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Table booked successfully',
                'table' => $table->fresh(),
                'order' => $order->load('orderItems'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to book table: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Release a reserved table
     */
    public function releaseTable(Table $table): JsonResponse
    {
        try {
            DB::beginTransaction();

            if ($table->status !== 'reserved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Table is not reserved',
                ], 422);
            }

            $hasActiveOrders = $table->orders()
                ->where('status', '!=', 'completed')
                ->exists();

            if ($hasActiveOrders) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot release table with active orders',
                ], 422);
            }

            $table->update(['status' => 'available']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Table released successfully',
                'table' => $table->fresh(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to release table: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get table details with current orders
     */
    public function getTableDetails(Table $table): JsonResponse
    {
        $table->load(['orders' => function($query) {
            $query->with('orderItems.menuItem')
                  ->where('status', '!=', 'completed')
                  ->orderBy('created_at', 'desc');
        }, 'tableType']);

        $currentOrder = $table->orders()
            ->where(function($query) {
                $query->where('status', 'pending')
                      ->orWhere('status', 'preparing')
                      ->orWhere('status', 'ready');
            })
            ->first();

        return response()->json([
            'table' => $table,
            'currentOrder' => $currentOrder,
        ]);
    }

    /**
     * Add multiple items to table's current order (bulk add)
     */
    public function addMultipleItemsToTable(Request $request, Table $table): JsonResponse
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.special_instructions' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $order = $table->orders()
                ->where(function($query) {
                    $query->where('status', 'pending')
                          ->orWhere('status', 'preparing');
                })
                ->first();

            if (!$order) {
                $order = $table->orders()->create([
                    'order_number' => 'ORD-' . time() . '-' . $table->id,
                    'status' => 'pending',
                    'priority' => 'normal',
                    'order_time' => now(),
                    'created_by' => auth()->id(),
                    'subtotal' => 0,
                    'tax_amount' => 0,
                    'total_amount' => 0,
                ]);
            }

            $addedItems = [];
            foreach ($request->items as $itemData) {
                $menuItem = MenuItem::findOrFail($itemData['menu_item_id']);
                
                $existingItem = $order->orderItems()
                    ->where('menu_item_id', $itemData['menu_item_id'])
                    ->where('special_instructions', $itemData['special_instructions'] ?? '')
                    ->first();

                if ($existingItem) {
                    $existingItem->update([
                        'quantity' => $existingItem->quantity + $itemData['quantity'],
                        'total_price' => ($existingItem->quantity + $itemData['quantity']) * $menuItem->price,
                        'subtotal' => ($existingItem->quantity + $itemData['quantity']) * $menuItem->price,
                    ]);
                    $addedItems[] = $existingItem->load('menuItem');
                } else {
                    $orderItem = $order->orderItems()->create([
                        'menu_item_id' => $itemData['menu_item_id'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $menuItem->price,
                        'special_instructions' => $itemData['special_instructions'] ?? null,
                        'total_price' => $menuItem->price * $itemData['quantity'],
                        'subtotal' => $menuItem->price * $itemData['quantity'],
                    ]);
                    $addedItems[] = $orderItem->load('menuItem');
                }
            }

            $this->updateOrderTotals($order);

            if ($table->status === 'available') {
                $table->update(['status' => 'occupied']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($request->items) . ' items added successfully',
                'addedItems' => $addedItems,
                'order' => $order->load('orderItems.menuItem'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add items: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add item to table's current order (single item - enhanced)
     */
    public function addItemToTable(Request $request, Table $table): JsonResponse
    {
        $request->validate([
            'menu_item_id' => 'required|exists:menu_items,id',
            'quantity' => 'required|integer|min:1',
            'special_instructions' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            if (!in_array($table->status, ['available', 'occupied'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Table is not available for ordering',
                ], 422);
            }

            $order = $table->orders()
                ->where(function($query) {
                    $query->where('status', 'pending')
                          ->orWhere('status', 'preparing');
                })
                ->first();

            if (!$order) {
                $order = $table->orders()->create([
                    'order_number' => 'ORD-' . time() . '-' . $table->id,
                    'status' => 'pending',
                    'priority' => 'normal',
                    'order_time' => now(),
                    'created_by' => auth()->id(),
                    'subtotal' => 0,
                    'tax_amount' => 0,
                    'total_amount' => 0,
                ]);
            }

            $menuItem = MenuItem::findOrFail($request->menu_item_id);
            
            $existingItem = $order->orderItems()
                ->where('menu_item_id', $request->menu_item_id)
                ->where('special_instructions', $request->special_instructions ?? '')
                ->first();

            if ($existingItem) {
                $existingItem->update([
                    'quantity' => $existingItem->quantity + $request->quantity,
                    'total_price' => ($existingItem->quantity + $request->quantity) * $menuItem->price,
                    'subtotal' => ($existingItem->quantity + $request->quantity) * $menuItem->price,
                ]);
                $orderItem = $existingItem;
            } else {
                $orderItem = $order->orderItems()->create([
                    'menu_item_id' => $request->menu_item_id,
                    'quantity' => $request->quantity,
                    'unit_price' => $menuItem->price,
                    'special_instructions' => $request->special_instructions,
                    'total_price' => $menuItem->price * $request->quantity,
                    'subtotal' => $menuItem->price * $request->quantity,
                ]);
            }

            $this->updateOrderTotals($order);

            if ($table->status === 'available') {
                $table->update(['status' => 'occupied']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Item added to table successfully',
                'orderItem' => $orderItem->load('menuItem'),
                'order' => $order->load('orderItems.menuItem'),
                'table' => $table->fresh(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove item from table's order
     */
    public function removeItemFromTable(OrderItem $orderItem): JsonResponse
    {
        try {
            DB::beginTransaction();

            $order = $orderItem->order;
            $orderItem->delete();

            $this->updateOrderTotals($order);

            if ($order->orderItems()->count() === 0) {
                $table = $order->table;
                $order->delete();
                
                $hasOtherOrders = $table->orders()
                    ->where('status', '!=', 'completed')
                    ->exists();
                
                if (!$hasOtherOrders) {
                    $table->update(['status' => 'available']);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Item removed successfully',
                'order' => $order->load('orderItems.menuItem'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update item quantity
     */
    public function updateItemQuantity(Request $request, OrderItem $orderItem): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $orderItem->update([
                'quantity' => $request->quantity,
                'total_price' => $orderItem->unit_price * $request->quantity,
                'subtotal' => $orderItem->unit_price * $request->quantity,
            ]);

            $this->updateOrderTotals($orderItem->order);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Quantity updated successfully',
                'orderItem' => $orderItem->load('menuItem'),
                'order' => $orderItem->order->load('orderItems.menuItem'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update quantity: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Submit order to kitchen
     */
    public function submitOrderToKitchen(Order $order): JsonResponse
    {
        try {
            $order->update([
                'status' => 'preparing',
                'ready_time' => now()->addMinutes(15),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order submitted to kitchen successfully',
                'order' => $order->load('orderItems.menuItem'),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete order and clear table
     */
    public function completeOrder(Order $order): JsonResponse
    {
        try {
            DB::beginTransaction();

            $order->update([
                'status' => 'completed',
                'served_time' => now(),
            ]);

            $table = $order->table;
            $hasOtherOrders = $table->orders()
                ->where('status', '!=', 'completed')
                ->exists();
            
            if (!$hasOtherOrders) {
                $table->update(['status' => 'available']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order completed successfully',
                'table' => $table->fresh(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update order totals
     */
    private function updateOrderTotals(Order $order): void
    {
        $subtotal = $order->orderItems()->sum('total_price');
        $taxSetting = TaxSetting::where('is_active', true)->first();
        
        $taxAmount = $taxSetting ? ($subtotal * $taxSetting->tax_rate / 100) : 0;
        $totalAmount = $subtotal + $taxAmount;

        $order->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
        ]);
    }
}
