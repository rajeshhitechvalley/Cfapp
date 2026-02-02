<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'table_id',
        'order_number',
        'status',
        'priority',
        'special_instructions',
        'subtotal',
        'tax_amount',
        'total_amount',
        'discount_amount',
        'order_time',
        'ready_time',
        'served_time',
        'created_by',
        'assigned_to',
        'customer_id',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'order_time' => 'datetime',
        'ready_time' => 'datetime',
        'served_time' => 'datetime',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function bill()
    {
        return $this->hasOne(Bill::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function menuItems()
    {
        return $this->belongsToMany(MenuItem::class, 'order_items')
            ->withPivot(['quantity', 'unit_price', 'total_price', 'special_instructions', 'status'])
            ->withTimestamps();
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'preparing', 'ready', 'served']);
    }

    public function updateTotals()
    {
        $this->subtotal = (string) $this->orderItems->sum('total_price');
        
        // Get active tax rate from TaxSetting
        $activeTax = \App\Models\TaxSetting::getActive();
        $taxRate = $activeTax ? ($activeTax->type === 'free' ? 0 : (float) $activeTax->tax_rate / 100) : 0.1;
        
        $this->tax_amount = (string) ((float) $this->subtotal * $taxRate);
        $this->total_amount = (string) ((float) $this->subtotal + (float) $this->tax_amount - (float) $this->discount_amount);
        $this->save();
    }

    public function generateOrderNumber()
    {
        do {
            $orderNumber = 'ORD-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (self::where('order_number', $orderNumber)->exists());
        
        return $orderNumber;
    }

    protected static function booted()
    {
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = $order->generateOrderNumber();
            }
            if (empty($order->order_time)) {
                $order->order_time = now();
            }
        });
    }
}
