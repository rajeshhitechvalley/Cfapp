<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Table extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'table_number',
        'name',
        'table_type_id',
        'capacity',
        'min_capacity',
        'location',
        'description',
        'position',
        'status',
        'is_active',
        'has_active_order',
    ];

    protected $casts = [
        'position' => 'array',
        'is_active' => 'boolean',
        'has_active_order' => 'boolean',
    ];

    public function tableType(): BelongsTo
    {
        return $this->belongsTo(TableType::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }

    public function activeReservations(): HasMany
    {
        return $this->reservations()->whereIn('status', ['pending', 'confirmed']);
    }

    public function activeOrder()
    {
        return $this->hasOne(Order::class)->whereIn('status', ['pending', 'preparing', 'ready', 'served']);
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available' && $this->is_active;
    }

    public function isAvailableForUser($userId = null): bool
    {
        $userId = $userId ?? auth()->id();
        
        // If table is not active, it's not available
        if (!$this->is_active) {
            return false;
        }
        
        // Check if user has active orders on this table
        $hasUserOrders = $this->orders()
            ->where('created_by', $userId)
            ->whereIn('status', ['pending', 'preparing', 'ready', 'served'])
            ->exists();
        
        // If user has orders, table is available for them
        if ($hasUserOrders) {
            return true;
        }
        
        // If no user orders, table is available only if status is available
        return $this->status === 'available';
    }

    public function scopeAvailableForUser($query, $userId = null)
    {
        $userId = $userId ?? auth()->id();
        
        return $query->where(function($q) use ($userId) {
            $q->where('status', 'available')
              ->orWhereHas('orders', function($orderQuery) use ($userId) {
                  $orderQuery->where('created_by', $userId)
                             ->whereIn('status', ['pending', 'preparing', 'ready', 'served']);
              });
        })->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')->where('is_active', true);
    }

    public function scopeByCapacity($query, $partySize)
    {
        return $query->where('capacity', '>=', $partySize)
                    ->where('min_capacity', '<=', $partySize);
    }
}
