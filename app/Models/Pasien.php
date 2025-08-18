<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pasien extends Model
{
    protected $table = 'pasien';
    
    protected $fillable = [
        'kode_pasien',
        'nik',
        'nama_lengkap',
        'tanggal_lahir',
        'tempat_lahir',
        'jenis_kelamin',
        'alamat',
        'telepon',
        'email',
        'kontak_darurat',
        'telepon_darurat',
        'golongan_darah',
        'alergi',
        'pekerjaan',
        'status_perkawinan',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    protected $appends = ['umur'];

    // Relationships
    public function pendaftaran(): HasMany
    {
        return $this->hasMany(Pendaftaran::class);
    }

    public function rekamMedis(): HasMany
    {
        return $this->hasMany(RekamMedis::class);
    }

    public function antrian(): HasMany
    {
        return $this->hasMany(Antrian::class);
    }

    public function resep(): HasMany
    {
        return $this->hasMany(Resep::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereNotNull('nama_lengkap');
    }

    // Accessors
    public function getUmurAttribute()
    {
        if (!$this->tanggal_lahir) return 0;
        return $this->tanggal_lahir->age;
    }
}
