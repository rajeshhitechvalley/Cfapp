<?php

namespace App\Http\Controllers;

use App\Models\Table;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\TableReservation;
use App\Models\Payment;
use App\Models\MenuCategory;
use App\Models\MenuCombo;
use App\Models\Promotion;
use App\Models\TaxSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdvancedQuickTableBookController extends Controller
{
    /**
     * Display the enhanced quick table booking interface
     */
    public function index()
    {
        $tables = Table::with(['tableType', 'orders' => function($query) {
            $query->where('status', '!=', 'completed')
                  ->orderBy('created_at', 'desc');
        }, 'reservations' => function($query) {
            $query->where('reservation_time', '>=', now())
                  ->whereIn('status', ['pending', 'confirmed'])
                  ->orderBy('reservation_time');
        }])
        ->where('is_active', true)
        ->orderBy('table_number')
        ->get();

        $menuCategories = MenuCategory::with(['menuItems' => function($query) {
            $query->where('is_available', true)->orderBy('name');
        }])->active()->ordered()->get();

        $menuCombos = MenuCombo::with(['comboItems.menuItem'])->active()->ordered()->get();

        $promotions = Promotion::where('is_active', true)
            ->where('start_time', '<=', now())
            ->where('end_time', '>=', now())
            ->get();

        $taxSetting = TaxSetting::where('is_active', true)->first();

        return Inertia::render('AdvancedQuickTableBook/Index', [
            'tables' => $tables,
            'menuCategories' => $menuCategories,
            'menuCombos' => $menuCombos,
            'promotions' => $promotions,
            'taxSetting' => $taxSetting,
        ]);
    }

    /**
     * Create advanced table reservation
     */
    public function createReservation(Request $request, Table $table): JsonResponse
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'number_of_guests' => 'required|integer|min:1|max:' . $table->capacity,
            'reservation_time' => 'required|date|after:now',
            'estimated_duration_minutes' => 'required|integer|min:30|max:240',
            'special_requests' => 'nullable|string|max:1000',
            'deposit_amount' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Check for conflicting reservations
            $conflictingReservation = TableReservation::where('table_id', $table->id)
                ->where('reservation_time', '<=', $request->reservation_time)
                ->whereRaw('DATE_ADD(reservation_time, INTERVAL estimated_duration_minutes MINUTE) > ?', [$request->reservation_time])
                ->whereIn('status', ['pending', 'confirmed', 'seated'])
                ->first();

            if ($conflictingReservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Table is already reserved for this time slot',
                ], 422);
            }

            $reservation = TableReservation::create([
                'table_id' => $table->id,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'number_of_guests' => $request->number_of_guests,
                'reservation_time' => $request->reservation_time,
                'estimated_duration_minutes' => $request->estimated_duration_minutes,
                'special_requests' => $request->special_requests,
                'deposit_amount' => $request->deposit_amount ?? 0,
                'status' => 'pending',
                'created_by' => auth()->id(),
            ]);

            // Process deposit payment if provided
            if ($request->deposit_amount > 0) {
                $this->processPayment($reservation, $request->deposit_amount, 'deposit');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Reservation created successfully',
                'reservation' => $reservation->load('table'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create reservation: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process payment for order or reservation
     */
    public function processPayment($entity, $amount, $type = 'payment'): Payment
    {
        return Payment::create([
            'order_id' => $entity instanceof Order ? $entity->id : null,
            'reservation_id' => $entity instanceof TableReservation ? $entity->id : null,
            'amount' => $amount,
            'payment_method' => request()->payment_method ?? 'cash',
            'payment_gateway' => request()->payment_gateway ?? null,
            'transaction_id' => request()->transaction_id ?? null,
            'status' => 'completed',
            'payment_details' => request()->only(['card_last_four', 'wallet_type', 'qr_reference']),
            'processed_by' => auth()->id(),
        ]);
    }

    /**
     * Add combo items to table's order
     */
    public function addComboToTable(Request $request, Table $table): JsonResponse
    {
        $request->validate([
            'combo_id' => 'required|exists:menu_combos,id',
            'quantity' => 'required|integer|min:1',
            'special_instructions' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $combo = MenuCombo::findOrFail($request->combo_id);
            
            // Get or create current order
            $order = $this->getOrCreateOrder($table);

            $orderItem = $order->orderItems()->create([
                'menu_item_id' => null, // Will be set to combo ID
                'quantity' => $request->quantity,
                'unit_price' => $combo->combo_price,
                'total_price' => $combo->combo_price * $request->quantity,
                'subtotal' => $combo->combo_price * $request->quantity,
                'special_instructions' => $request->special_instructions,
                'combo_id' => $combo->id, // Custom field for combo identification
            ]);

            // Add individual combo items
            foreach ($combo->comboItems as $comboItem) {
                for ($i = 0; $i < $comboItem->quantity * $request->quantity; $i++) {
                    $order->orderItems()->create([
                        'menu_item_id' => $comboItem->menu_item_id,
                        'quantity' => 1,
                        'unit_price' => 0, // Free as part of combo
                        'total_price' => 0,
                        'subtotal' => 0,
                        'special_instructions' => 'Part of combo: ' . $combo->name,
                        'parent_combo_item_id' => $orderItem->id, // Link to main combo item
                    ]);
                }
            }

            $this->updateOrderTotals($order);

            if ($table->status === 'available') {
                $table->update(['status' => 'occupied']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Combo added successfully',
                'order' => $order->load('orderItems.menuItem'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add combo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Apply promotion to order
     */
    public function applyPromotion(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'promotion_code' => 'required|string',
        ]);

        try {
            $promotion = Promotion::where('name', $request->promotion_code)
                ->where('is_active', true)
                ->where('start_time', '<=', now())
                ->where('end_time', '>=', now())
                ->first();

            if (!$promotion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired promotion code',
                ], 422);
            }

            // Check if minimum order amount is met
            if ($promotion->minimum_order_amount && $order->subtotal < $promotion->minimum_order_amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Minimum order amount of Rs ' . $promotion->minimum_order_amount . ' required',
                ], 422);
            }

            // Calculate discount
            $discountAmount = 0;
            if ($promotion->discount_type === 'percentage') {
                $discountAmount = $order->subtotal * ($promotion->discount_value / 100);
            } elseif ($promotion->discount_type === 'fixed_amount') {
                $discountAmount = min($promotion->discount_value, $order->subtotal);
            }

            // Apply discount to order
            $order->update([
                'discount_amount' => $discountAmount,
                'promotion_id' => $promotion->id,
            ]);

            $this->updateOrderTotals($order);

            return response()->json([
                'success' => true,
                'message' => 'Promotion applied successfully',
                'discount_amount' => $discountAmount,
                'new_total' => $order->total_amount,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to apply promotion: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Split order payment
     */
    public function splitOrderPayment(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'splits' => 'required|array|min:2',
            'splits.*.amount' => 'required|numeric|min:0.01',
            'splits.*.payment_method' => 'required|string',
            'splits.*.customer_name' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $totalSplitAmount = collect($request->splits)->sum('amount');
            
            if (abs($totalSplitAmount - $order->total_amount) > 0.01) {
                return response()->json([
                    'success' => false,
                    'message' => 'Split amounts must equal total order amount',
                ], 422);
            }

            $payments = [];
            foreach ($request->splits as $split) {
                $payment = Payment::create([
                    'order_id' => $order->id,
                    'amount' => $split['amount'],
                    'payment_method' => $split['payment_method'],
                    'status' => 'completed',
                    'payment_details' => [
                        'split_payment' => true,
                        'customer_name' => $split['customer_name'],
                    ],
                    'processed_by' => auth()->id(),
                ]);
                $payments[] = $payment;
            }

            $order->update(['payment_status' => 'paid']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment split successfully',
                'payments' => $payments,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to split payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get table availability for date range
     */
    public function getTableAvailability(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'guest_count' => 'required|integer|min:1',
        ]);

        $date = Carbon::parse($request->date);
        $startTime = Carbon::parse($request->date . ' ' . $request->start_time);
        $endTime = Carbon::parse($request->date . ' ' . $request->end_time);

        $availableTables = Table::where('is_active', true)
            ->where('capacity', '>=', $request->guest_count)
            ->whereDoesntHave('reservations', function ($query) use ($date, $startTime, $endTime) {
                $query->whereDate('reservation_time', $date)
                      ->whereIn('status', ['pending', 'confirmed', 'seated'])
                      ->where(function ($q) use ($startTime, $endTime) {
                          $q->whereBetween('reservation_time', [$startTime, $endTime])
                            ->orWhereRaw('DATE_ADD(reservation_time, INTERVAL estimated_duration_minutes MINUTE) > ?', [$startTime]);
                      });
            })
            ->with('tableType')
            ->orderBy('capacity')
            ->get();

        return response()->json([
            'available_tables' => $availableTables,
            'total_available' => $availableTables->count(),
        ]);
    }

    /**
     * Helper method to get or create order for table
     */
    private function getOrCreateOrder(Table $table): Order
    {
        $order = $table->orders()
            ->where(function($query) {
                $query->where('status', 'pending')
                      ->orWhere('status', 'preparing');
            })
            ->first();

        if (!$order) {
            $order = $table->orders()->create([
                'order_number' => 'ORD-' . time() . '-' . $table->id,
                'status' => 'pending',
                'priority' => 'normal',
                'order_time' => now(),
                'created_by' => auth()->id(),
                'subtotal' => 0,
                'tax_amount' => 0,
                'total_amount' => 0,
            ]);
        }

        return $order;
    }

    /**
     * Update order totals
     */
    private function updateOrderTotals(Order $order): void
    {
        $subtotal = $order->orderItems()->sum('total_price');
        $taxSetting = TaxSetting::where('is_active', true)->first();
        
        $taxAmount = $taxSetting ? ($subtotal * $taxSetting->tax_rate / 100) : 0;
        $discountAmount = $order->discount_amount ?? 0;
        $totalAmount = $subtotal + $taxAmount - $discountAmount;

        $order->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
        ]);
    }
}
