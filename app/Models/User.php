<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nama_pengguna',
        'nama_lengkap',
        'email',
        'password',
        'telepon',
        'foto_profil',
        'is_aktif',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_aktif' => 'boolean',
        ];
    }

    // Relationships
    public function pegawai(): HasOne
    {
        return $this->hasOne(Pegawai::class);
    }

    public function logAktivitas(): HasMany
    {
        return $this->hasMany(LogAktivitas::class);
    }

    public function riwayatStok(): HasMany
    {
        return $this->hasMany(RiwayatStok::class);
    }

    // Helper methods
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isDokter(): bool
    {
        return $this->hasRole('dokter');
    }

    public function isPendaftaran(): bool
    {
        return $this->hasRole('pendaftaran');
    }

    public function isApoteker(): bool
    {
        return $this->hasRole('apoteker');
    }

    public function isAktif(): bool
    {
        return $this->is_aktif;
    }

    public function getInitials(): string
    {
        $words = explode(' ', $this->nama_lengkap);
        $initials = '';
        
        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper(substr($word, 0, 1));
            }
        }
        
        return substr($initials, 0, 2);
    }

    public function getProfilePhotoUrl(): string
    {
        if ($this->foto_profil) {
            return asset('storage/' . $this->foto_profil);
        }
        
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->nama_lengkap) . '&color=3B82F6&background=EBF4FF';
    }

    public function getRoleName(): string
    {
        $roles = $this->getRoleNames();
        return $roles->isNotEmpty() ? $roles->first() : 'User';
    }

    public function getDashboardRoute(): string
    {
        if ($this->hasRole('admin')) {
            return route('admin.dashboard');
        } elseif ($this->hasRole('dokter')) {
            return route('dokter.dashboard');
        } elseif ($this->hasRole('pendaftaran')) {
            return route('pendaftaran.dashboard');
        } elseif ($this->hasRole('apoteker')) {
            return route('apoteker.dashboard');
        }
        
        return route('dashboard');
    }
}
