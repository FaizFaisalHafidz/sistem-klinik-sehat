import { Head, Link } from '@inertiajs/react';
import { AlertCircle, LogOut, Mail, Phone } from 'lucide-react';

interface User {
    nama_lengkap: string;
    email: string;
    telepon: string;
}

interface Props {
    user: User;
    message: string;
}

export default function AccountInactive({ user, message }: Props) {
    const handleLogout = () => {
        window.location.href = '/logout';
    };

    return (
        <>
            <Head title="Akun Tidak Aktif" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Clinic System</h1>
                        <p className="text-gray-600 mt-2">Sistem Manajemen Klinik</p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Akun Tidak Aktif
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {message}
                            </p>
                        </div>

                        {/* User Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-medium text-gray-900 mb-3">Informasi Akun:</h3>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                    <span className="font-medium text-gray-700 w-16">Nama:</span>
                                    <span className="text-gray-600">{user.nama_lengkap}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">{user.email}</span>
                                </div>
                                {user.telepon && (
                                    <div className="flex items-center text-sm">
                                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-gray-600">{user.telepon}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="font-medium text-blue-900 mb-2">Cara Mengatasi:</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Hubungi administrator sistem</li>
                                <li>• Sampaikan informasi akun Anda</li>
                                <li>• Tunggu konfirmasi aktivasi</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Keluar dari Sistem
                            </button>
                            
                            <Link
                                href="/login"
                                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                            >
                                Kembali ke Login
                            </Link>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                            <p className="text-xs text-gray-500">
                                Jika Anda merasa ini adalah kesalahan, silahkan hubungi administrator
                            </p>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            © 2025 Clinic System. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
