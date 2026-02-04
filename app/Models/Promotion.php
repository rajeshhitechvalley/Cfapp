<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'discount_type',
        'discount_value',
        'minimum_order_amount',
        'start_time',
        'end_time',
        'is_active',
        'usage_limit',
        'usage_count',
        'applicable_items',
        'conditions',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'is_active' => 'boolean',
        'usage_limit' => 'integer',
        'usage_count' => 'integer',
        'applicable_items' => 'array',
        'conditions' => 'array',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where('start_time', '<=', now())
                    ->where('end_time', '>=', now());
    }

    public function scopeValidForOrder($query, $orderTotal)
    {
        return $query->where(function ($q) use ($orderTotal) {
            $q->whereNull('minimum_order_amount')
              ->orWhere('minimum_order_amount', '<=', $orderTotal);
        });
    }

    public function calculateDiscount($orderTotal)
    {
        if ($this->discount_type === 'percentage') {
            return $orderTotal * ($this->discount_value / 100);
        } elseif ($this->discount_type === 'fixed_amount') {
            return min($this->discount_value, $orderTotal);
        }
        
        return 0;
    }

    public function canBeUsed()
    {
        return $this->is_active && 
               $this->start_time->isPast() && 
               $this->end_time->isFuture() &&
               (!$this->usage_limit || $this->usage_count < $this->usage_limit);
    }

    public function getFormattedDiscountAttribute()
    {
        if ($this->discount_type === 'percentage') {
            return $this->discount_value . '%';
        } elseif ($this->discount_type === 'fixed_amount') {
            return 'Rs ' . number_format((float) $this->discount_value, 2);
        } elseif ($this->discount_type === 'buy_one_get_one') {
            return 'Buy 1 Get 1';
        } elseif ($this->discount_type === 'free_item') {
            return 'Free Item';
        }
        
        return $this->discount_value;
    }
}
