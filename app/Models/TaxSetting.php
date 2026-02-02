<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxSetting extends Model
{
    use HasFactory;

    protected $appends = [
        'formatted_tax_rate',
    ];

    protected $fillable = [
        'name',
        'type',
        'tax_rate',
        'is_active',
        'description',
    ];

    protected $casts = [
        'tax_rate' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the active tax setting
     */
    public static function getActive()
    {
        return static::where('is_active', true)->first();
    }

    /**
     * Calculate tax amount for a given amount
     */
    public function calculateTax($amount)
    {
        if ($this->type === 'free') {
            return 0;
        }

        return ($amount * $this->tax_rate) / 100;
    }

    /**
     * Get formatted tax rate
     */
    public function getFormattedTaxRateAttribute()
    {
        if ($this->type === 'free') {
            return 'Free (0%)';
        }

        return $this->tax_rate . '%';
    }
}
