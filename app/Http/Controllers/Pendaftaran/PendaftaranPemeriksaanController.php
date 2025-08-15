<?php

namespace App\Http\Controllers\Pendaftaran;

use App\Http\Controllers\Controller;
use App\Models\Pasien;
use App\Models\Pendaftaran;
use App\Models\Antrian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class PendaftaranPemeriksaanController extends Controller
{
    /**
     * Display the examination registration page
     */
    public function index(Request $request)
    {
        // Statistik untuk dashboard
        $stats = [
            'total_pendaftaran_hari_ini' => Pendaftaran::whereDate('created_at', Carbon::today())->count(),
            'total_antrian_aktif' => Antrian::where('status_antrian', 'menunggu')->count(),
            'total_pasien_aktif' => Pasien::count(),
            'pendaftaran_bulan_ini' => Pendaftaran::whereMonth('created_at', Carbon::now()->month)->count(),
        ];

        // Filter pencarian
        $query = Pendaftaran::with(['pasien', 'antrian'])
            ->whereDate('created_at', Carbon::today())
            ->orderBy('created_at', 'desc');

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status_pendaftaran', $request->status);
        }

        // Filter berdasarkan nama pasien
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('pasien', function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('kode_pasien', 'like', "%{$search}%");
            });
        }

        $pendaftaranHariIni = $query->paginate(15)->withQueryString();

        return Inertia::render('pendaftaran/pemeriksaan/index', [
            'stats' => $stats,
            'pendaftaranHariIni' => $pendaftaranHariIni,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new examination registration
     */
    public function create(Request $request)
    {
        $pasienId = $request->get('pasien_id');
        $pasien = null;

        if ($pasienId) {
            $pasien = Pasien::findOrFail($pasienId);
            
            // Cek apakah pasien sudah terdaftar hari ini
            $pendaftaranHariIni = Pendaftaran::where('pasien_id', $pasien->id)
                ->whereDate('created_at', Carbon::today())
                ->where('status_pendaftaran', '!=', 'dibatalkan')
                ->first();

            if ($pendaftaranHariIni) {
                return redirect()->route('pendaftaran.pemeriksaan.show', $pendaftaranHariIni->id)
                    ->with('info', 'Pasien sudah terdaftar pemeriksaan hari ini.');
            }
        }

        return Inertia::render('pendaftaran/pemeriksaan/create', [
            'pasien' => $pasien,
        ]);
    }

    /**
     * Store a new examination registration
     */
    public function store(Request $request)
    {
        $request->validate([
            'pasien_id' => 'required|exists:pasien,id',
            'jenis_pemeriksaan' => 'required|string|max:100',
            'keluhan' => 'nullable|string|max:500',
            'catatan' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $pasien = Pasien::findOrFail($request->pasien_id);

            // Cek apakah pasien sudah terdaftar hari ini
            $pendaftaranHariIni = Pendaftaran::where('pasien_id', $pasien->id)
                ->whereDate('created_at', Carbon::today())
                ->where('status_pendaftaran', '!=', 'dibatalkan')
                ->first();

            if ($pendaftaranHariIni) {
                return redirect()->route('pendaftaran.pemeriksaan.show', $pendaftaranHariIni->id)
                    ->with('info', 'Pasien sudah terdaftar pemeriksaan hari ini.');
            }

            // Generate kode pendaftaran
            $tanggalHariIni = Carbon::today()->format('Ymd');
            $nomorUrut = Pendaftaran::whereDate('created_at', Carbon::today())->count() + 1;
            $kodePendaftaran = 'REG' . $tanggalHariIni . str_pad($nomorUrut, 3, '0', STR_PAD_LEFT);

            // Buat pendaftaran baru
            $pendaftaran = Pendaftaran::create([
                'kode_pendaftaran' => $kodePendaftaran,
                'pasien_id' => $request->pasien_id,
                'tanggal_pendaftaran' => Carbon::today(),
                'jenis_pemeriksaan' => $request->jenis_pemeriksaan,
                'keluhan' => $request->keluhan,
                'catatan' => $request->catatan,
                'status_pendaftaran' => 'terdaftar',
                'dibuat_oleh' => Auth::id(),
            ]);

            // Generate nomor antrian
            $antrianTerakhir = Antrian::whereDate('created_at', Carbon::today())->max('nomor_antrian') ?? 0;
            $nomorAntrian = $antrianTerakhir + 1;

            // Estimasi waktu tunggu berdasarkan antrian
            $antrianMenunggu = Antrian::where('status_antrian', 'menunggu')->count();
            $estimasiWaktu = Carbon::now()->addMinutes($antrianMenunggu * 15); // 15 menit per pasien

            // Buat antrian
            $antrian = Antrian::create([
                'pendaftaran_id' => $pendaftaran->id,
                'nomor_antrian' => $nomorAntrian,
                'status_antrian' => 'menunggu',
                'estimasi_waktu' => $estimasiWaktu,
                'keterangan' => 'Pendaftaran pemeriksaan - ' . $request->jenis_pemeriksaan,
            ]);

            DB::commit();

            return redirect()->route('pendaftaran.pemeriksaan.show', $pendaftaran->id)
                ->with('success', 'Pendaftaran pemeriksaan berhasil dibuat!');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified examination registration
     */
    public function show($id)
    {
        $pendaftaran = Pendaftaran::with(['pasien', 'antrian', 'dibuatOleh'])
            ->findOrFail($id);

        return Inertia::render('pendaftaran/pemeriksaan/show', [
            'pendaftaran' => [
                'id' => $pendaftaran->id,
                'kode_pendaftaran' => $pendaftaran->kode_pendaftaran,
                'tanggal_pendaftaran' => $pendaftaran->tanggal_pendaftaran->format('Y-m-d'),
                'tanggal_pendaftaran_formatted' => $pendaftaran->tanggal_pendaftaran->format('d/m/Y'),
                'jenis_pemeriksaan' => $pendaftaran->jenis_pemeriksaan,
                'keluhan' => $pendaftaran->keluhan,
                'catatan' => $pendaftaran->catatan,
                'status_pendaftaran' => $pendaftaran->status_pendaftaran,
                'created_at' => $pendaftaran->created_at->format('Y-m-d H:i:s'),
                'created_at_formatted' => $pendaftaran->created_at->format('d/m/Y H:i'),
                'pasien' => [
                    'id' => $pendaftaran->pasien->id,
                    'kode_pasien' => $pendaftaran->pasien->kode_pasien,
                    'nama_lengkap' => $pendaftaran->pasien->nama_lengkap,
                    'tanggal_lahir' => $pendaftaran->pasien->tanggal_lahir,
                    'tanggal_lahir_formatted' => Carbon::parse($pendaftaran->pasien->tanggal_lahir)->format('d/m/Y'),
                    'jenis_kelamin' => $pendaftaran->pasien->jenis_kelamin,
                    'telepon' => $pendaftaran->pasien->telepon,
                    'alamat' => $pendaftaran->pasien->alamat,
                    'umur' => Carbon::parse($pendaftaran->pasien->tanggal_lahir)->age,
                ],
                'antrian' => $pendaftaran->antrian ? [
                    'id' => $pendaftaran->antrian->id,
                    'nomor_antrian' => $pendaftaran->antrian->nomor_antrian,
                    'status_antrian' => $pendaftaran->antrian->status_antrian,
                    'estimasi_waktu' => $pendaftaran->antrian->estimasi_waktu,
                    'estimasi_waktu_formatted' => $pendaftaran->antrian->estimasi_waktu ? 
                        $pendaftaran->antrian->estimasi_waktu->format('H:i') : null,
                    'keterangan' => $pendaftaran->antrian->keterangan,
                ] : null,
                'user' => [
                    'nama_lengkap' => $pendaftaran->dibuatOleh->nama_lengkap,
                ],
            ]
        ]);
    }

    /**
     * Search for existing patients
     */
    public function searchPasien(Request $request)
    {
        $search = $request->get('search');
        
        if (empty($search)) {
            return response()->json([]);
        }

        $pasien = Pasien::where('nama_lengkap', 'like', "%{$search}%")
            ->orWhere('kode_pasien', 'like', "%{$search}%")
            ->orWhere('telepon', 'like', "%{$search}%")
            ->limit(10)
            ->get()
            ->map(function ($pasien) {
                return [
                    'id' => $pasien->id,
                    'kode_pasien' => $pasien->kode_pasien,
                    'nama_lengkap' => $pasien->nama_lengkap,
                    'tanggal_lahir' => $pasien->tanggal_lahir,
                    'tanggal_lahir_formatted' => Carbon::parse($pasien->tanggal_lahir)->format('d/m/Y'),
                    'jenis_kelamin' => $pasien->jenis_kelamin,
                    'telepon' => $pasien->telepon,
                    'alamat' => $pasien->alamat,
                    'umur' => Carbon::parse($pasien->tanggal_lahir)->age,
                ];
            });

        return response()->json($pasien);
    }

    /**
     * Cancel an examination registration
     */
    public function cancel($id)
    {
        try {
            DB::beginTransaction();

            $pendaftaran = Pendaftaran::findOrFail($id);
            
            // Hanya bisa dibatalkan jika status masih 'terdaftar'
            if ($pendaftaran->status_pendaftaran !== 'terdaftar') {
                return back()->withErrors(['error' => 'Pendaftaran ini tidak dapat dibatalkan.']);
            }

            // Update status pendaftaran
            $pendaftaran->update(['status_pendaftaran' => 'dibatalkan']);

            // Update status antrian jika ada
            if ($pendaftaran->antrian) {
                $pendaftaran->antrian->update(['status_antrian' => 'dibatalkan']);
            }

            DB::commit();

            return redirect()->route('pendaftaran.pemeriksaan.index')
                ->with('success', 'Pendaftaran pemeriksaan berhasil dibatalkan.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan saat membatalkan pendaftaran: ' . $e->getMessage()]);
        }
    }

    /**
     * Print ticket for examination registration
     */
    public function printTicket($id)
    {
        $pendaftaran = Pendaftaran::with(['pasien', 'antrian', 'dibuatOleh'])
            ->findOrFail($id);

        return Inertia::render('pendaftaran/pemeriksaan/print-ticket', [
            'pendaftaran' => [
                'id' => $pendaftaran->id,
                'kode_pendaftaran' => $pendaftaran->kode_pendaftaran,
                'tanggal_pendaftaran' => $pendaftaran->tanggal_pendaftaran->format('Y-m-d'),
                'tanggal_pendaftaran_formatted' => $pendaftaran->tanggal_pendaftaran->format('d/m/Y'),
                'jenis_pemeriksaan' => $pendaftaran->jenis_pemeriksaan,
                'keluhan' => $pendaftaran->keluhan ?? '-',
                'status_pendaftaran' => $pendaftaran->status_pendaftaran,
                'created_at' => $pendaftaran->created_at->format('Y-m-d H:i:s'),
                'jam_daftar' => $pendaftaran->created_at->format('H:i'),
                'pasien' => [
                    'id' => $pendaftaran->pasien->id,
                    'kode_pasien' => $pendaftaran->pasien->kode_pasien,
                    'nama_lengkap' => $pendaftaran->pasien->nama_lengkap,
                    'tanggal_lahir' => $pendaftaran->pasien->tanggal_lahir,
                    'tanggal_lahir_formatted' => Carbon::parse($pendaftaran->pasien->tanggal_lahir)->format('d/m/Y'),
                    'jenis_kelamin' => $pendaftaran->pasien->jenis_kelamin,
                    'telepon' => $pendaftaran->pasien->telepon,
                    'umur' => Carbon::parse($pendaftaran->pasien->tanggal_lahir)->age,
                ],
                'antrian' => $pendaftaran->antrian ? [
                    'id' => $pendaftaran->antrian->id,
                    'nomor_antrian' => $pendaftaran->antrian->nomor_antrian,
                    'status_antrian' => $pendaftaran->antrian->status_antrian,
                    'estimasi_waktu' => $pendaftaran->antrian->estimasi_waktu ? 
                        $pendaftaran->antrian->estimasi_waktu->format('H:i') : '-',
                    'keterangan' => $pendaftaran->antrian->keterangan ?? '-',
                ] : [
                    'nomor_antrian' => '-',
                    'status_antrian' => 'tidak_ada',
                    'estimasi_waktu' => '-',
                    'keterangan' => '-',
                ],
            ]
        ]);
    }
}
