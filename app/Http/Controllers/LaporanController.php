<?php

namespace App\Http\Controllers;

use App\Models\RekamMedis;
use App\Models\Pasien;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $query = RekamMedis::with(['pasien', 'dokter'])
            ->orderBy('tanggal_pemeriksaan', 'desc');

        // Filter berdasarkan tanggal
        if ($request->filled('tanggal_dari')) {
            $query->whereDate('tanggal_pemeriksaan', '>=', $request->tanggal_dari);
        }

        if ($request->filled('tanggal_sampai')) {
            $query->whereDate('tanggal_pemeriksaan', '<=', $request->tanggal_sampai);
        }

        // Filter berdasarkan pasien
        if ($request->filled('pasien_id')) {
            $query->where('pasien_id', $request->pasien_id);
        }

        // Filter berdasarkan dokter
        if ($request->filled('dokter_id')) {
            $query->where('dokter_id', $request->dokter_id);
        }

        // Filter berdasarkan jenis pemeriksaan
        if ($request->filled('jenis_pemeriksaan')) {
            $query->where('anamnesis', 'like', '%' . $request->jenis_pemeriksaan . '%');
        }

        $rekamMedis = $query->paginate(15)->withQueryString();

        // Transform data untuk frontend
        $rekamMedisData = $rekamMedis->through(function ($rekam) {
            $tandaVital = $rekam->tanda_vital ? json_decode($rekam->tanda_vital, true) : [];
            
            return [
                'id' => $rekam->id,
                'tanggal_pemeriksaan' => $rekam->tanggal_pemeriksaan->format('Y-m-d'),
                'tanggal_pemeriksaan_formatted' => $rekam->tanggal_pemeriksaan->format('d/m/Y'),
                'pasien' => [
                    'id' => $rekam->pasien->id,
                    'nama_lengkap' => $rekam->pasien->nama_lengkap,
                    'kode_pasien' => $rekam->pasien->kode_pasien,
                    'tanggal_lahir' => $rekam->pasien->tanggal_lahir,
                    'jenis_kelamin' => $rekam->pasien->jenis_kelamin,
                ],
                'dokter' => [
                    'id' => $rekam->dokter->id,
                    'nama_lengkap' => $rekam->dokter->nama_lengkap,
                    'jabatan' => $rekam->dokter->jabatan,
                ],
                'anamnesis' => $rekam->anamnesis,
                'diagnosa' => $rekam->diagnosa,
                'pemeriksaan_fisik' => $rekam->pemeriksaan_fisik,
                'rencana_pengobatan' => $rekam->rencana_pengobatan,
                'catatan_dokter' => $rekam->catatan_dokter,
                'tanda_vital' => $tandaVital,
                'status_rekam_medis' => $rekam->status_rekam_medis,
            ];
        });

        // Statistik untuk dashboard
        $totalRekamMedis = RekamMedis::count();
        $rekamMedisHariIni = RekamMedis::whereDate('tanggal_pemeriksaan', today())->count();
        $rekamMedisMingguIni = RekamMedis::whereBetween('tanggal_pemeriksaan', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ])->count();
        $rekamMedisBulanIni = RekamMedis::whereMonth('tanggal_pemeriksaan', Carbon::now()->month)
            ->whereYear('tanggal_pemeriksaan', Carbon::now()->year)
            ->count();

        // Data untuk filter dropdown
        $pasienList = Pasien::select('id', 'nama_lengkap', 'kode_pasien')
            ->orderBy('nama_lengkap')
            ->get();

        $dokterList = Pegawai::where('jabatan', 'dokter')
            ->select('id', 'nama_lengkap')
            ->orderBy('nama_lengkap')
            ->get();

        // Statistik diagnosa terbanyak
        $diagnosaTerbanyak = RekamMedis::select('diagnosa', DB::raw('count(*) as total'))
            ->whereNotNull('diagnosa')
            ->where('diagnosa', '!=', '')
            ->groupBy('diagnosa')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('admin/laporan/index', [
            'rekamMedis' => $rekamMedisData,
            'filters' => $request->only(['tanggal_dari', 'tanggal_sampai', 'pasien_id', 'dokter_id', 'jenis_pemeriksaan']),
            'statistics' => [
                'total_rekam_medis' => $totalRekamMedis,
                'rekam_medis_hari_ini' => $rekamMedisHariIni,
                'rekam_medis_minggu_ini' => $rekamMedisMingguIni,
                'rekam_medis_bulan_ini' => $rekamMedisBulanIni,
            ],
            'pasienList' => $pasienList,
            'dokterList' => $dokterList,
            'diagnosaTerbanyak' => $diagnosaTerbanyak,
        ]);
    }

    public function show(RekamMedis $rekamMedis)
    {
        $rekamMedis->load(['pasien', 'dokter']);

        $tandaVital = $rekamMedis->tanda_vital ? json_decode($rekamMedis->tanda_vital, true) : [];

        $rekamMedisData = [
            'id' => $rekamMedis->id,
            'tanggal_pemeriksaan' => $rekamMedis->tanggal_pemeriksaan->format('Y-m-d'),
            'tanggal_pemeriksaan_formatted' => $rekamMedis->tanggal_pemeriksaan->format('d F Y'),
            'pasien' => [
                'id' => $rekamMedis->pasien->id,
                'nama_lengkap' => $rekamMedis->pasien->nama_lengkap,
                'kode_pasien' => $rekamMedis->pasien->kode_pasien,
                'tanggal_lahir' => $rekamMedis->pasien->tanggal_lahir,
                'tanggal_lahir_formatted' => Carbon::parse($rekamMedis->pasien->tanggal_lahir)->format('d F Y'),
                'jenis_kelamin' => $rekamMedis->pasien->jenis_kelamin,
                'alamat' => $rekamMedis->pasien->alamat,
                'nomor_telepon' => $rekamMedis->pasien->telepon,
                'umur' => Carbon::parse($rekamMedis->pasien->tanggal_lahir)->age,
            ],
            'dokter' => [
                'id' => $rekamMedis->dokter->id,
                'nama_lengkap' => $rekamMedis->dokter->nama_lengkap,
                'jabatan' => $rekamMedis->dokter->jabatan,
                'nomor_sip' => $rekamMedis->dokter->nomor_izin ?? '-',
            ],
            'anamnesis' => $rekamMedis->anamnesis,
            'diagnosa' => $rekamMedis->diagnosa,
            'pemeriksaan_fisik' => $rekamMedis->pemeriksaan_fisik,
            'rencana_pengobatan' => $rekamMedis->rencana_pengobatan,
            'catatan_dokter' => $rekamMedis->catatan_dokter,
            'tanda_vital' => $tandaVital,
            'status_rekam_medis' => $rekamMedis->status_rekam_medis,
        ];

        // Riwayat rekam medis pasien
        $riwayatRekamMedis = RekamMedis::with(['dokter'])
            ->where('pasien_id', $rekamMedis->pasien_id)
            ->where('id', '!=', $rekamMedis->id)
            ->orderBy('tanggal_pemeriksaan', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($rekam) {
                return [
                    'id' => $rekam->id,
                    'tanggal_pemeriksaan' => $rekam->tanggal_pemeriksaan->format('d/m/Y'),
                    'diagnosa' => $rekam->diagnosa,
                    'dokter' => $rekam->dokter->nama_lengkap,
                ];
            });

        return Inertia::render('admin/laporan/show', [
            'rekamMedis' => $rekamMedisData,
            'riwayatRekamMedis' => $riwayatRekamMedis,
        ]);
    }

    public function cetak($id)
    {
        $rekamMedis = RekamMedis::with(['pasien', 'dokter'])->findOrFail($id);

        // Parse tanda vital
        $tandaVital = [];
        if ($rekamMedis->tanda_vital) {
            $tandaVital = is_array($rekamMedis->tanda_vital) 
                ? $rekamMedis->tanda_vital 
                : json_decode($rekamMedis->tanda_vital, true) ?? [];
        }

        $rekamMedisData = [
            'id' => $rekamMedis->id,
            'kode_rekam_medis' => $rekamMedis->kode_rekam_medis,
            'tanggal_pemeriksaan' => $rekamMedis->tanggal_pemeriksaan->format('Y-m-d'),
            'tanggal_pemeriksaan_formatted' => $rekamMedis->tanggal_pemeriksaan->format('d F Y'),
            'pasien' => [
                'id' => $rekamMedis->pasien->id,
                'nama_lengkap' => $rekamMedis->pasien->nama_lengkap,
                'kode_pasien' => $rekamMedis->pasien->kode_pasien,
                'tanggal_lahir' => $rekamMedis->pasien->tanggal_lahir,
                'tanggal_lahir_formatted' => Carbon::parse($rekamMedis->pasien->tanggal_lahir)->format('d F Y'),
                'jenis_kelamin' => $rekamMedis->pasien->jenis_kelamin,
                'alamat' => $rekamMedis->pasien->alamat,
                'nomor_telepon' => $rekamMedis->pasien->telepon,
                'umur' => Carbon::parse($rekamMedis->pasien->tanggal_lahir)->age,
            ],
            'dokter' => [
                'id' => $rekamMedis->dokter->id,
                'nama_lengkap' => $rekamMedis->dokter->nama_lengkap,
                'jabatan' => $rekamMedis->dokter->jabatan,
                'nomor_sip' => $rekamMedis->dokter->nomor_izin ?? '-',
            ],
            'anamnesis' => $rekamMedis->anamnesis,
            'diagnosa' => $rekamMedis->diagnosa,
            'pemeriksaan_fisik' => $rekamMedis->pemeriksaan_fisik,
            'rencana_pengobatan' => $rekamMedis->rencana_pengobatan,
            'catatan_dokter' => $rekamMedis->catatan_dokter,
            'tanda_vital' => $tandaVital,
            'status_rekam_medis' => $rekamMedis->status_rekam_medis,
        ];

        return Inertia::render('admin/laporan/cetak', [
            'rekamMedis' => $rekamMedisData,
        ]);
    }

    public function export(Request $request)
    {
        $query = RekamMedis::with(['pasien', 'dokter'])
            ->orderBy('tanggal_pemeriksaan', 'desc');

        // Apply same filters as index
        if ($request->filled('tanggal_dari')) {
            $query->whereDate('tanggal_pemeriksaan', '>=', $request->tanggal_dari);
        }

        if ($request->filled('tanggal_sampai')) {
            $query->whereDate('tanggal_pemeriksaan', '<=', $request->tanggal_sampai);
        }

        if ($request->filled('pasien_id')) {
            $query->where('pasien_id', $request->pasien_id);
        }

        if ($request->filled('dokter_id')) {
            $query->where('dokter_id', $request->dokter_id);
        }

        if ($request->filled('jenis_pemeriksaan')) {
            $query->where('anamnesis', 'like', '%' . $request->jenis_pemeriksaan . '%');
        }

        $data = $query->get();

        // Calculate statistics
        $stats = [
            'total_rekam_medis' => $data->count(),
            'rekam_medis_bulan_ini' => $data->filter(function($item) {
                return $item->tanggal_pemeriksaan->month == now()->month && 
                       $item->tanggal_pemeriksaan->year == now()->year;
            })->count(),
            'rekam_medis_hari_ini' => $data->filter(function($item) {
                return $item->tanggal_pemeriksaan->toDateString() == now()->toDateString();
            })->count(),
            'total_pasien_unik' => $data->pluck('pasien_id')->unique()->count()
        ];

        // Generate period text
        $periode = 'Semua Data';
        if ($request->filled('tanggal_dari') && $request->filled('tanggal_sampai')) {
            $dari = Carbon::parse($request->tanggal_dari)->format('d M Y');
            $sampai = Carbon::parse($request->tanggal_sampai)->format('d M Y');
            $periode = $dari . ' - ' . $sampai;
        } elseif ($request->filled('tanggal_dari')) {
            $periode = 'Dari ' . Carbon::parse($request->tanggal_dari)->format('d M Y');
        } elseif ($request->filled('tanggal_sampai')) {
            $periode = 'Sampai ' . Carbon::parse($request->tanggal_sampai)->format('d M Y');
        }

        $pdf = Pdf::loadView('laporan.pdf.rekam_medis', [
            'judul' => 'Laporan Rekam Medis',
            'periode' => $periode,
            'data' => $data,
            'stats' => $stats
        ]);

        $filename = 'laporan_rekam_medis_' . date('Y-m-d_H-i-s') . '.pdf';
        
        return $pdf->download($filename);
    }
}
