import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Mail, Phone, Shield, User, UserCheck, UserX } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen Pengguna', href: '/admin/users' },
    { title: 'Detail Pengguna', href: '' },
];

interface UserData {
    id: number;
    nama_pengguna: string;
    nama_lengkap: string;
    email: string;
    telepon?: string;
    is_aktif: boolean;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    roles: Array<{
        id: number;
        name: string;
        display_name?: string;
    }>;
}

interface ShowUserProps {
    user: UserData;
}

export default function ShowUser({ user }: ShowUserProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRoleBadgeColor = (roleName: string) => {
        const colors: Record<string, string> = {
            'admin': 'bg-purple-100 text-purple-800',
            'dokter': 'bg-blue-100 text-blue-800',
            'perawat': 'bg-green-100 text-green-800',
            'apoteker': 'bg-yellow-100 text-yellow-800',
            'resepsionis': 'bg-gray-100 text-gray-800',
        };
        return colors[roleName] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pengguna - ${user.nama_lengkap}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Detail Pengguna</h1>
                            <p className="text-gray-600">Informasi lengkap pengguna</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Link>
                        <Link
                            href="/admin/users"
                            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Link>
                    </div>
                </div>

                {/* User Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Informasi Pengguna</h2>
                        
                        <div className="space-y-6">
                            {/* Profile Summary */}
                            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">
                                        {user.nama_lengkap.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900">{user.nama_lengkap}</h3>
                                    <p className="text-gray-600">@{user.nama_pengguna}</p>
                                    <div className="flex items-center mt-2">
                                        {user.is_aktif ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <UserCheck className="w-3 h-3 mr-1" />
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                <UserX className="w-3 h-3 mr-1" />
                                                Tidak Aktif
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900">{user.email}</span>
                                        </div>
                                        {user.email_verified_at && (
                                            <span className="text-xs text-green-600 mt-1 block">
                                                Email terverifikasi pada {formatDate(user.email_verified_at)}
                                            </span>
                                        )}
                                    </div>

                                    {user.telepon && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                                            <div className="flex items-center space-x-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-900">{user.telepon}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Terdaftar</label>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900">{formatDate(user.created_at)}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Terakhir Diperbarui</label>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900">{formatDate(user.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Roles & Permissions */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-blue-600" />
                            Role & Akses
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                {user.roles.length > 0 ? (
                                    <div className="space-y-2">
                                        {user.roles.map((role) => (
                                            <span
                                                key={role.id}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(role.name)}`}
                                            >
                                                {role.display_name || role.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-500 text-sm">Tidak ada role</span>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Status Akun</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Status</span>
                                        <span className={`text-sm font-medium ${user.is_aktif ? 'text-green-600' : 'text-red-600'}`}>
                                            {user.is_aktif ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Email Verified</span>
                                        <span className={`text-sm font-medium ${user.email_verified_at ? 'text-green-600' : 'text-red-600'}`}>
                                            {user.email_verified_at ? 'Ya' : 'Tidak'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Log - Placeholder */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Aktivitas Terakhir</h2>
                    <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Log aktivitas akan ditampilkan di sini</p>
                        <p className="text-sm text-gray-400 mt-1">Fitur ini akan dikembangkan selanjutnya</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
