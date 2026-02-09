<?php

namespace Database\Seeders;

use App\Models\MenuCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MenuCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Tea',
                'description' => 'Various types of tea beverages',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Snack',
                'description' => 'Light snacks and appetizers',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Cake',
                'description' => 'Desserts and cakes',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Pizza',
                'description' => 'Various pizza options',
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            MenuCategory::create($category);
        }
    }
}
