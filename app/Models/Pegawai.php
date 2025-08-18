<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pegawai extends Model
{
    protected $table = 'pegawai';
    
    protected $fillable = [
        'kode_pegawai',
        'user_id',
        'nama_lengkap',
        'jabatan',
        'departemen',
        'nomor_izin',
        'spesialisasi',
        'telepon',
        'email',
        'alamat',
        'tanggal_masuk',
        'is_aktif',
        'biaya_konsultasi',
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
        'is_aktif' => 'boolean',
        'biaya_konsultasi' => 'decimal:2',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function antrian(): HasMany
    {
        return $this->hasMany(Antrian::class, 'dokter_id');
    }

    public function pendaftaran(): HasMany
    {
        return $this->hasMany(Pendaftaran::class, 'dokter_id');
    }

    public function rekamMedis(): HasMany
    {
        return $this->hasMany(RekamMedis::class, 'dokter_id');
    }

    public function resep(): HasMany
    {
        return $this->hasMany(Resep::class, 'dokter_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_aktif', true);
    }

    public function scopeDokter($query)
    {
        return $query->where('jabatan', 'dokter');
    }

    public function scopePendaftaran($query)
    {
        return $query->where('jabatan', 'pendaftaran');
    }

    // Accessors
    public function getBiayaKonsultasiFormattedAttribute()
    {
        return 'Rp ' . number_format($this->biaya_konsultasi, 0, ',', '.');
    }
}
