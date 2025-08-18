<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RekamMedis;
use App\Models\Resep;
use App\Models\DetailResep;

class BiayaRekamMedisSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $this->command->info('🔄 Mulai update biaya untuk semua rekam medis...');

        // Get all rekam medis dengan relasi dokter dan resep
        $rekamMedisList = RekamMedis::with(['dokter', 'resep.detailResep'])->get();

        $updatedCount = 0;

        foreach ($rekamMedisList as $rekamMedis) {
            // Set biaya konsultasi dari dokter
            $biayaKonsultasi = $rekamMedis->dokter->biaya_konsultasi ?? 0;
            
            // Hitung total biaya obat dari semua resep
            $totalBiayaObat = 0;
            
            foreach ($rekamMedis->resep as $resep) {
                foreach ($resep->detailResep as $detailResep) {
                    $totalBiayaObat += ($detailResep->jumlah * $detailResep->harga_satuan);
                }
            }

            // Update rekam medis dengan biaya
            $rekamMedis->update([
                'biaya_konsultasi' => $biayaKonsultasi,
                'biaya_obat' => $totalBiayaObat,
                'total_biaya' => $biayaKonsultasi + $totalBiayaObat,
            ]);

            $updatedCount++;

            $this->command->info("✓ Updated {$rekamMedis->kode_rekam_medis} - Konsultasi: Rp " . number_format($biayaKonsultasi, 0, ',', '.') . 
                               " | Obat: Rp " . number_format($totalBiayaObat, 0, ',', '.') . 
                               " | Total: Rp " . number_format($biayaKonsultasi + $totalBiayaObat, 0, ',', '.'));
        }

        $this->command->info("🎉 Berhasil update biaya untuk {$updatedCount} rekam medis");

        // Update obat yang belum memiliki harga
        $this->updateHargaObatDefault();
    }

    /**
     * Update harga default untuk obat yang belum memiliki harga
     */
    private function updateHargaObatDefault(): void
    {
        $this->command->info('🔄 Update harga default untuk obat...');

        // Update obat yang harganya masih 0 atau null
        $obatTanpaHarga = \App\Models\Obat::where(function($query) {
            $query->where('harga', 0)
                  ->orWhereNull('harga');
        })->get();

        if ($obatTanpaHarga->count() > 0) {
            foreach ($obatTanpaHarga as $obat) {
                // Set harga default berdasarkan kategori
                $hargaDefault = $this->getHargaDefaultByKategori($obat->kategori);
                
                $obat->update(['harga' => $hargaDefault]);
                
                $this->command->info("✓ Updated harga {$obat->nama_obat}: Rp " . number_format($hargaDefault, 0, ',', '.'));
            }

            // Update ulang detail resep yang mungkin masih punya harga 0
            $detailResepHarga0 = DetailResep::where('harga_satuan', 0)->with('obat')->get();
            
            foreach ($detailResepHarga0 as $detail) {
                if ($detail->obat) {
                    $detail->update(['harga_satuan' => $detail->obat->harga]);
                    $this->command->info("✓ Updated detail resep untuk {$detail->obat->nama_obat}: Rp " . number_format($detail->obat->harga, 0, ',', '.'));
                }
            }

            $this->command->info("✓ Updated harga untuk {$obatTanpaHarga->count()} obat");
        }
    }

    /**
     * Get harga default berdasarkan kategori obat
     */
    private function getHargaDefaultByKategori(string $kategori = null): int
    {
        $hargaDefault = [
            'tablet' => 500,
            'kapsul' => 750,
            'sirup' => 1000,
            'salep' => 2000,
            'injeksi' => 5000,
            'tetes' => 3000,
            'vitamin' => 1500,
            'antibiotik' => 2500,
            'analgesik' => 800,
            'antipyretik' => 600,
        ];

        $kategoriLower = strtolower($kategori ?? '');
        
        // Cari berdasarkan kategori yang mengandung kata kunci
        foreach ($hargaDefault as $key => $harga) {
            if (str_contains($kategoriLower, $key)) {
                return $harga;
            }
        }

        // Default jika tidak cocok dengan kategori manapun
        return 500;
    }
}
