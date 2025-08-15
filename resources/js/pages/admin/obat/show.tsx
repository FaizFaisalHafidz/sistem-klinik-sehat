import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Building,
    Calendar,
    CheckCircle,
    DollarSign,
    Edit,
    FileText,
    Hash,
    Package,
    Pill,
    Tag,
    XCircle,
} from 'lucide-react';

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    nama_generik: string | null;
    pabrik: string | null;
    kategori: string | null;
    satuan: string;
    harga: number;
    stok_tersedia: number;
    stok_minimum: number;
    tanggal_kadaluarsa: string | null;
    deskripsi: string | null;
    is_aktif: boolean;
    is_stok_menipis: boolean;
    is_akan_kadaluarsa: boolean;
    is_kadaluarsa: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    obat: Obat;
}

export default function Show({ obat }: Props) {
    return (
        <AppLayout>
            <Head title={`Detail Obat - ${obat.nama_obat}`} />
            
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/obat"
                            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
                            <Pill className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Detail Obat</h1>
                            <p className="text-sm text-gray-600">{obat.nama_obat}</p>
                        </div>
                    </div>
                    <Link
                        href={`/admin/obat/${obat.id}/edit`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 border border-transparent rounded-lg font-medium text-white hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Obat
                    </Link>
                </div>

                {/* Alerts */}
                {(obat.is_stok_menipis || obat.is_akan_kadaluarsa || obat.is_kadaluarsa) && (
                    <div className="mb-6 space-y-3">
                        {obat.stok_tersedia === 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <XCircle className="w-5 h-5 text-red-500 mr-3" />
                                    <div>
                                        <h3 className="text-sm font-medium text-red-800">Stok Habis</h3>
                                        <p className="text-sm text-red-700">Obat ini sudah habis dan perlu segera di-restock.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {obat.is_stok_menipis && obat.stok_tersedia > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 mr-3" />
                                    <div>
                                        <h3 className="text-sm font-medium text-amber-800">Stok Menipis</h3>
                                        <p className="text-sm text-amber-700">
                                            Stok tersedia ({obat.stok_tersedia}) sudah mencapai batas minimum ({obat.stok_minimum}).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {obat.is_kadaluarsa && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <XCircle className="w-5 h-5 text-red-500 mr-3" />
                                    <div>
                                        <h3 className="text-sm font-medium text-red-800">Obat Kadaluarsa</h3>
                                        <p className="text-sm text-red-700">Obat ini sudah melewati tanggal kadaluarsa dan tidak boleh digunakan.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {obat.is_akan_kadaluarsa && !obat.is_kadaluarsa && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 text-orange-500 mr-3" />
                                    <div>
                                        <h3 className="text-sm font-medium text-orange-800">Akan Kadaluarsa</h3>
                                        <p className="text-sm text-orange-700">Obat ini akan kadaluarsa dalam 30 hari ke depan.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Hash className="w-4 h-4 mr-3 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Kode Obat</p>
                                            <p className="text-sm font-medium text-gray-900">{obat.kode_obat}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Pill className="w-4 h-4 mr-3 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Nama Obat</p>
                                            <p className="text-sm font-medium text-gray-900">{obat.nama_obat}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-3 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Nama Generik</p>
                                            <p className="text-sm font-medium text-gray-900">{obat.nama_generik || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Building className="w-4 h-4 mr-3 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Pabrik</p>
                                            <p className="text-sm font-medium text-gray-900">{obat.pabrik || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Tag className="w-4 h-4 mr-3 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Kategori</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {obat.kategori || 'Umum'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Package className="w-4 h-4 mr-3 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Satuan</p>
                                            <p className="text-sm font-medium text-gray-900">{obat.satuan}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Stock */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Harga & Stok</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-3 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Harga per {obat.satuan}</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                Rp {new Intl.NumberFormat('id-ID').format(obat.harga)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Package className="w-4 h-4 mr-3 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Stok Tersedia</p>
                                            <div className="flex items-center space-x-2">
                                                <p className={`text-lg font-bold ${
                                                    obat.stok_tersedia === 0 ? 'text-red-600' : 
                                                    obat.is_stok_menipis ? 'text-amber-600' : 'text-gray-900'
                                                }`}>
                                                    {obat.stok_tersedia} {obat.satuan}
                                                </p>
                                                {obat.stok_tersedia === 0 && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Habis
                                                    </span>
                                                )}
                                                {obat.is_stok_menipis && obat.stok_tersedia > 0 && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                        Menipis
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Minimum: {obat.stok_minimum} {obat.satuan}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {obat.deskripsi && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Deskripsi</h2>
                                <p className="text-sm text-gray-700 leading-relaxed">{obat.deskripsi}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Status Obat</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        obat.is_aktif 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {obat.is_aktif ? (
                                            <>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Aktif
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Tidak Aktif
                                            </>
                                        )}
                                    </span>
                                </div>
                                
                                {obat.tanggal_kadaluarsa && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Tanggal Kadaluarsa</p>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className={`text-sm font-medium ${
                                                obat.is_kadaluarsa ? 'text-red-600' : 
                                                obat.is_akan_kadaluarsa ? 'text-orange-600' : 'text-gray-900'
                                            }`}>
                                                {new Date(obat.tanggal_kadaluarsa).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        {obat.is_kadaluarsa && (
                                            <p className="text-xs text-red-600 mt-1">Sudah kadaluarsa</p>
                                        )}
                                        {obat.is_akan_kadaluarsa && !obat.is_kadaluarsa && (
                                            <p className="text-xs text-orange-600 mt-1">Akan kadaluarsa dalam 30 hari</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Sistem</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-500">Dibuat</p>
                                    <p className="text-gray-900">
                                        {new Date(obat.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Diperbarui</p>
                                    <p className="text-gray-900">
                                        {new Date(obat.updated_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
