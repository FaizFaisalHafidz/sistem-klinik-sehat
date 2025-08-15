import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    BarChart3,
    Calendar,
    ChevronRight,
    Clock,
    Eye,
    FileText,
    Heart,
    Package,
    Pill,
    Plus,
    Settings,
    Stethoscope,
    TrendingUp,
    User,
    UserPlus,
    Users
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Stat {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    change?: string;
    changeType?: 'increase' | 'decrease';
}

interface User {
    nama_lengkap: string;
    email: string;
    role: string;
    foto_profil: string;
}

interface DashboardProps {
    user: User;
    role: string;
    stats: Stat[];
    title: string;
    subtitle: string;
}

const getIconComponent = (iconName: string) => {
    const icons = {
        Users, Calendar, Pill, Package, FileText, UserPlus,
        Clock, TrendingUp, AlertTriangle, Stethoscope, Activity,
        Heart, User, Plus, BarChart3, Settings, Eye
    };
    return icons[iconName as keyof typeof icons] || Activity;
};

export default function Dashboard({ user, role, stats, title, subtitle }: DashboardProps) {
    // Quick Actions berdasarkan role
    const getQuickActions = () => {
        switch (role) {
            case 'admin':
                return [
                    { title: 'Kelola Pengguna', desc: 'Tambah, edit, atau hapus pengguna sistem', icon: Users, color: 'bg-blue-500' },
                    { title: 'Laporan Sistem', desc: 'Lihat laporan aktivitas dan statistik', icon: BarChart3, color: 'bg-green-500' },
                    { title: 'Pengaturan', desc: 'Konfigurasi sistem dan pengaturan', icon: Settings, color: 'bg-purple-500' },
                    { title: 'Backup Data', desc: 'Kelola backup dan restore data', icon: Package, color: 'bg-orange-500' }
                ];
            case 'dokter':
                return [
                    { title: 'Lihat Antrian', desc: 'Cek daftar pasien yang menunggu', icon: Calendar, color: 'bg-blue-500' },
                    { title: 'Rekam Medis', desc: 'Kelola catatan medis pasien', icon: FileText, color: 'bg-green-500' },
                    { title: 'Resep Obat', desc: 'Buat dan kelola resep untuk pasien', icon: Pill, color: 'bg-purple-500' },
                    { title: 'Riwayat Pasien', desc: 'Lihat riwayat pemeriksaan', icon: Eye, color: 'bg-orange-500' }
                ];
            case 'pendaftaran':
                return [
                    { title: 'Daftar Pasien Baru', desc: 'Registrasi pasien baru ke sistem', icon: UserPlus, color: 'bg-blue-500' },
                    { title: 'Kelola Antrian', desc: 'Atur nomor antrian pasien', icon: Calendar, color: 'bg-green-500' },
                    { title: 'Cari Pasien', desc: 'Pencarian data pasien', icon: Users, color: 'bg-purple-500' },
                    { title: 'Jadwal Dokter', desc: 'Lihat jadwal praktik dokter', icon: Clock, color: 'bg-orange-500' }
                ];
            case 'apoteker':
                return [
                    { title: 'Proses Resep', desc: 'Siapkan obat sesuai resep dokter', icon: Pill, color: 'bg-blue-500' },
                    { title: 'Kelola Stok', desc: 'Update stok obat dan inventori', icon: Package, color: 'bg-green-500' },
                    { title: 'Laporan Obat', desc: 'Laporan stok dan penjualan obat', icon: BarChart3, color: 'bg-purple-500' },
                    { title: 'Supplier', desc: 'Kelola data supplier obat', icon: Users, color: 'bg-orange-500' }
                ];
            default:
                return [];
        }
    };

    const quickActions = getQuickActions();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex flex-col gap-6 p-6">
                {/* Header Section dengan Medical Theme */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 p-3 rounded-full">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{title}</h1>
                                <p className="text-blue-100 mt-1">{subtitle}</p>
                                <div className="flex items-center mt-2 space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-blue-100">
                                        Selamat datang kembali, {user.nama_lengkap}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">
                                    {user.nama_lengkap}
                                </p>
                                <p className="text-xs text-blue-200 capitalize bg-white/20 px-2 py-1 rounded-full">
                                    {role}
                                </p>
                            </div>
                            <img
                                src={user.foto_profil}
                                alt={user.nama_lengkap}
                                className="w-12 h-12 rounded-full border-3 border-white/50 shadow-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const IconComponent = getIconComponent(stat.icon);
                        return (
                            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            {stat.title}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                        {stat.change && (
                                            <div className={`flex items-center mt-2 text-sm ${
                                                stat.changeType === 'increase' 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {stat.changeType === 'increase' ? (
                                                    <ArrowUp className="w-4 h-4 mr-1" />
                                                ) : (
                                                    <ArrowDown className="w-4 h-4 mr-1" />
                                                )}
                                                {stat.change} dari bulan lalu
                                            </div>
                                        )}
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.color} shadow-md`}>
                                        <IconComponent className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions - 2/3 width */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                                <Plus className="w-5 h-5 mr-2 text-blue-600" />
                                Aksi Cepat
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quickActions.map((action, index) => {
                                const IconComponent = action.icon;
                                return (
                                    <button key={index} className="group p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-left">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <div className={`p-2 rounded-lg ${action.color} mr-3 group-hover:scale-105 transition-transform`}>
                                                        <IconComponent className="w-4 h-4 text-white" />
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                        {action.title}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {action.desc}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Activities - 1/3 width */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-green-600" />
                            Aktivitas Terbaru
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Sistem berjalan normal
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        5 menit yang lalu
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Database backup berhasil
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        1 jam yang lalu
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Update sistem tersedia
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        2 jam yang lalu
                                    </p>
                                </div>
                            </div>

                            {role === 'admin' && (
                                <div className="flex items-start space-x-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            5 pengguna baru didaftarkan
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            3 jam yang lalu
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button className="w-full mt-4 text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                            Lihat semua aktivitas →
                        </button>
                    </div>
                </div>

                {/* Role-specific Additional Content */}
                {role === 'admin' && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                            Status Sistem
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Server Status</span>
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Online - 99.9% uptime</p>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Database</span>
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                </div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Connected - Fast response</p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Storage</span>
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                </div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">75% used - 250GB free</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
