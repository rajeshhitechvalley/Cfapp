<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Bill;
use App\Models\MenuItem;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesController extends Controller
{
    public function dashboard(Request $request)
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        
        // Today's sales
        $todaySales = Bill::whereDate('bill_time', $today)
            ->whereHas('order', function($query) {
                $query->where('created_by', auth()->id());
            })
            ->paid()
            ->sum('total_amount');
            
        // Yesterday's sales
        $yesterdaySales = Bill::whereDate('bill_time', $yesterday)
            ->whereHas('order', function($query) {
                $query->where('created_by', auth()->id());
            })
            ->paid()
            ->sum('total_amount');
            
        // This month's sales
        $thisMonthSales = Bill::whereDate('bill_time', '>=', $thisMonth)
            ->whereHas('order', function($query) {
                $query->where('created_by', auth()->id());
            })
            ->paid()
            ->sum('total_amount');
            
        // Last month's sales
        $lastMonthSales = Bill::whereDate('bill_time', '>=', $lastMonth)
            ->whereDate('bill_time', '<', $thisMonth)
            ->whereHas('order', function($query) {
                $query->where('created_by', auth()->id());
            })
            ->paid()
            ->sum('total_amount');
        
        // Today's orders
        $todayOrders = Order::whereDate('order_time', $today)
            ->where('created_by', auth()->id())
            ->count();
        
        // Active orders
        $activeOrders = Order::active()
            ->where('created_by', auth()->id())
            ->count();
        
        // Top selling items today
        $topItemsToday = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->whereDate('orders.order_time', $today)
            ->where('orders.created_by', auth()->id())
            ->select(
                'menu_items.name',
                'menu_items.category',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total_price) as total_revenue'),
                DB::raw('COUNT(DISTINCT orders.id) as order_count')
            )
            ->groupBy('menu_items.id', 'menu_items.name', 'menu_items.category')
            ->orderBy('total_revenue', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'category' => $item->category,
                    'total_quantity' => (int) $item->total_quantity,
                    'total_revenue' => (string) $item->total_revenue,
                    'order_count' => (int) $item->order_count,
                ];
            });
        
        // Sales by category today
        $salesByCategoryToday = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->whereDate('orders.order_time', $today)
            ->where('orders.created_by', auth()->id())
            ->select(
                'menu_items.category',
                DB::raw('SUM(order_items.total_price) as total_revenue'),
                DB::raw('COUNT(DISTINCT orders.id) as order_count')
            )
            ->groupBy('menu_items.category')
            ->orderBy('total_revenue', 'desc')
            ->get();
        
        $totalSales = $salesByCategoryToday->sum('total_revenue');
        $salesByCategoryToday = $salesByCategoryToday->map(function ($category) use ($totalSales) {
            return [
                'category' => $category->category,
                'total_revenue' => (string) $category->total_revenue,
                'order_count' => (int) $category->order_count,
                'percentage' => $totalSales > 0 ? round(($category->total_revenue / $totalSales) * 100, 1) : 0,
            ];
        });
        
        // Recent orders
        $recentOrders = Order::with(['table', 'orderItems.menuItem'])
            ->where('created_by', auth()->id())
            ->orderBy('order_time', 'desc')
            ->limit(10)
            ->get();
        
        return Inertia::render('Sales/Dashboard', [
            'stats' => [
                'todaySales' => (float) $todaySales,
                'yesterdaySales' => (float) $yesterdaySales,
                'thisMonthSales' => (float) $thisMonthSales,
                'lastMonthSales' => (float) $lastMonthSales,
                'todayOrders' => $todayOrders,
                'activeOrders' => $activeOrders,
                'salesGrowth' => $yesterdaySales > 0 ? ((($todaySales - $yesterdaySales) / $yesterdaySales) * 100) : 0,
                'monthlyGrowth' => $lastMonthSales > 0 ? ((($thisMonthSales - $lastMonthSales) / $lastMonthSales) * 100) : 0,
            ],
            'topItemsToday' => $topItemsToday,
            'salesByCategoryToday' => $salesByCategoryToday,
            'recentOrders' => $recentOrders,
        ]);
    }
    
    public function reports(Request $request)
    {
        $query = Bill::with(['order.table', 'order.orderItems.menuItem'])
            ->whereHas('order', function($query) {
                $query->where('created_by', auth()->id());
            });
        
        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('bill_time', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('bill_time', '<=', $request->date_to);
        }
        
        // Filter by payment status
        if ($request->has('payment_status') && $request->payment_status !== 'all') {
            $query->byPaymentStatus($request->payment_status);
        }
        
        // Filter by table
        if ($request->has('table_id') && $request->table_id) {
            $query->where('table_id', $request->table_id);
        }
        
        $bills = $query->orderBy('bill_time', 'desc')->paginate(50);
        $tables = Table::where('is_active', true)->get();
        
        // Summary statistics
        $totalSales = $query->sum('total_amount');
        $totalOrders = $query->count();
        $averageOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;
        
        return Inertia::render('Sales/Reports', [
            'bills' => $bills,
            'tables' => $tables,
            'filters' => $request->only(['date_from', 'date_to', 'payment_status', 'table_id']),
            'summary' => [
                'totalSales' => (float) $totalSales,
                'totalOrders' => $totalOrders,
                'averageOrderValue' => (float) $averageOrderValue,
            ],
        ]);
    }
    
    public function menuAnalytics(Request $request)
    {
        $dateFrom = $request->get('date_from', Carbon::now()->subDays(30)->toDateString());
        $dateTo = $request->get('date_to', Carbon::now()->toDateString());
        
        // Top selling items
        $topItems = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->whereDate('orders.order_time', '>=', $dateFrom)
            ->whereDate('orders.order_time', '<=', $dateTo)
            ->where('orders.created_by', auth()->id())
            ->select('menu_items.name', 'menu_items.category', DB::raw('SUM(order_items.quantity) as total_quantity'), DB::raw('SUM(order_items.total_price) as total_revenue'))
            ->groupBy('menu_items.id', 'menu_items.name', 'menu_items.category')
            ->orderBy('total_revenue', 'desc')
            ->limit(20)
            ->get();
        
        // Sales by category
        $salesByCategory = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->whereDate('orders.order_time', '>=', $dateFrom)
            ->whereDate('orders.order_time', '<=', $dateTo)
            ->where('orders.created_by', auth()->id())
            ->select('menu_items.category', DB::raw('SUM(order_items.quantity) as total_quantity'), DB::raw('SUM(order_items.total_price) as total_revenue'), DB::raw('COUNT(DISTINCT orders.id) as total_orders'))
            ->groupBy('menu_items.category')
            ->orderBy('total_revenue', 'desc')
            ->get();
        
        // Hourly sales pattern
        $hourlySales = DB::table('bills')
            ->join('orders', 'bills.order_id', '=', 'orders.id')
            ->whereDate('bills.bill_time', '>=', $dateFrom)
            ->whereDate('bills.bill_time', '<=', $dateTo)
            ->where('orders.created_by', auth()->id())
            ->select(DB::raw('HOUR(bills.bill_time) as hour'), DB::raw('SUM(bills.total_amount) as total_sales'), DB::raw('COUNT(*) as total_orders'))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();
        
        return Inertia::render('Sales/MenuAnalytics', [
            'topItems' => $topItems,
            'salesByCategory' => $salesByCategory,
            'hourlySales' => $hourlySales,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
    
    public function export(Request $request): StreamedResponse
    {
        $query = Bill::with(['order.table', 'order.orderItems.menuItem'])
            ->whereHas('order', function($query) {
                $query->where('created_by', auth()->id());
            });
        
        // Apply same filters as reports method
        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('bill_time', '>=', $request->start_date);
        }
        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('bill_time', '<=', $request->end_date);
        }
        if ($request->has('payment_status') && $request->payment_status !== 'all') {
            $query->byPaymentStatus($request->payment_status);
        }
        if ($request->has('table_id') && $request->table_id && $request->table_id !== 'all') {
            $query->whereHas('order', function($q) use ($request) {
                $q->where('table_id', $request->table_id);
            });
        }
        
        $bills = $query->orderBy('bill_time', 'desc')->get();
        
        $filename = 'sales-report-' . date('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        
        $callback = function() use ($bills) {
            $file = fopen('php://output', 'w');
            
            // CSV header
            fputcsv($file, [
                'Bill Number',
                'Order Number', 
                'Table',
                'Bill Date',
                'Subtotal',
                'Tax Amount',
                'Total Amount',
                'Payment Status',
                'Payment Method',
                'Items Count',
                'Items'
            ]);
            
            // CSV data
            foreach ($bills as $bill) {
                $items = [];
                $itemsCount = 0;
                
                if ($bill->order && $bill->order->orderItems) {
                    foreach ($bill->order->orderItems as $item) {
                        $items[] = ($item->menuItem ? $item->menuItem->name : 'Unknown Item') . ' x' . $item->quantity;
                        $itemsCount += $item->quantity;
                    }
                }
                
                fputcsv($file, [
                    $bill->bill_number,
                    $bill->order ? $bill->order->order_number : 'N/A',
                    $bill->order && $bill->order->table ? $bill->order->table->table_number : 'N/A',
                    $bill->bill_time,
                    $bill->subtotal,
                    $bill->tax_amount,
                    $bill->total_amount,
                    $bill->payment_status,
                    $bill->payment_method ?? 'N/A',
                    $itemsCount,
                    implode('; ', $items)
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
}
