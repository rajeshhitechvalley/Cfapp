<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MenuCombo extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'combo_price',
        'savings_amount',
        'image_url',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'combo_price' => 'decimal:2',
        'savings_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function comboItems()
    {
        return $this->hasMany(ComboItem::class);
    }

    public function menuItems()
    {
        return $this->belongsToMany(MenuItem::class, 'combo_items')
            ->withPivot('quantity', 'is_required')
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function getFormattedPriceAttribute()
    {
        return 'Rs ' . number_format($this->combo_price, 2);
    }

    public function getFormattedSavingsAttribute()
    {
        return 'Rs ' . number_format($this->savings_amount, 2);
    }

    public function getIndividualItemsTotalAttribute()
    {
        return $this->comboItems->sum(function ($comboItem) {
            return $comboItem->menuItem->price * $comboItem->quantity;
        });
    }

    public function getSavingsPercentageAttribute()
    {
        $total = $this->individual_items_total;
        if ($total > 0) {
            return round(($this->savings_amount / $total) * 100, 1);
        }
        return 0;
    }
}
