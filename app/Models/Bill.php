<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Bill extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'table_id',
        'bill_number',
        'subtotal',
        'tax_amount',
        'service_charge',
        'discount_amount',
        'total_amount',
        'payment_status',
        'payment_method',
        'paid_amount',
        'bill_time',
        'paid_time',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'service_charge' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'bill_time' => 'datetime',
        'paid_time' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function scopeByPaymentStatus($query, $status)
    {
        return $query->where('payment_status', $status);
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    public function scopeUnpaid($query)
    {
        return $query->whereIn('payment_status', ['pending', 'partial']);
    }

    public function getRemainingAmountAttribute()
    {
        return (float) $this->total_amount - (float) $this->paid_amount;
    }

    public function getFormattedTotalAttribute()
    {
        return '$' . number_format((float) $this->total_amount, 2);
    }

    public function getFormattedPaidAmountAttribute()
    {
        return '$' . number_format((float) $this->paid_amount, 2);
    }

    public function getFormattedRemainingAmountAttribute()
    {
        return '$' . number_format($this->remaining_amount, 2);
    }

    public function generateBillNumber()
    {
        do {
            $billNumber = 'BILL-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (self::where('bill_number', $billNumber)->exists());
        
        return $billNumber;
    }

    protected static function booted()
    {
        static::creating(function ($bill) {
            if (empty($bill->bill_number)) {
                $bill->bill_number = $bill->generateBillNumber();
            }
            if (empty($bill->bill_time)) {
                $bill->bill_time = now();
            }
        });
    }
}
