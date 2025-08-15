<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Antrian extends Model
{
    protected $table = 'antrian';
    
    protected $fillable = [
        'tanggal_antrian',
        'nomor_antrian',
        'pasien_id',
        'dokter_id',
        'waktu_pendaftaran',
        'estimasi_waktu',
        'status_antrian',
        'waktu_dipanggil',
        'waktu_selesai',
        'dibuat_oleh',
    ];

    protected $casts = [
        'tanggal_antrian' => 'date',
        'waktu_pendaftaran' => 'datetime',
        'waktu_dipanggil' => 'datetime',
        'waktu_selesai' => 'datetime',
        'estimasi_waktu' => 'datetime',
    ];

    // Relationships
    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class);
    }

    public function dokter(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'dokter_id');
    }

    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function pendaftaran(): HasOne
    {
        return $this->hasOne(Pendaftaran::class);
    }

    // Scopes
    public function scopeHariIni($query)
    {
        return $query->where('tanggal_antrian', today());
    }

    public function scopeMenunggu($query)
    {
        return $query->where('status_antrian', 'menunggu');
    }

    public function scopeSedangDiperiksa($query)
    {
        return $query->where('status_antrian', 'sedang_diperiksa');
    }

    public function scopeSelesai($query)
    {
        return $query->where('status_antrian', 'selesai');
    }

    // Methods
    public function generateNomorAntrian()
    {
        $lastAntrian = self::where('tanggal_antrian', $this->tanggal_antrian)
            ->orderBy('nomor_antrian', 'desc')
            ->first();
        
        return $lastAntrian ? $lastAntrian->nomor_antrian + 1 : 1;
    }
}
