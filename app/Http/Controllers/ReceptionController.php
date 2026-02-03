<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderNotification;
use App\Models\Table;
use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReceptionController extends Controller
{
    public function index(): Response
    {
        // Get active orders with relationships
        $activeOrders = Order::with(['table', 'orderItems.menuItem', 'createdBy', 'assignedTo'])
            ->whereIn('status', ['pending', 'preparing', 'ready'])
            ->orderByRaw("FIELD(priority, 'high', 'normal', 'low')")
            ->orderBy('order_time', 'asc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'table_number' => $order->table->table_number,
                    'table_name' => $order->table->name,
                    'status' => $order->status,
                    'priority' => $order->priority,
                    'special_instructions' => $order->special_instructions,
                    'order_time' => $order->order_time->format('h:i A'),
                    'ready_time' => $order->ready_time?->format('h:i A'),
                    'created_by' => $order->createdBy?->name ?? 'Unknown',
                    'assigned_to' => $order->assignedTo?->name,
                    'total_amount' => $order->total_amount,
                    'items_count' => $order->orderItems->sum('quantity'),
                    'time_elapsed' => $order->order_time->diffForHumans(),
                    'estimated_time' => $this->calculateEstimatedTime($order),
                ];
            });

        // Get ready orders for serving
        $readyOrders = Order::with(['table', 'createdBy'])
            ->where('status', 'ready')
            ->orderBy('ready_time', 'asc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'table_number' => $order->table->table_number,
                    'table_name' => $order->table->name,
                    'ready_time' => $order->ready_time->format('h:i A'),
                    'waiting_time' => $order->ready_time->diffForHumans(),
                    'total_amount' => $order->total_amount,
                    'created_by' => $order->createdBy?->name ?? 'Unknown',
                ];
            });

        // Get table status
        $tables = Table::with(['activeOrder'])
            ->orderBy('table_number')
            ->get()
            ->map(function ($table) {
                return [
                    'id' => $table->id,
                    'table_number' => $table->table_number,
                    'name' => $table->name,
                    'capacity' => $table->capacity,
                    'status' => $table->status,
                    'has_active_order' => $table->has_active_order,
                    'active_order' => $table->activeOrder?->order_number,
                ];
            });

        // Get statistics
        $stats = [
            'total_active_orders' => Order::whereIn('status', ['pending', 'preparing', 'ready'])->count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'preparing_orders' => Order::where('status', 'preparing')->count(),
            'ready_orders' => Order::where('status', 'ready')->count(),
            'total_tables' => Table::count(),
            'occupied_tables' => Table::where('status', 'occupied')->count(),
            'available_tables' => Table::where('status', 'available')->count(),
            'high_priority_orders' => Order::whereIn('status', ['pending', 'preparing', 'ready'])
                ->where('priority', 'high')
                ->count(),
            'daily_revenue' => number_format(Bill::whereDate('created_at', today())
                ->where('payment_status', 'paid')
                ->sum('total_amount'), 2),
        ];

        return Inertia::render('Reception/Index', [
            'activeOrders' => $activeOrders,
            'readyOrders' => $readyOrders,
            'tables' => $tables,
            'stats' => $stats,
        ]);
    }

    public function markOrderServed(Order $order): JsonResponse
    {
        if ($order->status !== 'ready') {
            return response()->json([
                'success' => false,
                'message' => 'Order must be ready before serving',
            ], 422);
        }

        // Update order status to served
        $order->status = 'served';
        $order->served_time = now();
        $order->save();

        // Update table status to indicate order is served (but still occupied until payment)
        if ($order->table) {
            $order->table->status = 'occupied';
            $order->table->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Order marked as served',
            'order' => $order->fresh(),
        ]);
    }

    public function updateOrderPriority(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'priority' => 'required|in:low,normal,high',
        ]);

        $oldPriority = $order->priority;
        $order->priority = $request->priority;
        $order->save();

        // Create notification for priority change
        OrderNotification::createNotification(
            $order,
            OrderNotification::TYPE_PRIORITY_CHANGE,
            'Order Priority Updated',
            "Order #{$order->order_number} priority changed from {$oldPriority} to {$request->priority}",
            OrderNotification::TARGET_KITCHEN
        );

        return response()->json([
            'success' => true,
            'message' => 'Order priority updated successfully',
            'order' => $order->fresh(),
        ]);
    }

    public function getNotifications(): JsonResponse
    {
        $notifications = OrderNotification::with(['order.table', 'user'])
            ->forRole('reception')
            ->unread()
            ->latest()
            ->limit(50)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'order_number' => $notification->order->order_number,
                    'table_number' => $notification->order->table->table_number,
                    'created_at' => $notification->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $notifications->count(),
        ]);
    }

    public function markNotificationRead(OrderNotification $notification): JsonResponse
    {
        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    public function getRealTimeUpdates(): JsonResponse
    {
        $orders = Order::with(['table'])
            ->whereIn('status', ['pending', 'preparing', 'ready'])
            ->orderByRaw("FIELD(priority, 'high', 'normal', 'low')")
            ->orderBy('order_time', 'asc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'table_number' => $order->table->table_number,
                    'status' => $order->status,
                    'priority' => $order->priority,
                    'time_elapsed' => $order->order_time->diffInMinutes(now()),
                ];
            });

        $stats = [
            'total_active_orders' => Order::whereIn('status', ['pending', 'preparing', 'ready'])->count(),
            'ready_orders' => Order::where('status', 'ready')->count(),
            'high_priority_orders' => Order::whereIn('status', ['pending', 'preparing', 'ready'])
                ->where('priority', 'high')
                ->count(),
            'daily_revenue' => number_format(Bill::whereDate('created_at', today())
                ->where('payment_status', 'paid')
                ->sum('total_amount'), 2),
        ];

        return response()->json([
            'orders' => $orders,
            'stats' => $stats,
            'timestamp' => now()->toISOString(),
        ]);
    }

    private function calculateEstimatedTime($order): string
    {
        $baseTime = 15; // Base time in minutes
        $itemCount = $order->orderItems->sum('quantity');
        $priorityMultiplier = $order->priority === 'high' ? 0.7 : 1;
        
        $estimatedMinutes = ($baseTime + ($itemCount * 2)) * $priorityMultiplier;
        
        return now()->addMinutes($estimatedMinutes)->format('h:i A');
    }
}
