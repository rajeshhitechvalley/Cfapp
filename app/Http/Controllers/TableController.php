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
            ->where('user_id', auth()->id())
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

        Table::create(array_merge($validated, ['user_id' => auth()->id()]));

        return redirect()->route('tables.index')
            ->with('success', 'Table created successfully.');
    }

    public function show(Table $table)
    {
        // Check if user owns this table
        if ($table->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        
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
        // Check if user owns this table
        if ($table->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        
        $tableTypes = TableType::where('is_active', true)->get();

        return Inertia::render('Tables/Edit', [
            'table' => $table,
            'tableTypes' => $tableTypes,
        ]);
    }

    public function update(Request $request, Table $table)
    {
        // Check if user owns this table
        if ($table->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        
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
        // Check if user owns this table
        if ($table->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        
        // Check for active reservations
        if ($table->reservations()->whereIn('status', ['pending', 'confirmed'])->exists()) {
            return back()->with('error', 'Cannot delete table with active reservations.');
        }

        // Check for any orders
        if ($table->orders()->exists()) {
            return back()->with('error', 'Cannot delete table with existing orders. Please delete or complete all orders first.');
        }

        // Check for any bills
        if ($table->bills()->exists()) {
            return back()->with('error', 'Cannot delete table with existing bills. Please delete all bills first.');
        }

        // If no related records exist, proceed with deletion
        $table->delete();

        return redirect()->route('tables.index')
            ->with('success', 'Table deleted successfully.');
    }

    public function updateStatus(Request $request, Table $table)
    {
        // Check if user owns this table
        if ($table->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        
        $validated = $request->validate([
            'status' => 'required|in:available,reserved,occupied,maintenance',
        ]);

        $table->update(['status' => $validated['status']]);

        return back()->with('success', 'Table status updated successfully.');
    }
}
