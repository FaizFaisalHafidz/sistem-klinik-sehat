import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit, Eye, EyeOff, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Role {
    value: string;
    label: string;
}

interface UserData {
    id: number;
    nama_pengguna: string;
    nama_lengkap: string;
    email: string;
    telepon?: string;
    is_aktif: boolean;
    roles: Array<{
        id: number;
        name: string;
    }>;
}

interface EditUserProps {
    user: UserData;
    roles: Role[];
}

export default function EditUser({ user, roles }: EditUserProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manajemen Pengguna', href: '/admin/users' },
        { title: 'Detail Pengguna', href: `/admin/users/${user.id}` },
        { title: 'Edit Pengguna', href: '' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nama_pengguna: user.nama_pengguna,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        password: '',
        password_confirmation: '',
        telepon: user.telepon || '',
        roles: user.roles.map(role => role.name),
        is_aktif: user.is_aktif,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(`/admin/users/${user.id}`, {
            onSuccess: () => {
                toast.success('Pengguna berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui pengguna. Periksa kembali data yang dimasukkan.');
            }
        });
    };

    const handleRoleChange = (roleValue: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleValue]);
        } else {
            setData('roles', data.roles.filter(role => role !== roleValue));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Pengguna - ${user.nama_lengkap}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Edit className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Pengguna</h1>
                            <p className="text-gray-600">Perbarui informasi pengguna: {user.nama_lengkap}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/users/${user.id}`}
                            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Link>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Pengguna */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Pengguna <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_pengguna}
                                    onChange={(e) => setData('nama_pengguna', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.nama_pengguna ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Masukkan nama pengguna"
                                />
                                {errors.nama_pengguna && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nama_pengguna}</p>
                                )}
                            </div>

                            {/* Nama Lengkap */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_lengkap}
                                    onChange={(e) => setData('nama_lengkap', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.nama_lengkap ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Masukkan nama lengkap"
                                />
                                {errors.nama_lengkap && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nama_lengkap}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Masukkan email"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Telepon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Telepon
                                </label>
                                <input
                                    type="text"
                                    value={data.telepon}
                                    onChange={(e) => setData('telepon', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.telepon ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Masukkan nomor telepon"
                                />
                                {errors.telepon && (
                                    <p className="mt-1 text-sm text-red-600">{errors.telepon}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Ubah Password</h3>
                            <p className="text-sm text-gray-600 mb-4">Kosongkan jika tidak ingin mengubah password</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Masukkan password baru"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                {/* Konfirmasi Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Konfirmasi Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Konfirmasi password baru"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="border-t border-gray-200 pt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {roles.map((role) => (
                                    <label key={role.value} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.roles.includes(role.value)}
                                            onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                            {role.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.roles && (
                                <p className="mt-1 text-sm text-red-600">{errors.roles}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="border-t border-gray-200 pt-6">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_aktif}
                                    onChange={(e) => setData('is_aktif', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Aktifkan pengguna
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link
                                href={`/admin/users/${user.id}`}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
