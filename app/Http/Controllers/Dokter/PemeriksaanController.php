<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\Pendaftaran;
use App\Models\RekamMedis;
use App\Models\Pasien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
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

        // Get list obat yang aktif dan tersedia
        $obatList = \App\Models\Obat::active()
            ->where('stok_tersedia', '>', 0)
            ->select('id', 'kode_obat', 'nama_obat', 'nama_generik', 'kategori', 'satuan', 'harga', 'stok_tersedia')
            ->orderBy('nama_obat')
            ->get();

        return Inertia::render('dokter/pemeriksaan/create', [
            'pendaftaran' => $pendaftaran,
            'obatList' => $obatList,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Memulai proses penyimpanan rekam medis', [
            'user_id' => Auth::id(),
            'pendaftaran_id' => $request->pendaftaran_id,
            'timestamp' => now()
        ]);

        try {
            $request->validate([
                'pendaftaran_id' => 'required|exists:pendaftaran,id',
                'keluhan_utama' => 'required|string|max:1000',
                'riwayat_penyakit' => 'nullable|string|max:1000',
                'tekanan_darah' => 'nullable|string|max:20',
                'tinggi_badan' => 'nullable|numeric|min:50|max:250',
                'berat_badan' => 'nullable|numeric|min:10|max:300',
                'pemeriksaan_fisik' => 'nullable|string|max:1000',
                'diagnosis' => 'required|string|max:500',
                'tindakan' => 'nullable|string|max:1000',
                'resep_obat' => 'nullable|array',
                'resep_obat.*.obat_id' => 'required|exists:obat,id',
                'resep_obat.*.jumlah' => 'required|numeric|min:1',
                'resep_obat.*.dosis' => 'required|string|max:100',
                'resep_obat.*.aturan_pakai' => 'required|string|max:200',
                'resep_obat.*.keterangan' => 'nullable|string|max:200',
                'catatan' => 'nullable|string|max:1000',
                'anjuran' => 'nullable|string|max:1000',
            ]);

            Log::info('Validasi data berhasil', ['pendaftaran_id' => $request->pendaftaran_id]);

            DB::beginTransaction();

            $pendaftaran = Pendaftaran::findOrFail($request->pendaftaran_id);

            // Pastikan pendaftaran dalam status sedang diperiksa
            if ($pendaftaran->status_pendaftaran !== 'sedang_diperiksa') {
                Log::warning('Pendaftaran tidak dalam status sedang diperiksa', [
                    'pendaftaran_id' => $pendaftaran->id,
                    'status_actual' => $pendaftaran->status_pendaftaran
                ]);
                return redirect()->route('dokter.pemeriksaan.index')
                    ->with('error', 'Pendaftaran tidak dalam status sedang diperiksa.');
            }

            // Buat rekam medis baru
            $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
            if (!$pegawai) {
                Log::error('Data pegawai tidak ditemukan', ['user_id' => Auth::id()]);
                return redirect()->route('dokter.pemeriksaan.index')
                    ->with('error', 'Data pegawai tidak ditemukan.');
            }

            Log::info('Data pegawai ditemukan', [
                'pegawai_id' => $pegawai->id,
                'nama' => $pegawai->nama_lengkap ?? 'N/A'
            ]);

            // Prepare vital signs data
            $tandaVital = [];
            if ($request->filled('tekanan_darah')) {
                $tandaVital['tekanan_darah'] = $request->tekanan_darah;
            }
            if ($request->filled('tinggi_badan')) {
                $tandaVital['tinggi_badan'] = $request->tinggi_badan . ' cm';
            }
            if ($request->filled('berat_badan')) {
                $tandaVital['berat_badan'] = $request->berat_badan . ' kg';
            }

            // Prepare resep data
            $resepText = '';
            if (!empty($request->resep_obat)) {
                $resepLines = [];
                Log::info('Memproses resep obat', [
                    'jumlah_obat' => count($request->resep_obat),
                    'obat_ids' => collect($request->resep_obat)->pluck('obat_id')->toArray()
                ]);

                foreach ($request->resep_obat as $index => $resepItem) {
                    $obat = \App\Models\Obat::find($resepItem['obat_id']);
                    if ($obat) {
                        $resepLines[] = "• {$obat->nama_obat} ({$obat->nama_generik})";
                        $resepLines[] = "  Jumlah: {$resepItem['jumlah']} {$obat->satuan}";
                        $resepLines[] = "  Dosis: {$resepItem['dosis']}";
                        $resepLines[] = "  Aturan Pakai: {$resepItem['aturan_pakai']}";
                        if (!empty($resepItem['keterangan'])) {
                            $resepLines[] = "  Keterangan: {$resepItem['keterangan']}";
                        }
                        $resepLines[] = "";

                        Log::debug('Obat berhasil diproses', [
                            'index' => $index,
                            'obat_id' => $obat->id,
                            'nama_obat' => $obat->nama_obat,
                            'jumlah' => $resepItem['jumlah']
                        ]);
                    } else {
                        Log::warning('Obat tidak ditemukan', [
                            'obat_id' => $resepItem['obat_id'],
                            'index' => $index
                        ]);
                    }
                }
                $resepText = implode("\n", $resepLines);
            }

            $rekamMedis = new RekamMedis([
                'pendaftaran_id' => $pendaftaran->id,
                'pasien_id' => $pendaftaran->pasien_id,
                'dokter_id' => $pegawai->id,
                'tanggal_pemeriksaan' => Carbon::now(),
                'tanda_vital' => !empty($tandaVital) ? json_encode($tandaVital) : null,
                'anamnesis' => $request->keluhan_utama . ($request->riwayat_penyakit ? "\n\nRiwayat Penyakit:\n" . $request->riwayat_penyakit : ''),
                'pemeriksaan_fisik' => $request->pemeriksaan_fisik,
                'diagnosa' => $request->diagnosis,
                'rencana_pengobatan' => $request->tindakan . (!empty($resepText) ? "\n\nResep Obat:\n" . $resepText : '') . ($request->anjuran ? "\n\nAnjuran:\n" . $request->anjuran : ''),
                'catatan_dokter' => $request->catatan,
                'status_rekam_medis' => 'selesai',
            ]);

            // Generate kode rekam medis
            $rekamMedis->kode_rekam_medis = $rekamMedis->generateKodeRekamMedis();
            $rekamMedis->save();

            Log::info('Rekam medis berhasil disimpan', [
                'rekam_medis_id' => $rekamMedis->id,
                'kode_rekam_medis' => $rekamMedis->kode_rekam_medis,
                'pasien_id' => $rekamMedis->pasien_id
            ]);

            // Update status pendaftaran menjadi selesai
            $pendaftaran->update(['status_pendaftaran' => 'selesai']);

            Log::info('Status pendaftaran berhasil diupdate', [
                'pendaftaran_id' => $pendaftaran->id,
                'status_baru' => 'selesai'
            ]);

            DB::commit();

            Log::info('Proses penyimpanan rekam medis berhasil diselesaikan', [
                'pendaftaran_id' => $pendaftaran->id,
                'rekam_medis_id' => $rekamMedis->id
            ]);

            return redirect()->route('dokter.pemeriksaan.show', $pendaftaran->id)
                ->with('success', 'Rekam medis berhasil disimpan.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::warning('Validasi gagal saat menyimpan rekam medis', [
                'user_id' => Auth::id(),
                'pendaftaran_id' => $request->pendaftaran_id,
                'errors' => $e->errors()
            ]);
            throw $e; // Re-throw validation exception
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saat menyimpan rekam medis', [
                'user_id' => Auth::id(),
                'pendaftaran_id' => $request->pendaftaran_id,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('dokter.pemeriksaan.index')
                ->with('error', 'Terjadi kesalahan saat menyimpan rekam medis. Silakan coba lagi.');
        }
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

        // Get list obat yang aktif dan tersedia
        $obatList = \App\Models\Obat::active()
            ->where('stok_tersedia', '>', 0)
            ->select('id', 'kode_obat', 'nama_obat', 'nama_generik', 'kategori', 'satuan', 'harga', 'stok_tersedia')
            ->orderBy('nama_obat')
            ->get();

        return Inertia::render('dokter/pemeriksaan/edit', [
            'pendaftaran' => $pendaftaran,
            'obatList' => $obatList,
        ]);
    }

    public function update(Request $request, $id)
    {
        Log::info('Memulai proses update rekam medis', [
            'user_id' => Auth::id(),
            'pendaftaran_id' => $id,
            'timestamp' => now()
        ]);

        try {
            $request->validate([
                'keluhan_utama' => 'required|string|max:1000',
                'riwayat_penyakit' => 'nullable|string|max:1000',
                'pemeriksaan_fisik' => 'nullable|string|max:1000',
                'diagnosis' => 'required|string|max:500',
                'tindakan' => 'nullable|string|max:1000',
                'resep_obat' => 'nullable|array',
                'resep_obat.*.obat_id' => 'required|exists:obat,id',
                'resep_obat.*.jumlah' => 'required|numeric|min:1',
                'resep_obat.*.dosis' => 'required|string|max:100',
                'resep_obat.*.aturan_pakai' => 'required|string|max:200',
                'resep_obat.*.keterangan' => 'nullable|string|max:200',
                'catatan' => 'nullable|string|max:1000',
                'anjuran' => 'nullable|string|max:1000',
            ]);

            Log::info('Validasi data update berhasil', ['pendaftaran_id' => $id]);

            DB::beginTransaction();

            $pendaftaran = Pendaftaran::with('rekamMedis')->findOrFail($id);

            if (!$pendaftaran->rekamMedis) {
                Log::error('Rekam medis tidak ditemukan untuk update', ['pendaftaran_id' => $id]);
                return redirect()->route('dokter.pemeriksaan.index')
                    ->with('error', 'Rekam medis tidak ditemukan.');
            }

            // Hanya bisa edit rekam medis yang dibuat oleh dokter yang sama
            $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
            if (!$pegawai || $pendaftaran->rekamMedis->dokter_id !== $pegawai->id) {
                Log::warning('Akses ditolak untuk edit rekam medis', [
                    'user_id' => Auth::id(),
                    'pegawai_id' => $pegawai->id ?? null,
                    'dokter_id_rekam_medis' => $pendaftaran->rekamMedis->dokter_id,
                    'pendaftaran_id' => $id
                ]);
                return redirect()->route('dokter.pemeriksaan.index')
                    ->with('error', 'Anda tidak memiliki akses untuk mengedit rekam medis ini.');
            }

            Log::info('Akses edit rekam medis diverifikasi', [
                'rekam_medis_id' => $pendaftaran->rekamMedis->id,
                'dokter_id' => $pegawai->id,
                'nama_dokter' => $pegawai->nama_lengkap ?? 'N/A'
            ]);

            // Prepare resep data
            $resepText = '';
            if (!empty($request->resep_obat)) {
                $resepLines = [];
                Log::info('Memproses update resep obat', [
                    'jumlah_obat' => count($request->resep_obat),
                    'obat_ids' => collect($request->resep_obat)->pluck('obat_id')->toArray()
                ]);

                foreach ($request->resep_obat as $index => $resepItem) {
                    $obat = \App\Models\Obat::find($resepItem['obat_id']);
                    if ($obat) {
                        $resepLines[] = "• {$obat->nama_obat} ({$obat->nama_generik})";
                        $resepLines[] = "  Jumlah: {$resepItem['jumlah']} {$obat->satuan}";
                        $resepLines[] = "  Dosis: {$resepItem['dosis']}";
                        $resepLines[] = "  Aturan Pakai: {$resepItem['aturan_pakai']}";
                        if (!empty($resepItem['keterangan'])) {
                            $resepLines[] = "  Keterangan: {$resepItem['keterangan']}";
                        }
                        $resepLines[] = "";

                        Log::debug('Obat berhasil diproses untuk update', [
                            'index' => $index,
                            'obat_id' => $obat->id,
                            'nama_obat' => $obat->nama_obat,
                            'jumlah' => $resepItem['jumlah']
                        ]);
                    } else {
                        Log::warning('Obat tidak ditemukan saat update', [
                            'obat_id' => $resepItem['obat_id'],
                            'index' => $index
                        ]);
                    }
                }
                $resepText = implode("\n", $resepLines);
            }

            // Update existing record structure
            $anamnesis = $request->keluhan_utama . ($request->riwayat_penyakit ? "\n\nRiwayat Penyakit:\n" . $request->riwayat_penyakit : '');
            $rencana_pengobatan = $request->tindakan . (!empty($resepText) ? "\n\nResep Obat:\n" . $resepText : '') . ($request->anjuran ? "\n\nAnjuran:\n" . $request->anjuran : '');

            // Store old values for comparison
            $oldValues = [
                'anamnesis' => $pendaftaran->rekamMedis->anamnesis,
                'pemeriksaan_fisik' => $pendaftaran->rekamMedis->pemeriksaan_fisik,
                'diagnosa' => $pendaftaran->rekamMedis->diagnosa,
                'rencana_pengobatan' => $pendaftaran->rekamMedis->rencana_pengobatan,
                'catatan_dokter' => $pendaftaran->rekamMedis->catatan_dokter,
            ];

            $pendaftaran->rekamMedis->update([
                'anamnesis' => $anamnesis,
                'pemeriksaan_fisik' => $request->pemeriksaan_fisik,
                'diagnosa' => $request->diagnosis,
                'rencana_pengobatan' => $rencana_pengobatan,
                'catatan_dokter' => $request->catatan,
            ]);

            Log::info('Rekam medis berhasil diupdate', [
                'rekam_medis_id' => $pendaftaran->rekamMedis->id,
                'pendaftaran_id' => $id,
                'perubahan' => [
                    'anamnesis_changed' => $oldValues['anamnesis'] !== $anamnesis,
                    'pemeriksaan_fisik_changed' => $oldValues['pemeriksaan_fisik'] !== $request->pemeriksaan_fisik,
                    'diagnosa_changed' => $oldValues['diagnosa'] !== $request->diagnosis,
                    'rencana_pengobatan_changed' => $oldValues['rencana_pengobatan'] !== $rencana_pengobatan,
                    'catatan_dokter_changed' => $oldValues['catatan_dokter'] !== $request->catatan,
                ]
            ]);

            DB::commit();

            Log::info('Proses update rekam medis berhasil diselesaikan', [
                'pendaftaran_id' => $id,
                'rekam_medis_id' => $pendaftaran->rekamMedis->id
            ]);

            return redirect()->route('dokter.pemeriksaan.show', $pendaftaran->id)
                ->with('success', 'Rekam medis berhasil diperbarui.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::warning('Validasi gagal saat update rekam medis', [
                'user_id' => Auth::id(),
                'pendaftaran_id' => $id,
                'errors' => $e->errors()
            ]);
            throw $e; // Re-throw validation exception
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saat update rekam medis', [
                'user_id' => Auth::id(),
                'pendaftaran_id' => $id,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('dokter.pemeriksaan.index')
                ->with('error', 'Terjadi kesalahan saat memperbarui rekam medis. Silakan coba lagi.');
        }
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
