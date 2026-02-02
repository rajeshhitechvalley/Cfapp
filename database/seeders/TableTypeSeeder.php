<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TableType;

class TableTypeSeeder extends Seeder
{
    public function run(): void
    {
        $tableTypes = [
            [
                'name' => 'Regular',
                'description' => 'Standard dining table',
                'price_multiplier' => 1.00,
                'is_active' => true,
            ],
            [
                'name' => 'Booth',
                'description' => 'Comfortable booth seating',
                'price_multiplier' => 1.20,
                'is_active' => true,
            ],
            [
                'name' => 'Window',
                'description' => 'Table with window view',
                'price_multiplier' => 1.15,
                'is_active' => true,
            ],
            [
                'name' => 'Outdoor',
                'description' => 'Outdoor patio seating',
                'price_multiplier' => 0.90,
                'is_active' => true,
            ],
            [
                'name' => 'Private',
                'description' => 'Private dining room',
                'price_multiplier' => 1.50,
                'is_active' => true,
            ],
        ];

        foreach ($tableTypes as $type) {
            TableType::create($type);
        }
    }
}
