<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resep extends Model
{
    protected $table = 'resep';
    
    protected $fillable = [
        'kode_resep',
        'pasien_id',
        'dokter_id',
        'rekam_medis_id',
        'tanggal_resep',
        'catatan_resep',
        'status_resep',
    ];

    protected $casts = [
        'tanggal_resep' => 'datetime',
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

    public function rekamMedis(): BelongsTo
    {
        return $this->belongsTo(RekamMedis::class);
    }

    public function detailResep(): HasMany
    {
        return $this->hasMany(DetailResep::class);
    }

    // Scopes
    public function scopeHariIni($query)
    {
        return $query->whereDate('tanggal_resep', today());
    }

    public function scopeMenunggu($query)
    {
        return $query->where('status_resep', 'menunggu');
    }

    public function scopeSudahDiambil($query)
    {
        return $query->where('status_resep', 'sudah_diambil');
    }

    public function scopeDibatalkan($query)
    {
        return $query->where('status_resep', 'dibatalkan');
    }

    // Methods
    public function generateKodeResep()
    {
        $tanggal = $this->tanggal_resep->format('Ymd');
        $lastResep = self::whereDate('tanggal_resep', $this->tanggal_resep)
            ->orderBy('id', 'desc')
            ->first();
        
        $urutan = $lastResep ? (intval(substr($lastResep->kode_resep, -3)) + 1) : 1;
        
        return 'RSP' . $tanggal . str_pad($urutan, 3, '0', STR_PAD_LEFT);
    }

    public function hitungTotalHarga()
    {
        return $this->detailResep()->sum(\Illuminate\Support\Facades\DB::raw('jumlah * harga_satuan'));
    }
}
