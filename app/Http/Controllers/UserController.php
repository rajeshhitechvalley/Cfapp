<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request): Response
    {
        $query = User::where('created_by', auth()->id())
            ->orWhere('id', auth()->id());

        // Filter by role if specified
        if ($request->filled('role')) {
            $query->byRole($request->role);
        }

        // Filter by active status if specified
        if ($request->filled('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['role', 'active', 'search']),
            'roles' => [
                'staff' => 'Staff',
                'customer' => 'Customer',
                'kitchen' => 'Kitchen Staff',
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'roles' => [
                'staff' => 'Staff',
                'customer' => 'Customer',
                'kitchen' => 'Kitchen Staff',
            ],
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'required|in:staff,customer,kitchen',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['created_by'] = auth()->id();

        User::create($validated);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        // Check if user owns this staff member (or is viewing themselves)
        if ($user->created_by !== auth()->id() && $user->id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        
        $user->load(['createdOrders', 'assignedOrders', 'customerOrders']);

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        // Check if user owns this staff member (or is editing themselves)
        if ($user->created_by !== auth()->id() && $user->id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        
        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => [
                'staff' => 'Staff',
                'customer' => 'Customer',
                'kitchen' => 'Kitchen Staff',
            ],
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        // Check if user owns this staff member (or is updating themselves)
        if ($user->created_by !== auth()->id() && $user->id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:staff,customer,kitchen',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['required', 'confirmed', Password::defaults()],
            ]);
            $validated['password'] = Hash::make($validated['password']);
        }

        $validated['is_active'] = $validated['is_active'] ?? $user->is_active;

        $user->update($validated);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        // Prevent deletion of the current authenticated user
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }
        
        // Check if user owns this staff member
        if ($user->created_by !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive(User $user)
    {
        // Prevent deactivating the current authenticated user
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }
        
        // Check if user owns this staff member
        if ($user->created_by !== auth()->id() && $user->id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $user->update([
            'is_active' => !$user->is_active
        ]);

        $status = $user->is_active ? 'activated' : 'deactivated';
        
        return back()->with('success', "User {$status} successfully.");
    }

    /**
     * Get users by role for API endpoints.
     */
    public function getByRole(Request $request, string $role)
    {
        $users = User::byRole($role)->active()->get(['id', 'name', 'email']);
        
        return response()->json($users);
    }

    /**
     * Update user profile (for self-service).
     */
    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'preferences' => 'nullable|array',
        ]);

        $user->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update user password (for self-service).
     */
    public function updatePassword(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        return back()->with('success', 'Password updated successfully.');
    }
}
