<?php

namespace App\Http\Controllers\Pendaftaran;

use App\Http\Controllers\Controller;
use App\Models\Pasien;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PasienController extends Controller
{
    public function index(Request $request)
    {
        $query = Pasien::query();

        // Filter berdasarkan nama
        if ($request->filled('nama')) {
            $query->where('nama_lengkap', 'like', '%' . $request->nama . '%');
        }

        // Filter berdasarkan NIK
        if ($request->filled('nik')) {
            $query->where('nik', 'like', '%' . $request->nik . '%');
        }

        // Filter berdasarkan jenis kelamin
        if ($request->filled('jenis_kelamin')) {
            $query->where('jenis_kelamin', $request->jenis_kelamin);
        }

        // Filter berdasarkan umur
        if ($request->filled('umur_dari') && $request->filled('umur_sampai')) {
            $tahunSekarang = date('Y');
            $tahunDari = $tahunSekarang - $request->umur_sampai;
            $tahunSampai = $tahunSekarang - $request->umur_dari;
            
            $query->whereYear('tanggal_lahir', '>=', $tahunDari)
                  ->whereYear('tanggal_lahir', '<=', $tahunSampai);
        }

        // Filter berdasarkan telepon
        if ($request->filled('telepon')) {
            $query->where('telepon', 'like', '%' . $request->telepon . '%');
        }

        // Filter berdasarkan alamat
        if ($request->filled('alamat')) {
            $query->where('alamat', 'like', '%' . $request->alamat . '%');
        }

        $pasien = $query->orderBy('created_at', 'desc')
                       ->paginate(20)
                       ->withQueryString();

        // Transform data untuk frontend
        $pasienData = $pasien->through(function ($p) {
            return [
                'id' => $p->id,
                'kode_pasien' => $p->kode_pasien,
                'nik' => $p->nik,
                'nama_lengkap' => $p->nama_lengkap,
                'tanggal_lahir' => $p->tanggal_lahir,
                'tanggal_lahir_formatted' => $p->tanggal_lahir->format('d/m/Y'),
                'umur' => $p->tanggal_lahir->age,
                'jenis_kelamin' => $p->jenis_kelamin,
                'alamat' => $p->alamat,
                'telepon' => $p->telepon,
                'email' => $p->email,
                'created_at' => $p->created_at->format('Y-m-d H:i:s'),
                'created_at_formatted' => $p->created_at->format('d/m/Y H:i'),
                'created_at_diff' => $p->created_at->diffForHumans(),
            ];
        });

        // Statistik pasien
        $totalPasien = Pasien::count();
        $pasienLakiLaki = Pasien::where('jenis_kelamin', 'laki-laki')->count();
        $pasienPerempuan = Pasien::where('jenis_kelamin', 'perempuan')->count();
        $pasienBulanIni = Pasien::whereMonth('created_at', date('m'))
                                ->whereYear('created_at', date('Y'))
                                ->count();

        return Inertia::render('pendaftaran/pasien/index', [
            'pasien' => $pasienData,
            'filters' => $request->only(['nama', 'nik', 'jenis_kelamin', 'umur_dari', 'umur_sampai', 'telepon', 'alamat']),
            'statistics' => [
                'total_pasien' => $totalPasien,
                'pasien_laki_laki' => $pasienLakiLaki,
                'pasien_perempuan' => $pasienPerempuan,
                'pasien_bulan_ini' => $pasienBulanIni,
            ],
        ]);
    }

    public function show(Pasien $pasien)
    {
        // Load relasi yang diperlukan
        $pasien->load(['pendaftaran.rekamMedis', 'antrian']);

        $pasienData = [
            'id' => $pasien->id,
            'kode_pasien' => $pasien->kode_pasien,
            'nik' => $pasien->nik,
            'nama_lengkap' => $pasien->nama_lengkap,
            'tanggal_lahir' => $pasien->tanggal_lahir,
            'tanggal_lahir_formatted' => $pasien->tanggal_lahir->format('d F Y'),
            'umur' => $pasien->tanggal_lahir->age,
            'jenis_kelamin' => $pasien->jenis_kelamin,
            'alamat' => $pasien->alamat,
            'telepon' => $pasien->telepon,
            'email' => $pasien->email,
            'created_at' => $pasien->created_at->format('Y-m-d H:i:s'),
            'created_at_formatted' => $pasien->created_at->format('d F Y, H:i'),
            'created_at_diff' => $pasien->created_at->diffForHumans(),
        ];

        // Riwayat pendaftaran
        $riwayatPendaftaran = $pasien->pendaftaran()
            ->with(['rekamMedis'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($pendaftaran) {
                return [
                    'id' => $pendaftaran->id,
                    'kode_pendaftaran' => $pendaftaran->kode_pendaftaran,
                    'tanggal_pendaftaran' => $pendaftaran->tanggal_pendaftaran->format('d/m/Y H:i'),
                    'jenis_pemeriksaan' => $pendaftaran->jenis_pemeriksaan,
                    'keluhan' => $pendaftaran->keluhan,
                    'status_pendaftaran' => $pendaftaran->status_pendaftaran,
                    'rekam_medis' => $pendaftaran->rekamMedis ? [
                        'id' => $pendaftaran->rekamMedis->id,
                        'kode_rekam_medis' => $pendaftaran->rekamMedis->kode_rekam_medis,
                        'diagnosa' => $pendaftaran->rekamMedis->diagnosa,
                        'status_rekam_medis' => $pendaftaran->rekamMedis->status_rekam_medis,
                    ] : null,
                ];
            });

        // Statistik pasien
        $totalKunjungan = $pasien->pendaftaran()->count();
        $kunjunganSelesai = $pasien->pendaftaran()->where('status_pendaftaran', 'selesai')->count();
        $rekamMedisCount = $pasien->rekamMedis()->count();

        return Inertia::render('pendaftaran/pasien/show', [
            'pasien' => $pasienData,
            'riwayatPendaftaran' => $riwayatPendaftaran,
            'statistics' => [
                'total_kunjungan' => $totalKunjungan,
                'kunjungan_selesai' => $kunjunganSelesai,
                'rekam_medis_count' => $rekamMedisCount,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('pendaftaran/pasien/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_pasien' => 'nullable|string|unique:pasien,kode_pasien',
            'nik' => 'required|string|size:16|unique:pasien,nik',
            'nama_lengkap' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date|before:today',
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
            'alamat' => 'required|string',
            'telepon' => 'required|string|max:20',
            'email' => 'nullable|email|unique:pasien,email',
        ]);

        // Fallback: jika kode_pasien kosong atau null, generate otomatis
        $kodePasien = $request->kode_pasien;
        if (empty($kodePasien)) {
            $kodePasien = $this->generateKodePasien();
            
            // Pastikan kode yang di-generate unik
            while (Pasien::where('kode_pasien', $kodePasien)->exists()) {
                sleep(1); // tunggu 1 detik untuk memastikan timestamp berbeda
                $kodePasien = $this->generateKodePasien();
            }
        }

        $pasien = Pasien::create([
            'kode_pasien' => $kodePasien,
            'nik' => $request->nik,
            'nama_lengkap' => $request->nama_lengkap,
            'tanggal_lahir' => $request->tanggal_lahir,
            'jenis_kelamin' => $request->jenis_kelamin,
            'alamat' => $request->alamat,
            'telepon' => $request->telepon,
            'email' => $request->email,
        ]);

        return redirect()->route('pendaftaran.pasien.show', $pasien)
            ->with('success', 'Data pasien berhasil ditambahkan.');
    }

    public function edit(Pasien $pasien)
    {
        $pasienData = [
            'id' => $pasien->id,
            'kode_pasien' => $pasien->kode_pasien,
            'nik' => $pasien->nik,
            'nama_lengkap' => $pasien->nama_lengkap,
            'tanggal_lahir' => $pasien->tanggal_lahir->format('Y-m-d'),
            'jenis_kelamin' => $pasien->jenis_kelamin,
            'alamat' => $pasien->alamat,
            'telepon' => $pasien->telepon,
            'email' => $pasien->email,
        ];

        return Inertia::render('pendaftaran/pasien/edit', [
            'pasien' => $pasienData,
        ]);
    }

    public function update(Request $request, Pasien $pasien)
    {
        $request->validate([
            'nik' => ['required', 'string', 'size:16', Rule::unique('pasien')->ignore($pasien->id)],
            'nama_lengkap' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date|before:today',
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
            'alamat' => 'required|string',
            'telepon' => 'required|string|max:20',
            'email' => ['nullable', 'email', Rule::unique('pasien')->ignore($pasien->id)],
        ]);

        $pasien->update([
            'nik' => $request->nik,
            'nama_lengkap' => $request->nama_lengkap,
            'tanggal_lahir' => $request->tanggal_lahir,
            'jenis_kelamin' => $request->jenis_kelamin,
            'alamat' => $request->alamat,
            'telepon' => $request->telepon,
            'email' => $request->email,
        ]);

        return redirect()->route('pendaftaran.pasien.show', $pasien)
            ->with('success', 'Data pasien berhasil diperbarui.');
    }

    public function destroy(Pasien $pasien)
    {
        // Check if pasien has any related records
        if ($pasien->pendaftaran()->exists() || $pasien->rekamMedis()->exists()) {
            return redirect()->route('pendaftaran.pasien.index')
                ->with('error', 'Tidak dapat menghapus pasien yang memiliki riwayat pendaftaran atau rekam medis.');
        }

        $pasien->delete();

        return redirect()->route('pendaftaran.pasien.index')
            ->with('success', 'Data pasien berhasil dihapus.');
    }

    public function export(Request $request)
    {
        $query = Pasien::query();

        // Apply same filters as index
        if ($request->filled('nama')) {
            $query->where('nama_lengkap', 'like', '%' . $request->nama . '%');
        }

        if ($request->filled('nik')) {
            $query->where('nik', 'like', '%' . $request->nik . '%');
        }

        if ($request->filled('jenis_kelamin')) {
            $query->where('jenis_kelamin', $request->jenis_kelamin);
        }

        if ($request->filled('umur_dari') && $request->filled('umur_sampai')) {
            $tahunSekarang = date('Y');
            $tahunDari = $tahunSekarang - $request->umur_sampai;
            $tahunSampai = $tahunSekarang - $request->umur_dari;
            
            $query->whereYear('tanggal_lahir', '>=', $tahunDari)
                  ->whereYear('tanggal_lahir', '<=', $tahunSampai);
        }

        if ($request->filled('telepon')) {
            $query->where('telepon', 'like', '%' . $request->telepon . '%');
        }

        if ($request->filled('alamat')) {
            $query->where('alamat', 'like', '%' . $request->alamat . '%');
        }

        $pasien = $query->orderBy('created_at', 'desc')->get();

        $filename = 'data_pasien_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($pasien) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for proper UTF-8 encoding in Excel
            fwrite($file, "\xEF\xBB\xBF");
            
            // Header CSV
            fputcsv($file, [
                'No',
                'Kode Pasien',
                'NIK',
                'Nama Lengkap',
                'Tanggal Lahir',
                'Umur',
                'Jenis Kelamin',
                'Alamat',
                'Telepon',
                'Email',
                'Tanggal Daftar',
            ]);

            // Data CSV
            foreach ($pasien as $index => $p) {
                fputcsv($file, [
                    $index + 1,
                    $p->kode_pasien,
                    $p->nik,
                    $p->nama_lengkap,
                    $p->tanggal_lahir->format('d/m/Y'),
                    $p->tanggal_lahir->age,
                    ucfirst($p->jenis_kelamin),
                    $p->alamat,
                    $p->telepon,
                    $p->email,
                    $p->created_at->format('d/m/Y H:i'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Generate kode pasien otomatis
     */
    private function generateKodePasien()
    {
        // Format: P + YYYYMMDDHHMMSS (14 digit timestamp)
        $now = now();
        return 'P' . $now->format('YmdHis');
    }
}
