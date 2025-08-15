<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class LogAktivitas extends Model
{
    protected $table = 'log_aktivitas';
    
    protected $fillable = [
        'user_id',
        'aktivitas',
        'modul',
        'data_lama',
        'data_baru',
        'ip_address',
        'user_agent',
        'keterangan',
    ];

    protected $casts = [
        'data_lama' => 'array',
        'data_baru' => 'array',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByUser(Builder $query, $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByModul(Builder $query, $modul): Builder
    {
        return $query->where('modul', $modul);
    }

    public function scopeByAktivitas(Builder $query, $aktivitas): Builder
    {
        return $query->where('aktivitas', $aktivitas);
    }

    public function scopePeriode(Builder $query, $startDate, $endDate): Builder
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeTerbaru(Builder $query): Builder
    {
        return $query->orderBy('created_at', 'desc');
    }

    // Boot method
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($log) {
            if (!$log->user_id && Auth::check()) {
                $log->user_id = Auth::id();
            }
            
            if (!$log->ip_address && request()) {
                $log->ip_address = request()->ip();
            }
            
            if (!$log->user_agent && request()) {
                $log->user_agent = request()->userAgent();
            }
        });
    }

    // Static methods untuk logging
    public static function logLogin($keterangan = null)
    {
        return self::create([
            'aktivitas' => 'login',
            'modul' => 'auth',
            'keterangan' => $keterangan ?? 'User berhasil login',
        ]);
    }

    public static function logLogout($keterangan = null)
    {
        return self::create([
            'aktivitas' => 'logout',
            'modul' => 'auth',
            'keterangan' => $keterangan ?? 'User berhasil logout',
        ]);
    }

    public static function logCreate($modul, $dataModel, $keterangan = null)
    {
        return self::create([
            'aktivitas' => 'create',
            'modul' => $modul,
            'data_baru' => $dataModel->toArray(),
            'keterangan' => $keterangan ?? "Data {$modul} berhasil dibuat",
        ]);
    }

    public static function logUpdate($modul, $dataLama, $dataBaru, $keterangan = null)
    {
        return self::create([
            'aktivitas' => 'update',
            'modul' => $modul,
            'data_lama' => $dataLama,
            'data_baru' => $dataBaru,
            'keterangan' => $keterangan ?? "Data {$modul} berhasil diperbarui",
        ]);
    }

    public static function logDelete($modul, $dataModel, $keterangan = null)
    {
        return self::create([
            'aktivitas' => 'delete',
            'modul' => $modul,
            'data_lama' => $dataModel->toArray(),
            'keterangan' => $keterangan ?? "Data {$modul} berhasil dihapus",
        ]);
    }

    public static function logCustom($aktivitas, $modul, $keterangan = null, $dataLama = null, $dataBaru = null)
    {
        return self::create([
            'aktivitas' => $aktivitas,
            'modul' => $modul,
            'data_lama' => $dataLama,
            'data_baru' => $dataBaru,
            'keterangan' => $keterangan,
        ]);
    }

    // Helper methods
    public function getAktivitasColor()
    {
        return match($this->aktivitas) {
            'login', 'create' => 'green',
            'update' => 'blue',
            'delete' => 'red',
            'logout' => 'yellow',
            default => 'gray'
        };
    }

    public function getAktivitasIcon()
    {
        return match($this->aktivitas) {
            'login' => 'LogIn',
            'logout' => 'LogOut',
            'create' => 'Plus',
            'update' => 'Edit',
            'delete' => 'Trash',
            default => 'Activity'
        };
    }

    public function hasDataChange()
    {
        return !empty($this->data_lama) || !empty($this->data_baru);
    }

    public function getChangedFields()
    {
        if (!$this->data_lama || !$this->data_baru) {
            return [];
        }

        $changed = [];
        $dataLama = $this->data_lama;
        $dataBaru = $this->data_baru;

        foreach ($dataBaru as $field => $value) {
            if (isset($dataLama[$field]) && $dataLama[$field] != $value) {
                $changed[$field] = [
                    'from' => $dataLama[$field],
                    'to' => $value
                ];
            }
        }

        return $changed;
    }
}
