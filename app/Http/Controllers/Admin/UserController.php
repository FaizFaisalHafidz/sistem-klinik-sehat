<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $role = $request->get('role');
        $status = $request->get('status');

        $users = User::with('roles')
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('nama_pengguna', 'like', "%{$search}%");
                });
            })
            ->when($role, function ($query, $role) {
                return $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            })
            ->when($status !== null, function ($query) use ($status) {
                return $query->where('is_aktif', $status === 'active');
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Transform data untuk frontend
        $users->through(function ($user) {
            return [
                'id' => $user->id,
                'nama_pengguna' => $user->nama_pengguna,
                'nama_lengkap' => $user->nama_lengkap,
                'email' => $user->email,
                'telepon' => $user->telepon,
                'is_aktif' => $user->is_aktif,
                'roles' => $user->roles->pluck('name')->toArray(),
                'foto_profil' => $user->foto_profil 
                    ? asset('storage/' . $user->foto_profil)
                    : 'https://ui-avatars.com/api/?name=' . urlencode($user->nama_lengkap) . '&color=3B82F6&background=EBF4FF',
                'created_at' => $user->created_at->format('d M Y H:i'),
                'updated_at' => $user->updated_at->format('d M Y H:i'),
            ];
        });

        $roles = Role::all()->pluck('name', 'name');

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::all()->map(function ($role) {
            return [
                'value' => $role->name,
                'label' => ucfirst($role->name),
            ];
        });

        return Inertia::render('admin/users/create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pengguna' => 'required|string|max:255|unique:users',
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'telepon' => 'nullable|string|max:20',
            'roles' => 'required|array|min:1',
            'roles.*' => 'string|exists:roles,name',
            'is_aktif' => 'boolean',
        ]);

        $user = User::create([
            'nama_pengguna' => $validated['nama_pengguna'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'telepon' => $validated['telepon'],
            'is_aktif' => $validated['is_aktif'] ?? true,
        ]);

        $user->assignRole($validated['roles']);

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load('roles');

        $userData = [
            'id' => $user->id,
            'nama_pengguna' => $user->nama_pengguna,
            'nama_lengkap' => $user->nama_lengkap,
            'email' => $user->email,
            'telepon' => $user->telepon,
            'is_aktif' => $user->is_aktif,
            'roles' => $user->roles->pluck('name')->toArray(),
            'foto_profil' => $user->foto_profil 
                ? asset('storage/' . $user->foto_profil)
                : 'https://ui-avatars.com/api/?name=' . urlencode($user->nama_lengkap) . '&color=3B82F6&background=EBF4FF',
            'created_at' => $user->created_at->format('d M Y H:i'),
            'updated_at' => $user->updated_at->format('d M Y H:i'),
        ];

        return Inertia::render('admin/users/show', [
            'user' => $userData,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $user->load('roles');

        $roles = Role::all()->map(function ($role) {
            return [
                'value' => $role->name,
                'label' => ucfirst($role->name),
            ];
        });

        $userData = [
            'id' => $user->id,
            'nama_pengguna' => $user->nama_pengguna,
            'nama_lengkap' => $user->nama_lengkap,
            'email' => $user->email,
            'telepon' => $user->telepon,
            'is_aktif' => $user->is_aktif,
            'roles' => $user->roles->pluck('name')->toArray(),
        ];

        return Inertia::render('admin/users/edit', [
            'user' => $userData,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'nama_pengguna' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'nama_lengkap' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'telepon' => 'nullable|string|max:20',
            'roles' => 'required|array|min:1',
            'roles.*' => 'string|exists:roles,name',
            'is_aktif' => 'boolean',
        ]);

        $updateData = [
            'nama_pengguna' => $validated['nama_pengguna'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'email' => $validated['email'],
            'telepon' => $validated['telepon'],
            'is_aktif' => $validated['is_aktif'] ?? $user->is_aktif,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);
        $user->syncRoles($validated['roles']);

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berhasil diperbarui.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(User $user)
    {
        $user->update([
            'is_aktif' => !$user->is_aktif
        ]);

        $status = $user->is_aktif ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()
            ->with('success', "Pengguna berhasil {$status}.");
    }

    /**
     * Remove the specified resource from storage.
     * Note: We don't actually delete users, just deactivate them.
     */
    public function destroy(User $user)
    {
        return redirect()->back()
            ->with('error', 'Pengguna tidak dapat dihapus. Gunakan fitur nonaktifkan pengguna.');
    }
}
