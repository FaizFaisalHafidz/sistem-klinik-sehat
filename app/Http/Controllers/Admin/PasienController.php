<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pasien;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PasienController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $jenis_kelamin = $request->get('jenis_kelamin');
        $golongan_darah = $request->get('golongan_darah');

        $pasien = Pasien::query()
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('nik', 'like', "%{$search}%")
                      ->orWhere('kode_pasien', 'like', "%{$search}%")
                      ->orWhere('telepon', 'like', "%{$search}%");
                });
            })
            ->when($jenis_kelamin, function ($query, $jenis_kelamin) {
                return $query->where('jenis_kelamin', $jenis_kelamin);
            })
            ->when($golongan_darah, function ($query, $golongan_darah) {
                return $query->where('golongan_darah', $golongan_darah);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Transform data untuk frontend
        $pasien->through(function ($p) {
            return [
                'id' => $p->id,
                'no_rm' => $p->kode_pasien, // Map kode_pasien ke no_rm untuk frontend
                'nik' => $p->nik,
                'nama_lengkap' => $p->nama_lengkap,
                'tempat_lahir' => $p->tempat_lahir ?? '',
                'tanggal_lahir' => $p->tanggal_lahir,
                'jenis_kelamin' => $p->jenis_kelamin,
                'alamat' => $p->alamat,
                'telepon' => $p->telepon,
                'golongan_darah' => $p->golongan_darah,
                'pekerjaan' => $p->pekerjaan,
                'status_pernikahan' => $p->status_perkawinan,
                'kontak_darurat' => $p->kontak_darurat,
                'alergi' => $p->alergi,
                'created_at' => $p->created_at->format('d M Y H:i'),
                'updated_at' => $p->updated_at->format('d M Y H:i'),
                'umur' => $p->tanggal_lahir ? $p->tanggal_lahir->age : null,
            ];
        });

        return Inertia::render('admin/pasien/index', [
            'pasien' => $pasien,
            'filters' => [
                'search' => $search,
                'jenis_kelamin' => $jenis_kelamin,
                'golongan_darah' => $golongan_darah,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Generate kode pasien otomatis
        $lastPasien = Pasien::latest('id')->first();
        $nextNumber = $lastPasien ? (int)substr($lastPasien->kode_pasien, -6) + 1 : 1;
        $no_rm = 'RM' . date('Y') . sprintf('%06d', $nextNumber);

        return Inertia::render('admin/pasien/create', [
            'no_rm' => $no_rm,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'no_rm' => 'required|string|max:20|unique:pasien,kode_pasien',
            'nik' => 'required|string|size:16|unique:pasien',
            'nama_lengkap' => 'required|string|max:100',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
            'alamat' => 'required|string',
            'telepon' => 'required|string|max:20',
            'golongan_darah' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'pekerjaan' => 'nullable|string|max:100',
            'status_pernikahan' => 'nullable|in:belum_menikah,menikah,cerai,janda_duda',
            'kontak_darurat' => 'nullable|string|max:100',
            'alergi' => 'nullable|string',
        ]);

        // Map field names to database columns
        $data = [
            'kode_pasien' => $validated['no_rm'],
            'nik' => $validated['nik'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'tempat_lahir' => $validated['tempat_lahir'],
            'tanggal_lahir' => $validated['tanggal_lahir'],
            'jenis_kelamin' => $validated['jenis_kelamin'],
            'alamat' => $validated['alamat'],
            'telepon' => $validated['telepon'],
            'golongan_darah' => $validated['golongan_darah'],
            'pekerjaan' => $validated['pekerjaan'],
            'status_perkawinan' => $validated['status_pernikahan'],
            'kontak_darurat' => $validated['kontak_darurat'],
            'alergi' => $validated['alergi'],
        ];

        Pasien::create($data);

        return redirect()->route('admin.pasien.index')
            ->with('success', 'Data pasien berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(Pasien $pasien)
    {
        // Load relasi yang diperlukan
        $pasien->load(['pendaftaran.rekamMedis']);

        $pasienData = [
            'id' => $pasien->id,
            'no_rm' => $pasien->kode_pasien,
            'nik' => $pasien->nik,
            'nama_lengkap' => $pasien->nama_lengkap,
            'tempat_lahir' => $pasien->tempat_lahir ?? '',
            'tanggal_lahir' => $pasien->tanggal_lahir,
            'jenis_kelamin' => $pasien->jenis_kelamin,
            'alamat' => $pasien->alamat,
            'telepon' => $pasien->telepon,
            'golongan_darah' => $pasien->golongan_darah,
            'pekerjaan' => $pasien->pekerjaan,
            'status_pernikahan' => $pasien->status_perkawinan,
            'kontak_darurat' => $pasien->kontak_darurat,
            'alergi' => $pasien->alergi,
            'created_at' => $pasien->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $pasien->updated_at->format('Y-m-d H:i:s'),
            'umur' => $pasien->tanggal_lahir ? $pasien->tanggal_lahir->age : null,
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

        return Inertia::render('admin/pasien/show', [
            'pasien' => $pasienData,
            'riwayatPendaftaran' => $riwayatPendaftaran,
            'statistics' => [
                'total_kunjungan' => $totalKunjungan,
                'kunjungan_selesai' => $kunjunganSelesai,
                'rekam_medis_count' => $rekamMedisCount,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pasien $pasien)
    {
        $pasienData = [
            'id' => $pasien->id,
            'no_rm' => $pasien->kode_pasien,
            'nik' => $pasien->nik,
            'nama_lengkap' => $pasien->nama_lengkap,
            'tempat_lahir' => $pasien->tempat_lahir ?? '',
            'tanggal_lahir' => $pasien->tanggal_lahir,
            'jenis_kelamin' => $pasien->jenis_kelamin,
            'alamat' => $pasien->alamat,
            'telepon' => $pasien->telepon,
            'golongan_darah' => $pasien->golongan_darah,
            'pekerjaan' => $pasien->pekerjaan,
            'status_pernikahan' => $pasien->status_perkawinan,
            'kontak_darurat' => $pasien->kontak_darurat,
            'alergi' => $pasien->alergi,
        ];

        return Inertia::render('admin/pasien/edit', [
            'pasien' => $pasienData,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pasien $pasien)
    {
        $validated = $request->validate([
            'no_rm' => ['required', 'string', 'max:20', Rule::unique('pasien', 'kode_pasien')->ignore($pasien->id)],
            'nik' => ['required', 'string', 'size:16', Rule::unique('pasien')->ignore($pasien->id)],
            'nama_lengkap' => 'required|string|max:100',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
            'alamat' => 'required|string',
            'telepon' => 'required|string|max:20',
            'golongan_darah' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'pekerjaan' => 'nullable|string|max:100',
            'status_pernikahan' => 'nullable|in:belum_menikah,menikah,cerai,janda_duda',
            'kontak_darurat' => 'nullable|string|max:100',
            'alergi' => 'nullable|string',
        ]);

        // Map field names to database columns
        $data = [
            'kode_pasien' => $validated['no_rm'],
            'nik' => $validated['nik'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'tempat_lahir' => $validated['tempat_lahir'],
            'tanggal_lahir' => $validated['tanggal_lahir'],
            'jenis_kelamin' => $validated['jenis_kelamin'],
            'alamat' => $validated['alamat'],
            'telepon' => $validated['telepon'],
            'golongan_darah' => $validated['golongan_darah'],
            'pekerjaan' => $validated['pekerjaan'],
            'status_perkawinan' => $validated['status_pernikahan'],
            'kontak_darurat' => $validated['kontak_darurat'],
            'alergi' => $validated['alergi'],
        ];

        $pasien->update($data);

        return redirect()->route('admin.pasien.index')
            ->with('success', 'Data pasien berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pasien $pasien)
    {
        // Cek apakah pasien memiliki rekam medis
        if ($pasien->rekamMedis()->count() > 0) {
            return back()->withErrors([
                'delete' => 'Pasien tidak dapat dihapus karena memiliki rekam medis.'
            ]);
        }

        $pasien->delete();

        return redirect()->route('admin.pasien.index')
            ->with('success', 'Data pasien berhasil dihapus');
    }
}
