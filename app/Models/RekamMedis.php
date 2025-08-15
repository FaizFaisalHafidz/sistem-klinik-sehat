<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RekamMedis extends Model
{
    protected $table = 'rekam_medis';
    
    protected $fillable = [
        'kode_rekam_medis',
        'pendaftaran_id',
        'pasien_id',
        'dokter_id',
        'tanggal_pemeriksaan',
        'tanda_vital',
        'anamnesis',
        'pemeriksaan_fisik',
        'diagnosa',
        'rencana_pengobatan',
        'catatan_dokter',
        'tanggal_kontrol',
        'status_rekam_medis',
    ];

    protected $casts = [
        'tanggal_pemeriksaan' => 'datetime',
        'tanggal_kontrol' => 'date',
        'tanda_vital' => 'array',
    ];

    // Relationships
    public function pendaftaran(): BelongsTo
    {
        return $this->belongsTo(Pendaftaran::class);
    }

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class);
    }

    public function dokter(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'dokter_id');
    }

    public function resep(): HasMany
    {
        return $this->hasMany(Resep::class, 'rekam_medis_id');
    }

    // Scopes
    public function scopeHariIni($query)
    {
        return $query->whereDate('tanggal_pemeriksaan', today());
    }

    public function scopeDraft($query)
    {
        return $query->where('status_rekam_medis', 'draft');
    }

    public function scopeSelesai($query)
    {
        return $query->where('status_rekam_medis', 'selesai');
    }

    // Methods
    public function generateKodeRekamMedis()
    {
        $tanggal = $this->tanggal_pemeriksaan->format('Ymd');
        $lastRekamMedis = self::whereDate('tanggal_pemeriksaan', $this->tanggal_pemeriksaan)
            ->orderBy('id', 'desc')
            ->first();
        
        $urutan = $lastRekamMedis ? (intval(substr($lastRekamMedis->kode_rekam_medis, -3)) + 1) : 1;
        
        return 'RM' . $tanggal . str_pad($urutan, 3, '0', STR_PAD_LEFT);
    }

    // Accessors
    public function getTekananDarahAttribute()
    {
        return $this->tanda_vital['tekanan_darah'] ?? null;
    }

    public function getSuhuAttribute()
    {
        return $this->tanda_vital['suhu'] ?? null;
    }

    public function getBeratBadanAttribute()
    {
        return $this->tanda_vital['berat_badan'] ?? null;
    }

    public function getTinggiBadanAttribute()
    {
        return $this->tanda_vital['tinggi_badan'] ?? null;
    }
}
