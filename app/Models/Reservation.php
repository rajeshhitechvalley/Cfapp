<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'table_id',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'party_size',
        'reservation_date',
        'end_time',
        'duration_minutes',
        'special_requests',
        'status',
        'deposit_amount',
        'is_walk_in',
        'confirmation_code',
        'confirmed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'reservation_date' => 'datetime',
        'end_time' => 'datetime',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'deposit_amount' => 'decimal:2',
        'is_walk_in' => 'boolean',
    ];

    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']) && 
               $this->reservation_date->isFuture();
    }

    public function isPast(): bool
    {
        return $this->reservation_date->isPast();
    }

    public function confirm(): void
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
    }

    public function generateConfirmationCode(): string
    {
        return strtoupper(substr(md5($this->id . $this->customer_email), 0, 8));
    }

    protected static function booted()
    {
        static::creating(function ($reservation) {
            $reservation->confirmation_code = $reservation->generateConfirmationCode();
            $reservation->end_time = $reservation->reservation_date->addMinutes((int) $reservation->duration_minutes);
        });
    }
}
