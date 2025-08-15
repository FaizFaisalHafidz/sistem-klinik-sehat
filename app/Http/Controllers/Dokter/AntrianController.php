<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\Antrian;
use App\Models\Pendaftaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AntrianController extends Controller
{
    /**
     * Display queue list for doctor
     */
    public function index(Request $request)
    {
        // Stats untuk hari ini
        $stats = [
            'total_antrian_hari_ini' => Antrian::whereDate('created_at', Carbon::today())->count(),
            'antrian_menunggu' => Antrian::whereDate('created_at', Carbon::today())
                ->where('status_antrian', 'menunggu')->count(),
            'antrian_sedang_diperiksa' => Antrian::whereDate('created_at', Carbon::today())
                ->where('status_antrian', 'sedang_diperiksa')->count(),
            'antrian_selesai' => Antrian::whereDate('created_at', Carbon::today())
                ->where('status_antrian', 'selesai')->count(),
            'pasien_diperiksa' => Antrian::whereDate('created_at', Carbon::today())
                ->whereHas('pendaftaran', function($q) {
                    $q->where('status_pendaftaran', 'sedang_diperiksa');
                })->count(),
        ];

        // Filter pencarian
        $query = Antrian::with(['pendaftaran.pasien', 'pendaftaran.dibuatOleh'])
            ->whereDate('created_at', Carbon::today())
            ->orderBy('nomor_antrian', 'asc');

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status_antrian', $request->status);
        }

        // Filter berdasarkan nama pasien
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('pendaftaran.pasien', function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('kode_pasien', 'like', "%{$search}%");
            });
        }

        $antrianHariIni = $query->paginate(20)->withQueryString();

        // Transform data untuk frontend
        $antrianData = $antrianHariIni->through(function ($antrian) {
            return [
                'id' => $antrian->id,
                'nomor_antrian' => $antrian->nomor_antrian,
                'status_antrian' => $antrian->status_antrian,
                'estimasi_waktu' => $antrian->estimasi_waktu,
                'estimasi_waktu_formatted' => $antrian->estimasi_waktu ? 
                    $antrian->estimasi_waktu->format('H:i') : null,
                'keterangan' => $antrian->keterangan,
                'created_at' => $antrian->created_at->format('Y-m-d H:i:s'),
                'created_at_formatted' => $antrian->created_at->format('H:i'),
                'pendaftaran' => [
                    'id' => $antrian->pendaftaran->id,
                    'kode_pendaftaran' => $antrian->pendaftaran->kode_pendaftaran,
                    'jenis_pemeriksaan' => $antrian->pendaftaran->jenis_pemeriksaan ?? 'Pemeriksaan Umum',
                    'keluhan' => $antrian->pendaftaran->keluhan ?? $antrian->pendaftaran->keluhan_utama,
                    'status_pendaftaran' => $antrian->pendaftaran->status_pendaftaran,
                    'pasien' => [
                        'id' => $antrian->pendaftaran->pasien->id,
                        'kode_pasien' => $antrian->pendaftaran->pasien->kode_pasien,
                        'nama_lengkap' => $antrian->pendaftaran->pasien->nama_lengkap,
                        'jenis_kelamin' => $antrian->pendaftaran->pasien->jenis_kelamin,
                        'telepon' => $antrian->pendaftaran->pasien->telepon,
                        'umur' => Carbon::parse($antrian->pendaftaran->pasien->tanggal_lahir)->age,
                    ],
                    'petugas' => [
                        'nama_lengkap' => $antrian->pendaftaran->dibuatOleh->nama_lengkap ?? 'Sistem',
                    ],
                ],
            ];
        });

        return Inertia::render('dokter/antrian/index', [
            'stats' => $stats,
            'antrianHariIni' => $antrianData,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Display specific queue item detail for doctor
     */
    public function show($id)
    {
        $antrian = Antrian::with(['pendaftaran.pasien', 'pendaftaran.dibuatOleh', 'pendaftaran.rekamMedis'])
            ->findOrFail($id);

        return Inertia::render('dokter/antrian/show', [
            'antrian' => [
                'id' => $antrian->id,
                'nomor_antrian' => $antrian->nomor_antrian,
                'status_antrian' => $antrian->status_antrian,
                'estimasi_waktu' => $antrian->estimasi_waktu,
                'estimasi_waktu_formatted' => $antrian->estimasi_waktu ? 
                    $antrian->estimasi_waktu->format('H:i') : null,
                'keterangan' => $antrian->keterangan,
                'created_at' => $antrian->created_at->format('Y-m-d H:i:s'),
                'created_at_formatted' => $antrian->created_at->format('d/m/Y H:i'),
                'updated_at' => $antrian->updated_at->format('Y-m-d H:i:s'),
                'updated_at_formatted' => $antrian->updated_at->format('d/m/Y H:i'),
                'pendaftaran' => [
                    'id' => $antrian->pendaftaran->id,
                    'kode_pendaftaran' => $antrian->pendaftaran->kode_pendaftaran,
                    'tanggal_pendaftaran' => $antrian->pendaftaran->tanggal_pendaftaran->format('Y-m-d'),
                    'tanggal_pendaftaran_formatted' => $antrian->pendaftaran->tanggal_pendaftaran->format('d/m/Y'),
                    'jenis_pemeriksaan' => $antrian->pendaftaran->jenis_pemeriksaan ?? 'Pemeriksaan Umum',
                    'keluhan' => $antrian->pendaftaran->keluhan ?? $antrian->pendaftaran->keluhan_utama,
                    'catatan' => $antrian->pendaftaran->catatan ?? '',
                    'status_pendaftaran' => $antrian->pendaftaran->status_pendaftaran,
                    'created_at' => $antrian->pendaftaran->created_at->format('Y-m-d H:i:s'),
                    'created_at_formatted' => $antrian->pendaftaran->created_at->format('d/m/Y H:i'),
                    'pasien' => [
                        'id' => $antrian->pendaftaran->pasien->id,
                        'kode_pasien' => $antrian->pendaftaran->pasien->kode_pasien,
                        'nama_lengkap' => $antrian->pendaftaran->pasien->nama_lengkap,
                        'tanggal_lahir' => $antrian->pendaftaran->pasien->tanggal_lahir,
                        'tanggal_lahir_formatted' => Carbon::parse($antrian->pendaftaran->pasien->tanggal_lahir)->format('d/m/Y'),
                        'jenis_kelamin' => $antrian->pendaftaran->pasien->jenis_kelamin,
                        'telepon' => $antrian->pendaftaran->pasien->telepon,
                        'alamat' => $antrian->pendaftaran->pasien->alamat,
                        'umur' => Carbon::parse($antrian->pendaftaran->pasien->tanggal_lahir)->age,
                    ],
                    'petugas' => [
                        'nama_lengkap' => $antrian->pendaftaran->dibuatOleh->nama_lengkap ?? 'Sistem',
                    ],
                    'rekam_medis' => $antrian->pendaftaran->rekamMedis ? [
                        'id' => $antrian->pendaftaran->rekamMedis->id,
                        'diagnosis' => $antrian->pendaftaran->rekamMedis->diagnosis,
                        'tindakan' => $antrian->pendaftaran->rekamMedis->tindakan,
                        'resep' => $antrian->pendaftaran->rekamMedis->resep()->get()->map(function ($resep) {
                            return [
                                'id' => $resep->id,
                                'kode_resep' => $resep->kode_resep,
                                'tanggal_resep' => $resep->tanggal_resep,
                                'catatan_resep' => $resep->catatan_resep,
                                'status_resep' => $resep->status_resep,
                            ];
                        }),
                        'catatan' => $antrian->pendaftaran->rekamMedis->catatan,
                    ] : null,
                ],
            ]
        ]);
    }

    /**
     * Start examination for a patient
     */
    public function startExamination($id)
    {
        $antrian = Antrian::with(['pendaftaran'])->findOrFail($id);
        
        // Update status antrian menjadi sedang_diperiksa
        $antrian->update([
            'status_antrian' => 'sedang_diperiksa',
            'keterangan' => 'Pasien sedang diperiksa oleh dokter',
        ]);

        // Update status pendaftaran menjadi sedang_diperiksa
        $antrian->pendaftaran->update([
            'status_pendaftaran' => 'sedang_diperiksa',
        ]);

        return redirect()->route('dokter.pemeriksaan.create', [
            'pendaftaran_id' => $antrian->pendaftaran->id
        ])->with('success', 'Pemeriksaan dimulai. Silakan isi rekam medis pasien.');
    }

    /**
     * Call next patient in queue
     */
    public function callNext(Request $request)
    {
        // Cari antrian berikutnya yang menunggu
        $nextAntrian = Antrian::where('status_antrian', 'menunggu')
            ->whereDate('created_at', Carbon::today())
            ->orderBy('nomor_antrian', 'asc')
            ->first();

        if (!$nextAntrian) {
            return redirect()->back()->with('error', 'Tidak ada antrian yang menunggu.');
        }

        // Update status antrian menjadi sedang_diperiksa
        $nextAntrian->update([
            'status_antrian' => 'sedang_diperiksa',
            'keterangan' => 'Pasien dipanggil untuk pemeriksaan',
        ]);

        return redirect()->back()->with('success', "Antrian #{$nextAntrian->nomor_antrian} berhasil dipanggil.");
    }

    /**
     * Complete examination
     */
    public function completeExamination($id)
    {
        $antrian = Antrian::with(['pendaftaran'])->findOrFail($id);
        
        // Update status antrian menjadi selesai
        $antrian->update([
            'status_antrian' => 'selesai',
            'keterangan' => 'Pemeriksaan selesai',
        ]);

        // Update status pendaftaran menjadi selesai
        $antrian->pendaftaran->update([
            'status_pendaftaran' => 'selesai',
        ]);

        return redirect()->route('dokter.antrian.index')
            ->with('success', 'Pemeriksaan berhasil diselesaikan.');
    }

    /**
     * Get current queue status
     */
    public function currentStatus()
    {
        $currentAntrian = Antrian::with(['pendaftaran.pasien'])
            ->where('status_antrian', 'sedang_diperiksa')
            ->whereDate('created_at', Carbon::today())
            ->first();

        $nextAntrian = Antrian::where('status_antrian', 'menunggu')
            ->whereDate('created_at', Carbon::today())
            ->orderBy('nomor_antrian', 'asc')
            ->first();

        return response()->json([
            'current' => $currentAntrian ? [
                'nomor_antrian' => $currentAntrian->nomor_antrian,
                'nama_pasien' => $currentAntrian->pendaftaran->pasien->nama_lengkap,
                'kode_pasien' => $currentAntrian->pendaftaran->pasien->kode_pasien,
            ] : null,
            'next' => $nextAntrian ? [
                'nomor_antrian' => $nextAntrian->nomor_antrian,
                'nama_pasien' => $nextAntrian->pendaftaran->pasien->nama_lengkap,
                'kode_pasien' => $nextAntrian->pendaftaran->pasien->kode_pasien,
            ] : null,
            'total_waiting' => Antrian::where('status_antrian', 'menunggu')
                ->whereDate('created_at', Carbon::today())->count(),
        ]);
    }
}
