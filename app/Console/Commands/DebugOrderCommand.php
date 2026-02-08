<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\Table;

class DebugOrderCommand extends Command
{
    protected $signature = 'debug:order {orderNumber}';
    protected $description = 'Debug specific order and table status';

    public function handle()
    {
        $orderNumber = $this->argument('orderNumber');
        
        echo "=== Checking Order {$orderNumber} ===\n";

        // Find the order
        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            echo "Order not found!\n";
            return;
        }

        echo "Order Status: " . $order->status . "\n";
        echo "Table ID: " . $order->table_id . "\n";

        // Get the table
        $table = Table::find($order->table_id);

        if (!$table) {
            echo "Table not found!\n";
            return;
        }

        echo "Table Status: " . $table->status . "\n";
        echo "Table has_active_order: " . ($table->has_active_order ? 'true' : 'false') . "\n";

        // Check active order relationship
        $activeOrder = $table->activeOrder;
        echo "Active Order: " . ($activeOrder ? $activeOrder->order_number : 'null') . "\n";

        // Check all orders for this table
        $allOrders = Order::where('table_id', $table->id)->get();
        echo "\nAll orders for table " . $table->table_number . ":\n";
        foreach ($allOrders as $o) {
            echo "  - " . $o->order_number . " (status: " . $o->status . ")\n";
        }

        echo "\n=== End Check ===\n";
    }
}
