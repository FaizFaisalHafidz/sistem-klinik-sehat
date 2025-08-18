<?php

namespace App\Http\Controllers\Pendaftaran;

use App\Http\Controllers\Controller;
use App\Models\RekamMedis;
use App\Models\Pasien;
use App\Models\Pendaftaran;
use App\Models\Antrian;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['tanggal_mulai', 'tanggal_akhir', 'jenis_laporan', 'search']);
        
        // Set default date range only if not provided or empty
        $tanggalMulai = !empty($filters['tanggal_mulai']) ? $filters['tanggal_mulai'] : Carbon::now()->subDays(7)->format('Y-m-d');
        $tanggalAkhir = !empty($filters['tanggal_akhir']) ? $filters['tanggal_akhir'] : Carbon::now()->format('Y-m-d');
        $jenisLaporan = $filters['jenis_laporan'] ?? 'pendaftaran';
        $search = $filters['search'] ?? '';

        // Ensure proper date format and validation
        try {
            $tanggalMulai = Carbon::parse($tanggalMulai)->format('Y-m-d');
            $tanggalAkhir = Carbon::parse($tanggalAkhir)->format('Y-m-d');
        } catch (\Exception $e) {
            // Fallback to default if date parsing fails
            $tanggalMulai = Carbon::now()->subDays(7)->format('Y-m-d');
            $tanggalAkhir = Carbon::now()->format('Y-m-d');
        }

        // Initialize stats
        $stats = [];
        $data = [];

        switch ($jenisLaporan) {
            case 'pendaftaran':
                $stats = $this->getPendaftaranStats($tanggalMulai, $tanggalAkhir);
                $data = $this->getPendaftaranData($tanggalMulai, $tanggalAkhir, $search);
                break;
                
            case 'antrian':
                $stats = $this->getAntrianStats($tanggalMulai, $tanggalAkhir);
                $data = $this->getAntrianData($tanggalMulai, $tanggalAkhir, $search);
                break;
                
            case 'rekam_medis':
                $stats = $this->getRekamMedisStats($tanggalMulai, $tanggalAkhir);
                $data = $this->getRekamMedisData($tanggalMulai, $tanggalAkhir, $search);
                break;
                
            case 'pasien':
                $stats = $this->getPasienStats($tanggalMulai, $tanggalAkhir);
                $data = $this->getPasienData($tanggalMulai, $tanggalAkhir, $search);
                break;
        }

        return Inertia::render('pendaftaran/laporan/index', [
            'stats' => $stats,
            'data' => $data,
            'filters' => [
                'tanggal_mulai' => $tanggalMulai,
                'tanggal_akhir' => $tanggalAkhir,
                'jenis_laporan' => $jenisLaporan,
                'search' => $search,
            ],
        ]);
    }

    private function getPendaftaranStats($tanggalMulai, $tanggalAkhir)
    {
        $totalPendaftaran = Pendaftaran::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])->count();
        $pendaftaranAktif = Pendaftaran::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->where('status_pendaftaran', 'aktif')->count();
        $pendaftaranDibatalkan = Pendaftaran::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->where('status_pendaftaran', 'dibatalkan')->count();
        $pendaftaranSelesai = Pendaftaran::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->where('status_pendaftaran', 'selesai')->count();

        // Chart data - pendaftaran per hari
        $chartData = Pendaftaran::select(
                DB::raw('DATE(created_at) as tanggal'),
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        return [
            'total_pendaftaran' => $totalPendaftaran,
            'pendaftaran_aktif' => $pendaftaranAktif,
            'pendaftaran_dibatalkan' => $pendaftaranDibatalkan,
            'pendaftaran_selesai' => $pendaftaranSelesai,
            'chart_data' => $chartData,
        ];
    }

    private function getPendaftaranData($tanggalMulai, $tanggalAkhir, $search)
    {
        $query = Pendaftaran::with(['pasien', 'dibuatOleh'])
            ->whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59']);

        if ($search) {
            $query->whereHas('pasien', function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('kode_pasien', 'like', "%{$search}%");
            })->orWhere('kode_pendaftaran', 'like', "%{$search}%");
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    private function getAntrianStats($tanggalMulai, $tanggalAkhir)
    {
        $totalAntrian = Antrian::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])->count();
        $antrianMenunggu = Antrian::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->where('status_antrian', 'menunggu')->count();
        $antrianDipanggil = Antrian::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->where('status_antrian', 'dipanggil')->count();
        $antrianSelesai = Antrian::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->where('status_antrian', 'selesai')->count();

        // Average waiting time calculation
        $avgWaitingTime = Antrian::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->where('status_antrian', 'selesai')
            ->avg(DB::raw('TIMESTAMPDIFF(MINUTE, created_at, updated_at)'));

        // Chart data - antrian per hari
        $chartData = Antrian::select(
                DB::raw('DATE(created_at) as tanggal'),
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        return [
            'total_antrian' => $totalAntrian,
            'antrian_menunggu' => $antrianMenunggu,
            'antrian_dipanggil' => $antrianDipanggil,
            'antrian_selesai' => $antrianSelesai,
            'avg_waiting_time' => round($avgWaitingTime ?? 0, 1),
            'chart_data' => $chartData,
        ];
    }

    private function getAntrianData($tanggalMulai, $tanggalAkhir, $search)
    {
        $query = Antrian::with(['pendaftaran.pasien', 'pendaftaran.dibuatOleh'])
            ->whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59']);

        if ($search) {
            $query->whereHas('pendaftaran.pasien', function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('kode_pasien', 'like', "%{$search}%");
            })->orWhere('nomor_antrian', 'like', "%{$search}%");
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    private function getRekamMedisStats($tanggalMulai, $tanggalAkhir)
    {
        $totalRekamMedis = RekamMedis::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])->count();
        $rekamMedisHariIni = RekamMedis::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->whereDate('created_at', Carbon::today())->count();
        $rekamMedisBulanIni = RekamMedis::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();
        $totalPasienUnik = RekamMedis::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->distinct('pasien_id')
            ->count('pasien_id');

        // Top diagnoses
        $topDiagnoses = RekamMedis::select('diagnosa', DB::raw('COUNT(*) as total'))
            ->whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->whereNotNull('diagnosa')
            ->groupBy('diagnosa')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        // Chart data - rekam medis per hari
        $chartData = RekamMedis::select(
                DB::raw('DATE(created_at) as tanggal'),
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        return [
            'total_rekam_medis' => $totalRekamMedis,
            'rekam_medis_hari_ini' => $rekamMedisHariIni,
            'rekam_medis_bulan_ini' => $rekamMedisBulanIni,
            'total_pasien_unik' => $totalPasienUnik,
            'top_diagnoses' => $topDiagnoses,
            'chart_data' => $chartData,
        ];
    }

    private function getRekamMedisData($tanggalMulai, $tanggalAkhir, $search)
    {
        $query = RekamMedis::with(['pasien', 'dokter'])
            ->whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59']);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->whereHas('pasien', function($subQ) use ($search) {
                    $subQ->where('nama_lengkap', 'like', "%{$search}%")
                         ->orWhere('kode_pasien', 'like', "%{$search}%");
                })->orWhere('diagnosa', 'like', "%{$search}%")
                  ->orWhere('anamnesis', 'like', "%{$search}%")
                  ->orWhere('kode_rekam_medis', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    private function getPasienStats($tanggalMulai, $tanggalAkhir)
    {
        $totalPasien = Pasien::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])->count();
        $pasienBaru = Pasien::whereDate('created_at', Carbon::today())->count();
        $pasienLakiLaki = Pasien::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->where('jenis_kelamin', 'laki-laki')->count();
        $pasienPerempuan = Pasien::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->where('jenis_kelamin', 'perempuan')->count();

        // Age distribution
        $ageDistribution = Pasien::select(
                DB::raw('CASE 
                    WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 18 THEN "0-17" 
                    WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 18 AND 35 THEN "18-35"
                    WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 36 AND 55 THEN "36-55"
                    ELSE "55+" 
                END as age_group'),
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->groupBy('age_group')
            ->get();

        // Chart data - pasien baru per hari
        $chartData = Pasien::select(
                DB::raw('DATE(created_at) as tanggal'),
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        return [
            'total_pasien' => $totalPasien,
            'pasien_baru_hari_ini' => $pasienBaru,
            'pasien_laki_laki' => $pasienLakiLaki,
            'pasien_perempuan' => $pasienPerempuan,
            'age_distribution' => $ageDistribution,
            'chart_data' => $chartData,
        ];
    }

    private function getPasienData($tanggalMulai, $tanggalAkhir, $search)
    {
        $query = Pasien::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59']);

        if ($search) {
            $query->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('kode_pasien', 'like', "%{$search}%")
                  ->orWhere('telepon', 'like', "%{$search}%");
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    public function export(Request $request)
    {
        $filters = $request->only(['tanggal_mulai', 'tanggal_akhir', 'jenis_laporan', 'format', 'search']);
        
        // Use the same logic as index method for consistency
        $tanggalMulai = !empty($filters['tanggal_mulai']) ? $filters['tanggal_mulai'] : Carbon::now()->subDays(7)->format('Y-m-d');
        $tanggalAkhir = !empty($filters['tanggal_akhir']) ? $filters['tanggal_akhir'] : Carbon::now()->format('Y-m-d');
        $jenisLaporan = $filters['jenis_laporan'] ?? 'pendaftaran';
        $format = $filters['format'] ?? 'pdf';
        $search = $filters['search'] ?? '';

        // Ensure proper date format and validation
        try {
            $tanggalMulai = Carbon::parse($tanggalMulai)->format('Y-m-d');
            $tanggalAkhir = Carbon::parse($tanggalAkhir)->format('Y-m-d');
        } catch (\Exception $e) {
            // Fallback to default if date parsing fails
            $tanggalMulai = Carbon::now()->subDays(7)->format('Y-m-d');
            $tanggalAkhir = Carbon::now()->format('Y-m-d');
        }

        // Generate filename with actual date range
        $filename = "laporan_{$jenisLaporan}_{$tanggalMulai}_to_{$tanggalAkhir}.{$format}";

        // Get data based on report type - use the same search parameter
        $data = [];
        $stats = [];
        
        switch ($jenisLaporan) {
            case 'pendaftaran':
                $stats = $this->getPendaftaranStats($tanggalMulai, $tanggalAkhir);
                $data = $this->getPendaftaranData($tanggalMulai, $tanggalAkhir, $search);
                break;
                
            case 'antrian':
                $stats = $this->getAntrianStats($tanggalMulai, $tanggalAkhir);
                $data = $this->getAntrianData($tanggalMulai, $tanggalAkhir, $search);
                break;
                
            case 'rekam_medis':
                $stats = $this->getRekamMedisStats($tanggalMulai, $tanggalAkhir);
                $data = $this->getRekamMedisData($tanggalMulai, $tanggalAkhir, $search);
                break;
                
            case 'pasien':
                $stats = $this->getPasienStats($tanggalMulai, $tanggalAkhir);
                $data = $this->getPasienData($tanggalMulai, $tanggalAkhir, $search);
                break;
        }

        if ($format === 'pdf') {
            return $this->exportToPdf($data, $stats, $jenisLaporan, $tanggalMulai, $tanggalAkhir, $filename);
        } else {
            return $this->exportToExcel($data, $stats, $jenisLaporan, $tanggalMulai, $tanggalAkhir, $filename);
        }
    }

    private function exportToPdf($data, $stats, $jenisLaporan, $tanggalMulai, $tanggalAkhir, $filename)
    {
        $viewData = [
            'data' => $data,
            'stats' => $stats,
            'jenisLaporan' => $jenisLaporan,
            'tanggalMulai' => $tanggalMulai,
            'tanggalAkhir' => $tanggalAkhir,
            'judul' => $this->getJudulLaporan($jenisLaporan),
            'periode' => Carbon::parse($tanggalMulai)->format('d M Y') . ' - ' . Carbon::parse($tanggalAkhir)->format('d M Y'),
        ];

        try {
            $pdf = Pdf::loadView('laporan.pdf.' . $jenisLaporan, $viewData);
            $pdf->setPaper('A4', 'portrait');
            
            // Set proper headers for PDF download
            return response($pdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Gagal membuat PDF: ' . $e->getMessage(),
                'message' => 'Terjadi kesalahan saat membuat laporan PDF'
            ], 500);
        }
    }

    private function getJudulLaporan($jenisLaporan)
    {
        $judulMap = [
            'pendaftaran' => 'Laporan Pendaftaran Pasien',
            'antrian' => 'Laporan Antrian Pasien',
            'rekam_medis' => 'Laporan Rekam Medis',
            'pasien' => 'Laporan Data Pasien'
        ];
        
        return $judulMap[$jenisLaporan] ?? 'Laporan';
    }

    private function exportToExcel($data, $stats, $jenisLaporan, $tanggalMulai, $tanggalAkhir, $filename)
    {
        // For now, return JSON data (implement Excel export later)
        return response()->json([
            'message' => 'Excel export functionality will be implemented',
            'data' => $data,
            'stats' => $stats,
            'type' => $jenisLaporan,
            'period' => "$tanggalMulai to $tanggalAkhir"
        ]);
    }

    public function show($id, Request $request)
    {
        $jenisLaporan = $request->get('jenis_laporan', 'rekam_medis');

        switch ($jenisLaporan) {
            case 'rekam_medis':
                return $this->showRekamMedis($id);
                
            case 'pendaftaran':
                return $this->showPendaftaran($id);
                
            case 'pasien':
                return $this->showPasien($id);
                
            case 'antrian':
                return $this->showAntrian($id);
                
            default:
                abort(404, 'Jenis laporan tidak valid');
        }
    }

    private function showRekamMedis($id)
    {
        $rekamMedis = RekamMedis::with([
            'pasien:id,nama_lengkap,tanggal_lahir,jenis_kelamin,telepon,alamat',
            'dokter:id,nama_lengkap,spesialisasi,telepon',
            'pendaftaran:id,kode_pendaftaran,jenis_pemeriksaan,status_pendaftaran',
            'resep.detailResep.obat:id,nama_obat,satuan'
        ])->findOrFail($id);

        // Calculate total biaya if not set
        if (!$rekamMedis->total_biaya || $rekamMedis->total_biaya == 0) {
            $rekamMedis->updateBiayaObat();
            $rekamMedis->refresh();
        }

        return Inertia::render('pendaftaran/laporan/show', [
            'rekamMedis' => $rekamMedis,
            'jenisLaporan' => 'rekam_medis'
        ]);
    }

    private function showPendaftaran($id)
    {
        $pendaftaran = Pendaftaran::with([
            'pasien:id,nama_lengkap,tanggal_lahir,jenis_kelamin,telepon,alamat',
            'dokter:id,nama_lengkap,spesialisasi',
            'antrian:id,nomor_antrian,status_antrian,waktu_dipanggil,estimasi_waktu'
        ])->findOrFail($id);

        return Inertia::render('pendaftaran/laporan/show', [
            'pendaftaran' => $pendaftaran,
            'jenisLaporan' => 'pendaftaran'
        ]);
    }

    private function showPasien($id)
    {
        $pasien = Pasien::with([
            'pendaftaran' => function($query) {
                $query->latest()->take(5);
            },
            'rekamMedis' => function($query) {
                $query->latest()->take(5);
            }
        ])->findOrFail($id);

        return Inertia::render('pendaftaran/laporan/show', [
            'pasien' => $pasien,
            'jenisLaporan' => 'pasien'
        ]);
    }

    private function showAntrian($id)
    {
        $antrian = Antrian::with([
            'pendaftaran.pasien:id,nama_lengkap,tanggal_lahir,jenis_kelamin,telepon',
            'pendaftaran.dokter:id,nama_lengkap,spesialisasi'
        ])->findOrFail($id);

        return Inertia::render('pendaftaran/laporan/show', [
            'antrian' => $antrian,
            'jenisLaporan' => 'antrian'
        ]);
    }
}
