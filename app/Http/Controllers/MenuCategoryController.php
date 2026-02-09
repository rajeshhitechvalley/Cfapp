<?php

namespace App\Http\Controllers;

use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = MenuCategory::ordered()->get();
        
        return Inertia::render('MenuCategories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('MenuCategories/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:menu_categories',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/categories'), $imageName);
            $validated['image_url'] = '/uploads/categories/' . $imageName;
        }

        unset($validated['image']); // Remove the file from validated data

        MenuCategory::create($validated);

        return redirect()->route('menu-categories.index')
            ->with('success', 'Menu category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MenuCategory $menuCategory)
    {
        $menuCategory->load('menuItems');
        
        return Inertia::render('MenuCategories/Show', [
            'category' => $menuCategory,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MenuCategory $menuCategory)
    {
        return Inertia::render('MenuCategories/Edit', [
            'category' => $menuCategory,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MenuCategory $menuCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:menu_categories,name,' . $menuCategory->id,
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($menuCategory->image_url && file_exists(public_path($menuCategory->image_url))) {
                unlink(public_path($menuCategory->image_url));
            }
            
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/categories'), $imageName);
            $validated['image_url'] = '/uploads/categories/' . $imageName;
        }

        unset($validated['image']); // Remove the file from validated data

        $menuCategory->update($validated);

        return redirect()->route('menu-categories.index')
            ->with('success', 'Menu category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $menuCategory = MenuCategory::findOrFail($id);
        
        if ($menuCategory->menuItems()->exists()) {
            return back()->with('error', 'Cannot delete category with associated menu items.');
        }

        // Delete associated image if exists
        if ($menuCategory->image_url && file_exists(public_path($menuCategory->image_url))) {
            unlink(public_path($menuCategory->image_url));
        }

        $menuCategory->delete();

        return redirect()->route('menu-categories.index')
            ->with('success', 'Menu category deleted successfully.');
    }
}
