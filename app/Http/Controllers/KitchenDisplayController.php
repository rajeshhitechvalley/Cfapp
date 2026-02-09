<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderNotification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class KitchenDisplayController extends Controller
{
    public function index(): Response
    {
        $orders = Order::with(['table', 'orderItems.menuItem', 'createdBy'])
            ->where('created_by', auth()->id())
            ->whereIn('status', ['pending', 'preparing'])
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
                    'special_instructions' => $order->special_instructions,
                    'order_time' => $order->order_time->diffForHumans(),
                    'created_by' => $order->createdBy?->name ?? 'Unknown',
                    'items' => $order->orderItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'menu_item_name' => $item->menuItem->name,
                            'quantity' => $item->quantity,
                            'special_instructions' => $item->special_instructions,
                            'status' => $item->status,
                        ];
                    }),
                    'total_items' => $order->orderItems->sum('quantity'),
                    'time_elapsed' => $order->order_time->diffInMinutes(now()),
                ];
            });

        // Get available kitchen staff for assignment
        $kitchenStaff = User::where('role', 'kitchen')
            ->where('is_active', true)
            ->where(function($query) {
                $query->where('created_by', auth()->id())
                      ->orWhere('id', auth()->id()); // Include current user if they are kitchen staff
            })
            ->get(['id', 'name']);

        // Get order statistics
        $stats = [
            'pending_orders' => Order::where('created_by', auth()->id())->where('status', 'pending')->count(),
            'preparing_orders' => Order::where('created_by', auth()->id())->where('status', 'preparing')->count(),
            'ready_orders' => Order::where('created_by', auth()->id())->where('status', 'ready')->count(),
            'total_active_orders' => Order::where('created_by', auth()->id())->whereIn('status', ['pending', 'preparing', 'ready'])->count(),
            'high_priority_orders' => Order::where('created_by', auth()->id())
                ->whereIn('status', ['pending', 'preparing'])
                ->where('priority', 'high')
                ->count(),
        ];

        return Inertia::render('Kitchen/Index', [
            'orders' => $orders,
            'kitchenStaff' => $kitchenStaff,
            'stats' => $stats,
        ]);
    }

    public function updateOrderStatus(Request $request, Order $order): JsonResponse
    {
        // Check if user owns this order
        if ($order->created_by !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,served,cancelled',
        ]);

        $oldStatus = $order->status;
        $order->status = $request->status;

        // Set timestamps based on status
        if ($request->status === 'ready' && !$order->ready_time) {
            $order->ready_time = now();
        } elseif ($request->status === 'served' && !$order->served_time) {
            $order->served_time = now();
        }

        $order->save();

        // Create notification for status change
        OrderNotification::notifyStatusChange($order, $oldStatus, $request->status);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'order' => $order->fresh(['table', 'createdBy']),
        ]);
    }

    public function assignOrder(Request $request, Order $order): JsonResponse
    {
        // Check if user owns this order
        if ($order->created_by !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        
        $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $assignedTo = User::findOrFail($request->assigned_to);
        
        if ($assignedTo->role !== 'kitchen') {
            return response()->json([
                'success' => false,
                'message' => 'Order can only be assigned to kitchen staff',
            ], 422);
        }
        
        // Check if the assigned staff belongs to current user
        if ($assignedTo->created_by !== auth()->id() && $assignedTo->id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You can only assign orders to your own staff members',
            ], 422);
        }

        $order->assigned_to = $assignedTo->id;
        $order->save();

        // Create notification for assignment
        OrderNotification::notifyAssignment($order, $assignedTo);

        return response()->json([
            'success' => true,
            'message' => "Order assigned to {$assignedTo->name}",
            'order' => $order->fresh(['assignedTo']),
        ]);
    }

    public function updateItemStatus(Request $request, Order $order): JsonResponse
    {
        // Check if user owns this order
        if ($order->created_by !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        
        // Debug logging
        \Log::info('updateItemStatus called', [
            'order_id' => $order->id,
            'request_data' => $request->all(),
            'user' => auth()->user()?->name ?? 'guest'
        ]);

        $request->validate([
            'item_id' => 'required|exists:order_items,id',
            'status' => 'required|in:pending,preparing,ready',
        ]);

        $orderItem = $order->orderItems()->findOrFail($request->item_id);
        $orderItem->status = $request->status;
        $orderItem->save();

        // Check if all items are ready to update order status
        if ($order->orderItems()->where('status', '!=', 'ready')->count() === 0) {
            $order->status = 'ready';
            $order->ready_time = now();
            $order->save();

            // Temporarily disable notification to test
            // OrderNotification::notifyStatusChange($order, 'preparing', 'ready');
        }

        return response()->json([
            'success' => true,
            'message' => 'Item status updated successfully',
            'item' => $orderItem->fresh(),
        ]);
    }

    public function getNotifications(): JsonResponse
    {
        $notifications = OrderNotification::with(['order.table', 'user'])
            ->whereHas('order', function($query) {
                $query->where('created_by', auth()->id());
            })
            ->forRole('kitchen')
            ->forUser(auth()->id())
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

    public function markAllNotificationsRead(): JsonResponse
    {
        OrderNotification::whereHas('order', function($query) {
                $query->where('created_by', auth()->id());
            })
            ->forRole('kitchen')
            ->forUser(auth()->id())
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }

    public function getRealTimeUpdates(): JsonResponse
    {
        $orders = Order::with(['table', 'orderItems.menuItem'])
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
                    'total_items' => $order->orderItems->sum('quantity'),
                    'time_elapsed' => $order->order_time->diffInMinutes(now()),
                    'items' => $order->orderItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'menu_item_name' => $item->menuItem->name ?? 'Unknown Item',
                            'quantity' => $item->quantity,
                            'status' => $item->status ?? 'pending',
                            'special_instructions' => $item->special_instructions,
                        ];
                    })->toArray(),
                ];
            });

        // Calculate stats
        $stats = [
            'pending_orders' => $orders->where('status', 'pending')->count(),
            'preparing_orders' => $orders->where('status', 'preparing')->count(),
            'ready_orders' => $orders->where('status', 'ready')->count(),
            'total_active_orders' => $orders->count(),
            'high_priority_orders' => $orders->where('priority', 'high')->count(),
        ];

        return response()->json([
            'orders' => $orders,
            'stats' => $stats,
            'timestamp' => now()->toISOString(),
        ]);
    }
}
