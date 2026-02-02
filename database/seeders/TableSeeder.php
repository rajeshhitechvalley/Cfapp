<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Table;
use App\Models\TableType;

class TableSeeder extends Seeder
{
    public function run(): void
    {
        $regularTypeId = TableType::where('name', 'Regular')->first()->id;
        $boothTypeId = TableType::where('name', 'Booth')->first()->id;
        $windowTypeId = TableType::where('name', 'Window')->first()->id;
        $outdoorTypeId = TableType::where('name', 'Outdoor')->first()->id;

        $tables = [
            // Regular tables
            ['table_number' => 'T1', 'name' => 'Table 1', 'table_type_id' => $regularTypeId, 'capacity' => 4, 'min_capacity' => 1, 'location' => 'Main Hall', 'position' => ['x' => 100, 'y' => 100]],
            ['table_number' => 'T2', 'name' => 'Table 2', 'table_type_id' => $regularTypeId, 'capacity' => 4, 'min_capacity' => 1, 'location' => 'Main Hall', 'position' => ['x' => 200, 'y' => 100]],
            ['table_number' => 'T3', 'name' => 'Table 3', 'table_type_id' => $regularTypeId, 'capacity' => 2, 'min_capacity' => 1, 'location' => 'Main Hall', 'position' => ['x' => 300, 'y' => 100]],
            ['table_number' => 'T4', 'name' => 'Table 4', 'table_type_id' => $regularTypeId, 'capacity' => 6, 'min_capacity' => 2, 'location' => 'Main Hall', 'position' => ['x' => 100, 'y' => 200]],
            ['table_number' => 'T5', 'name' => 'Table 5', 'table_type_id' => $regularTypeId, 'capacity' => 4, 'min_capacity' => 1, 'location' => 'Main Hall', 'position' => ['x' => 200, 'y' => 200]],
            
            // Booth tables
            ['table_number' => 'B1', 'name' => 'Booth 1', 'table_type_id' => $boothTypeId, 'capacity' => 4, 'min_capacity' => 2, 'location' => 'Booth Section', 'position' => ['x' => 400, 'y' => 100]],
            ['table_number' => 'B2', 'name' => 'Booth 2', 'table_type_id' => $boothTypeId, 'capacity' => 4, 'min_capacity' => 2, 'location' => 'Booth Section', 'position' => ['x' => 400, 'y' => 200]],
            ['table_number' => 'B3', 'name' => 'Booth 3', 'table_type_id' => $boothTypeId, 'capacity' => 6, 'min_capacity' => 3, 'location' => 'Booth Section', 'position' => ['x' => 400, 'y' => 300]],
            
            // Window tables
            ['table_number' => 'W1', 'name' => 'Window 1', 'table_type_id' => $windowTypeId, 'capacity' => 2, 'min_capacity' => 1, 'location' => 'Window Section', 'position' => ['x' => 100, 'y' => 300]],
            ['table_number' => 'W2', 'name' => 'Window 2', 'table_type_id' => $windowTypeId, 'capacity' => 4, 'min_capacity' => 2, 'location' => 'Window Section', 'position' => ['x' => 200, 'y' => 300]],
            ['table_number' => 'W3', 'name' => 'Window 3', 'table_type_id' => $windowTypeId, 'capacity' => 2, 'min_capacity' => 1, 'location' => 'Window Section', 'position' => ['x' => 300, 'y' => 300]],
            
            // Outdoor tables
            ['table_number' => 'O1', 'name' => 'Patio 1', 'table_type_id' => $outdoorTypeId, 'capacity' => 4, 'min_capacity' => 2, 'location' => 'Patio', 'position' => ['x' => 500, 'y' => 100]],
            ['table_number' => 'O2', 'name' => 'Patio 2', 'table_type_id' => $outdoorTypeId, 'capacity' => 6, 'min_capacity' => 3, 'location' => 'Patio', 'position' => ['x' => 500, 'y' => 200]],
            ['table_number' => 'O3', 'name' => 'Patio 3', 'table_type_id' => $outdoorTypeId, 'capacity' => 4, 'min_capacity' => 2, 'location' => 'Patio', 'position' => ['x' => 500, 'y' => 300]],
        ];

        foreach ($tables as $table) {
            Table::create($table);
        }
    }
}
