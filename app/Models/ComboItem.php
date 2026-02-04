<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ComboItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_combo_id',
        'menu_item_id',
        'quantity',
        'is_required',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'is_required' => 'boolean',
    ];

    public function menuCombo()
    {
        return $this->belongsTo(MenuCombo::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}
