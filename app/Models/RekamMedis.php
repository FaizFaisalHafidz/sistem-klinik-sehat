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
        'biaya_konsultasi',
        'biaya_obat',
        'total_biaya',
    ];

    protected $casts = [
        'tanggal_pemeriksaan' => 'datetime',
        'tanggal_kontrol' => 'date',
        'tanda_vital' => 'array',
        'biaya_konsultasi' => 'decimal:2',
        'biaya_obat' => 'decimal:2',
        'total_biaya' => 'decimal:2',
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

    // Methods for calculating costs
    public function hitungBiayaObat()
    {
        return $this->resep->sum(function ($resep) {
            return $resep->detailResep->sum(function ($detail) {
                return $detail->jumlah * $detail->harga_satuan;
            });
        });
    }

    public function hitungTotalBiaya()
    {
        return $this->biaya_konsultasi + $this->biaya_obat;
    }

    public function updateBiayaObat()
    {
        $this->biaya_obat = $this->hitungBiayaObat();
        $this->total_biaya = $this->hitungTotalBiaya();
        $this->save();
    }

    public function setBiayaKonsultasi()
    {
        if ($this->dokter && $this->dokter->biaya_konsultasi > 0) {
            $this->biaya_konsultasi = $this->dokter->biaya_konsultasi;
        }
        return $this;
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

    // Currency format accessors
    public function getBiayaKonsultasiFormattedAttribute()
    {
        return 'Rp ' . number_format($this->biaya_konsultasi, 0, ',', '.');
    }

    public function getBiayaObatFormattedAttribute()
    {
        return 'Rp ' . number_format($this->biaya_obat, 0, ',', '.');
    }

    public function getTotalBiayaFormattedAttribute()
    {
        return 'Rp ' . number_format($this->total_biaya, 0, ',', '.');
    }
}
