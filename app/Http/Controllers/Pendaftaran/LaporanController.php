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

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['tanggal_mulai', 'tanggal_akhir', 'jenis_laporan', 'search']);
        
        // Set default date range (last 30 days)
        $tanggalMulai = $filters['tanggal_mulai'] ?? Carbon::now()->subDays(30)->format('Y-m-d');
        $tanggalAkhir = $filters['tanggal_akhir'] ?? Carbon::now()->format('Y-m-d');
        $jenisLaporan = $filters['jenis_laporan'] ?? 'pendaftaran';
        $search = $filters['search'] ?? '';

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
        $rekamMedisTerbaru = RekamMedis::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->whereDate('created_at', Carbon::today())->count();

        // Top diagnoses
        $topDiagnoses = RekamMedis::select('diagnosis', DB::raw('COUNT(*) as total'))
            ->whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->whereNotNull('diagnosis')
            ->groupBy('diagnosis')
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
            'rekam_medis_hari_ini' => $rekamMedisTerbaru,
            'top_diagnoses' => $topDiagnoses,
            'chart_data' => $chartData,
        ];
    }

    private function getRekamMedisData($tanggalMulai, $tanggalAkhir, $search)
    {
        $query = RekamMedis::with(['pasien', 'dokter'])
            ->whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59']);

        if ($search) {
            $query->whereHas('pasien', function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('kode_pasien', 'like', "%{$search}%");
            })->orWhere('diagnosis', 'like', "%{$search}%")
              ->orWhere('keluhan', 'like', "%{$search}%");
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    private function getPasienStats($tanggalMulai, $tanggalAkhir)
    {
        $totalPasien = Pasien::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])->count();
        $pasienBaru = Pasien::whereDate('created_at', Carbon::today())->count();
        $pasienLakiLaki = Pasien::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->where('jenis_kelamin', 'L')->count();
        $pasienPerempuan = Pasien::whereBetween('created_at', [$tanggalMulai, $tanggalAkhir . ' 23:59:59'])
            ->where('jenis_kelamin', 'P')->count();

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
        $filters = $request->only(['tanggal_mulai', 'tanggal_akhir', 'jenis_laporan', 'format']);
        
        // Set default values
        $tanggalMulai = $filters['tanggal_mulai'] ?? Carbon::now()->subDays(30)->format('Y-m-d');
        $tanggalAkhir = $filters['tanggal_akhir'] ?? Carbon::now()->format('Y-m-d');
        $jenisLaporan = $filters['jenis_laporan'] ?? 'pendaftaran';
        $format = $filters['format'] ?? 'pdf';

        // Generate filename
        $filename = "laporan_{$jenisLaporan}_{$tanggalMulai}_to_{$tanggalAkhir}.{$format}";

        // Get data based on report type
        $data = [];
        $stats = [];
        
        switch ($jenisLaporan) {
            case 'pendaftaran':
                $stats = $this->getPendaftaranStats($tanggalMulai, $tanggalAkhir);
                $data = $this->getPendaftaranData($tanggalMulai, $tanggalAkhir, '');
                break;
                
            case 'antrian':
                $stats = $this->getAntrianStats($tanggalMulai, $tanggalAkhir);
                $data = $this->getAntrianData($tanggalMulai, $tanggalAkhir, '');
                break;
                
            case 'rekam_medis':
                $stats = $this->getRekamMedisStats($tanggalMulai, $tanggalAkhir);
                $data = $this->getRekamMedisData($tanggalMulai, $tanggalAkhir, '');
                break;
                
            case 'pasien':
                $stats = $this->getPasienStats($tanggalMulai, $tanggalAkhir);
                $data = $this->getPasienData($tanggalMulai, $tanggalAkhir, '');
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
        // For now, return JSON data (implement PDF generation later)
        return response()->json([
            'message' => 'PDF export functionality will be implemented',
            'data' => $data,
            'stats' => $stats,
            'type' => $jenisLaporan,
            'period' => "$tanggalMulai to $tanggalAkhir"
        ]);
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
}
