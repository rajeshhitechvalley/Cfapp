<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Table;
use App\Models\TableType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CafeDashboardController extends Controller
{
    public function index()
    {
        $today = now()->startOfDay();
        $tomorrow = now()->addDay()->startOfDay();

        $stats = [
            'total_tables' => Table::count(),
            'available_tables' => Table::available()->count(),
            'today_reservations' => Reservation::whereBetween('reservation_date', [$today, $tomorrow])->count(),
            'active_reservations' => Reservation::whereIn('status', ['pending', 'confirmed'])
                ->where('reservation_date', '>=', now())->count(),
        ];

        $todayReservations = Reservation::with(['table.tableType'])
            ->whereBetween('reservation_date', [$today, $tomorrow])
            ->orderBy('reservation_date')
            ->get();

        $recentReservations = Reservation::with(['table.tableType'])
            ->where('reservation_date', '>=', now()->subHours(24))
            ->orderBy('reservation_date', 'desc')
            ->limit(10)
            ->get();

        $tableStatuses = Table::with('tableType')
            ->get()
            ->map(function ($table) {
                return [
                    'id' => $table->id,
                    'table_number' => $table->table_number,
                    'name' => $table->name,
                    'capacity' => $table->capacity,
                    'status' => $table->status,
                    'type' => $table->tableType->name,
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'todayReservations' => $todayReservations,
            'recentReservations' => $recentReservations,
            'tableStatuses' => $tableStatuses,
        ]);
    }

    public function calendar(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $startDate = Carbon::parse($date)->startOfDay();
        $endDate = Carbon::parse($date)->endOfDay();

        $reservations = Reservation::with(['table.tableType', 'user'])
            ->whereBetween('reservation_date', [$startDate, $endDate])
            ->orderBy('reservation_date')
            ->get();

        $tables = Table::with('tableType')
            ->orderBy('table_number')
            ->get();

        return Inertia::render('Calendar', [
            'reservations' => $reservations,
            'tables' => $tables,
            'selectedDate' => $date,
        ]);
    }

    public function analytics(Request $request)
    {
        $period = $request->get('period', '7');
        $days = (int) $period;
        $startDate = now()->subDays($days)->startOfDay();

        $dailyStats = Reservation::where('reservation_date', '>=', $startDate)
            ->selectRaw('DATE(reservation_date) as date, COUNT(*) as reservations, SUM(party_size) as total_customers')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $tablePerformance = Table::with(['tableType', 'reservations' => function ($query) use ($startDate) {
            $query->where('reservation_date', '>=', $startDate);
        }])
        ->get()
        ->map(function ($table) {
            $reservationCount = $table->reservations->count();
            $totalCustomers = $table->reservations->sum('party_size');
            
            return [
                'table_number' => $table->table_number,
                'type' => $table->tableType->name,
                'reservations' => $reservationCount,
                'total_customers' => $totalCustomers,
                'utilization' => $reservationCount > 0 ? ($totalCustomers / ($reservationCount * $table->capacity)) * 100 : 0,
            ];
        });

        $popularHours = Reservation::where('reservation_date', '>=', $startDate)
            ->selectRaw('HOUR(reservation_date) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Analytics', [
            'dailyStats' => $dailyStats,
            'tablePerformance' => $tablePerformance,
            'popularHours' => $popularHours,
            'period' => $period,
        ]);
    }

    public function floorPlan()
    {
        $tables = Table::with(['tableType', 'activeReservations'])
            ->get()
            ->map(function ($table) {
                return [
                    'id' => $table->id,
                    'table_number' => $table->table_number,
                    'name' => $table->name,
                    'capacity' => $table->capacity,
                    'status' => $table->status,
                    'type' => $table->tableType->name,
                    'position' => $table->position,
                    'has_active_reservation' => $table->activeReservations->isNotEmpty(),
                ];
            });

        $tableTypes = TableType::where('is_active', true)->get();

        return Inertia::render('FloorPlan', [
            'tables' => $tables,
            'tableTypes' => $tableTypes,
        ]);
    }
}
