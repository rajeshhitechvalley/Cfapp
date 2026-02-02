<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'target_role',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    // Notification types
    const TYPE_NEW_ORDER = 'new_order';
    const TYPE_STATUS_CHANGE = 'status_change';
    const TYPE_PRIORITY_CHANGE = 'priority_change';
    const TYPE_ASSIGNED = 'assigned';
    const TYPE_READY = 'ready';
    const TYPE_CANCELLED = 'cancelled';
    const TYPE_PAYMENT_REQUEST = 'payment_request';

    // Target roles
    const TARGET_STAFF = 'staff';
    const TARGET_KITCHEN = 'kitchen';
    const TARGET_RECEPTION = 'reception';
    const TARGET_ALL = 'all';

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function markAsRead(): bool
    {
        return $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeForRole($query, $role)
    {
        return $query->where('target_role', $role)
            ->orWhere('target_role', self::TARGET_ALL);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId)
            ->orWhereNull('user_id');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Create a new order notification
     */
    public static function createNotification(
        Order $order,
        string $type,
        string $title,
        string $message,
        string $targetRole,
        ?User $user = null,
        array $data = []
    ): self {
        return self::create([
            'order_id' => $order->id,
            'user_id' => $user?->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'target_role' => $targetRole,
        ]);
    }

    /**
     * Notify new order to relevant roles
     */
    public static function notifyNewOrder(Order $order): void
    {
        // Notify kitchen staff
        self::createNotification(
            $order,
            self::TYPE_NEW_ORDER,
            'New Order Received',
            "Order #{$order->order_number} for Table " . ($order->table?->table_number ?? 'Unknown'),
            self::TARGET_KITCHEN
        );

        // Notify reception staff
        self::createNotification(
            $order,
            self::TYPE_NEW_ORDER,
            'New Order Created',
            "Order #{$order->order_number} created by " . ($order->createdBy?->name ?? 'Unknown'),
            self::TARGET_RECEPTION,
            $order->createdBy
        );
    }

    /**
     * Notify order status change
     */
    public static function notifyStatusChange(Order $order, string $oldStatus, string $newStatus): void
    {
        $targetRole = in_array($newStatus, ['preparing', 'ready']) ? self::TARGET_RECEPTION : self::TARGET_KITCHEN;
        
        self::createNotification(
            $order,
            self::TYPE_STATUS_CHANGE,
            'Order Status Updated',
            "Order #{$order->order_number} status changed from {$oldStatus} to {$newStatus}",
            $targetRole
        );
    }

    /**
     * Notify order assignment
     */
    public static function notifyAssignment(Order $order, User $assignedTo): void
    {
        self::createNotification(
            $order,
            self::TYPE_ASSIGNED,
            'Order Assigned',
            "Order #{$order->order_number} assigned to {$assignedTo->name}",
            self::TARGET_KITCHEN,
            $assignedTo
        );
    }
}
