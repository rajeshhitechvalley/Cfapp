<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TableType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price_multiplier',
        'is_active',
    ];

    protected $casts = [
        'price_multiplier' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function tables()
    {
        return $this->hasMany(Table::class);
    }
}
