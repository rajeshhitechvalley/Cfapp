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
        return $this->hasOne(Order::class)->where('status', '!=', 'served');
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available' && $this->is_active;
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
