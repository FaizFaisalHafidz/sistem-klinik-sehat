<?php

namespace App\Http\Controllers;

use App\Models\Pegawai;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PegawaiController extends Controller
{
    public function index(Request $request)
    {
        $query = Pegawai::with('user');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('kode_pegawai', 'like', "%{$searchTerm}%")
                  ->orWhere('nama_lengkap', 'like', "%{$searchTerm}%")
                  ->orWhere('jabatan', 'like', "%{$searchTerm}%")
                  ->orWhere('departemen', 'like', "%{$searchTerm}%")
                  ->orWhere('nomor_izin', 'like', "%{$searchTerm}%")
                  ->orWhere('spesialisasi', 'like', "%{$searchTerm}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('is_aktif', $request->status === 'aktif');
        }

        // Filter by jabatan
        if ($request->has('jabatan') && $request->jabatan !== '') {
            $query->where('jabatan', $request->jabatan);
        }

        // Filter by departemen
        if ($request->has('departemen') && $request->departemen !== '') {
            $query->where('departemen', $request->departemen);
        }

        $pegawai = $query->orderBy('created_at', 'desc')->paginate(10);

        // Transform data for frontend
        $pegawai->getCollection()->transform(function ($item) {
            // Append accessor untuk biaya konsultasi formatted
            $item->append('biaya_konsultasi_formatted');
            
            return [
                'id' => $item->id,
                'kode_pegawai' => $item->kode_pegawai,
                'nama_lengkap' => $item->nama_lengkap,
                'jabatan' => $item->jabatan,
                'departemen' => $item->departemen,
                'nomor_izin' => $item->nomor_izin,
                'spesialisasi' => $item->spesialisasi,
                'telepon' => $item->telepon,
                'email' => $item->email,
                'alamat' => $item->alamat,
                'tanggal_masuk' => $item->tanggal_masuk?->format('Y-m-d'),
                'is_aktif' => $item->is_aktif,
                'biaya_konsultasi' => $item->biaya_konsultasi,
                'biaya_konsultasi_formatted' => $item->biaya_konsultasi_formatted,
                'user' => $item->user ? [
                    'id' => $item->user->id,
                    'nama_pengguna' => $item->user->nama_pengguna,
                    'nama_lengkap' => $item->user->nama_lengkap,
                    'email' => $item->user->email,
                ] : null,
                'created_at' => $item->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $item->updated_at?->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('admin/pegawai/index', [
            'pegawai' => $pegawai,
            'filters' => $request->only(['search', 'status', 'jabatan', 'departemen']),
        ]);
    }

    public function create()
    {
        // Get available users that are not already assigned to employees
        $availableUsers = User::whereDoesntHave('pegawai')->get(['id', 'nama_pengguna', 'nama_lengkap', 'email']);

        return Inertia::render('admin/pegawai/create', [
            'availableUsers' => $availableUsers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_pegawai' => 'required|string|max:20|unique:pegawai,kode_pegawai',
            'user_id' => 'nullable|exists:users,id|unique:pegawai,user_id',
            'nama_lengkap' => 'required|string|max:100',
            'jabatan' => 'required|string|max:50',
            'departemen' => 'nullable|string|max:50',
            'nomor_izin' => 'nullable|string|max:50',
            'spesialisasi' => 'nullable|string|max:100',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'alamat' => 'nullable|string',
            'tanggal_masuk' => 'nullable|date',
            'biaya_konsultasi' => 'nullable|numeric|min:0|max:99999999.99',
            'is_aktif' => 'required|string|in:true,false',
        ]);

        // Convert string boolean to actual boolean
        $validated['is_aktif'] = $validated['is_aktif'] === 'true';
        
        // Convert empty user_id to null
        if (empty($validated['user_id'])) {
            $validated['user_id'] = null;
        }

        // Set default biaya konsultasi jika tidak diisi
        if (empty($validated['biaya_konsultasi'])) {
            $validated['biaya_konsultasi'] = 0;
        }

        DB::transaction(function () use ($validated) {
            Pegawai::create($validated);
        });

        return redirect()->route('admin.pegawai.index')
            ->with('success', 'Data pegawai berhasil ditambahkan.');
    }

    public function show(Pegawai $pegawai)
    {
        $pegawai->load('user');

        $pegawaiData = [
            'id' => $pegawai->id,
            'kode_pegawai' => $pegawai->kode_pegawai,
            'nama_lengkap' => $pegawai->nama_lengkap,
            'jabatan' => $pegawai->jabatan,
            'departemen' => $pegawai->departemen,
            'nomor_izin' => $pegawai->nomor_izin,
            'spesialisasi' => $pegawai->spesialisasi,
            'telepon' => $pegawai->telepon,
            'email' => $pegawai->email,
            'alamat' => $pegawai->alamat,
            'tanggal_masuk' => $pegawai->tanggal_masuk?->format('Y-m-d'),
            'biaya_konsultasi' => $pegawai->biaya_konsultasi,
            'biaya_konsultasi_formatted' => $pegawai->biaya_konsultasi_formatted,
            'is_aktif' => $pegawai->is_aktif,
            'user' => $pegawai->user ? [
                'id' => $pegawai->user->id,
                'nama_pengguna' => $pegawai->user->nama_pengguna,
                'nama_lengkap' => $pegawai->user->nama_lengkap,
                'email' => $pegawai->user->email,
            ] : null,
            'created_at' => $pegawai->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $pegawai->updated_at?->format('Y-m-d H:i:s'),
        ];

        return Inertia::render('admin/pegawai/show', [
            'pegawai' => $pegawaiData,
        ]);
    }

    public function edit(Pegawai $pegawai)
    {
        $pegawai->load('user');

        // Get available users (excluding current user if assigned)
        $availableUsers = User::whereDoesntHave('pegawai')
            ->orWhere('id', $pegawai->user_id)
            ->get(['id', 'nama_pengguna', 'nama_lengkap', 'email']);

        $pegawaiData = [
            'id' => $pegawai->id,
            'kode_pegawai' => $pegawai->kode_pegawai,
            'user_id' => $pegawai->user_id,
            'nama_lengkap' => $pegawai->nama_lengkap,
            'jabatan' => $pegawai->jabatan,
            'departemen' => $pegawai->departemen,
            'nomor_izin' => $pegawai->nomor_izin,
            'spesialisasi' => $pegawai->spesialisasi,
            'telepon' => $pegawai->telepon,
            'email' => $pegawai->email,
            'alamat' => $pegawai->alamat,
            'tanggal_masuk' => $pegawai->tanggal_masuk?->format('Y-m-d'),
            'biaya_konsultasi' => $pegawai->biaya_konsultasi,
            'is_aktif' => $pegawai->is_aktif,
        ];

        return Inertia::render('admin/pegawai/edit', [
            'pegawai' => $pegawaiData,
            'availableUsers' => $availableUsers,
        ]);
    }

    public function update(Request $request, Pegawai $pegawai)
    {
        $validated = $request->validate([
            'kode_pegawai' => [
                'required',
                'string',
                'max:20',
                Rule::unique('pegawai', 'kode_pegawai')->ignore($pegawai->id),
            ],
            'user_id' => [
                'nullable',
                'exists:users,id',
                Rule::unique('pegawai', 'user_id')->ignore($pegawai->id),
            ],
            'nama_lengkap' => 'required|string|max:100',
            'jabatan' => 'required|string|max:50',
            'departemen' => 'nullable|string|max:50',
            'nomor_izin' => 'nullable|string|max:50',
            'spesialisasi' => 'nullable|string|max:100',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'alamat' => 'nullable|string',
            'tanggal_masuk' => 'nullable|date',
            'biaya_konsultasi' => 'nullable|numeric|min:0|max:99999999.99',
            'is_aktif' => 'required|string|in:true,false',
        ]);

        // Convert string boolean to actual boolean
        $validated['is_aktif'] = $validated['is_aktif'] === 'true';
        
        // Convert empty user_id to null
        if (empty($validated['user_id'])) {
            $validated['user_id'] = null;
        }

        // Set default biaya konsultasi jika tidak diisi
        if (empty($validated['biaya_konsultasi'])) {
            $validated['biaya_konsultasi'] = 0;
        }

        DB::transaction(function () use ($pegawai, $validated) {
            $pegawai->update($validated);
        });

        return redirect()->route('admin.pegawai.index')
            ->with('success', 'Data pegawai berhasil diperbarui.');
    }

    public function destroy(Pegawai $pegawai)
    {
        DB::transaction(function () use ($pegawai) {
            $pegawai->delete();
        });

        return redirect()->route('admin.pegawai.index')
            ->with('success', 'Data pegawai berhasil dihapus.');
    }
}
