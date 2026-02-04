<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TableReservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'table_id',
        'customer_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'number_of_guests',
        'reservation_time',
        'estimated_arrival_time',
        'estimated_duration_minutes',
        'special_requests',
        'status',
        'deposit_amount',
        'payment_status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'reservation_time' => 'datetime',
        'estimated_arrival_time' => 'datetime',
        'deposit_amount' => 'decimal:2',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'reservation_id');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'confirmed', 'seated']);
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('reservation_time', $date);
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'confirmed']) && 
               $this->reservation_time->greaterThan(now()->addHours(2));
    }

    public function getFormattedTimeAttribute()
    {
        return $this->reservation_time->format('M j, Y g:i A');
    }

    public function getDurationHoursAttribute()
    {
        return $this->estimated_duration_minutes / 60;
    }
}
