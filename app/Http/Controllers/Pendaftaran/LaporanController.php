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
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

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
        // Create new Spreadsheet object
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set proper filename
        $filename = str_replace(['.excel', '.csv'], '.xlsx', $filename);
        
        $judulMap = [
            'pendaftaran' => 'LAPORAN DATA PENDAFTARAN',
            'antrian' => 'LAPORAN DATA ANTRIAN', 
            'rekam_medis' => 'LAPORAN REKAM MEDIS',
            'pasien' => 'LAPORAN DATA PASIEN'
        ];
        
        $judul = $judulMap[$jenisLaporan] ?? 'LAPORAN';
        
        // Set document properties
        $spreadsheet->getProperties()
            ->setCreator("Klinik Sehat - Yayasan Al Fathonah")
            ->setLastModifiedBy("Sistem Klinik")
            ->setTitle($judul)
            ->setSubject("Laporan " . ucfirst($jenisLaporan))
            ->setDescription("Laporan periode " . Carbon::parse($tanggalMulai)->format('d/m/Y') . " - " . Carbon::parse($tanggalAkhir)->format('d/m/Y'));

        $currentRow = 1;
        
        // Header Section with styling
        $sheet->setCellValue("A{$currentRow}", $judul);
        $sheet->mergeCells("A{$currentRow}:H{$currentRow}");
        $sheet->getStyle("A{$currentRow}")->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 16,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2E86AB'] // Biru langit
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ]);
        $sheet->getRowDimension($currentRow)->setRowHeight(30);
        
        $currentRow++;
        $sheet->setCellValue("A{$currentRow}", 'KLINIK SEHAT - Yayasan Al Fathonah');
        $sheet->mergeCells("A{$currentRow}:H{$currentRow}");
        $sheet->getStyle("A{$currentRow}")->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4A90A4'] // Biru langit lebih terang
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER
            ]
        ]);
        
        $currentRow++;
        $sheet->setCellValue("A{$currentRow}", 'Periode: ' . Carbon::parse($tanggalMulai)->format('d/m/Y') . ' - ' . Carbon::parse($tanggalAkhir)->format('d/m/Y'));
        $sheet->mergeCells("A{$currentRow}:H{$currentRow}");
        $sheet->getStyle("A{$currentRow}")->applyFromArray([
            'font' => ['italic' => true, 'size' => 10],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);
        
        $currentRow++;
        $sheet->setCellValue("A{$currentRow}", 'Dicetak pada: ' . Carbon::now()->format('d/m/Y H:i:s') . ' WIB');
        $sheet->mergeCells("A{$currentRow}:H{$currentRow}");
        $sheet->getStyle("A{$currentRow}")->applyFromArray([
            'font' => ['italic' => true, 'size' => 10],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);
        
        $currentRow += 2; // Skip row
        
        // Statistics Section
        $sheet->setCellValue("A{$currentRow}", 'STATISTIK');
        $sheet->mergeCells("A{$currentRow}:H{$currentRow}");
        $sheet->getStyle("A{$currentRow}")->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 14,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '87CEEB'] // Sky blue
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER
            ]
        ]);
        
        $currentRow++;
        
        // Add statistics with nice formatting
        switch ($jenisLaporan) {
            case 'pendaftaran':
                $statsData = [
                    ['Total Pendaftaran', $stats['total_pendaftaran'] ?? 0],
                    ['Pendaftaran Selesai', $stats['pendaftaran_selesai'] ?? 0],
                    ['Pendaftaran Aktif', $stats['pendaftaran_aktif'] ?? 0],
                    ['Pendaftaran Dibatalkan', $stats['pendaftaran_dibatalkan'] ?? 0]
                ];
                break;
            case 'antrian':
                $statsData = [
                    ['Total Antrian', $stats['total_antrian'] ?? 0],
                    ['Antrian Menunggu', $stats['antrian_menunggu'] ?? 0],
                    ['Antrian Dipanggil', $stats['antrian_dipanggil'] ?? 0],
                    ['Antrian Selesai', $stats['antrian_selesai'] ?? 0]
                ];
                break;
            case 'rekam_medis':
                $statsData = [
                    ['Total Rekam Medis', $stats['total_rekam_medis'] ?? 0],
                    ['Rekam Medis Bulan Ini', $stats['rekam_medis_bulan_ini'] ?? 0],
                    ['Rekam Medis Hari Ini', $stats['rekam_medis_hari_ini'] ?? 0]
                ];
                break;
            case 'pasien':
                $statsData = [
                    ['Total Pasien', $stats['total_pasien'] ?? 0],
                    ['Pasien Baru Bulan Ini', $stats['pasien_baru_bulan_ini'] ?? 0],
                    ['Pasien Baru Hari Ini', $stats['pasien_baru_hari_ini'] ?? 0]
                ];
                break;
        }
        
        foreach ($statsData as $stat) {
            $sheet->setCellValue("B{$currentRow}", $stat[0]);
            $sheet->setCellValue("C{$currentRow}", $stat[1]);
            $sheet->getStyle("B{$currentRow}:C{$currentRow}")->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'F0F8FF'] // Alice blue
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '87CEEB']
                    ]
                ]
            ]);
            $sheet->getStyle("B{$currentRow}")->getFont()->setBold(true);
            $currentRow++;
        }
        
        $currentRow += 2; // Skip rows
        
        // Data Section Header
        $sheet->setCellValue("A{$currentRow}", 'DATA ' . strtoupper($jenisLaporan));
        $sheet->mergeCells("A{$currentRow}:H{$currentRow}");
        $sheet->getStyle("A{$currentRow}")->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 14,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4682B4'] // Steel blue
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER
            ]
        ]);
        
        $currentRow += 2;
        
        // Column headers with beautiful styling
        switch ($jenisLaporan) {
            case 'pendaftaran':
                $headers = ['No', 'Kode Pendaftaran', 'Tanggal Pendaftaran', 'Nama Pasien', 'No. Telepon', 'Keluhan Utama', 'Status', 'Dibuat Oleh'];
                break;
            case 'antrian':
                $headers = ['No', 'Nomor Antrian', 'Tanggal', 'Nama Pasien', 'Jenis Kelamin', 'Status Antrian', 'Jam Panggil', 'Jam Selesai'];
                break;
            case 'rekam_medis':
                $headers = ['No', 'Kode Rekam Medis', 'Tanggal Pemeriksaan', 'Nama Pasien', 'Umur', 'Jenis Kelamin', 'Dokter', 'Diagnosa'];
                break;
            case 'pasien':
                $headers = ['No', 'Kode Pasien', 'Nama Lengkap', 'NIK', 'Tanggal Lahir', 'Umur', 'Jenis Kelamin', 'Telepon'];
                break;
        }
        
        // Set headers
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $currentRow, $header);
            $sheet->getStyle($col . $currentRow)->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '6495ED'] // Cornflower blue
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '4682B4']
                    ]
                ]
            ]);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }
        
        $currentRow++;
        $headerRow = $currentRow - 1;
        
        // Add data rows with alternating colors
        foreach ($data as $index => $item) {
            $col = 'A';
            $isEven = $index % 2 == 0;
            $bgColor = $isEven ? 'F0F8FF' : 'FFFFFF'; // Alternating alice blue and white
            
            switch ($jenisLaporan) {
                case 'pendaftaran':
                    $rowData = [
                        $index + 1,
                        $item->kode_pendaftaran,
                        Carbon::parse($item->tanggal_pendaftaran)->format('d/m/Y'),
                        $item->pasien->nama_lengkap ?? 'N/A',
                        $item->pasien->telepon ?? 'N/A',
                        $item->keluhan_utama ?? '-',
                        ucfirst(str_replace('_', ' ', $item->status_pendaftaran)),
                        $item->dibuatOleh->nama_lengkap ?? 'N/A'
                    ];
                    break;
                case 'antrian':
                    $rowData = [
                        $index + 1,
                        $item->nomor_antrian,
                        Carbon::parse($item->tanggal_antrian)->format('d/m/Y'),
                        $item->pendaftaran->pasien->nama_lengkap ?? 'N/A',
                        $item->pendaftaran->pasien->jenis_kelamin ?? 'N/A',
                        ucfirst(str_replace('_', ' ', $item->status_antrian)),
                        $item->jam_panggil ? Carbon::parse($item->jam_panggil)->format('H:i') : '-',
                        $item->jam_selesai ? Carbon::parse($item->jam_selesai)->format('H:i') : '-'
                    ];
                    break;
                case 'rekam_medis':
                    $rowData = [
                        $index + 1,
                        $item->kode_rekam_medis,
                        Carbon::parse($item->tanggal_pemeriksaan)->format('d/m/Y'),
                        $item->pasien->nama_lengkap ?? 'N/A',
                        $item->pasien->umur ?? 'N/A',
                        $item->pasien->jenis_kelamin ?? 'N/A',
                        $item->dokter->nama_lengkap ?? 'N/A',
                        $item->diagnosa ?? '-'
                    ];
                    break;
                case 'pasien':
                    $rowData = [
                        $index + 1,
                        $item->kode_pasien,
                        $item->nama_lengkap,
                        $item->nik,
                        Carbon::parse($item->tanggal_lahir)->format('d/m/Y'),
                        $item->umur . ' tahun',
                        $item->jenis_kelamin,
                        $item->telepon ?? '-'
                    ];
                    break;
            }
            
            foreach ($rowData as $cellData) {
                $sheet->setCellValue($col . $currentRow, $cellData);
                $sheet->getStyle($col . $currentRow)->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $bgColor]
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'B0C4DE']
                        ]
                    ],
                    'alignment' => [
                        'vertical' => Alignment::VERTICAL_CENTER
                    ]
                ]);
                
                // Center align for number column
                if ($col == 'A') {
                    $sheet->getStyle($col . $currentRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                }
                
                $col++;
            }
            $currentRow++;
        }
        
        // Footer
        $currentRow += 2;
        $sheet->setCellValue("A{$currentRow}", '=== AKHIR LAPORAN ===');
        $sheet->mergeCells("A{$currentRow}:H{$currentRow}");
        $sheet->getStyle("A{$currentRow}")->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2E86AB']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER
            ]
        ]);
        
        $currentRow++;
        $sheet->setCellValue("A{$currentRow}", '© ' . date('Y') . ' Klinik Sehat - Yayasan Al Fathonah');
        $sheet->mergeCells("A{$currentRow}:H{$currentRow}");
        $sheet->getStyle("A{$currentRow}")->applyFromArray([
            'font' => ['italic' => true, 'size' => 10],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);
        
        // Set page setup
        $sheet->getPageSetup()->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4);
        
        // Create writer and output
        $writer = new Xlsx($spreadsheet);
        
        // Set headers for download
        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ];

        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $filename, $headers);
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

    public function cetak($id, Request $request)
    {
        $jenisLaporan = $request->get('jenis_laporan', 'rekam_medis');

        switch ($jenisLaporan) {
            case 'rekam_medis':
                return $this->cetakRekamMedis($id);
                
            case 'pendaftaran':
                return $this->cetakPendaftaran($id);
                
            case 'pasien':
                return $this->cetakPasien($id);
                
            case 'antrian':
                return $this->cetakAntrian($id);
                
            default:
                abort(404, 'Jenis laporan tidak valid');
        }
    }

    private function cetakRekamMedis($id)
    {
        $rekamMedis = RekamMedis::with([
            'pasien:id,nama_lengkap,tanggal_lahir,jenis_kelamin,telepon,alamat,kode_pasien',
            'dokter:id,nama_lengkap,spesialisasi,telepon',
            'pendaftaran:id,kode_pendaftaran,jenis_pemeriksaan,status_pendaftaran',
            'resep.detailResep.obat:id,nama_obat,satuan'
        ])->findOrFail($id);

        // Calculate total biaya if not set
        if (!$rekamMedis->total_biaya || $rekamMedis->total_biaya == 0) {
            $rekamMedis->updateBiayaObat();
            $rekamMedis->refresh();
        }

        return Inertia::render('pendaftaran/laporan/cetak', [
            'data' => $rekamMedis,
            'jenisLaporan' => 'rekam_medis'
        ]);
    }

    private function cetakPendaftaran($id)
    {
        $pendaftaran = Pendaftaran::with([
            'pasien:id,nama_lengkap,tanggal_lahir,jenis_kelamin,telepon,alamat,kode_pasien',
            'dokter:id,nama_lengkap,spesialisasi',
            'antrian:id,nomor_antrian,status_antrian,waktu_dipanggil,estimasi_waktu'
        ])->findOrFail($id);

        return Inertia::render('pendaftaran/laporan/cetak', [
            'data' => $pendaftaran,
            'jenisLaporan' => 'pendaftaran'
        ]);
    }

    private function cetakPasien($id)
    {
        $pasien = Pasien::with([
            'pendaftaran' => function($query) {
                $query->latest()->take(5);
            },
            'rekamMedis' => function($query) {
                $query->latest()->take(5);
            }
        ])->findOrFail($id);

        return Inertia::render('pendaftaran/laporan/cetak', [
            'data' => $pasien,
            'jenisLaporan' => 'pasien'
        ]);
    }

    private function cetakAntrian($id)
    {
        $antrian = Antrian::with([
            'pendaftaran.pasien:id,nama_lengkap,tanggal_lahir,jenis_kelamin,telepon,kode_pasien',
            'pendaftaran.dokter:id,nama_lengkap,spesialisasi'
        ])->findOrFail($id);

        return Inertia::render('pendaftaran/laporan/cetak', [
            'data' => $antrian,
            'jenisLaporan' => 'antrian'
        ]);
    }
}
