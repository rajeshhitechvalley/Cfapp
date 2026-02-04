<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CustomerLoyaltyPoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'points_earned',
        'points_redeemed',
        'points_balance',
        'total_spent',
        'visits_count',
        'last_visit_date',
    ];

    protected $casts = [
        'points_earned' => 'integer',
        'points_redeemed' => 'integer',
        'points_balance' => 'integer',
        'total_spent' => 'decimal:2',
        'visits_count' => 'integer',
        'last_visit_date' => 'date',
    ];

    public function addPoints($points, $orderAmount = 0)
    {
        $this->increment('points_earned', $points);
        $this->increment('points_balance', $points);
        $this->increment('total_spent', $orderAmount);
        $this->increment('visits_count');
        $this->update(['last_visit_date' => now()]);
    }

    public function redeemPoints($points)
    {
        if ($this->points_balance >= $points) {
            $this->increment('points_redeemed', $points);
            $this->decrement('points_balance', $points);
            return true;
        }
        return false;
    }

    public function getTierAttribute()
    {
        if ($this->points_balance >= 1000) {
            return 'Gold';
        } elseif ($this->points_balance >= 500) {
            return 'Silver';
        } elseif ($this->points_balance >= 100) {
            return 'Bronze';
        }
        return 'Standard';
    }

    public function getTierBenefitsAttribute()
    {
        $benefits = [
            'Standard' => ['points_per_rupee' => 1],
            'Bronze' => ['points_per_rupee' => 1.5, 'birthday_bonus' => 50],
            'Silver' => ['points_per_rupee' => 2, 'birthday_bonus' => 100, 'free_delivery' => true],
            'Gold' => ['points_per_rupee' => 3, 'birthday_bonus' => 200, 'free_delivery' => true, 'priority_seating' => true],
        ];
        
        return $benefits[$this->tier] ?? $benefits['Standard'];
    }
}
