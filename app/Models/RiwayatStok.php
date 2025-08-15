<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class RiwayatStok extends Model
{
    protected $table = 'riwayat_stok';
    
    protected $fillable = [
        'obat_id',
        'jenis_transaksi',
        'jumlah',
        'stok_sebelum',
        'stok_sesudah',
        'keterangan',
        'referensi_id',
        'referensi_tabel',
        'dibuat_oleh',
    ];

    protected $casts = [
        'jumlah' => 'integer',
        'stok_sebelum' => 'integer',
        'stok_sesudah' => 'integer',
        'harga_per_unit' => 'decimal:2',
        'total_nilai' => 'decimal:2',
        'tanggal_exp' => 'date',
    ];

    // Relationships
    public function obat(): BelongsTo
    {
        return $this->belongsTo(Obat::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeMasuk(Builder $query): Builder
    {
        return $query->where('jenis_transaksi', 'masuk');
    }

    public function scopeKeluar(Builder $query): Builder
    {
        return $query->where('jenis_transaksi', 'keluar');
    }

    public function scopeAdjustment(Builder $query): Builder
    {
        return $query->where('jenis_transaksi', 'adjustment');
    }

    public function scopeByObat(Builder $query, $obatId): Builder
    {
        return $query->where('obat_id', $obatId);
    }

    public function scopePeriode(Builder $query, $startDate, $endDate): Builder
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeBySupplier(Builder $query, $supplier): Builder
    {
        return $query->where('supplier', $supplier);
    }

    // Boot method
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($riwayat) {
            if (!$riwayat->dibuat_oleh && Auth::check()) {
                $riwayat->dibuat_oleh = Auth::id();
            }
        });
    }

    // Helper methods
    public function getPersentasePerubahan()
    {
        if ($this->stok_sebelum > 0) {
            return (($this->stok_sesudah - $this->stok_sebelum) / $this->stok_sebelum) * 100;
        }
        return 0;
    }

    public function getSelisihStok()
    {
        return $this->stok_sesudah - $this->stok_sebelum;
    }

    public function isMasuk()
    {
        return $this->jenis_transaksi === 'masuk';
    }

    public function isKeluar()
    {
        return $this->jenis_transaksi === 'keluar';
    }

    public function isAdjustment()
    {
        return $this->jenis_transaksi === 'adjustment';
    }

    public function getJenisTransaksiColor()
    {
        return match($this->jenis_transaksi) {
            'masuk' => 'green',
            'keluar' => 'red',
            'adjustment' => 'blue',
            default => 'gray'
        };
    }
}
