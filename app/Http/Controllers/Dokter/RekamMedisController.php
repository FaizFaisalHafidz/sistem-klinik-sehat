<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\RekamMedis;
use App\Models\Pasien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class RekamMedisController extends Controller
{
    public function index(Request $request)
    {
        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $query = RekamMedis::with(['pasien', 'pendaftaran', 'dokter'])
            ->where('dokter_id', $pegawai->id)
            ->orderBy('tanggal_pemeriksaan', 'desc');

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_rekam_medis', 'like', "%{$search}%")
                  ->orWhere('diagnosa', 'like', "%{$search}%")
                  ->orWhereHas('pasien', function ($q) use ($search) {
                      $q->where('nama_lengkap', 'like', "%{$search}%")
                        ->orWhere('kode_pasien', 'like', "%{$search}%");
                  });
            });
        }

        // Filter berdasarkan tanggal
        if ($request->filled('tanggal_dari') && $request->filled('tanggal_sampai')) {
            $query->whereBetween('tanggal_pemeriksaan', [
                $request->tanggal_dari,
                $request->tanggal_sampai . ' 23:59:59'
            ]);
        } elseif ($request->filled('tanggal_dari')) {
            $query->whereDate('tanggal_pemeriksaan', '>=', $request->tanggal_dari);
        } elseif ($request->filled('tanggal_sampai')) {
            $query->whereDate('tanggal_pemeriksaan', '<=', $request->tanggal_sampai);
        }

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status_rekam_medis', $request->status);
        }

        $rekamMedis = $query->paginate(20)->withQueryString();

        // Stats untuk dashboard
        $stats = [
            'total_rekam_medis' => RekamMedis::where('dokter_id', $pegawai->id)->count(),
            'rekam_medis_bulan_ini' => RekamMedis::where('dokter_id', $pegawai->id)
                ->whereMonth('tanggal_pemeriksaan', Carbon::now()->month)
                ->whereYear('tanggal_pemeriksaan', Carbon::now()->year)
                ->count(),
            'rekam_medis_hari_ini' => RekamMedis::where('dokter_id', $pegawai->id)
                ->whereDate('tanggal_pemeriksaan', Carbon::today())
                ->count(),
            'total_pasien_unik' => RekamMedis::where('dokter_id', $pegawai->id)
                ->distinct('pasien_id')
                ->count('pasien_id'),
        ];

        return Inertia::render('dokter/rekammedis/index', [
            'rekamMedis' => $rekamMedis,
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

        $rekamMedis = RekamMedis::with(['pasien', 'pendaftaran', 'dokter', 'resep.detailResep.obat'])
            ->where('dokter_id', $pegawai->id)
            ->findOrFail($id);

        // Append formatted biaya attributes
        $rekamMedis->append([
            'biaya_konsultasi_formatted',
            'biaya_obat_formatted', 
            'total_biaya_formatted'
        ]);

        // Calculate resep details if exists
        $resepDetails = [];
        if ($rekamMedis->resep->isNotEmpty()) {
            foreach ($rekamMedis->resep as $resep) {
                foreach ($resep->detailResep as $detail) {
                    $resepDetails[] = [
                        'obat' => $detail->obat,
                        'jumlah' => $detail->jumlah,
                        'aturan_pakai' => $detail->aturan_pakai,
                        'harga_satuan' => $detail->harga_satuan,
                        'subtotal' => $detail->jumlah * $detail->harga_satuan,
                        'subtotal_formatted' => 'Rp ' . number_format($detail->jumlah * $detail->harga_satuan, 0, ',', '.'),
                        'keterangan' => $detail->keterangan,
                    ];
                }
            }
        }

        return Inertia::render('dokter/rekammedis/show', [
            'rekamMedis' => $rekamMedis,
            'resepDetails' => $resepDetails,
        ]);
    }

    public function edit($id)
    {
        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $rekamMedis = RekamMedis::with(['pasien', 'pendaftaran'])
            ->where('dokter_id', $pegawai->id)
            ->findOrFail($id);

        return Inertia::render('dokter/rekammedis/edit', [
            'rekamMedis' => $rekamMedis,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'anamnesis' => 'required|string|max:2000',
            'pemeriksaan_fisik' => 'nullable|string|max:2000',
            'diagnosa' => 'required|string|max:1000',
            'rencana_pengobatan' => 'nullable|string|max:2000',
            'catatan_dokter' => 'nullable|string|max:1000',
            'tanggal_kontrol' => 'nullable|date|after:today',
            'tanda_vital' => 'nullable|array',
            'tanda_vital.tekanan_darah' => 'nullable|string|max:20',
            'tanda_vital.suhu' => 'nullable|numeric|min:30|max:45',
            'tanda_vital.berat_badan' => 'nullable|numeric|min:1|max:500',
            'tanda_vital.tinggi_badan' => 'nullable|numeric|min:50|max:250',
        ]);

        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $rekamMedis = RekamMedis::where('dokter_id', $pegawai->id)->findOrFail($id);

        $rekamMedis->update([
            'anamnesis' => $request->anamnesis,
            'pemeriksaan_fisik' => $request->pemeriksaan_fisik,
            'diagnosa' => $request->diagnosa,
            'rencana_pengobatan' => $request->rencana_pengobatan,
            'catatan_dokter' => $request->catatan_dokter,
            'tanggal_kontrol' => $request->tanggal_kontrol,
            'tanda_vital' => $request->tanda_vital ? json_encode($request->tanda_vital) : null,
            'status_rekam_medis' => 'selesai',
        ]);

        return redirect()->route('dokter.rekam-medis.show', $rekamMedis->id)
            ->with('success', 'Rekam medis berhasil diperbarui.');
    }

    public function destroy($id)
    {
        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $rekamMedis = RekamMedis::where('dokter_id', $pegawai->id)->findOrFail($id);
        
        // Hanya bisa menghapus rekam medis yang masih draft
        if ($rekamMedis->status_rekam_medis !== 'draft') {
            return redirect()->route('dokter.rekam-medis.index')
                ->with('error', 'Hanya rekam medis dengan status draft yang dapat dihapus.');
        }

        $rekamMedis->delete();

        return redirect()->route('dokter.rekam-medis.index')
            ->with('success', 'Rekam medis berhasil dihapus.');
    }

    public function cetak($id)
    {
        // Get pegawai record for current user
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dashboard')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $rekamMedis = RekamMedis::with(['pasien', 'pendaftaran', 'dokter', 'resep.detailResep.obat'])
            ->where('dokter_id', $pegawai->id)
            ->findOrFail($id);

        // Append formatted biaya attributes
        $rekamMedis->append([
            'biaya_konsultasi_formatted',
            'biaya_obat_formatted', 
            'total_biaya_formatted'
        ]);

        // Calculate resep details if exists
        $resepDetails = [];
        if ($rekamMedis->resep->isNotEmpty()) {
            foreach ($rekamMedis->resep as $resep) {
                foreach ($resep->detailResep as $detail) {
                    $resepDetails[] = [
                        'obat' => $detail->obat,
                        'jumlah' => $detail->jumlah,
                        'aturan_pakai' => $detail->aturan_pakai,
                        'harga_satuan' => $detail->harga_satuan,
                        'subtotal' => $detail->jumlah * $detail->harga_satuan,
                        'subtotal_formatted' => 'Rp ' . number_format($detail->jumlah * $detail->harga_satuan, 0, ',', '.'),
                        'keterangan' => $detail->keterangan,
                    ];
                }
            }
        }

        return Inertia::render('dokter/rekammedis/cetak', [
            'rekamMedis' => $rekamMedis,
            'resepDetails' => $resepDetails,
        ]);
    }
}
