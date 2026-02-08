<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Table;

class FixAllTablesCommand extends Command
{
    protected $signature = 'fix:all-tables';
    protected $description = 'Fix all tables with incorrect has_active_order field';

    public function handle()
    {
        echo "=== Fixing All Tables ===\n";

        // Get all tables
        $tables = Table::all();

        $fixedCount = 0;

        foreach ($tables as $table) {
            // Check if there are any active orders using the same logic as the relationship
            $hasActiveOrders = $table->orders()
                ->whereIn('status', ['pending', 'preparing', 'ready', 'served'])
                ->exists();

            $needsFix = (!$hasActiveOrders && $table->has_active_order) || 
                       ($hasActiveOrders && !$table->has_active_order);

            if ($needsFix) {
                echo "Fixing Table {$table->table_number} (ID: {$table->id})\n";
                echo "  Current has_active_order: " . ($table->has_active_order ? 'true' : 'false') . "\n";
                echo "  Has active orders: " . ($hasActiveOrders ? 'true' : 'false') . "\n";
                
                // Update the field to match reality
                $table->has_active_order = $hasActiveOrders;
                $table->status = $hasActiveOrders ? 'occupied' : 'available';
                $table->save();
                
                echo "  Updated has_active_order to: " . ($table->has_active_order ? 'true' : 'false') . "\n";
                echo "  Updated status to: " . $table->status . "\n\n";
                
                $fixedCount++;
            }
        }

        echo "=== Fix Complete ===\n";
        echo "Fixed {$fixedCount} tables.\n";
    }
}
