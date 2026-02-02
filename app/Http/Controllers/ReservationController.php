<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReservationController extends Controller
{
    public function index()
    {
        $reservations = Reservation::with(['table.tableType', 'user'])
            ->where('reservation_date', '>=', now()->subDays(7))
            ->orderBy('reservation_date', 'desc')
            ->paginate(20);

        return Inertia::render('Reservations/Index', [
            'reservations' => $reservations,
        ]);
    }

    public function create()
    {
        $tables = Table::with('tableType')
            ->available()
            ->orderBy('table_number')
            ->get();

        return Inertia::render('Reservations/Create', [
            'tables' => $tables,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id' => 'required|exists:tables,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'party_size' => 'required|integer|min:1|max:20',
            'reservation_date' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:30|max:480',
            'special_requests' => 'nullable|string|max:1000',
            'deposit_amount' => 'nullable|numeric|min:0',
            'is_walk_in' => 'boolean',
        ]);

        $table = Table::findOrFail($validated['table_id']);
        $reservationDate = Carbon::parse($validated['reservation_date']);
        $endTime = $reservationDate->copy()->addMinutes((int) $validated['duration_minutes']);

        $conflictingReservation = Reservation::where('table_id', $table->id)
            ->where('status', ['pending', 'confirmed'])
            ->where(function ($query) use ($reservationDate, $endTime) {
                $query->whereBetween('reservation_date', [$reservationDate, $endTime])
                      ->orWhereBetween('end_time', [$reservationDate, $endTime])
                      ->orWhere(function ($q) use ($reservationDate, $endTime) {
                          $q->where('reservation_date', '<=', $reservationDate)
                            ->where('end_time', '>=', $endTime);
                      });
            })
            ->first();

        if ($conflictingReservation) {
            return back()->with('error', 'Table is already reserved for this time slot.');
        }

        if ($validated['party_size'] > $table->capacity) {
            return back()->with('error', 'Party size exceeds table capacity.');
        }

        $reservation = Reservation::create($validated);

        return redirect()->route('reservations.show', $reservation)
            ->with('success', 'Reservation created successfully.');
    }

    public function show(Reservation $reservation)
    {
        $reservation->load(['table.tableType', 'user']);

        return Inertia::render('Reservations/Show', [
            'reservation' => $reservation,
        ]);
    }

    public function edit(Reservation $reservation)
    {
        $tables = Table::with('tableType')
            ->available()
            ->orderBy('table_number')
            ->get();

        return Inertia::render('Reservations/Edit', [
            'reservation' => $reservation,
            'tables' => $tables,
        ]);
    }

    public function update(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'table_id' => 'required|exists:tables,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'party_size' => 'required|integer|min:1|max:20',
            'reservation_date' => 'required|date',
            'duration_minutes' => 'required|integer|min:30|max:480',
            'special_requests' => 'nullable|string|max:1000',
            'status' => 'required|in:pending,confirmed,cancelled,completed,no_show',
        ]);

        $reservation->update($validated);

        return redirect()->route('reservations.show', $reservation)
            ->with('success', 'Reservation updated successfully.');
    }

    public function destroy(Reservation $reservation)
    {
        $reservation->cancel();

        return redirect()->route('reservations.index')
            ->with('success', 'Reservation cancelled successfully.');
    }

    public function confirm(Reservation $reservation)
    {
        $reservation->confirm();

        return back()->with('success', 'Reservation confirmed successfully.');
    }

    public function checkAvailability(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'party_size' => 'required|integer|min:1',
            'duration' => 'required|integer|min:30',
        ]);

        $date = Carbon::parse($validated['date']);
        $endTime = $date->copy()->addMinutes((int) $validated['duration']);

        $availableTables = Table::with('tableType')
            ->available()
            ->byCapacity($validated['party_size'])
            ->whereDoesntHave('reservations', function ($query) use ($date, $endTime) {
                $query->where('status', ['pending', 'confirmed'])
                      ->where(function ($q) use ($date, $endTime) {
                          $q->whereBetween('reservation_date', [$date, $endTime])
                            ->orWhereBetween('end_time', [$date, $endTime])
                            ->orWhere(function ($subQ) use ($date, $endTime) {
                                $subQ->where('reservation_date', '<=', $date)
                                      ->where('end_time', '>=', $endTime);
                            });
                      });
            })
            ->get();

        return response()->json([
            'available_tables' => $availableTables,
        ]);
    }
}
