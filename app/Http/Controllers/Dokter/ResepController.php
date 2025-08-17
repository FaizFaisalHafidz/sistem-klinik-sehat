<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\Resep;
use App\Models\Pasien;
use App\Models\Obat;
use App\Models\DetailResep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class ResepController extends Controller
{
    public function index(Request $request)
    {
        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $query = Resep::with(['pasien', 'dokter', 'detailResep.obat'])
            ->where('dokter_id', $pegawai->id)
            ->orderBy('tanggal_resep', 'desc');

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_resep', 'like', "%{$search}%")
                  ->orWhereHas('pasien', function ($q) use ($search) {
                      $q->where('nama_lengkap', 'like', "%{$search}%")
                        ->orWhere('kode_pasien', 'like', "%{$search}%");
                  });
            });
        }

        // Filter berdasarkan tanggal
        if ($request->filled('tanggal_dari') && $request->filled('tanggal_sampai')) {
            $query->whereBetween('tanggal_resep', [
                $request->tanggal_dari,
                $request->tanggal_sampai . ' 23:59:59'
            ]);
        } elseif ($request->filled('tanggal_dari')) {
            $query->whereDate('tanggal_resep', '>=', $request->tanggal_dari);
        } elseif ($request->filled('tanggal_sampai')) {
            $query->whereDate('tanggal_resep', '<=', $request->tanggal_sampai);
        }

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status_resep', $request->status);
        }

        $resep = $query->paginate(20)->withQueryString();

        // Format data untuk setiap item
        $resep->getCollection()->transform(function ($item) {
            $item->tanggal_resep_formatted = $item->tanggal_resep->format('d M Y, H:i');
            $item->total_obat = $item->detailResep->count();
            return $item;
        });

        // Stats untuk dashboard
        $stats = [
            'total_resep' => Resep::where('dokter_id', $pegawai->id)->count(),
            'resep_bulan_ini' => Resep::where('dokter_id', $pegawai->id)
                ->whereMonth('tanggal_resep', Carbon::now()->month)
                ->whereYear('tanggal_resep', Carbon::now()->year)
                ->count(),
            'resep_hari_ini' => Resep::where('dokter_id', $pegawai->id)
                ->whereDate('tanggal_resep', Carbon::today())
                ->count(),
            'total_pasien_unik' => Resep::where('dokter_id', $pegawai->id)
                ->distinct('pasien_id')
                ->count('pasien_id'),
        ];

        return Inertia::render('dokter/resep/index', [
            'resep' => $resep,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'tanggal_dari' => $request->tanggal_dari,
                'tanggal_sampai' => $request->tanggal_sampai,
                'status' => $request->status,
            ],
        ]);
    }

    public function show($id)
    {
        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $resep = Resep::with(['pasien', 'dokter', 'detailResep.obat'])
            ->where('dokter_id', $pegawai->id)
            ->findOrFail($id);

        // Format data
        $resep->tanggal_resep_formatted = $resep->tanggal_resep->format('d M Y, H:i');
        $resep->total_harga = $resep->detailResep->sum(function ($detail) {
            return $detail->jumlah * $detail->harga_satuan;
        });

        return Inertia::render('dokter/resep/show', [
            'resep' => $resep,
        ]);
    }

    public function create(Request $request)
    {
        $pasienId = $request->query('pasien_id');
        
        // Get available obat
        $obat = Obat::where('stok_tersedia', '>', 0)->get();
        
        // Get pasien if pasien_id provided
        $selectedPasien = null;
        if ($pasienId) {
            $selectedPasien = Pasien::findOrFail($pasienId);
            $selectedPasien->append('umur');
        }

        return Inertia::render('dokter/resep/create', [
            'obat' => $obat,
            'selectedPasien' => $selectedPasien,
        ]);
    }

    public function searchPasien(Request $request)
    {
        $search = $request->get('search', '');
        
        if (strlen($search) < 2) {
            return response()->json([
                'data' => [],
                'message' => 'Masukkan minimal 2 karakter untuk pencarian'
            ]);
        }

        $pasien = Pasien::where(function ($query) use ($search) {
            $query->where('nama_lengkap', 'LIKE', "%{$search}%")
                  ->orWhere('kode_pasien', 'LIKE', "%{$search}%");
        })
        ->limit(10)
        ->get()
        ->map(function ($p) {
            $p->append('umur');
            return $p;
        });

        return response()->json([
            'data' => $pasien,
            'message' => 'Data pasien ditemukan'
        ]);
    }

    public function store(Request $request)
    {
        // Debug request data
        Log::info('Resep Store Request Data:', $request->all());

        $validated = $request->validate([
            'pasien_id' => 'required|exists:pasien,id',
            'catatan_resep' => 'nullable|string|max:1000',
            'detail_resep' => 'required|array|min:1',
            'detail_resep.*.obat_id' => 'required|exists:obat,id',
            'detail_resep.*.jumlah' => 'required|integer|min:1',
            'detail_resep.*.aturan_pakai' => 'required|string|max:255',
            'detail_resep.*.keterangan' => 'nullable|string|max:255',
        ]);

        Log::info('Validation passed. Data:', $validated);

        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();

        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        DB::beginTransaction();
        try {
            // Generate kode resep
            $kodeResep = $this->generateKodeResep();
            Log::info('Generated kode resep:', ['kode_resep' => $kodeResep]);

            // Create resep
            $resep = Resep::create([
                'kode_resep' => $kodeResep,
                'pasien_id' => $request->pasien_id,
                'dokter_id' => $pegawai->id,
                'tanggal_resep' => Carbon::now(),
                'catatan_resep' => $request->catatan_resep,
                'status_resep' => 'belum_diambil',
            ]);
            Log::info('Resep created:', ['resep_id' => $resep->id]);

            // Create detail resep
            foreach ($request->detail_resep as $detail) {
                Log::info('Processing detail resep:', $detail);
                $obat = Obat::findOrFail($detail['obat_id']);
                Log::info('Found obat:', ['obat_id' => $obat->id, 'nama_obat' => $obat->nama_obat, 'stok' => $obat->stok_tersedia]);
                
                // Check stok
                if ($obat->stok_tersedia < $detail['jumlah']) {
                    throw new \Exception("Stok obat {$obat->nama_obat} tidak mencukupi.");
                }

                $detailResep = DetailResep::create([
                    'resep_id' => $resep->id,
                    'obat_id' => $detail['obat_id'],
                    'jumlah' => $detail['jumlah'],
                    'harga_satuan' => $obat->harga,
                    'aturan_pakai' => $detail['aturan_pakai'],
                    'keterangan' => $detail['keterangan'],
                ]);
                Log::info('Detail resep created:', ['detail_id' => $detailResep->id]);

                // Update stok obat
                $obat->decrement('stok_tersedia', $detail['jumlah']);
                Log::info('Stock updated for obat:', ['obat_id' => $obat->id, 'new_stock' => $obat->fresh()->stok_tersedia]);
            }

            DB::commit();
            Log::info('Transaction committed successfully');

            return redirect()->route('dokter.resep.show', $resep->id)
                ->with('success', 'Resep berhasil dibuat.');

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating resep:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function edit($id)
    {
        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $resep = Resep::with(['pasien', 'detailResep.obat'])
            ->where('dokter_id', $pegawai->id)
            ->findOrFail($id);

        // Only allow editing if status is 'belum_diambil'
        if ($resep->status_resep !== 'belum_diambil') {
            return redirect()->route('dokter.resep.show', $resep->id)
                ->with('error', 'Resep yang sudah diambil tidak dapat diedit.');
        }

        // Get available obat
        $obat = Obat::where('stok_tersedia', '>', 0)->get();

        return Inertia::render('dokter/resep/edit', [
            'resep' => $resep,
            'obat' => $obat,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'catatan_resep' => 'nullable|string|max:1000',
            'detail_resep' => 'required|array|min:1',
            'detail_resep.*.obat_id' => 'required|exists:obat,id',
            'detail_resep.*.jumlah' => 'required|integer|min:1',
            'detail_resep.*.aturan_pakai' => 'required|string|max:255',
            'detail_resep.*.keterangan' => 'nullable|string|max:255',
        ]);

        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $resep = Resep::where('dokter_id', $pegawai->id)->findOrFail($id);

        // Only allow editing if status is 'belum_diambil'
        if ($resep->status_resep !== 'belum_diambil') {
            return redirect()->route('dokter.resep.show', $resep->id)
                ->with('error', 'Resep yang sudah diambil tidak dapat diedit.');
        }

        DB::beginTransaction();
        try {
            // Restore stock from old detail resep
            foreach ($resep->detailResep as $oldDetail) {
                $oldDetail->obat->increment('stok_tersedia', $oldDetail->jumlah);
            }

            // Delete old detail resep
            $resep->detailResep()->delete();

            // Update resep
            $resep->update([
                'catatan_resep' => $request->catatan_resep,
            ]);

            // Create new detail resep
            foreach ($request->detail_resep as $detail) {
                $obat = Obat::findOrFail($detail['obat_id']);
                
                // Check stok
                if ($obat->stok_tersedia < $detail['jumlah']) {
                    throw new \Exception("Stok obat {$obat->nama_obat} tidak mencukupi.");
                }

                DetailResep::create([
                    'resep_id' => $resep->id,
                    'obat_id' => $detail['obat_id'],
                    'jumlah' => $detail['jumlah'],
                    'harga_satuan' => $obat->harga,
                    'aturan_pakai' => $detail['aturan_pakai'],
                    'keterangan' => $detail['keterangan'],
                ]);

                // Update stok obat
                $obat->decrement('stok_tersedia', $detail['jumlah']);
            }

            DB::commit();

            return redirect()->route('dokter.resep.show', $resep->id)
                ->with('success', 'Resep berhasil diperbarui.');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy($id)
    {
        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $resep = Resep::where('dokter_id', $pegawai->id)->findOrFail($id);
        
        // Only allow deleting if status is 'belum_diambil'
        if ($resep->status_resep !== 'belum_diambil') {
            return redirect()->route('dokter.resep.index')
                ->with('error', 'Resep yang sudah diambil tidak dapat dihapus.');
        }

        DB::beginTransaction();
        try {
            // Restore stock
            foreach ($resep->detailResep as $detail) {
                $detail->obat->increment('stok_tersedia', $detail->jumlah);
            }

            // Delete detail resep first
            $resep->detailResep()->delete();
            
            // Delete resep
            $resep->delete();

            DB::commit();

            return redirect()->route('dokter.resep.index')
                ->with('success', 'Resep berhasil dihapus.');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    public function cetak($id)
    {
        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $resep = Resep::with(['pasien', 'dokter', 'detailResep.obat'])
            ->where('dokter_id', $pegawai->id)
            ->findOrFail($id);

        // Format data
        $resep->tanggal_resep_formatted = $resep->tanggal_resep->format('d M Y, H:i');
        $resep->total_harga = $resep->detailResep->sum(function ($detail) {
            return $detail->jumlah * $detail->harga_satuan;
        });

        return Inertia::render('dokter/resep/cetak', [
            'resep' => $resep,
        ]);
    }

    public function toggleStatus($id)
    {
        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $resep = Resep::where('dokter_id', $pegawai->id)->findOrFail($id);

        DB::beginTransaction();
        try {
            // Toggle status dari belum_diambil ke sudah_diambil atau sebaliknya
            if ($resep->status_resep === 'belum_diambil') {
                $resep->update(['status_resep' => 'sudah_diambil']);
                $message = 'Status resep berhasil diubah menjadi "Sudah Diambil".';
            } elseif ($resep->status_resep === 'sudah_diambil') {
                $resep->update(['status_resep' => 'belum_diambil']);
                $message = 'Status resep berhasil diubah menjadi "Belum Diambil".';
            } else {
                throw new \Exception('Resep yang dibatalkan tidak dapat diubah statusnya.');
            }

            DB::commit();

            return redirect()->back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    private function generateKodeResep()
    {
        $tanggal = Carbon::now()->format('Ymd');
        $lastResep = Resep::whereDate('created_at', Carbon::today())
            ->orderBy('id', 'desc')
            ->first();
        
        $urutan = $lastResep ? (intval(substr($lastResep->kode_resep, -3)) + 1) : 1;
        
        return 'RSP' . $tanggal . str_pad($urutan, 3, '0', STR_PAD_LEFT);
    }
}
