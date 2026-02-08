<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Table;

class FixTableCommand extends Command
{
    protected $signature = 'fix:table {tableId}';
    protected $description = 'Fix table status for completed orders';

    public function handle()
    {
        $tableId = $this->argument('tableId');
        
        echo "=== Fixing Table {$tableId} ===\n";

        // Get the table
        $table = Table::find($tableId);

        if (!$table) {
            echo "Table not found!\n";
            return;
        }

        echo "Current Table Status: " . $table->status . "\n";
        echo "Current has_active_order: " . ($table->has_active_order ? 'true' : 'false') . "\n";

        // Check if there are any active orders
        $hasActiveOrders = $table->activeOrder() !== null;
        
        echo "Has Active Orders: " . ($hasActiveOrders ? 'true' : 'false') . "\n";

        if (!$hasActiveOrders) {
            // Update table to available
            $table->status = 'available';
            $table->has_active_order = false;
            $table->save();
            
            echo "Updated table status to: " . $table->status . "\n";
            echo "Updated has_active_order to: " . ($table->has_active_order ? 'true' : 'false') . "\n";
        } else {
            echo "Table has active orders, no changes needed.\n";
        }

        echo "\n=== Fix Complete ===\n";
    }
}
