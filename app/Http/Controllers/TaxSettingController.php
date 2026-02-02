<?php

namespace App\Http\Controllers;

use App\Models\TaxSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxSettingController extends Controller
{
    public function index()
    {
        $taxSettings = TaxSetting::orderBy('created_at', 'desc')->get();
        $activeTax = TaxSetting::getActive();

        return Inertia::render('TaxSettings/Index', [
            'taxSettings' => $taxSettings,
            'activeTax' => $activeTax,
        ]);
    }

    public function create()
    {
        return Inertia::render('TaxSettings/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:free,manual',
            'tax_rate' => 'required_if:type,manual|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // If this is set as active, deactivate all others
        if ($validated['is_active'] ?? false) {
            TaxSetting::where('is_active', true)->update(['is_active' => false]);
        }

        // Set default values
        $validated['is_active'] = $validated['is_active'] ?? false;
        if ($validated['type'] === 'free') {
            $validated['tax_rate'] = null;
        }

        TaxSetting::create($validated);

        return redirect()->route('tax-settings.index')
            ->with('success', 'Tax setting created successfully!');
    }

    public function edit(TaxSetting $taxSetting)
    {
        return Inertia::render('TaxSettings/Edit', [
            'taxSetting' => $taxSetting,
        ]);
    }

    public function update(Request $request, TaxSetting $taxSetting)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:free,manual',
            'tax_rate' => 'required_if:type,manual|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // If this is set as active, deactivate all others
        if ($validated['is_active'] ?? false) {
            TaxSetting::where('id', '!=', $taxSetting->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        // Set default values
        $validated['is_active'] = $validated['is_active'] ?? false;
        if ($validated['type'] === 'free') {
            $validated['tax_rate'] = null;
        }

        $taxSetting->update($validated);

        return redirect()->route('tax-settings.index')
            ->with('success', 'Tax setting updated successfully!');
    }

    public function destroy(TaxSetting $taxSetting)
    {
        $taxSetting->delete();

        return redirect()->route('tax-settings.index')
            ->with('success', 'Tax setting deleted successfully!');
    }

    public function toggleActive(TaxSetting $taxSetting)
    {
        if ($taxSetting->is_active) {
            // Deactivate this tax setting
            $taxSetting->update(['is_active' => false]);
            $message = 'Tax setting deactivated successfully!';
        } else {
            // Activate this tax setting and deactivate all others
            TaxSetting::where('id', '!=', $taxSetting->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);
            
            $taxSetting->update(['is_active' => true]);
            $message = 'Tax setting activated successfully!';
        }

        return redirect()->route('tax-settings.index')
            ->with('success', $message);
    }
}
