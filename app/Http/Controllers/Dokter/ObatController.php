<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\Obat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ObatController extends Controller
{
    /**
     * Display a listing of obat
     */
    public function index(Request $request)
    {
        $query = Obat::query();
        
        // Search functionality
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_obat', 'like', "%{$search}%")
                  ->orWhere('nama_generik', 'like', "%{$search}%")
                  ->orWhere('kategori', 'like', "%{$search}%")
                  ->orWhere('pabrik', 'like', "%{$search}%");
            });
        }

        // Filter by kategori
        if ($request->kategori) {
            $query->where('kategori', $request->kategori);
        }

        // Filter by status stok
        if ($request->status_stok) {
            if ($request->status_stok === 'habis') {
                $query->where('stok_tersedia', '<=', 0);
            } elseif ($request->status_stok === 'menipis') {
                $query->where('stok_tersedia', '>', 0)
                      ->where('stok_tersedia', '<=', 10);
            } elseif ($request->status_stok === 'tersedia') {
                $query->where('stok_tersedia', '>', 10);
            }
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'nama_obat');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $obat = $query->paginate(20)->withQueryString();

        // Transform data for frontend
        $obat->getCollection()->transform(function ($item) {
            return [
                'id' => $item->id,
                'kode_obat' => $item->kode_obat,
                'nama_obat' => $item->nama_obat,
                'nama_generik' => $item->nama_generik,
                'kategori' => $item->kategori,
                'satuan' => $item->satuan,
                'stok_tersedia' => $item->stok_tersedia,
                'stok_minimum' => $item->stok_minimum,
                'harga' => $item->harga,
                'pabrik' => $item->pabrik,
                'tanggal_kadaluarsa' => $item->tanggal_kadaluarsa?->format('Y-m-d'),
                'tanggal_kadaluarsa_formatted' => $item->tanggal_kadaluarsa?->format('d/m/Y'),
                'status_stok' => $this->getStatusStok($item->stok_tersedia, $item->stok_minimum),
                'is_expired' => $item->tanggal_kadaluarsa && $item->tanggal_kadaluarsa->isPast(),
                'days_to_expire' => $item->tanggal_kadaluarsa ? now()->diffInDays($item->tanggal_kadaluarsa, false) : null,
                'is_aktif' => $item->is_aktif,
            ];
        });

        // Get unique categories for filter
        $categories = Obat::distinct()->pluck('kategori')->filter()->sort();

        // Statistics
        $stats = [
            'total_obat' => Obat::count(),
            'stok_habis' => Obat::where('stok_tersedia', '<=', 0)->count(),
            'stok_menipis' => Obat::where('stok_tersedia', '>', 0)->where('stok_tersedia', '<=', 10)->count(),
            'akan_kadaluwarsa' => Obat::whereNotNull('tanggal_kadaluarsa')
                ->where('tanggal_kadaluarsa', '<=', now()->addDays(30))
                ->where('tanggal_kadaluarsa', '>', now())
                ->count(),
            'sudah_kadaluwarsa' => Obat::whereNotNull('tanggal_kadaluarsa')
                ->where('tanggal_kadaluarsa', '<=', now())
                ->count(),
        ];

        return Inertia::render('dokter/obat/index', [
            'obat' => [
                'data' => $obat->items(),
                'current_page' => $obat->currentPage(),
                'last_page' => $obat->lastPage(),
                'per_page' => $obat->perPage(),
                'total' => $obat->total(),
                'from' => $obat->firstItem(),
                'to' => $obat->lastItem(),
            ],
            'categories' => $categories,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'kategori' => $request->kategori,
                'status_stok' => $request->status_stok,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Show the form for creating a new obat
     */
    public function create()
    {
        // Get unique categories for dropdown
        $categories = Obat::distinct()->pluck('kategori')->filter()->sort();
        
        // Common satuan options
        $satuanOptions = [
            'tablet',
            'kapsul',
            'sirup',
            'botol',
            'sachet',
            'tube',
            'vial',
            'ampul',
        ];

        return Inertia::render('dokter/obat/create', [
            'categories' => $categories,
            'satuan_options' => $satuanOptions,
        ]);
    }

    /**
     * Store a newly created obat
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_obat' => 'required|string|max:100|unique:obat,nama_obat',
            'nama_generik' => 'nullable|string|max:100',
            'kategori' => 'required|string|max:50',
            'satuan' => 'required|string|max:20',
            'stok_tersedia' => 'required|integer|min:0',
            'stok_minimum' => 'required|integer|min:0',
            'harga' => 'required|numeric|min:0',
            'pabrik' => 'nullable|string|max:100',
            'tanggal_kadaluarsa' => 'nullable|date|after:today',
            'deskripsi' => 'nullable|string|max:1000',
        ]);

        try {
            // Generate kode obat
            $kodeObat = $this->generateKodeObat();

            $obat = Obat::create([
                'kode_obat' => $kodeObat,
                'nama_obat' => $request->nama_obat,
                'nama_generik' => $request->nama_generik,
                'kategori' => $request->kategori,
                'satuan' => $request->satuan,
                'stok_tersedia' => $request->stok_tersedia,
                'stok_minimum' => $request->stok_minimum,
                'harga' => $request->harga,
                'pabrik' => $request->pabrik,
                'tanggal_kadaluarsa' => $request->tanggal_kadaluarsa,
                'deskripsi' => $request->deskripsi,
                'is_aktif' => true,
            ]);

            Log::info('Obat created successfully', [
                'obat_id' => $obat->id,
                'nama_obat' => $obat->nama_obat,
                'created_by' => Auth::user()->name ?? 'System'
            ]);

            return redirect()->route('dokter.obat.index')
                ->with('success', 'Data obat berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Failed to create obat', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return back()->withErrors(['error' => 'Gagal menambahkan data obat.'])->withInput();
        }
    }

    /**
     * Display the specified obat
     */
    public function show(Obat $obat)
    {
        $obatData = [
            'id' => $obat->id,
            'kode_obat' => $obat->kode_obat,
            'nama_obat' => $obat->nama_obat,
            'nama_generik' => $obat->nama_generik,
            'kategori' => $obat->kategori,
            'satuan' => $obat->satuan,
            'stok_tersedia' => $obat->stok_tersedia,
            'stok_minimum' => $obat->stok_minimum,
            'harga' => $obat->harga,
            'harga_formatted' => 'Rp ' . number_format($obat->harga, 0, ',', '.'),
            'pabrik' => $obat->pabrik,
            'tanggal_kadaluarsa' => $obat->tanggal_kadaluarsa?->format('Y-m-d'),
            'tanggal_kadaluarsa_formatted' => $obat->tanggal_kadaluarsa?->format('d/m/Y'),
            'deskripsi' => $obat->deskripsi,
            'status_stok' => $this->getStatusStok($obat->stok_tersedia, $obat->stok_minimum),
            'is_expired' => $obat->tanggal_kadaluarsa && $obat->tanggal_kadaluarsa->isPast(),
            'days_to_expire' => $obat->tanggal_kadaluarsa ? now()->diffInDays($obat->tanggal_kadaluarsa, false) : null,
            'is_aktif' => $obat->is_aktif,
            'created_at' => $obat->created_at->format('Y-m-d H:i:s'),
            'created_at_formatted' => $obat->created_at->format('d/m/Y H:i'),
            'updated_at' => $obat->updated_at->format('Y-m-d H:i:s'),
            'updated_at_formatted' => $obat->updated_at->format('d/m/Y H:i'),
        ];

        return Inertia::render('dokter/obat/show', [
            'obat' => $obatData,
        ]);
    }

    /**
     * Show the form for editing the specified obat
     */
    public function edit(Obat $obat)
    {
        // Get unique categories for dropdown
        $categories = Obat::distinct()->pluck('kategori')->filter()->sort();
        
        // Common satuan options
        $satuanOptions = [
            'tablet',
            'kapsul',
            'sirup',
            'botol',
            'sachet',
            'tube',
            'vial',
            'ampul',
        ];

        $obatData = [
            'id' => $obat->id,
            'kode_obat' => $obat->kode_obat,
            'nama_obat' => $obat->nama_obat,
            'nama_generik' => $obat->nama_generik,
            'kategori' => $obat->kategori,
            'satuan' => $obat->satuan,
            'stok_tersedia' => $obat->stok_tersedia,
            'stok_minimum' => $obat->stok_minimum,
            'harga' => $obat->harga,
            'pabrik' => $obat->pabrik,
            'tanggal_kadaluarsa' => $obat->tanggal_kadaluarsa?->format('Y-m-d'),
            'deskripsi' => $obat->deskripsi,
            'is_aktif' => $obat->is_aktif,
        ];

        return Inertia::render('dokter/obat/edit', [
            'obat' => $obatData,
            'categories' => $categories,
            'satuan_options' => $satuanOptions,
        ]);
    }

    /**
     * Update the specified obat
     */
    public function update(Request $request, Obat $obat)
    {
        $request->validate([
            'nama_obat' => 'required|string|max:100|unique:obat,nama_obat,' . $obat->id,
            'nama_generik' => 'nullable|string|max:100',
            'kategori' => 'required|string|max:50',
            'satuan' => 'required|string|max:20',
            'stok_tersedia' => 'required|integer|min:0',
            'stok_minimum' => 'required|integer|min:0',
            'harga' => 'required|numeric|min:0',
            'pabrik' => 'nullable|string|max:100',
            'tanggal_kadaluarsa' => 'nullable|date|after:today',
            'deskripsi' => 'nullable|string|max:1000',
        ]);

        try {
            $obat->update([
                'nama_obat' => $request->nama_obat,
                'nama_generik' => $request->nama_generik,
                'kategori' => $request->kategori,
                'satuan' => $request->satuan,
                'stok_tersedia' => $request->stok_tersedia,
                'stok_minimum' => $request->stok_minimum,
                'harga' => $request->harga,
                'pabrik' => $request->pabrik,
                'tanggal_kadaluarsa' => $request->tanggal_kadaluarsa,
                'deskripsi' => $request->deskripsi,
            ]);

            Log::info('Obat updated successfully', [
                'obat_id' => $obat->id,
                'nama_obat' => $obat->nama_obat,
                'updated_by' => Auth::user()->name ?? 'System'
            ]);

            return redirect()->route('dokter.obat.index')
                ->with('success', 'Data obat berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Failed to update obat', [
                'obat_id' => $obat->id,
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return back()->withErrors(['error' => 'Gagal memperbarui data obat.'])->withInput();
        }
    }

    /**
     * Remove the specified obat
     */
    public function destroy(Obat $obat)
    {
        try {
            // Check if obat is used in any resep
            if ($obat->detailResep()->exists()) {
                return back()->withErrors(['error' => 'Obat tidak dapat dihapus karena sudah digunakan dalam resep.']);
            }

            $namaObat = $obat->nama_obat;
            $obat->delete();

            Log::info('Obat deleted successfully', [
                'obat_id' => $obat->id,
                'nama_obat' => $namaObat,
                'deleted_by' => Auth::user()->name ?? 'System'
            ]);

            return redirect()->route('dokter.obat.index')
                ->with('success', 'Data obat berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Failed to delete obat', [
                'obat_id' => $obat->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Gagal menghapus data obat.']);
        }
    }

    /**
     * Get status stok based on available stock and minimum stock
     */
    private function getStatusStok($stokTersedia, $stokMinimum)
    {
        if ($stokTersedia <= 0) {
            return 'habis';
        } elseif ($stokTersedia <= $stokMinimum) {
            return 'menipis';
        } else {
            return 'tersedia';
        }
    }

    /**
     * Generate kode obat otomatis
     */
    private function generateKodeObat()
    {
        // Format: OBT + 6 digit number (contoh: OBT000001)
        $lastObat = Obat::orderBy('id', 'desc')->first();
        $nextNumber = $lastObat ? ($lastObat->id + 1) : 1;
        
        return 'OBT' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }
}
