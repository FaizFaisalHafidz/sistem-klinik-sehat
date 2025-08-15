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

class PendaftaranBaruController extends Controller
{
    /**
     * Display the registration form
     */
    public function index()
    {
        // Statistik untuk dashboard
        $stats = [
            'total_pendaftaran_hari_ini' => Pendaftaran::whereDate('created_at', Carbon::today())->count(),
            'total_antrian_aktif' => Antrian::where('status_antrian', 'menunggu')->count(),
            'total_pasien_terdaftar' => Pasien::count(),
            'rata_rata_waktu_tunggu' => $this->getAverageWaitingTime(),
        ];

        // Data pendaftaran hari ini
        $pendaftaranHariIni = Pendaftaran::with(['pasien', 'antrian'])
            ->whereDate('created_at', Carbon::today())
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('pendaftaran/baru/index', [
            'stats' => $stats,
            'pendaftaranHariIni' => $pendaftaranHariIni,
        ]);
    }

    /**
     * Show the registration form for existing patient
     */
    public function create(Request $request)
    {
        $pasienId = $request->get('pasien_id');
        $pasien = null;

        if ($pasienId) {
            $pasien = Pasien::findOrFail($pasienId);
        }

        return Inertia::render('pendaftaran/baru/create', [
            'pasien' => $pasien,
        ]);
    }

    /**
     * Store a new registration
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pasien_id' => 'required|exists:pasien,id',
            'jenis_kunjungan' => 'required|in:baru,lama',
            'keluhan_utama' => 'required|string|max:500',
            'cara_bayar' => 'required|in:umum,bpjs,asuransi',
            'nomor_asuransi' => 'nullable|string|max:50',
            'keterangan' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            // Generate nomor pendaftaran
            $kodePendaftaran = $this->generateNomorPendaftaran();

            // Buat antrian terlebih dahulu
            $nomorAntrian = $this->generateNomorAntrian();
            $antrian = Antrian::create([
                'tanggal_antrian' => Carbon::now()->toDateString(),
                'nomor_antrian' => $nomorAntrian,
                'pasien_id' => $validated['pasien_id'],
                'waktu_pendaftaran' => Carbon::now(),
                'estimasi_waktu' => $this->calculateEstimatedTime(),
                'status_antrian' => 'menunggu',
                'dibuat_oleh' => Auth::id(),
            ]);

            // Buat pendaftaran
            $pendaftaran = Pendaftaran::create([
                'kode_pendaftaran' => $kodePendaftaran,
                'pasien_id' => $validated['pasien_id'],
                'antrian_id' => $antrian->id,
                'tanggal_pendaftaran' => Carbon::now()->toDateString(),
                'keluhan_utama' => $validated['keluhan_utama'],
                'status_pendaftaran' => 'terdaftar',
                'biaya_pendaftaran' => 0, // Set default atau sesuai aturan
                'dibuat_oleh' => Auth::id(),
            ]);

            DB::commit();

            return redirect()->route('pendaftaran.baru.show', $pendaftaran->id)
                ->with('success', 'Pendaftaran berhasil! Nomor antrian: ' . $nomorAntrian);

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->withErrors(['error' => 'Gagal melakukan pendaftaran: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Show registration details and queue number
     */
    public function show($id)
    {
        $pendaftaran = Pendaftaran::with(['pasien', 'antrian', 'dibuatOleh'])
            ->findOrFail($id);

        // Hitung posisi antrian
        $posisiAntrian = Antrian::where('status_antrian', 'menunggu')
            ->where('tanggal_antrian', '<=', $pendaftaran->antrian->tanggal_antrian)
            ->where('id', '<=', $pendaftaran->antrian->id)
            ->count();

        return Inertia::render('pendaftaran/baru/show', [
            'pendaftaran' => $pendaftaran,
            'posisiAntrian' => $posisiAntrian,
        ]);
    }

    /**
     * Search for existing patients
     */
    public function searchPasien(Request $request)
    {
        $query = $request->get('q');
        
        if (!$query || strlen($query) < 2) {
            return response()->json([]);
        }

        $pasien = Pasien::where(function($q) use ($query) {
            $q->where('nama_lengkap', 'LIKE', "%{$query}%")
              ->orWhere('nik', 'LIKE', "%{$query}%")
              ->orWhere('kode_pasien', 'LIKE', "%{$query}%")
              ->orWhere('telepon', 'LIKE', "%{$query}%");
        })
        ->select('id', 'kode_pasien', 'nik', 'nama_lengkap', 'telepon', 'alamat', 'tanggal_lahir', 'jenis_kelamin', 'golongan_darah', 'email', 'pekerjaan')
        ->limit(10)
        ->get();

        return response()->json($pasien);
    }

    /**
     * Cancel registration
     */
    public function cancel($id)
    {
        try {
            DB::beginTransaction();

            $pendaftaran = Pendaftaran::with('antrian')->findOrFail($id);
            
            // Update status pendaftaran
            $pendaftaran->update(['status_pendaftaran' => 'dibatalkan']);
            
            // Update status antrian
            if ($pendaftaran->antrian) {
                $pendaftaran->antrian->update(['status_antrian' => 'dibatalkan']);
            }

            DB::commit();

            return redirect()->route('pendaftaran.baru.index')
                ->with('success', 'Pendaftaran berhasil dibatalkan');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->withErrors(['error' => 'Gagal membatalkan pendaftaran: ' . $e->getMessage()]);
        }
    }

    /**
     * Print queue ticket
     */
    public function printTicket($id)
    {
        $pendaftaran = Pendaftaran::with(['pasien', 'antrian'])
            ->findOrFail($id);

        return Inertia::render('pendaftaran/baru/print-ticket', [
            'pendaftaran' => [
                'id' => $pendaftaran->id,
                'kode_pendaftaran' => $pendaftaran->kode_pendaftaran,
                'jenis_kunjungan' => 'Kunjungan Umum', // Default value karena field tidak ada di database
                'cara_bayar' => 'Tunai', // Default value karena field tidak ada di database
                'created_at' => $pendaftaran->created_at,
                'pasien' => [
                    'id' => $pendaftaran->pasien->id,
                    'kode_pasien' => $pendaftaran->pasien->kode_pasien,
                    'nama_lengkap' => $pendaftaran->pasien->nama_lengkap,
                    'telepon' => $pendaftaran->pasien->telepon,
                ],
                'antrian' => [
                    'id' => $pendaftaran->antrian->id,
                    'nomor_antrian' => $pendaftaran->antrian->nomor_antrian,
                    'tanggal_antrian' => $pendaftaran->antrian->tanggal_antrian,
                    'waktu_pendaftaran' => $pendaftaran->antrian->waktu_pendaftaran,
                    'estimasi_waktu' => $pendaftaran->antrian->estimasi_waktu,
                ],
            ],
        ]);
    }

    /**
     * Generate nomor pendaftaran
     */
    private function generateNomorPendaftaran()
    {
        $today = Carbon::now()->format('Ymd');
        $lastNumber = Pendaftaran::where('kode_pendaftaran', 'LIKE', "REG{$today}%")
            ->orderBy('kode_pendaftaran', 'desc')
            ->first();

        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber->kode_pendaftaran, -4);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return "REG{$today}" . str_pad($newSequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Generate nomor antrian
     */
    private function generateNomorAntrian()
    {
        $today = Carbon::now()->format('Y-m-d');
        $lastNumber = Antrian::whereDate('tanggal_antrian', $today)
            ->orderBy('nomor_antrian', 'desc')
            ->first();

        if ($lastNumber) {
            $newSequence = $lastNumber->nomor_antrian + 1;
        } else {
            $newSequence = 1;
        }

        return $newSequence;
    }

    /**
     * Calculate estimated waiting time
     */
    private function calculateEstimatedTime()
    {
        $antrianMenunggu = Antrian::where('status_antrian', 'menunggu')
            ->whereDate('tanggal_antrian', Carbon::today())
            ->count();

        // Estimasi 15 menit per pasien
        $estimatedMinutes = $antrianMenunggu * 15;
        
        return Carbon::now()->addMinutes($estimatedMinutes)->format('H:i:s');
    }

    /**
     * Get average waiting time
     */
    private function getAverageWaitingTime()
    {
        $antrianSelesai = Antrian::where('status_antrian', 'selesai')
            ->whereDate('tanggal_antrian', Carbon::today())
            ->whereNotNull('waktu_dipanggil')
            ->get();

        if ($antrianSelesai->count() == 0) {
            return 0;
        }

        $totalWaitingTime = 0;
        foreach ($antrianSelesai as $antrian) {
            $waitingTime = Carbon::parse($antrian->waktu_dipanggil)->diffInMinutes(Carbon::parse($antrian->waktu_pendaftaran));
            $totalWaitingTime += $waitingTime;
        }

        return round($totalWaitingTime / $antrianSelesai->count());
    }
}
