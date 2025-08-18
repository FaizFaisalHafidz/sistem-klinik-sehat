<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Obat;
use App\Models\DetailResep;
use App\Models\Resep;
use App\Models\RekamMedis;

class TestBiayaObatSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $this->command->info('🔄 Membuat data test untuk biaya obat...');

        // Update harga obat yang ada atau buat data test
        $obatTest = [
            ['nama_obat' => 'Paracetamol 500mg', 'kategori' => 'tablet', 'harga' => 500, 'satuan' => 'tablet'],
            ['nama_obat' => 'Amoxicillin 500mg', 'kategori' => 'kapsul', 'harga' => 750, 'satuan' => 'kapsul'],
            ['nama_obat' => 'CTM 4mg', 'kategori' => 'tablet', 'harga' => 300, 'satuan' => 'tablet'],
            ['nama_obat' => 'OBH Combi', 'kategori' => 'sirup', 'harga' => 15000, 'satuan' => 'botol'],
            ['nama_obat' => 'Vitamin C 1000mg', 'kategori' => 'tablet', 'harga' => 1500, 'satuan' => 'tablet'],
        ];

        foreach ($obatTest as $obatData) {
            // Cari atau buat obat
            $obat = Obat::firstOrCreate(
                ['nama_obat' => $obatData['nama_obat']],
                [
                    'kode_obat' => 'OBT' . str_pad(Obat::count() + 1, 3, '0', STR_PAD_LEFT),
                    'nama_generik' => $obatData['nama_obat'],
                    'kategori' => $obatData['kategori'],
                    'satuan' => $obatData['satuan'],
                    'harga' => $obatData['harga'],
                    'stok_tersedia' => 100,
                    'stok_minimum' => 10,
                    'is_aktif' => true,
                ]
            );

            if ($obat->wasRecentlyCreated) {
                $this->command->info("✓ Membuat obat baru: {$obat->nama_obat} - Rp " . number_format($obat->harga, 0, ',', '.'));
            } else {
                // Update harga jika obat sudah ada
                $obat->update(['harga' => $obatData['harga']]);
                $this->command->info("✓ Update harga {$obat->nama_obat}: Rp " . number_format($obat->harga, 0, ',', '.'));
            }
        }

        // Update detail resep yang ada dengan harga baru
        $detailResepList = DetailResep::with('obat')->get();
        
        foreach ($detailResepList as $detail) {
            if ($detail->obat) {
                $detail->update(['harga_satuan' => $detail->obat->harga]);
                $this->command->info("✓ Update harga detail resep {$detail->obat->nama_obat}: Rp " . number_format($detail->obat->harga, 0, ',', '.'));
            }
        }

        // Recalculate biaya obat di rekam medis
        $this->recalculateBiayaRekamMedis();

        $this->command->info('🎉 Selesai membuat data test biaya obat');
    }

    /**
     * Recalculate biaya obat di rekam medis
     */
    private function recalculateBiayaRekamMedis(): void
    {
        $this->command->info('🔄 Recalculate biaya di rekam medis...');

        $rekamMedisList = RekamMedis::with(['resep.detailResep'])->get();

        foreach ($rekamMedisList as $rekamMedis) {
            $totalBiayaObat = 0;
            
            foreach ($rekamMedis->resep as $resep) {
                foreach ($resep->detailResep as $detail) {
                    $totalBiayaObat += ($detail->jumlah * $detail->harga_satuan);
                }
            }

            $rekamMedis->update([
                'biaya_obat' => $totalBiayaObat,
                'total_biaya' => $rekamMedis->biaya_konsultasi + $totalBiayaObat,
            ]);

            $this->command->info("✓ Recalculate biaya {$rekamMedis->kode_rekam_medis}: Obat Rp " . number_format($totalBiayaObat, 0, ',', '.') . 
                               " | Total Rp " . number_format($rekamMedis->biaya_konsultasi + $totalBiayaObat, 0, ',', '.'));
        }
    }
}
