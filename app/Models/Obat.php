<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Obat extends Model
{
    protected $table = 'obat';
    
    protected $fillable = [
        'kode_obat',
        'nama_obat',
        'nama_generik',
        'pabrik',
        'kategori',
        'satuan',
        'harga',
        'stok_tersedia',
        'stok_minimum',
        'tanggal_kadaluarsa',
        'deskripsi',
        'is_aktif',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
        'tanggal_kadaluarsa' => 'date',
        'is_aktif' => 'boolean',
        'stok_tersedia' => 'integer',
        'stok_minimum' => 'integer',
    ];

    // Relationships
    public function detailResep(): HasMany
    {
        return $this->hasMany(DetailResep::class);
    }

    public function riwayatStok(): HasMany
    {
        return $this->hasMany(RiwayatStok::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_aktif', true);
    }

    public function scopeStokMenipis($query)
    {
        return $query->whereColumn('stok_tersedia', '<=', 'stok_minimum');
    }

    public function scopeAkanKadaluarsa($query, $hari = 30)
    {
        return $query->where('tanggal_kadaluarsa', '<=', now()->addDays($hari));
    }

    // Accessors
    public function getIsStokMenipisAttribute()
    {
        return $this->stok_tersedia <= $this->stok_minimum;
    }

    public function getIsAkanKadaluarsaAttribute()
    {
        if (!$this->tanggal_kadaluarsa) return false;
        return $this->tanggal_kadaluarsa->diffInDays(now()) <= 30;
    }
}
