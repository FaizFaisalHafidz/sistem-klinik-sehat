import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Edit,
    Package,
    Pill
} from 'lucide-react';

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    nama_generik: string | null;
    kategori: string;
    satuan: string;
    stok_tersedia: number;
    stok_minimum: number;
    harga: number;
    harga_formatted: string;
    pabrik: string | null;
    tanggal_kadaluarsa: string | null;
    tanggal_kadaluarsa_formatted: string | null;
    deskripsi: string | null;
    status_stok: 'habis' | 'menipis' | 'tersedia';
    is_expired: boolean;
    days_to_expire: number | null;
    is_aktif: boolean;
    created_at: string;
    created_at_formatted: string;
    updated_at: string;
    updated_at_formatted: string;
}

interface Props {
    obat: Obat;
}

export default function Show({ obat }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Obat', href: '/dokter/obat' },
        { title: obat.nama_obat, href: `/dokter/obat/${obat.id}` },
    ];

    const getStatusBadge = (status: string) => {
        const variants = {
            habis: 'bg-red-100 text-red-800 border-red-200',
            menipis: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            tersedia: 'bg-green-100 text-green-800 border-green-200',
        };
        
        return `px-3 py-1 text-sm font-medium rounded-full border ${variants[status as keyof typeof variants]}`;
    };

    const getStatusText = (status: string) => {
        const texts = {
            habis: 'Stok Habis',
            menipis: 'Stok Menipis',
            tersedia: 'Stok Tersedia',
        };
        
        return texts[status as keyof typeof texts];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${obat.nama_obat} - Detail Obat`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{obat.nama_obat}</h1>
                        <p className="text-gray-600">Detail informasi obat</p>
                    </div>
                    
                    <div className="flex space-x-3">
                        <Link
                            href="/dokter/obat"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali
                        </Link>
                        <Link
                            href={`/dokter/obat/${obat.id}/edit`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </Link>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Status Stok */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Status Stok</h3>
                                <span className={getStatusBadge(obat.status_stok)}>
                                    {getStatusText(obat.status_stok)}
                                </span>
                            </div>
                            <Package className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    {/* Status Kadaluarsa */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Status Kadaluarsa</h3>
                                {obat.tanggal_kadaluarsa_formatted ? (
                                    <div className="mt-1">
                                        {obat.is_expired ? (
                                            <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 border border-red-200 rounded-full">
                                                Kadaluwarsa
                                            </span>
                                        ) : obat.days_to_expire !== null && obat.days_to_expire <= 30 ? (
                                            <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200 rounded-full">
                                                {obat.days_to_expire} hari lagi
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 border border-green-200 rounded-full">
                                                Masih valid
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200 rounded-full">
                                        Tidak diketahui
                                    </span>
                                )}
                            </div>
                            <Calendar className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>

                    {/* Status Aktif */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Status Aktif</h3>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                                    obat.is_aktif 
                                        ? 'bg-green-100 text-green-800 border-green-200' 
                                        : 'bg-red-100 text-red-800 border-red-200'
                                }`}>
                                    {obat.is_aktif ? 'Aktif' : 'Tidak Aktif'}
                                </span>
                            </div>
                            <AlertTriangle className={`w-8 h-8 ${obat.is_aktif ? 'text-green-500' : 'text-red-500'}`} />
                        </div>
                    </div>
                </div>

                {/* Detail Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informasi Dasar */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Pill className="w-5 h-5 mr-2 text-blue-600" />
                                Informasi Dasar
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Kode Obat</label>
                                        <p className="text-sm text-gray-900 font-mono">{obat.kode_obat}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Nama Obat</label>
                                        <p className="text-sm text-gray-900 font-medium">{obat.nama_obat}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Nama Generik</label>
                                        <p className="text-sm text-gray-900">{obat.nama_generik || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Kategori</label>
                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                            {obat.kategori}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Satuan</label>
                                        <p className="text-sm text-gray-900">{obat.satuan}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Pabrik/Produsen</label>
                                        <p className="text-sm text-gray-900">{obat.pabrik || '-'}</p>
                                    </div>
                                </div>

                                {obat.deskripsi && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                                        <p className="text-sm text-gray-900 mt-1">{obat.deskripsi}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Informasi Stok & Harga */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-green-600" />
                                Stok & Harga
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Stok Tersedia</label>
                                        <p className="text-2xl font-bold text-gray-900">{obat.stok_tersedia}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Stok Minimum</label>
                                        <p className="text-2xl font-bold text-orange-600">{obat.stok_minimum}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Harga</label>
                                    <p className="text-2xl font-bold text-green-600">{obat.harga_formatted}</p>
                                </div>

                                {obat.tanggal_kadaluarsa_formatted && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tanggal Kadaluarsa</label>
                                        <p className="text-sm text-gray-900">{obat.tanggal_kadaluarsa_formatted}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline/Log */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Sistem</h3>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Dibuat pada</label>
                                <p className="text-sm text-gray-900">{obat.created_at_formatted}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Terakhir diperbarui</label>
                                <p className="text-sm text-gray-900">{obat.updated_at_formatted}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
