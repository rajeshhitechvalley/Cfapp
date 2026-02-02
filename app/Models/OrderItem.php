<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'menu_item_id',
        'quantity',
        'unit_price',
        'total_price',
        'special_instructions',
        'status',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }

    protected static function booted()
    {
        static::creating(function ($orderItem) {
            if ($orderItem->menuItem && $orderItem->quantity) {
                $orderItem->unit_price = $orderItem->menuItem->price;
                $orderItem->total_price = (string) ((float) $orderItem->menuItem->price * $orderItem->quantity);
            }
        });

        static::updating(function ($orderItem) {
            if ($orderItem->menuItem && $orderItem->quantity) {
                $orderItem->total_price = (string) ((float) $orderItem->unit_price * $orderItem->quantity);
            }
        });
    }
}
