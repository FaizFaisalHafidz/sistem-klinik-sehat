import AppLayinterface Obat {
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
}ts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Building,
    Calendar,
    Edit,
    Package,
    Pill
} from 'lucide-react';

interface Obat {
    id: number;
    nama_obat: string;
    kategori: string;
    bentuk_sediaan: string;
    dosis: string;
    stok_tersedia: number;
    stok_minimum: number;
    harga: number;
    harga_formatted: string;
    produsen: string;
    tanggal_kadaluwarsa: string | null;
    tanggal_kadaluwarsa_formatted: string | null;
    deskripsi: string | null;
    efek_samping: string | null;
    kontraindikasi: string | null;
    indikasi: string | null;
    status_stok: 'habis' | 'menipis' | 'tersedia';
    is_expired: boolean;
    days_to_expire: number | null;
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
            <Head title={`Detail Obat - ${obat.nama_obat}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{obat.nama_obat}</h1>
                        <p className="text-gray-600">Detail informasi obat</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
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
                            Edit Obat
                        </Link>
                    </div>
                </div>

                {/* Alert untuk status kritis */}
                {(obat.status_stok === 'habis' || obat.status_stok === 'menipis' || obat.is_expired || (obat.days_to_expire !== null && obat.days_to_expire <= 30)) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Perhatian</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        {obat.status_stok === 'habis' && (
                                            <li>Stok obat telah habis</li>
                                        )}
                                        {obat.status_stok === 'menipis' && (
                                            <li>Stok obat tinggal {obat.stok_tersedia} unit (di bawah minimum {obat.stok_minimum})</li>
                                        )}
                                        {obat.is_expired && (
                                            <li>Obat telah kadaluwarsa pada {obat.tanggal_kadaluwarsa_formatted}</li>
                                        )}
                                        {!obat.is_expired && obat.days_to_expire !== null && obat.days_to_expire <= 30 && (
                                            <li>Obat akan kadaluwarsa dalam {obat.days_to_expire} hari</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informasi Dasar */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Pill className="w-5 h-5 mr-2 text-blue-600" />
                                    Informasi Dasar
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Nama Obat
                                        </label>
                                        <p className="text-lg font-semibold text-gray-900">{obat.nama_obat}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Kategori
                                        </label>
                                        <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                                            {obat.kategori}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Bentuk Sediaan
                                        </label>
                                        <p className="text-gray-900">{obat.bentuk_sediaan}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Dosis
                                        </label>
                                        <p className="text-gray-900 font-medium">{obat.dosis}</p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            <Building className="w-4 h-4 inline mr-1" />
                                            Produsen
                                        </label>
                                        <p className="text-gray-900">{obat.produsen}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informasi Medis */}
                        {(obat.indikasi || obat.kontraindikasi || obat.efek_samping || obat.deskripsi) && (
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Informasi Medis
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        {obat.indikasi && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">
                                                    Indikasi
                                                </label>
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <p className="text-gray-700 leading-relaxed">{obat.indikasi}</p>
                                                </div>
                                            </div>
                                        )}

                                        {obat.kontraindikasi && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">
                                                    Kontraindikasi
                                                </label>
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                    <p className="text-gray-700 leading-relaxed">{obat.kontraindikasi}</p>
                                                </div>
                                            </div>
                                        )}

                                        {obat.efek_samping && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">
                                                    Efek Samping
                                                </label>
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                    <p className="text-gray-700 leading-relaxed">{obat.efek_samping}</p>
                                                </div>
                                            </div>
                                        )}

                                        {obat.deskripsi && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">
                                                    Deskripsi
                                                </label>
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                    <p className="text-gray-700 leading-relaxed">{obat.deskripsi}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status & Stok */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-green-600" />
                                    Status & Stok
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            Status Stok
                                        </label>
                                        <span className={getStatusBadge(obat.status_stok)}>
                                            {getStatusText(obat.status_stok)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Stok Tersedia
                                            </label>
                                            <p className="text-2xl font-bold text-gray-900">{obat.stok_tersedia}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Stok Minimum
                                            </label>
                                            <p className="text-2xl font-bold text-gray-500">{obat.stok_minimum}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Harga
                                        </label>
                                        <p className="text-2xl font-bold text-blue-600">{obat.harga_formatted}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tanggal Kadaluwarsa */}
                        {obat.tanggal_kadaluwarsa && (
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                                        Kadaluwarsa
                                    </h3>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Tanggal Kadaluwarsa
                                            </label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {obat.tanggal_kadaluwarsa_formatted}
                                            </p>
                                        </div>

                                        {obat.is_expired ? (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-sm font-medium text-red-800">
                                                    ⚠️ Obat telah kadaluwarsa
                                                </p>
                                            </div>
                                        ) : obat.days_to_expire !== null && obat.days_to_expire <= 30 ? (
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                <p className="text-sm font-medium text-orange-800">
                                                    ⏰ {obat.days_to_expire} hari lagi
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-sm font-medium text-green-800">
                                                    ✅ Masih berlaku
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Informasi Sistem */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Informasi Sistem
                                </h3>
                                
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <label className="block font-medium text-gray-500 mb-1">
                                            Dibuat
                                        </label>
                                        <p className="text-gray-700">{obat.created_at_formatted}</p>
                                    </div>

                                    <div>
                                        <label className="block font-medium text-gray-500 mb-1">
                                            Terakhir Diperbarui
                                        </label>
                                        <p className="text-gray-700">{obat.updated_at_formatted}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
