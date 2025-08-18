<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Pasien;
use App\Models\Antrian;
use App\Models\RekamMedis;
use App\Models\Resep;
use App\Models\Obat;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $roles = $user->roles->pluck('name');
        $role = $roles->isNotEmpty() ? $roles->first() : 'user';

        // Simple profile photo URL
        $profilePhotoUrl = $user->foto_profil 
            ? asset('storage/' . $user->foto_profil)
            : 'https://ui-avatars.com/api/?name=' . urlencode($user->nama_lengkap) . '&color=3B82F6&background=EBF4FF';

        // Base dashboard data
        $dashboardData = [
            'user' => [
                'nama_lengkap' => $user->nama_lengkap,
                'email' => $user->email,
                'role' => $role,
                'foto_profil' => $profilePhotoUrl,
            ],
            'role' => $role,
        ];

        // Role-specific data
        switch ($role) {
            case 'admin':
                $dashboardData['stats'] = $this->getAdminStats();
                $dashboardData['title'] = 'Dashboard Administrator';
                $dashboardData['subtitle'] = 'Kelola seluruh sistem klinik';
                break;

            case 'dokter':
                $dashboardData['stats'] = $this->getDokterStats();
                $dashboardData['title'] = 'Dashboard Dokter';
                $dashboardData['subtitle'] = 'Kelola pasien dan rekam medis';
                break;

            case 'pendaftaran':
                $dashboardData['stats'] = $this->getPendaftaranStats();
                $dashboardData['title'] = 'Dashboard Pendaftaran';
                $dashboardData['subtitle'] = 'Kelola pendaftaran pasien dan antrian';
                break;

            case 'apoteker':
                $dashboardData['stats'] = $this->getApotekerStats();
                $dashboardData['title'] = 'Dashboard Apoteker';
                $dashboardData['subtitle'] = 'Kelola resep dan inventori obat';
                break;

            default:
                $dashboardData['stats'] = [];
                $dashboardData['title'] = 'Dashboard';
                $dashboardData['subtitle'] = 'Selamat datang di sistem klinik';
                break;
        }

        return Inertia::render('dashboard', $dashboardData);
    }

    private function getAdminStats()
    {
        return [
            [
                'title' => 'Total Pasien',
                'value' => Pasien::count(),
                'icon' => 'Users',
                'color' => 'bg-blue-500',
                'change' => '+12%',
                'changeType' => 'increase'
            ],
            [
                'title' => 'Antrian Hari Ini',
                'value' => Antrian::whereDate('created_at', today())->count(),
                'icon' => 'Calendar',
                'color' => 'bg-green-500',
                'change' => '+5%',
                'changeType' => 'increase',
                'description' => 'Pasien yang mendaftar hari ini'
            ],
            [
                'title' => 'Resep Aktif',
                'value' => Resep::where('status_resep', 'belum_diambil')->count(),
                'icon' => 'Pill',
                'color' => 'bg-purple-500',
                'change' => '+8%',
                'changeType' => 'increase',
                'description' => 'Resep yang belum diambil pasien'
            ],
            [
                'title' => 'Total Obat',
                'value' => Obat::count(),
                'icon' => 'Package',
                'color' => 'bg-orange-500',
                'change' => '+15%',
                'changeType' => 'increase',
                'description' => 'Jenis obat tersedia di apotek'
            ]
        ];
    }

    private function getDokterStats()
    {
        return [
            [
                'title' => 'Pasien Hari Ini',
                'value' => Antrian::whereDate('created_at', today())->count(),
                'icon' => 'Users',
                'color' => 'bg-blue-500',
            ],
            [
                'title' => 'Antrian Menunggu',
                'value' => Antrian::where('status_antrian', 'menunggu')->count(),
                'icon' => 'Calendar',
                'color' => 'bg-yellow-500',
            ],
            [
                'title' => 'Rekam Medis Hari Ini',
                'value' => RekamMedis::whereDate('created_at', today())->count(),
                'icon' => 'FileText',
                'color' => 'bg-green-500',
            ],
            [
                'title' => 'Konsultasi Selesai',
                'value' => Antrian::where('status_antrian', 'selesai')->whereDate('updated_at', today())->count(),
                'icon' => 'Stethoscope',
                'color' => 'bg-purple-500',
            ]
        ];
    }

    private function getPendaftaranStats()
    {
        return [
            [
                'title' => 'Pendaftaran Hari Ini',
                'value' => Antrian::whereDate('created_at', today())->count(),
                'icon' => 'UserPlus',
                'color' => 'bg-blue-500',
            ],
            [
                'title' => 'Antrian Aktif',
                'value' => Antrian::whereIn('status_antrian', ['menunggu', 'sedang_diperiksa'])->count(),
                'icon' => 'Calendar',
                'color' => 'bg-green-500',
            ],
            [
                'title' => 'Pasien Baru Hari Ini',
                'value' => Pasien::whereDate('created_at', today())->count(),
                'icon' => 'FileText',
                'color' => 'bg-purple-500',
            ],
            [
                'title' => 'Rata-rata Waktu Tunggu',
                'value' => '12 menit',
                'icon' => 'Clock',
                'color' => 'bg-orange-500',
            ]
        ];
    }

    private function getApotekerStats()
    {
        return [
            [
                'title' => 'Resep Hari Ini',
                'value' => Resep::whereDate('created_at', today())->count(),
                'icon' => 'Pill',
                'color' => 'bg-blue-500',
                'description' => 'Resep baru yang masuk hari ini'
            ],
            [
                'title' => 'Total Stok Obat',
                'value' => Obat::sum('stok_tersedia'),
                'icon' => 'Package',
                'color' => 'bg-green-500',
            ],
            [
                'title' => 'Resep Diproses',
                'value' => Resep::where('status_resep', 'belum_diambil')->count(),
                'icon' => 'TrendingUp',
                'color' => 'bg-purple-500',
                'description' => 'Resep yang perlu disiapkan'
            ],
            [
                'title' => 'Stok Menipis',
                'value' => Obat::where('stok_tersedia', '<=', 10)->count(),
                'icon' => 'AlertTriangle',
                'color' => 'bg-red-500',
                'description' => 'Obat dengan stok ≤ 10'
            ]
        ];
    }
}
