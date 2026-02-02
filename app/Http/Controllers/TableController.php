<?php

namespace App\Http\Controllers;

use App\Models\Table;
use App\Models\TableType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TableController extends Controller
{
    public function index()
    {
        $tables = Table::with('tableType')
            ->orderBy('table_number')
            ->get();

        $tableTypes = TableType::where('is_active', true)->get();

        return Inertia::render('Tables/Index', [
            'tables' => $tables,
            'tableTypes' => $tableTypes,
        ]);
    }

    public function create()
    {
        $tableTypes = TableType::where('is_active', true)->get();

        return Inertia::render('Tables/Create', [
            'tableTypes' => $tableTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_number' => 'required|string|unique:tables,table_number',
            'name' => 'nullable|string|max:255',
            'table_type_id' => 'required|exists:table_types,id',
            'capacity' => 'required|integer|min:1|max:20',
            'min_capacity' => 'required|integer|min:1|lte:capacity',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'position' => 'nullable|array',
        ]);

        Table::create($validated);

        return redirect()->route('tables.index')
            ->with('success', 'Table created successfully.');
    }

    public function show(Table $table)
    {
        $table->load(['tableType', 'reservations' => function ($query) {
            $query->where('reservation_date', '>=', now())
                  ->orderBy('reservation_date');
        }]);

        return Inertia::render('Tables/Show', [
            'table' => $table,
        ]);
    }

    public function edit(Table $table)
    {
        $tableTypes = TableType::where('is_active', true)->get();

        return Inertia::render('Tables/Edit', [
            'table' => $table,
            'tableTypes' => $tableTypes,
        ]);
    }

    public function update(Request $request, Table $table)
    {
        $validated = $request->validate([
            'table_number' => 'required|string|unique:tables,table_number,' . $table->id,
            'name' => 'nullable|string|max:255',
            'table_type_id' => 'required|exists:table_types,id',
            'capacity' => 'required|integer|min:1|max:20',
            'min_capacity' => 'required|integer|min:1|lte:capacity',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'position' => 'nullable|array',
            'status' => 'required|in:available,reserved,occupied,maintenance',
            'is_active' => 'boolean',
        ]);

        $table->update($validated);

        return redirect()->route('tables.index')
            ->with('success', 'Table updated successfully.');
    }

    public function destroy(Table $table)
    {
        if ($table->reservations()->whereIn('status', ['pending', 'confirmed'])->exists()) {
            return back()->with('error', 'Cannot delete table with active reservations.');
        }

        $table->delete();

        return redirect()->route('tables.index')
            ->with('success', 'Table deleted successfully.');
    }

    public function updateStatus(Request $request, Table $table)
    {
        $validated = $request->validate([
            'status' => 'required|in:available,reserved,occupied,maintenance',
        ]);

        $table->update(['status' => $validated['status']]);

        return back()->with('success', 'Table status updated successfully.');
    }
}
