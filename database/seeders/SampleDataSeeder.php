<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Pasien;
use App\Models\Pegawai;
use App\Models\RekamMedis;
use App\Models\Pendaftaran;
use Carbon\Carbon;

class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing patients or create new ones
        $pasien1 = Pasien::where('kode_pasien', 'P001')->first();
        if (!$pasien1) {
            $pasien1 = Pasien::create([
                'kode_pasien' => 'P001',
                'nik' => '1234567890123456',
                'nama_lengkap' => 'Ahmad Rizky',
                'tanggal_lahir' => '1990-05-15',
                'jenis_kelamin' => 'laki-laki',
                'alamat' => 'Jl. Merdeka No. 123, Jakarta',
                'telepon' => '081234567890',
                'email' => 'ahmad.rizky@email.com',
            ]);
        }

        $pasien2 = Pasien::where('kode_pasien', 'P002')->first();
        if (!$pasien2) {
            $pasien2 = Pasien::create([
                'kode_pasien' => 'P002',
                'nik' => '1234567890123457',
                'nama_lengkap' => 'Siti Nurhaliza',
                'tanggal_lahir' => '1985-12-20',
                'jenis_kelamin' => 'perempuan',
                'alamat' => 'Jl. Sudirman No. 456, Jakarta',
                'telepon' => '081234567891',
                'email' => 'siti.nurhaliza@email.com',
            ]);
        }

        $pasien3 = Pasien::where('kode_pasien', 'P003')->first();
        if (!$pasien3) {
            $pasien3 = Pasien::create([
                'kode_pasien' => 'P003',
                'nik' => '1234567890123458',
                'nama_lengkap' => 'Budi Santoso',
                'tanggal_lahir' => '1995-03-10',
                'jenis_kelamin' => 'laki-laki',
                'alamat' => 'Jl. Thamrin No. 789, Jakarta',
                'telepon' => '081234567892',
                'email' => 'budi.santoso@email.com',
            ]);
        }

        // Create sample doctors
        $dokter1 = Pegawai::where('kode_pegawai', 'DOK001')->first();
        if (!$dokter1) {
            $dokter1 = Pegawai::create([
                'kode_pegawai' => 'DOK001',
                'nama_lengkap' => 'Dr. John Doe, Sp.PD',
                'jabatan' => 'dokter',
                'spesialisasi' => 'Penyakit Dalam',
                'nomor_izin' => 'SIP.001/2024',
                'alamat' => 'Jl. Dokter No. 1',
                'telepon' => '081234567800',
                'email' => 'dr.johndoe@klinik.com',
                'tanggal_masuk' => '2024-01-01',
                'is_aktif' => true,
            ]);
        }

        $dokter2 = Pegawai::where('kode_pegawai', 'DOK002')->first();
        if (!$dokter2) {
            $dokter2 = Pegawai::create([
                'kode_pegawai' => 'DOK002',
                'nama_lengkap' => 'Dr. Jane Smith, Sp.A',
                'jabatan' => 'dokter',
                'spesialisasi' => 'Anak',
                'nomor_izin' => 'SIP.002/2024',
                'alamat' => 'Jl. Dokter No. 2',
                'telepon' => '081234567801',
                'email' => 'dr.janesmith@klinik.com',
                'tanggal_masuk' => '2024-01-01',
                'is_aktif' => true,
            ]);
        }

        // Create sample pendaftaran records only if not exist
        $pendaftaran1 = Pendaftaran::where('kode_pendaftaran', 'REG001')->first();
        if (!$pendaftaran1) {
            $pendaftaran1 = Pendaftaran::create([
                'kode_pendaftaran' => 'REG001',
                'pasien_id' => $pasien1->id,
                'tanggal_pendaftaran' => Carbon::now()->subDays(5),
                'keluhan_utama' => 'Demam dan batuk',
                'status_pendaftaran' => 'selesai',
            ]);
        }

        $pendaftaran2 = Pendaftaran::where('kode_pendaftaran', 'REG002')->first();
        if (!$pendaftaran2) {
            $pendaftaran2 = Pendaftaran::create([
                'kode_pendaftaran' => 'REG002',
                'pasien_id' => $pasien2->id,
                'tanggal_pendaftaran' => Carbon::now()->subDays(3),
                'keluhan_utama' => 'Kontrol diabetes',
                'status_pendaftaran' => 'selesai',
            ]);
        }

        $pendaftaran3 = Pendaftaran::where('kode_pendaftaran', 'REG003')->first();
        if (!$pendaftaran3) {
            $pendaftaran3 = Pendaftaran::create([
                'kode_pendaftaran' => 'REG003',
                'pasien_id' => $pasien3->id,
                'tanggal_pendaftaran' => Carbon::now()->subDays(1),
                'keluhan_utama' => 'Sakit kepala',
                'status_pendaftaran' => 'selesai',
            ]);
        }

        // Create sample rekam medis only if not exist
        if (!RekamMedis::where('kode_rekam_medis', 'RM001')->exists()) {
            RekamMedis::create([
                'kode_rekam_medis' => 'RM001',
                'pendaftaran_id' => $pendaftaran1->id,
                'pasien_id' => $pasien1->id,
                'dokter_id' => $dokter1->id,
                'tanggal_pemeriksaan' => Carbon::now()->subDays(5),
                'tanda_vital' => json_encode([
                    'tekanan_darah' => '120/80',
                    'suhu' => '38.5',
                    'berat_badan' => '70',
                    'tinggi_badan' => '170'
                ]),
                'anamnesis' => 'Pasien mengeluh demam sejak 3 hari yang lalu disertai dengan batuk berdahak. Tidak ada mual muntah. Nafsu makan menurun.',
                'pemeriksaan_fisik' => 'Keadaan umum: tampak sakit sedang. Kesadaran: composmentis. Suhu: 38.5°C. Tenggorokan: hiperemis. Paru: ronki basah halus di kedua lapang paru.',
                'diagnosa' => 'Infeksi Saluran Pernapasan Atas (ISPA)',
                'rencana_pengobatan' => 'Antibiotik amoxicillin 3x500mg, paracetamol 3x500mg, OBH sirup 3x1 sendok makan',
                'catatan_dokter' => 'Anjuran istirahat cukup, minum air putih yang banyak, kontrol 3 hari jika tidak ada perbaikan',
                'tanggal_kontrol' => Carbon::now()->addDays(3),
                'status_rekam_medis' => 'selesai',
            ]);
        }

        if (!RekamMedis::where('kode_rekam_medis', 'RM002')->exists()) {
            RekamMedis::create([
                'kode_rekam_medis' => 'RM002',
                'pendaftaran_id' => $pendaftaran2->id,
                'pasien_id' => $pasien2->id,
                'dokter_id' => $dokter1->id,
                'tanggal_pemeriksaan' => Carbon::now()->subDays(3),
                'tanda_vital' => json_encode([
                    'tekanan_darah' => '140/90',
                    'suhu' => '36.5',
                    'berat_badan' => '65',
                    'tinggi_badan' => '155'
                ]),
                'anamnesis' => 'Pasien kontrol rutin diabetes melitus. Keluhan sering buang air kecil dan mudah haus. Sudah menjalankan diet diabetes.',
                'pemeriksaan_fisik' => 'Keadaan umum: baik. Kesadaran: composmentis. Suhu: 36.5°C. Pemeriksaan mata: tidak ada kelainan. Ekstremitas: tidak ada luka.',
                'diagnosa' => 'Diabetes Melitus Tipe 2 terkontrol',
                'rencana_pengobatan' => 'Metformin 2x500mg, glibenclamide 1x5mg sebelum makan',
                'catatan_dokter' => 'Anjuran tetap menjalankan diet diabetes, olahraga teratur, kontrol gula darah rutin',
                'tanggal_kontrol' => Carbon::now()->addDays(30),
                'status_rekam_medis' => 'selesai',
            ]);
        }

        if (!RekamMedis::where('kode_rekam_medis', 'RM003')->exists()) {
            RekamMedis::create([
                'kode_rekam_medis' => 'RM003',
                'pendaftaran_id' => $pendaftaran3->id,
                'pasien_id' => $pasien3->id,
                'dokter_id' => $dokter2->id,
                'tanggal_pemeriksaan' => Carbon::now()->subDays(1),
                'tanda_vital' => json_encode([
                    'tekanan_darah' => '110/70',
                    'suhu' => '36.8',
                    'berat_badan' => '75',
                    'tinggi_badan' => '175'
                ]),
                'anamnesis' => 'Pasien mengeluh sakit kepala sejak 2 hari yang lalu. Sakit kepala berdenyut di daerah temporal. Tidak ada mual muntah.',
                'pemeriksaan_fisik' => 'Keadaan umum: baik. Kesadaran: composmentis. Suhu: 36.8°C. Pemeriksaan neurologis: tidak ada defisit neurologis.',
                'diagnosa' => 'Tension Headache (Sakit Kepala Tegang)',
                'rencana_pengobatan' => 'Paracetamol 3x500mg, istirahat cukup',
                'catatan_dokter' => 'Anjuran mengurangi stress, istirahat yang cukup, kompres hangat di area kepala',
                'status_rekam_medis' => 'selesai',
            ]);
        }

        echo "Sample data created successfully!\n";
        echo "- 3 Pasien\n";
        echo "- 2 Dokter\n";
        echo "- 3 Pendaftaran\n";
        echo "- 3 Rekam Medis\n";
    }
}
