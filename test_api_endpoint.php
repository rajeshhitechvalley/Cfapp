<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing API endpoint directly...\n";

try {
    // Get a sample order with items
    $order = \App\Models\Order::with(['orderItems'])->first();
    
    if (!$order) {
        echo "⚠️  No orders found\n";
        exit;
    }
    
    echo "✅ Found order: {$order->order_number}\n";
    
    if ($order->orderItems->count() > 0) {
        $item = $order->orderItems->first();
        echo "✅ Found item: {$item->id}\n";
        
        // Create a mock request
        $request = new \Illuminate\Http\Request();
        $request->merge([
            'item_id' => $item->id,
            'status' => 'ready'
        ]);
        
        echo "✅ Mock request created\n";
        
        // Test the controller method directly
        $controller = new \App\Http\Controllers\KitchenDisplayController();
        
        // Mock authenticated user
        $user = \App\Models\User::where('role', 'staff')->first();
        if ($user) {
            auth()->setUser($user);
        }
        
        echo "✅ Calling controller method...\n";
        
        $response = $controller->updateItemStatus($request, $order);
        
        echo "✅ Response received\n";
        echo "Status: " . $response->getStatusCode() . "\n";
        echo "Content: " . $response->getContent() . "\n";
        
    } else {
        echo "⚠️  No items found in order\n";
    }
    
    echo "\n✅ API test completed!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
