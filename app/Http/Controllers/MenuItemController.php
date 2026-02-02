<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    public function index()
    {
        $menuItems = MenuItem::orderBy('category')->orderBy('name')->get();
        
        return Inertia::render('MenuItems/Index', [
            'menuItems' => $menuItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'category' => $item->category,
                    'description' => $item->description,
                    'price' => (string) $item->price,
                    'image_url' => $item->image_url,
                    'is_available' => $item->is_available,
                    'preparation_time' => $item->preparation_time,
                    'formatted_price' => $item->formatted_price,
                ];
            }),
        ]);
    }

    public function create()
    {
        return Inertia::render('MenuItems/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:tea,snack,cake,pizza',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0|max:999999.99',
            'image_url' => 'nullable|url',
            'is_available' => 'boolean',
            'preparation_time' => 'required|integer|min:0|max:120',
        ]);

        MenuItem::create($validated);

        return redirect()->route('menu-items.index')
            ->with('success', 'Menu item created successfully!');
    }

    public function edit(MenuItem $menuItem)
    {
        return Inertia::render('MenuItems/Edit', [
            'menuItem' => [
                'id' => $menuItem->id,
                'name' => $menuItem->name,
                'category' => $menuItem->category,
                'description' => $menuItem->description,
                'price' => (string) $menuItem->price,
                'image_url' => $menuItem->image_url,
                'is_available' => $menuItem->is_available,
                'preparation_time' => $menuItem->preparation_time,
            ],
        ]);
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:tea,snack,cake,pizza',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0|max:999999.99',
            'image_url' => 'nullable|url',
            'is_available' => 'boolean',
            'preparation_time' => 'required|integer|min:0|max:120',
        ]);

        $menuItem->update($validated);

        return redirect()->route('menu-items.index')
            ->with('success', 'Menu item updated successfully!');
    }

    public function destroy(MenuItem $menuItem)
    {
        $menuItem->delete();

        return redirect()->route('menu-items.index')
            ->with('success', 'Menu item deleted successfully!');
    }

    public function toggleAvailability(MenuItem $menuItem)
    {
        $menuItem->update([
            'is_available' => !$menuItem->is_available
        ]);

        return back()->with('success', 'Menu item availability updated!');
    }
}
