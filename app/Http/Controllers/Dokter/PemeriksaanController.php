<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\Pendaftaran;
use App\Models\RekamMedis;
use App\Models\Pasien;
use App\Models\Resep;
use App\Models\DetailResep;
use App\Models\Obat;
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

        // Load resep data jika ada
        $resep = null;
        if ($pendaftaran->rekamMedis) {
            $resep = Resep::with(['detailResep.obat'])
                ->where('rekam_medis_id', $pendaftaran->rekamMedis->id)
                ->first();
                
            // Append formatted biaya attributes
            $pendaftaran->rekamMedis->append([
                'biaya_konsultasi_formatted',
                'biaya_obat_formatted', 
                'total_biaya_formatted'
            ]);
        }

        // Format data untuk tampilan
        $pendaftaran->created_at_formatted = $pendaftaran->created_at->format('d M Y, H:i');
        $pendaftaran->tanggal_pendaftaran_formatted = $pendaftaran->tanggal_pendaftaran->format('d M Y');
        
        // Make sure umur is included in pasien data
        $pendaftaran->pasien->append('umur');

        return Inertia::render('dokter/pemeriksaan/show', [
            'pendaftaran' => $pendaftaran,
            'resep' => $resep,
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

        // Get data dokter yang sedang login untuk biaya konsultasi
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai) {
            return redirect()->route('dokter.pemeriksaan.index')
                ->with('error', 'Data pegawai tidak ditemukan.');
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
            'dokter' => $pegawai,
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

            // Validasi stok obat jika ada resep
            if (!empty($request->resep_obat)) {
                foreach ($request->resep_obat as $index => $resepItem) {
                    $obat = Obat::find($resepItem['obat_id']);
                    if (!$obat) {
                        Log::error('Obat tidak ditemukan', [
                            'obat_id' => $resepItem['obat_id'],
                            'index' => $index
                        ]);
                        return redirect()->back()
                            ->with('error', 'Obat tidak ditemukan.')
                            ->withInput();
                    }

                    if ($obat->stok_tersedia < $resepItem['jumlah']) {
                        Log::warning('Stok obat tidak mencukupi', [
                            'obat_id' => $obat->id,
                            'nama_obat' => $obat->nama_obat,
                            'stok_tersedia' => $obat->stok_tersedia,
                            'jumlah_diminta' => $resepItem['jumlah']
                        ]);
                        return redirect()->back()
                            ->with('error', "Stok obat {$obat->nama_obat} tidak mencukupi. Stok tersedia: {$obat->stok_tersedia}")
                            ->withInput();
                    }
                }
                Log::info('Validasi stok obat berhasil');
            }

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

            // Hitung total biaya obat
            $totalBiayaObat = 0;
            if (!empty($request->resep_obat)) {
                foreach ($request->resep_obat as $resepItem) {
                    $obat = \App\Models\Obat::find($resepItem['obat_id']);
                    if ($obat) {
                        $totalBiayaObat += $obat->harga * $resepItem['jumlah'];
                    }
                }
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
                'biaya_konsultasi' => $pegawai->biaya_konsultasi,
                'biaya_obat' => $totalBiayaObat,
                'total_biaya' => $pegawai->biaya_konsultasi + $totalBiayaObat,
            ]);

            // Generate kode rekam medis
            $rekamMedis->kode_rekam_medis = $rekamMedis->generateKodeRekamMedis();
            $rekamMedis->save();

            Log::info('Rekam medis berhasil disimpan', [
                'rekam_medis_id' => $rekamMedis->id,
                'kode_rekam_medis' => $rekamMedis->kode_rekam_medis,
                'pasien_id' => $rekamMedis->pasien_id
            ]);

            // Simpan resep obat ke tabel resep dan detail_resep jika ada
            if (!empty($request->resep_obat)) {
                Log::info('Memulai penyimpanan resep ke database', [
                    'rekam_medis_id' => $rekamMedis->id,
                    'jumlah_obat' => count($request->resep_obat)
                ]);

                // Buat resep baru
                $resep = new Resep([
                    'pasien_id' => $pendaftaran->pasien_id,
                    'dokter_id' => $pegawai->id,
                    'rekam_medis_id' => $rekamMedis->id,
                    'tanggal_resep' => Carbon::now(),
                    'catatan_resep' => $request->catatan,
                    'status_resep' => 'belum_diambil',
                ]);

                // Generate kode resep
                $resep->kode_resep = $resep->generateKodeResep();
                $resep->save();

                Log::info('Resep berhasil dibuat', [
                    'resep_id' => $resep->id,
                    'kode_resep' => $resep->kode_resep
                ]);

                // Simpan detail resep
                foreach ($request->resep_obat as $index => $resepItem) {
                    $obat = Obat::find($resepItem['obat_id']);
                    
                    $detailResep = new DetailResep([
                        'resep_id' => $resep->id,
                        'obat_id' => $obat->id,
                        'jumlah' => $resepItem['jumlah'],
                        'aturan_pakai' => $resepItem['dosis'] . ' - ' . $resepItem['aturan_pakai'],
                        'harga_satuan' => $obat->harga,
                        'keterangan' => $resepItem['keterangan'] ?? null,
                    ]);

                    $detailResep->save();

                    Log::debug('Detail resep berhasil disimpan', [
                        'detail_resep_id' => $detailResep->id,
                        'obat_id' => $obat->id,
                        'nama_obat' => $obat->nama_obat,
                        'jumlah' => $resepItem['jumlah'],
                        'harga_satuan' => $obat->harga
                    ]);
                }

                Log::info('Semua detail resep berhasil disimpan', [
                    'resep_id' => $resep->id,
                    'jumlah_detail' => count($request->resep_obat)
                ]);
            }

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
        $pegawai = \App\Models\Pegawai::where('user_id', Auth::id())->first();
        if (!$pegawai || $pendaftaran->rekamMedis->dokter_id !== $pegawai->id) {
            return redirect()->route('dokter.pemeriksaan.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengedit rekam medis ini.');
        }

        // Get existing resep data
        $existingResep = Resep::with(['detailResep.obat'])
            ->where('rekam_medis_id', $pendaftaran->rekamMedis->id)
            ->first();

        // Get list obat yang aktif dan tersedia
        $obatList = Obat::active()
            ->where('stok_tersedia', '>', 0)
            ->select('id', 'kode_obat', 'nama_obat', 'nama_generik', 'kategori', 'satuan', 'harga', 'stok_tersedia')
            ->orderBy('nama_obat')
            ->get();

        return Inertia::render('dokter/pemeriksaan/edit', [
            'pendaftaran' => $pendaftaran,
            'obatList' => $obatList,
            'existingResep' => $existingResep,
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

            // Get pendaftaran data for validation
            $pendaftaran = Pendaftaran::with('rekamMedis')->findOrFail($id);

            if (!$pendaftaran->rekamMedis) {
                Log::error('Rekam medis tidak ditemukan untuk update', ['pendaftaran_id' => $id]);
                return redirect()->route('dokter.pemeriksaan.index')
                    ->with('error', 'Rekam medis tidak ditemukan.');
            }

            // Validasi stok obat jika ada resep (untuk obat baru atau perubahan jumlah)
            if (!empty($request->resep_obat)) {
                foreach ($request->resep_obat as $index => $resepItem) {
                    $obat = Obat::find($resepItem['obat_id']);
                    if (!$obat) {
                        Log::error('Obat tidak ditemukan saat update', [
                            'obat_id' => $resepItem['obat_id'],
                            'index' => $index
                        ]);
                        return redirect()->back()
                            ->with('error', 'Obat tidak ditemukan.')
                            ->withInput();
                    }

                    // Cek stok tersedia (tidak termasuk yang sudah diresepkan sebelumnya)
                    $existingDetail = DetailResep::whereHas('resep', function($q) use ($pendaftaran) {
                            $q->where('rekam_medis_id', $pendaftaran->rekamMedis->id);
                        })
                        ->where('obat_id', $obat->id)
                        ->first();
                    
                    $stokTersedia = $obat->stok_tersedia;
                    if ($existingDetail) {
                        $stokTersedia += $existingDetail->jumlah; // Tambah kembali stok yang sudah digunakan
                    }

                    if ($stokTersedia < $resepItem['jumlah']) {
                        Log::warning('Stok obat tidak mencukupi saat update', [
                            'obat_id' => $obat->id,
                            'nama_obat' => $obat->nama_obat,
                            'stok_tersedia' => $stokTersedia,
                            'jumlah_diminta' => $resepItem['jumlah']
                        ]);
                        return redirect()->back()
                            ->with('error', "Stok obat {$obat->nama_obat} tidak mencukupi. Stok tersedia: {$stokTersedia}")
                            ->withInput();
                    }
                }
                Log::info('Validasi stok obat update berhasil');
            }

            DB::beginTransaction();

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

            // Update resep obat jika ada perubahan
            $existingResep = Resep::where('rekam_medis_id', $pendaftaran->rekamMedis->id)->first();
            
            if (!empty($request->resep_obat)) {
                Log::info('Memulai update resep obat', [
                    'rekam_medis_id' => $pendaftaran->rekamMedis->id,
                    'jumlah_obat_baru' => count($request->resep_obat),
                    'existing_resep_id' => $existingResep->id ?? null
                ]);

                if ($existingResep) {
                    // Delete existing detail resep (stok akan dikembalikan otomatis oleh model)
                    $existingResep->detailResep()->delete();
                    
                    // Update resep header
                    $existingResep->update([
                        'tanggal_resep' => Carbon::now(),
                        'catatan_resep' => $request->catatan,
                        'status_resep' => 'belum_diambil',
                    ]);

                    Log::info('Existing resep berhasil diupdate', [
                        'resep_id' => $existingResep->id,
                        'kode_resep' => $existingResep->kode_resep
                    ]);
                } else {
                    // Buat resep baru
                    $existingResep = new Resep([
                        'pasien_id' => $pendaftaran->pasien_id,
                        'dokter_id' => $pegawai->id,
                        'rekam_medis_id' => $pendaftaran->rekamMedis->id,
                        'tanggal_resep' => Carbon::now(),
                        'catatan_resep' => $request->catatan,
                        'status_resep' => 'belum_diambil',
                    ]);

                    $existingResep->kode_resep = $existingResep->generateKodeResep();
                    $existingResep->save();

                    Log::info('Resep baru berhasil dibuat saat update', [
                        'resep_id' => $existingResep->id,
                        'kode_resep' => $existingResep->kode_resep
                    ]);
                }

                // Simpan detail resep baru
                foreach ($request->resep_obat as $index => $resepItem) {
                    $obat = Obat::find($resepItem['obat_id']);
                    
                    $detailResep = new DetailResep([
                        'resep_id' => $existingResep->id,
                        'obat_id' => $obat->id,
                        'jumlah' => $resepItem['jumlah'],
                        'aturan_pakai' => $resepItem['dosis'] . ' - ' . $resepItem['aturan_pakai'],
                        'harga_satuan' => $obat->harga,
                        'keterangan' => $resepItem['keterangan'] ?? null,
                    ]);

                    $detailResep->save();

                    Log::debug('Detail resep update berhasil disimpan', [
                        'detail_resep_id' => $detailResep->id,
                        'obat_id' => $obat->id,
                        'nama_obat' => $obat->nama_obat,
                        'jumlah' => $resepItem['jumlah']
                    ]);
                }

                Log::info('Semua detail resep update berhasil disimpan', [
                    'resep_id' => $existingResep->id,
                    'jumlah_detail' => count($request->resep_obat)
                ]);
            } else if ($existingResep) {
                // Jika tidak ada resep obat baru tapi ada resep lama, hapus resep lama
                Log::info('Menghapus resep existing karena tidak ada resep baru', [
                    'resep_id' => $existingResep->id
                ]);
                $existingResep->detailResep()->delete(); // Stok dikembalikan otomatis
                $existingResep->delete();
            }

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
