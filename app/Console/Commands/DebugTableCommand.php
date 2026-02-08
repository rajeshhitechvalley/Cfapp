<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Table;

class DebugTableCommand extends Command
{
    protected $signature = 'debug:table {tableId}';
    protected $description = 'Debug table active order logic';

    public function handle()
    {
        $tableId = $this->argument('tableId');
        
        echo "=== Debugging Table {$tableId} ===\n";

        // Get the table
        $table = Table::find($tableId);

        if (!$table) {
            echo "Table not found!\n";
            return;
        }

        echo "Table Status: " . $table->status . "\n";
        echo "Table has_active_order: " . ($table->has_active_order ? 'true' : 'false') . "\n";

        // Check active order relationship using different methods
        echo "\n--- Checking Active Order Methods ---\n";
        
        // Method 1: Direct relationship
        $activeOrder1 = $table->activeOrder;
        echo "1. Direct relationship: " . ($activeOrder1 ? $activeOrder1->order_number : 'null') . "\n";
        
        // Method 2: Manual query
        $activeOrder2 = $table->orders()
            ->whereIn('status', ['pending', 'preparing', 'ready', 'served'])
            ->first();
        echo "2. Manual query: " . ($activeOrder2 ? $activeOrder2->order_number : 'null') . "\n";
        
        // Method 3: Check if any active orders exist
        $hasActiveOrders = $table->orders()
            ->whereIn('status', ['pending', 'preparing', 'ready', 'served'])
            ->exists();
        echo "3. Exists check: " . ($hasActiveOrders ? 'true' : 'false') . "\n";

        echo "\n=== Debug Complete ===\n";
    }
}
