<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Table;

class FixTableFieldCommand extends Command
{
    protected $signature = 'fix:table-field {tableId}';
    protected $description = 'Fix table has_active_order field';

    public function handle()
    {
        $tableId = $this->argument('tableId');
        
        echo "=== Fixing Table Field {$tableId} ===\n";

        // Get the table
        $table = Table::find($tableId);

        if (!$table) {
            echo "Table not found!\n";
            return;
        }

        echo "Current Table Status: " . $table->status . "\n";
        echo "Current has_active_order field: " . ($table->has_active_order ? 'true' : 'false') . "\n";

        // Check if there are any active orders using the same logic as the relationship
        $hasActiveOrders = $table->orders()
            ->whereIn('status', ['pending', 'preparing', 'ready', 'served'])
            ->exists();
        
        echo "Has Active Orders (check): " . ($hasActiveOrders ? 'true' : 'false') . "\n";

        if (!$hasActiveOrders && $table->has_active_order) {
            // Update the field to match reality
            $table->has_active_order = false;
            $table->status = 'available';
            $table->save();
            
            echo "Updated table field has_active_order to: false\n";
            echo "Updated table status to: " . $table->status . "\n";
        } elseif ($hasActiveOrders && !$table->has_active_order) {
            // Update the field to match reality
            $table->has_active_order = true;
            $table->status = 'occupied';
            $table->save();
            
            echo "Updated table field has_active_order to: true\n";
            echo "Updated table status to: " . $table->status . "\n";
        } else {
            echo "Table field is already correct.\n";
        }

        echo "\n=== Fix Complete ===\n";
    }
}
