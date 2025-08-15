<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\Pendaftaran;
use App\Models\RekamMedis;
use App\Models\Pasien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class PemeriksaanController extends Controller
{
    public function index(Request $request)
    {
        $query = Pendaftaran::with(['pasien', 'dibuatOleh', 'rekamMedis', 'antrian'])
            ->whereIn('status_pendaftaran', ['sedang_diperiksa', 'terdaftar', 'selesai'])
            ->orderBy('created_at', 'desc');

        // Filter berdasarkan pencarian
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_pendaftaran', 'like', "%{$search}%")
                  ->orWhereHas('pasien', function ($q) use ($search) {
                      $q->where('nama_lengkap', 'like', "%{$search}%")
                        ->orWhere('kode_pasien', 'like', "%{$search}%");
                  });
            });
        }

        // Filter berdasarkan tanggal
        if ($request->filled('tanggal')) {
            $query->whereDate('created_at', $request->tanggal);
        }

        $pendaftaran = $query->paginate(15)->withQueryString();
        
        // Format data untuk setiap item
        $pendaftaran->getCollection()->transform(function ($item) {
            $item->created_at_formatted = $item->created_at->format('d M Y, H:i');
            $item->tanggal_pendaftaran_formatted = $item->tanggal_pendaftaran->format('d M Y');
            $item->pasien->append('umur');
            return $item;
        });

        // Stats untuk dashboard
        $stats = [
            'total_pemeriksaan_hari_ini' => Pendaftaran::whereDate('created_at', Carbon::today())
                ->where('status_pendaftaran', 'sedang_diperiksa')->count(),
            'total_selesai_hari_ini' => Pendaftaran::whereDate('created_at', Carbon::today())
                ->where('status_pendaftaran', 'selesai')->count(),
            'total_rekam_medis_hari_ini' => RekamMedis::whereDate('created_at', Carbon::today())->count(),
            'rata_rata_waktu_pemeriksaan' => $this->calculateAverageExaminationTime(),
        ];

        return Inertia::render('dokter/pemeriksaan/index', [
            'pendaftaran' => $pendaftaran,
            'stats' => $stats,
            'filters' => $request->only(['search', 'tanggal']),
        ]);
    }

    public function show($id)
    {
        $pendaftaran = Pendaftaran::with([
            'pasien', 
            'dibuatOleh', 
            'rekamMedis.dokter',
            'antrian'
        ])->findOrFail($id);

        // Format data untuk tampilan
        $pendaftaran->created_at_formatted = $pendaftaran->created_at->format('d M Y, H:i');
        $pendaftaran->tanggal_pendaftaran_formatted = $pendaftaran->tanggal_pendaftaran->format('d M Y');
        
        // Make sure umur is included in pasien data
        $pendaftaran->pasien->append('umur');

        return Inertia::render('dokter/pemeriksaan/show', [
            'pendaftaran' => $pendaftaran,
        ]);
    }

    public function create(Request $request)
    {
        $pendaftaranId = $request->query('pendaftaran_id');
        
        if (!$pendaftaranId) {
            return redirect()->route('dokter.pemeriksaan.index')
                ->with('error', 'ID Pendaftaran tidak ditemukan.');
        }

        $pendaftaran = Pendaftaran::with(['pasien', 'dibuatOleh', 'rekamMedis'])
            ->findOrFail($pendaftaranId);

        // Pastikan pendaftaran dalam status sedang diperiksa
        if ($pendaftaran->status_pendaftaran !== 'sedang_diperiksa') {
            return redirect()->route('dokter.pemeriksaan.index')
                ->with('error', 'Pendaftaran tidak dalam status sedang diperiksa.');
        }

        return Inertia::render('dokter/pemeriksaan/create', [
            'pendaftaran' => $pendaftaran,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'pendaftaran_id' => 'required|exists:pendaftaran,id',
            'keluhan_utama' => 'required|string|max:1000',
            'riwayat_penyakit' => 'nullable|string|max:1000',
            'pemeriksaan_fisik' => 'nullable|string|max:1000',
            'diagnosis' => 'required|string|max:500',
            'tindakan' => 'nullable|string|max:1000',
            'resep' => 'nullable|string|max:1000',
            'catatan' => 'nullable|string|max:1000',
            'anjuran' => 'nullable|string|max:1000',
        ]);

        $pendaftaran = Pendaftaran::findOrFail($request->pendaftaran_id);

        // Pastikan pendaftaran dalam status sedang diperiksa
        if ($pendaftaran->status_pendaftaran !== 'sedang_diperiksa') {
            return redirect()->route('dokter.pemeriksaan.index')
                ->with('error', 'Pendaftaran tidak dalam status sedang diperiksa.');
        }

        // Buat rekam medis baru
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dokter.pemeriksaan.index')
                ->with('error', 'Data pegawai tidak ditemukan.');
        }

        $rekamMedis = new RekamMedis([
            'pendaftaran_id' => $pendaftaran->id,
            'pasien_id' => $pendaftaran->pasien_id,
            'dokter_id' => $pegawai->id,
            'tanggal_pemeriksaan' => Carbon::now(),
            'anamnesis' => $request->keluhan_utama . ($request->riwayat_penyakit ? "\n\nRiwayat Penyakit:\n" . $request->riwayat_penyakit : ''),
            'pemeriksaan_fisik' => $request->pemeriksaan_fisik,
            'diagnosa' => $request->diagnosis,
            'rencana_pengobatan' => $request->tindakan . ($request->resep ? "\n\nResep:\n" . $request->resep : '') . ($request->anjuran ? "\n\nAnjuran:\n" . $request->anjuran : ''),
            'catatan_dokter' => $request->catatan,
            'status_rekam_medis' => 'selesai',
        ]);

        // Generate kode rekam medis
        $rekamMedis->kode_rekam_medis = $rekamMedis->generateKodeRekamMedis();
        $rekamMedis->save();

        // Update status pendaftaran menjadi selesai
        $pendaftaran->update(['status_pendaftaran' => 'selesai']);

        return redirect()->route('dokter.pemeriksaan.show', $pendaftaran->id)
            ->with('success', 'Rekam medis berhasil disimpan.');
    }

    public function edit($id)
    {
        $pendaftaran = Pendaftaran::with(['pasien', 'dibuatOleh', 'rekamMedis'])
            ->findOrFail($id);

        if (!$pendaftaran->rekamMedis) {
            return redirect()->route('dokter.pemeriksaan.index')
                ->with('error', 'Rekam medis tidak ditemukan.');
        }

        // Hanya bisa edit rekam medis yang dibuat oleh dokter yang sama
        if ($pendaftaran->rekamMedis->dokter_id !== Auth::id()) {
            return redirect()->route('dokter.pemeriksaan.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengedit rekam medis ini.');
        }

        return Inertia::render('dokter/pemeriksaan/edit', [
            'pendaftaran' => $pendaftaran,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'keluhan_utama' => 'required|string|max:1000',
            'riwayat_penyakit' => 'nullable|string|max:1000',
            'pemeriksaan_fisik' => 'nullable|string|max:1000',
            'diagnosis' => 'required|string|max:500',
            'tindakan' => 'nullable|string|max:1000',
            'resep' => 'nullable|string|max:1000',
            'catatan' => 'nullable|string|max:1000',
            'anjuran' => 'nullable|string|max:1000',
        ]);

        $pendaftaran = Pendaftaran::with('rekamMedis')->findOrFail($id);

        if (!$pendaftaran->rekamMedis) {
            return redirect()->route('dokter.pemeriksaan.index')
                ->with('error', 'Rekam medis tidak ditemukan.');
        }

        // Hanya bisa edit rekam medis yang dibuat oleh dokter yang sama
        if ($pendaftaran->rekamMedis->dokter_id !== Auth::id()) {
            return redirect()->route('dokter.pemeriksaan.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengedit rekam medis ini.');
        }

        $pendaftaran->rekamMedis->update([
            'keluhan_utama' => $request->keluhan_utama,
            'riwayat_penyakit' => $request->riwayat_penyakit,
            'pemeriksaan_fisik' => $request->pemeriksaan_fisik,
            'diagnosis' => $request->diagnosis,
            'tindakan' => $request->tindakan,
            'resep' => $request->resep,
            'catatan' => $request->catatan,
            'anjuran' => $request->anjuran,
        ]);

        return redirect()->route('dokter.pemeriksaan.show', $pendaftaran->id)
            ->with('success', 'Rekam medis berhasil diperbarui.');
    }

    private function calculateAverageExaminationTime()
    {
        // Implementasi sederhana untuk menghitung rata-rata waktu pemeriksaan
        // Berdasarkan selisih waktu antara mulai dan selesai pemeriksaan
        $examinations = Pendaftaran::where('status_pendaftaran', 'selesai')
            ->whereDate('updated_at', Carbon::today())
            ->get();

        if ($examinations->isEmpty()) {
            return '0 menit';
        }

        $totalMinutes = 0;
        $count = 0;

        foreach ($examinations as $exam) {
            // Asumsi bahwa updated_at adalah waktu selesai pemeriksaan
            // dan created_at adalah waktu mulai
            $startTime = Carbon::parse($exam->created_at);
            $endTime = Carbon::parse($exam->updated_at);
            
            $totalMinutes += $endTime->diffInMinutes($startTime);
            $count++;
        }

        if ($count === 0) {
            return '0 menit';
        }

        $averageMinutes = round($totalMinutes / $count);
        
        if ($averageMinutes < 60) {
            return $averageMinutes . ' menit';
        } else {
            $hours = floor($averageMinutes / 60);
            $minutes = $averageMinutes % 60;
            return $hours . ' jam ' . $minutes . ' menit';
        }
    }
}
