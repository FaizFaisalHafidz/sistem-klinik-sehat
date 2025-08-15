<?php

namespace App\Http\Controllers;

use App\Models\Obat;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ObatController extends Controller
{
    public function index(Request $request)
    {
        $query = Obat::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('kode_obat', 'like', "%{$searchTerm}%")
                  ->orWhere('nama_obat', 'like', "%{$searchTerm}%")
                  ->orWhere('nama_generik', 'like', "%{$searchTerm}%")
                  ->orWhere('pabrik', 'like', "%{$searchTerm}%")
                  ->orWhere('kategori', 'like', "%{$searchTerm}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('is_aktif', $request->status === 'aktif');
        }

        // Filter by kategori
        if ($request->has('kategori') && $request->kategori !== '') {
            $query->where('kategori', $request->kategori);
        }

        // Filter by stok
        if ($request->has('stok') && $request->stok !== '') {
            if ($request->stok === 'menipis') {
                $query->whereColumn('stok_tersedia', '<=', 'stok_minimum');
            } elseif ($request->stok === 'habis') {
                $query->where('stok_tersedia', 0);
            }
        }

        // Filter by expiry
        if ($request->has('expiry') && $request->expiry !== '') {
            if ($request->expiry === 'akan_kadaluarsa') {
                $query->where('tanggal_kadaluarsa', '<=', now()->addDays(30));
            } elseif ($request->expiry === 'kadaluarsa') {
                $query->where('tanggal_kadaluarsa', '<', now());
            }
        }

        $obat = $query->orderBy('created_at', 'desc')->paginate(10);

        // Transform data for frontend
        $obat->getCollection()->transform(function ($item) {
            return [
                'id' => $item->id,
                'kode_obat' => $item->kode_obat,
                'nama_obat' => $item->nama_obat,
                'nama_generik' => $item->nama_generik,
                'pabrik' => $item->pabrik,
                'kategori' => $item->kategori,
                'satuan' => $item->satuan,
                'harga' => $item->harga,
                'stok_tersedia' => $item->stok_tersedia,
                'stok_minimum' => $item->stok_minimum,
                'tanggal_kadaluarsa' => $item->tanggal_kadaluarsa?->format('Y-m-d'),
                'deskripsi' => $item->deskripsi,
                'is_aktif' => $item->is_aktif,
                'is_stok_menipis' => $item->stok_tersedia <= $item->stok_minimum,
                'is_akan_kadaluarsa' => $item->tanggal_kadaluarsa ? $item->tanggal_kadaluarsa->diffInDays(now()) <= 30 : false,
                'is_kadaluarsa' => $item->tanggal_kadaluarsa ? $item->tanggal_kadaluarsa < now() : false,
                'created_at' => $item->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $item->updated_at?->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('admin/obat/index', [
            'obat' => $obat,
            'filters' => $request->only(['search', 'status', 'kategori', 'stok', 'expiry']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/obat/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_obat' => 'required|string|max:20|unique:obat,kode_obat',
            'nama_obat' => 'required|string|max:100',
            'nama_generik' => 'nullable|string|max:100',
            'pabrik' => 'nullable|string|max:100',
            'kategori' => 'nullable|string|max:50',
            'satuan' => 'required|string|max:20',
            'harga' => 'required|numeric|min:0',
            'stok_tersedia' => 'required|integer|min:0',
            'stok_minimum' => 'required|integer|min:0',
            'tanggal_kadaluarsa' => 'nullable|date|after:today',
            'deskripsi' => 'nullable|string',
            'is_aktif' => 'required|string|in:true,false',
        ]);

        // Convert string boolean to actual boolean
        $validated['is_aktif'] = $validated['is_aktif'] === 'true';

        DB::transaction(function () use ($validated) {
            Obat::create($validated);
        });

        return redirect()->route('admin.obat.index')
            ->with('success', 'Data obat berhasil ditambahkan.');
    }

    public function show(Obat $obat)
    {
        $obatData = [
            'id' => $obat->id,
            'kode_obat' => $obat->kode_obat,
            'nama_obat' => $obat->nama_obat,
            'nama_generik' => $obat->nama_generik,
            'pabrik' => $obat->pabrik,
            'kategori' => $obat->kategori,
            'satuan' => $obat->satuan,
            'harga' => $obat->harga,
            'stok_tersedia' => $obat->stok_tersedia,
            'stok_minimum' => $obat->stok_minimum,
            'tanggal_kadaluarsa' => $obat->tanggal_kadaluarsa?->format('Y-m-d'),
            'deskripsi' => $obat->deskripsi,
            'is_aktif' => $obat->is_aktif,
            'is_stok_menipis' => $obat->stok_tersedia <= $obat->stok_minimum,
            'is_akan_kadaluarsa' => $obat->tanggal_kadaluarsa ? $obat->tanggal_kadaluarsa->diffInDays(now()) <= 30 : false,
            'is_kadaluarsa' => $obat->tanggal_kadaluarsa ? $obat->tanggal_kadaluarsa < now() : false,
            'created_at' => $obat->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $obat->updated_at?->format('Y-m-d H:i:s'),
        ];

        return Inertia::render('admin/obat/show', [
            'obat' => $obatData,
        ]);
    }

    public function edit(Obat $obat)
    {
        $obatData = [
            'id' => $obat->id,
            'kode_obat' => $obat->kode_obat,
            'nama_obat' => $obat->nama_obat,
            'nama_generik' => $obat->nama_generik,
            'pabrik' => $obat->pabrik,
            'kategori' => $obat->kategori,
            'satuan' => $obat->satuan,
            'harga' => $obat->harga,
            'stok_tersedia' => $obat->stok_tersedia,
            'stok_minimum' => $obat->stok_minimum,
            'tanggal_kadaluarsa' => $obat->tanggal_kadaluarsa?->format('Y-m-d'),
            'deskripsi' => $obat->deskripsi,
            'is_aktif' => $obat->is_aktif,
        ];

        return Inertia::render('admin/obat/edit', [
            'obat' => $obatData,
        ]);
    }

    public function update(Request $request, Obat $obat)
    {
        $validated = $request->validate([
            'kode_obat' => [
                'required',
                'string',
                'max:20',
                Rule::unique('obat', 'kode_obat')->ignore($obat->id),
            ],
            'nama_obat' => 'required|string|max:100',
            'nama_generik' => 'nullable|string|max:100',
            'pabrik' => 'nullable|string|max:100',
            'kategori' => 'nullable|string|max:50',
            'satuan' => 'required|string|max:20',
            'harga' => 'required|numeric|min:0',
            'stok_tersedia' => 'required|integer|min:0',
            'stok_minimum' => 'required|integer|min:0',
            'tanggal_kadaluarsa' => 'nullable|date|after:today',
            'deskripsi' => 'nullable|string',
            'is_aktif' => 'required|string|in:true,false',
        ]);

        // Convert string boolean to actual boolean
        $validated['is_aktif'] = $validated['is_aktif'] === 'true';

        DB::transaction(function () use ($obat, $validated) {
            $obat->update($validated);
        });

        return redirect()->route('admin.obat.index')
            ->with('success', 'Data obat berhasil diperbarui.');
    }

    public function destroy(Obat $obat)
    {
        DB::transaction(function () use ($obat) {
            $obat->delete();
        });

        return redirect()->route('admin.obat.index')
            ->with('success', 'Data obat berhasil dihapus.');
    }
}
