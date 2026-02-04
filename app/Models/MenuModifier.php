<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MenuModifier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price_adjustment',
        'modifier_type',
        'menu_item_id',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price_adjustment' => 'decimal:2',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getFormattedPriceAdjustmentAttribute()
    {
        $prefix = $this->modifier_type === 'add' ? '+' : $this->modifier_type === 'remove' ? '-' : '';
        return $prefix . 'Rs ' . number_format((float) $this->price_adjustment, 2);
    }
}
