<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'reservation_id',
        'amount',
        'payment_method',
        'payment_gateway',
        'transaction_id',
        'status',
        'payment_details',
        'notes',
        'processed_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_details' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function reservation()
    {
        return $this->belongsTo(TableReservation::class, 'reservation_id');
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function isSuccessful()
    {
        return $this->status === 'completed';
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function getFormattedAmountAttribute()
    {
        return 'Rs ' . number_format($this->amount, 2);
    }

    public function getPaymentMethodLabelAttribute()
    {
        return [
            'cash' => 'Cash',
            'card' => 'Credit/Debit Card',
            'mobile' => 'Mobile Payment',
            'qr_code' => 'QR Code',
            'bank_transfer' => 'Bank Transfer',
            'digital_wallet' => 'Digital Wallet',
        ][$this->payment_method] ?? $this->payment_method;
    }
}
