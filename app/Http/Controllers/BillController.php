<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillController extends Controller
{
    public function index()
    {
        $bills = Bill::with(['order.table', 'order.orderItems.menuItem'])
            ->orderBy('bill_time', 'desc')
            ->paginate(20);
            
        return Inertia::render('Bills/Index', [
            'bills' => $bills,
        ]);
    }

    public function show(Bill $bill)
    {
        $bill->load(['order.table', 'order.orderItems.menuItem']);
        
        return Inertia::render('Bills/Show', [
            'bill' => $bill,
        ]);
    }

    public function update(Request $request, Bill $bill)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,partial,refunded',
            'payment_method' => 'nullable|in:cash,card,upi,other',
            'paid_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $bill->update($validated);

        // Set paid time if status is paid
        if ($validated['payment_status'] === 'paid' && !$bill->paid_time) {
            $bill->paid_time = now();
            $bill->save();
        }

        return back()->with('success', 'Bill updated successfully.');
    }

    public function updatePayment(Request $request, Bill $bill)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:cash,card,upi,other',
            'amount' => 'required|numeric|min:0|max:' . $bill->remaining_amount,
        ]);

        $newPaidAmount = (float) $bill->paid_amount + (float) $validated['amount'];
        
        $bill->update([
            'payment_method' => $validated['payment_method'],
            'paid_amount' => $newPaidAmount,
            'payment_status' => $newPaidAmount >= (float) $bill->total_amount ? 'paid' : 'partial',
        ]);

        // Set paid time if fully paid
        if ($newPaidAmount >= (float) $bill->total_amount && !$bill->paid_time) {
            $bill->paid_time = now();
            $bill->save();
        }

        return back()->with('success', 'Payment recorded successfully.');
    }
}
