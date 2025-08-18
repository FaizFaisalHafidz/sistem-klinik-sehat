<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Pegawai;

class BiayaKonsultasiSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Set default biaya konsultasi untuk dokter umum
        Pegawai::where('jabatan', 'dokter')
            ->where('spesialisasi', null)
            ->orWhere('spesialisasi', '')
            ->orWhere('spesialisasi', 'like', '%umum%')
            ->update(['biaya_konsultasi' => 150000]); // Rp 150,000

        // Set biaya konsultasi untuk dokter spesialis
        Pegawai::where('jabatan', 'dokter')
            ->whereNotNull('spesialisasi')
            ->where('spesialisasi', '!=', '')
            ->where('spesialisasi', 'not like', '%umum%')
            ->update(['biaya_konsultasi' => 250000]); // Rp 250,000

        $this->command->info('✓ Biaya konsultasi telah diset untuk semua dokter');
    }
}
