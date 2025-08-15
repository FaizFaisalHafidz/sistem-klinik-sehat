<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailResep extends Model
{
    protected $table = 'detail_resep';
    
    protected $fillable = [
        'resep_id',
        'obat_id',
        'jumlah',
        'aturan_pakai',
        'harga_satuan',
        'keterangan',
    ];

    protected $casts = [
        'harga_satuan' => 'decimal:2',
        'jumlah' => 'integer',
    ];

    // Relationships
    public function resep(): BelongsTo
    {
        return $this->belongsTo(Resep::class);
    }

    public function obat(): BelongsTo
    {
        return $this->belongsTo(Obat::class);
    }

    // Boot method for managing stock
    protected static function boot()
    {
        parent::boot();

        static::saved(function ($detail) {
            // Update stok obat
            $obat = $detail->obat;
            if ($obat) {
                $obat->decrement('stok_tersedia', $detail->jumlah);
                
                // Catat riwayat stok
                RiwayatStok::create([
                    'obat_id' => $obat->id,
                    'jenis_transaksi' => 'keluar',
                    'jumlah' => $detail->jumlah,
                    'stok_sebelum' => $obat->stok_tersedia + $detail->jumlah,
                    'stok_sesudah' => $obat->stok_tersedia,
                    'keterangan' => 'Resep: ' . $detail->resep->kode_resep,
                    'referensi_id' => $detail->id,
                    'referensi_tabel' => 'detail_resep',
                ]);
            }
        });

        static::deleted(function ($detail) {
            // Kembalikan stok obat
            $obat = $detail->obat;
            if ($obat) {
                $obat->increment('stok_tersedia', $detail->jumlah);
                
                // Catat riwayat stok
                RiwayatStok::create([
                    'obat_id' => $obat->id,
                    'jenis_transaksi' => 'masuk',
                    'jumlah' => $detail->jumlah,
                    'stok_sebelum' => $obat->stok_tersedia - $detail->jumlah,
                    'stok_sesudah' => $obat->stok_tersedia,
                    'keterangan' => 'Pembatalan resep: ' . $detail->resep->kode_resep,
                    'referensi_id' => $detail->id,
                    'referensi_tabel' => 'detail_resep',
                ]);
            }
        });
    }
}
