<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Pendaftaran extends Model
{
    protected $table = 'pendaftaran';
    
    protected $fillable = [
        'kode_pendaftaran',
        'pasien_id',
        'dokter_id',
        'antrian_id',
        'tanggal_pendaftaran',
        'keluhan_utama',
        'status_pendaftaran',
        'biaya_pendaftaran',
        'dibuat_oleh',
        'jenis_pemeriksaan',
        'keluhan',
        'catatan',
    ];

    protected $casts = [
        'tanggal_pendaftaran' => 'date',
        'biaya_pendaftaran' => 'decimal:2',
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

    public function antrian(): BelongsTo
    {
        return $this->belongsTo(Antrian::class);
    }

    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function rekamMedis(): HasOne
    {
        return $this->hasOne(RekamMedis::class);
    }

    // Scopes
    public function scopeHariIni($query)
    {
        return $query->where('tanggal_pendaftaran', today());
    }

    public function scopeTerdaftar($query)
    {
        return $query->where('status_pendaftaran', 'terdaftar');
    }

    public function scopeSedangDiperiksa($query)
    {
        return $query->where('status_pendaftaran', 'sedang_diperiksa');
    }

    public function scopeSelesai($query)
    {
        return $query->where('status_pendaftaran', 'selesai');
    }

    // Methods
    public function generateKodePendaftaran()
    {
        $tanggal = $this->tanggal_pendaftaran->format('Ymd');
        $lastPendaftaran = self::where('tanggal_pendaftaran', $this->tanggal_pendaftaran)
            ->orderBy('id', 'desc')
            ->first();
        
        $urutan = $lastPendaftaran ? (intval(substr($lastPendaftaran->kode_pendaftaran, -3)) + 1) : 1;
        
        return 'REG' . $tanggal . str_pad($urutan, 3, '0', STR_PAD_LEFT);
    }
}
