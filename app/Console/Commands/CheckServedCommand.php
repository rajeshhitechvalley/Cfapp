<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\Table;

class CheckServedCommand extends Command
{
    protected $signature = 'check:served {tableId}';
    protected $description = 'Check served orders for table';

    public function handle()
    {
        $tableId = $this->argument('tableId');
        
        echo "=== Checking Served Orders for Table {$tableId} ===\n";

        // Get all orders for this table
        $orders = Order::where('table_id', $tableId)->get();
        
        echo "All orders:\n";
        foreach ($orders as $order) {
            echo "  - " . $order->order_number . " (status: " . $order->status . ")\n";
        }

        // Check specifically for served orders
        $servedOrders = Order::where('table_id', $tableId)
            ->where('status', 'served')
            ->get();

        echo "\nServed orders:\n";
        foreach ($servedOrders as $order) {
            echo "  - " . $order->order_number . " (status: " . $order->status . ")\n";
        }

        // Check what the activeOrder relationship returns
        $table = Table::find($tableId);
        $activeOrder = $table->activeOrder;
        
        echo "\nActive Order Relationship returns:\n";
        if ($activeOrder) {
            echo "  - " . $activeOrder->order_number . " (status: " . $activeOrder->status . ")\n";
        } else {
            echo "  - null\n";
        }

        echo "\n=== Check Complete ===\n";
    }
}
