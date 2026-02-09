<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\TableController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\CafeDashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\MenuCategoryController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TaxSettingController;
use App\Http\Controllers\KitchenDisplayController;
use App\Http\Controllers\ReceptionController;
use App\Http\Controllers\QuickTableBookController;
use App\Http\Controllers\AdvancedQuickTableBookController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/test', function () {
    return Inertia::render('TestNavigation');
})->name('test');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('calendar', [CafeDashboardController::class, 'calendar'])->name('calendar');
    Route::get('analytics', [CafeDashboardController::class, 'analytics'])->name('analytics');
    Route::get('floor-plan', [CafeDashboardController::class, 'floorPlan'])->name('floor-plan');
});

// Temporarily make dashboard accessible without authentication for testing
Route::get('dashboard', [CafeDashboardController::class, 'index'])->name('dashboard');

// Temporarily make tables and reservations accessible without authentication for testing
Route::middleware('web')->group(function () {
    Route::resource('tables', TableController::class);
    Route::post('tables/{table}/status', [TableController::class, 'updateStatus'])->name('tables.update-status');
    
    // Quick Table Book routes
    Route::get('quick-table-book', [QuickTableBookController::class, 'index'])->name('quick-table-book.index');
    Route::get('quick-table-book/test', [QuickTableBookController::class, 'index'])->name('quick-table-book.test');
    Route::get('quick-table-book/tables/{table}', [QuickTableBookController::class, 'getTableDetails'])->name('quick-table-book.tables.show');
    Route::post('quick-table-book/tables/{table}/book', [QuickTableBookController::class, 'bookTable'])->name('quick-table-book.tables.book');
    Route::post('quick-table-book/tables/{table}/release', [QuickTableBookController::class, 'releaseTable'])->name('quick-table-book.tables.release');
    Route::post('quick-table-book/tables/{table}/add-item', [QuickTableBookController::class, 'addItemToTable'])->name('quick-table-book.tables.add-item');
    Route::post('quick-table-book/tables/{table}/add-multiple-items', [QuickTableBookController::class, 'addMultipleItemsToTable'])->name('quick-table-book.tables.add-multiple-items');
    Route::delete('quick-table-book/order-items/{orderItem}', [QuickTableBookController::class, 'removeItemFromTable'])->name('quick-table-book.order-items.destroy');
    Route::put('quick-table-book/order-items/{orderItem}/quantity', [QuickTableBookController::class, 'updateItemQuantity'])->name('quick-table-book.order-items.update-quantity');
    Route::post('quick-table-book/orders/{order}/submit', [QuickTableBookController::class, 'submitOrderToKitchen'])->name('quick-table-book.orders.submit');
    Route::post('quick-table-book/orders/{order}/complete', [QuickTableBookController::class, 'completeOrder'])->name('quick-table-book.orders.complete');
    
    // Advanced Quick Table Book routes
    Route::get('advanced-quick-table-book', [AdvancedQuickTableBookController::class, 'index'])->name('advanced-quick-table-book.index');
    Route::post('advanced-quick-table-book/reservations', [AdvancedQuickTableBookController::class, 'createReservation'])->name('advanced-quick-table-book.reservations.create');
    Route::post('advanced-quick-table-book/tables/{table}/combo', [AdvancedQuickTableBookController::class, 'addComboToTable'])->name('advanced-quick-table-book.tables.combo');
    Route::post('advanced-quick-table-book/orders/{order}/promotion', [AdvancedQuickTableBookController::class, 'applyPromotion'])->name('advanced-quick-table-book.orders.promotion');
    Route::post('advanced-quick-table-book/orders/{order}/split-payment', [AdvancedQuickTableBookController::class, 'splitOrderPayment'])->name('advanced-quick-table-book.orders.split-payment');
    Route::get('advanced-quick-table-book/table-availability', [AdvancedQuickTableBookController::class, 'getTableAvailability'])->name('advanced-quick-table-book.table-availability');
    Route::post('advanced-quick-table-book/payments', [AdvancedQuickTableBookController::class, 'processPayment'])->name('advanced-quick-table-book.payments.process');
    
    Route::resource('reservations', ReservationController::class);
    Route::post('reservations/{reservation}/confirm', [ReservationController::class, 'confirm'])->name('reservations.confirm');
    Route::get('reservations/check-availability', [ReservationController::class, 'checkAvailability'])->name('reservations.check-availability');
    
    // Order management routes
    Route::resource('orders', OrderController::class);
    Route::post('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::post('orders/{order}/generate-bill', [OrderController::class, 'generateBill'])->name('orders.generate-bill');
    
    // Sales tracking routes
    Route::get('sales/dashboard', [SalesController::class, 'dashboard'])->name('sales.dashboard');
    Route::get('sales/reports', [SalesController::class, 'reports'])->name('sales.reports');
    Route::get('sales/reports/export', [SalesController::class, 'export'])->name('sales.reports.export');
    Route::get('sales/menu-analytics', [SalesController::class, 'menuAnalytics'])->name('sales.menu-analytics');
    
    // Bill management routes
    Route::resource('bills', BillController::class)->only(['index', 'show', 'update']);
    Route::post('bills/{bill}/payment', [BillController::class, 'updatePayment'])->name('bills.payment');
    
    // Menu management routes
    Route::resource('menu-items', MenuItemController::class);
    Route::post('menu-items/{menuItem}/toggle-availability', [MenuItemController::class, 'toggleAvailability'])->name('menu-items.toggle-availability');
    
    // Menu category management routes
    Route::resource('menu-categories', MenuCategoryController::class);
    
    // Tax settings routes
    Route::resource('tax-settings', TaxSettingController::class);
    Route::post('tax-settings/{taxSetting}/toggle-active', [TaxSettingController::class, 'toggleActive'])->name('tax-settings.toggle-active');
    
    // Reception Dashboard routes
    Route::get('/reception', [ReceptionController::class, 'index'])->middleware('role:staff')->name('reception.index');
    Route::post('/reception/orders/{order}/serve', [ReceptionController::class, 'markOrderServed'])->middleware('role:staff')->name('reception.orders.serve');
    Route::post('/reception/orders/{order}/priority', [ReceptionController::class, 'updateOrderPriority'])->middleware('role:staff')->name('reception.orders.priority');
    Route::get('/reception/notifications', [ReceptionController::class, 'getNotifications'])->middleware('role:staff')->name('reception.notifications');
    Route::post('/reception/notifications/{notification}/read', [ReceptionController::class, 'markNotificationRead'])->middleware('role:staff')->name('reception.notifications.read');
    Route::get('/reception/realtime', [ReceptionController::class, 'getRealTimeUpdates'])->middleware('role:staff')->name('reception.realtime');
    
    // User management routes
    Route::resource('users', UserController::class)->middleware('role:staff');
    Route::post('users/{user}/toggle-active', [UserController::class, 'toggleActive'])->middleware('role:staff')->name('users.toggle-active');
    Route::get('api/users/by-role/{role}', [UserController::class, 'getByRole'])->middleware('role:staff')->name('users.by-role');
    
    // Kitchen Display System routes
    Route::get('/kitchen', [KitchenDisplayController::class, 'index'])->middleware('role:kitchen,staff')->name('kitchen.index');
    Route::post('/kitchen/orders/{order}/status', [KitchenDisplayController::class, 'updateOrderStatus'])->middleware('role:kitchen,staff')->name('kitchen.orders.update-status');
    Route::post('/kitchen/orders/{order}/assign', [KitchenDisplayController::class, 'assignOrder'])->middleware('role:kitchen,staff')->name('kitchen.orders.assign');
    Route::post('/kitchen/orders/{order}/items/status', [KitchenDisplayController::class, 'updateItemStatus'])->middleware('role:kitchen,staff')->name('kitchen.orders.update-item-status');
    Route::get('/kitchen/notifications', [KitchenDisplayController::class, 'getNotifications'])->middleware('role:kitchen,staff')->name('kitchen.notifications');
    Route::post('/kitchen/notifications/{notification}/read', [KitchenDisplayController::class, 'markNotificationRead'])->middleware('role:kitchen,staff')->name('kitchen.notifications.read');
    Route::post('/kitchen/notifications/read-all', [KitchenDisplayController::class, 'markAllNotificationsRead'])->middleware('role:kitchen,staff')->name('kitchen.notifications.read-all');
    Route::get('/kitchen/realtime', [KitchenDisplayController::class, 'getRealTimeUpdates'])->middleware('role:kitchen,staff')->name('kitchen.realtime');
});

require __DIR__.'/settings.php';
