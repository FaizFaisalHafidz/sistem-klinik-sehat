<?php

namespace App\Http\Controllers\Pendaftaran;

use App\Http\Controllers\Controller;
use App\Models\Antrian;
use App\Models\Pendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AntrianController extends Controller
{
    /**
     * Display the queue management page
     */
    public function index(Request $request)
    {
        // Statistik untuk dashboard
        $stats = [
            'total_antrian_hari_ini' => Antrian::whereDate('created_at', Carbon::today())->count(),
            'antrian_menunggu' => Antrian::where('status_antrian', 'menunggu')->count(),
            'antrian_dipanggil' => Antrian::where('status_antrian', 'dipanggil')->count(),
            'antrian_selesai' => Antrian::whereDate('created_at', Carbon::today())
                ->where('status_antrian', 'selesai')->count(),
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

        return Inertia::render('pendaftaran/antrian/index', [
            'stats' => $stats,
            'antrianHariIni' => $antrianData,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Display the specified queue item
     */
    public function show($id)
    {
        $antrian = Antrian::with(['pendaftaran.pasien', 'pendaftaran.dibuatOleh'])
            ->findOrFail($id);

        return Inertia::render('pendaftaran/antrian/show', [
            'antrian' => [
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
                    'tanggal_pendaftaran' => $antrian->pendaftaran->tanggal_pendaftaran->format('Y-m-d'),
                    'tanggal_pendaftaran_formatted' => $antrian->pendaftaran->tanggal_pendaftaran->format('d/m/Y'),
                    'jenis_pemeriksaan' => $antrian->pendaftaran->jenis_pemeriksaan ?? 'Pemeriksaan Umum',
                    'keluhan' => $antrian->pendaftaran->keluhan ?? $antrian->pendaftaran->keluhan_utama,
                    'catatan' => $antrian->pendaftaran->catatan ?? '',
                    'status_pendaftaran' => $antrian->pendaftaran->status_pendaftaran,
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
                ],
            ]
        ]);
    }

    /**
     * Update queue status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:menunggu,dipanggil,selesai,dibatalkan',
            'keterangan' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $antrian = Antrian::findOrFail($id);
            
            $antrian->update([
                'status_antrian' => $request->status,
                'keterangan' => $request->keterangan,
            ]);

            // Update status pendaftaran jika diperlukan
            if ($request->status === 'selesai') {
                $antrian->pendaftaran->update(['status_pendaftaran' => 'selesai']);
            } elseif ($request->status === 'dibatalkan') {
                $antrian->pendaftaran->update(['status_pendaftaran' => 'dibatalkan']);
            } elseif ($request->status === 'dipanggil') {
                $antrian->pendaftaran->update(['status_pendaftaran' => 'sedang_diperiksa']);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Status antrian berhasil diperbarui.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan saat memperbarui status: ' . $e->getMessage()]);
        }
    }

    /**
     * Print ticket for queue
     */
    public function printTicket($id)
    {
        $antrian = Antrian::with(['pendaftaran.pasien', 'pendaftaran.dibuatOleh'])
            ->findOrFail($id);

        return Inertia::render('pendaftaran/antrian/print-ticket', [
            'antrian' => [
                'id' => $antrian->id,
                'nomor_antrian' => $antrian->nomor_antrian,
                'status_antrian' => $antrian->status_antrian,
                'estimasi_waktu' => $antrian->estimasi_waktu ? 
                    $antrian->estimasi_waktu->format('H:i') : '-',
                'keterangan' => $antrian->keterangan ?? '-',
                'created_at' => $antrian->created_at->format('Y-m-d H:i:s'),
                'jam_daftar' => $antrian->created_at->format('H:i'),
                'pendaftaran' => [
                    'id' => $antrian->pendaftaran->id,
                    'kode_pendaftaran' => $antrian->pendaftaran->kode_pendaftaran,
                    'tanggal_pendaftaran' => $antrian->pendaftaran->tanggal_pendaftaran->format('Y-m-d'),
                    'tanggal_pendaftaran_formatted' => $antrian->pendaftaran->tanggal_pendaftaran->format('d/m/Y'),
                    'jenis_pemeriksaan' => $antrian->pendaftaran->jenis_pemeriksaan ?? 'Pemeriksaan Umum',
                    'keluhan' => $antrian->pendaftaran->keluhan ?? $antrian->pendaftaran->keluhan_utama ?? '-',
                    'status_pendaftaran' => $antrian->pendaftaran->status_pendaftaran,
                    'pasien' => [
                        'id' => $antrian->pendaftaran->pasien->id,
                        'kode_pasien' => $antrian->pendaftaran->pasien->kode_pasien,
                        'nama_lengkap' => $antrian->pendaftaran->pasien->nama_lengkap,
                        'tanggal_lahir' => $antrian->pendaftaran->pasien->tanggal_lahir,
                        'tanggal_lahir_formatted' => Carbon::parse($antrian->pendaftaran->pasien->tanggal_lahir)->format('d/m/Y'),
                        'jenis_kelamin' => $antrian->pendaftaran->pasien->jenis_kelamin,
                        'telepon' => $antrian->pendaftaran->pasien->telepon,
                        'umur' => Carbon::parse($antrian->pendaftaran->pasien->tanggal_lahir)->age,
                    ],
                ],
            ]
        ]);
    }

    /**
     * Call next queue
     */
    public function callNext(Request $request)
    {
        try {
            DB::beginTransaction();

            // Cari antrian berikutnya yang menunggu
            $nextAntrian = Antrian::where('status_antrian', 'menunggu')
                ->whereDate('created_at', Carbon::today())
                ->orderBy('nomor_antrian', 'asc')
                ->first();

            if (!$nextAntrian) {
                return redirect()->back()->with('info', 'Tidak ada antrian yang menunggu.');
            }

            // Update status antrian menjadi dipanggil
            $nextAntrian->update([
                'status_antrian' => 'dipanggil',
                'keterangan' => 'Antrian dipanggil pada ' . Carbon::now()->format('H:i'),
            ]);

            // Update status pendaftaran
            $nextAntrian->pendaftaran->update(['status_pendaftaran' => 'sedang_diperiksa']);

            DB::commit();

            return redirect()->back()->with('success', "Antrian nomor {$nextAntrian->nomor_antrian} telah dipanggil.");

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan saat memanggil antrian: ' . $e->getMessage()]);
        }
    }

    /**
     * Get current queue status for display
     */
    public function currentStatus()
    {
        $currentQueue = Antrian::where('status_antrian', 'dipanggil')
            ->whereDate('created_at', Carbon::today())
            ->with(['pendaftaran.pasien'])
            ->orderBy('updated_at', 'desc')
            ->first();

        $waitingCount = Antrian::where('status_antrian', 'menunggu')
            ->whereDate('created_at', Carbon::today())
            ->count();

        return response()->json([
            'current_queue' => $currentQueue ? [
                'nomor_antrian' => $currentQueue->nomor_antrian,
                'nama_pasien' => $currentQueue->pendaftaran->pasien->nama_lengkap,
                'jenis_pemeriksaan' => $currentQueue->pendaftaran->jenis_pemeriksaan ?? 'Pemeriksaan Umum',
            ] : null,
            'waiting_count' => $waitingCount,
        ]);
    }
}
