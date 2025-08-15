import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Briefcase, Calendar, Clock, Edit, Heart, MapPin, Phone, User } from 'lucide-react';

interface PasienData {
    id: number;
    no_rm: string;
    nik: string;
    nama_lengkap: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    telepon: string;
    golongan_darah?: string;
    pekerjaan?: string;
    status_pernikahan?: string;
    kontak_darurat?: string;
    alergi?: string;
    created_at: string;
    updated_at: string;
    umur?: number;
}

interface ShowPasienProps {
    pasien: PasienData;
}

export default function ShowPasien({ pasien }: ShowPasienProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Pasien', href: '/admin/pasien' },
        { title: `Detail Pasien - ${pasien.nama_lengkap}`, href: '' },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatTanggalLahir = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusPernikahanLabel = (status?: string) => {
        const statusMap: Record<string, string> = {
            'belum_menikah': 'Belum Menikah',
            'menikah': 'Menikah',
            'cerai': 'Cerai'
        };
        return status ? statusMap[status] || status : '-';
    };

    const getJenisKelaminLabel = (jenis_kelamin: string) => {
        return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
    };

    const getGolonganDarahBadge = (golDarah?: string) => {
        if (!golDarah) return null;
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {golDarah}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pasien - ${pasien.nama_lengkap}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Detail Pasien</h1>
                            <p className="text-gray-600">Informasi lengkap data pasien</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/pasien/${pasien.id}/edit`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Data
                        </Link>
                        <Link
                            href="/admin/pasien"
                            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Link>
                    </div>
                </div>

                {/* Patient Overview Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start space-x-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                                {pasien.nama_lengkap.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{pasien.nama_lengkap}</h2>
                                    <p className="text-gray-600 font-mono">{pasien.no_rm}</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            pasien.jenis_kelamin === 'L' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-pink-100 text-pink-800'
                                        }`}>
                                            {getJenisKelaminLabel(pasien.jenis_kelamin)}
                                        </span>
                                        {pasien.umur && (
                                            <span className="text-sm text-gray-600">
                                                {pasien.umur} tahun
                                            </span>
                                        )}
                                        {getGolonganDarahBadge(pasien.golongan_darah)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Identitas */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <div className="w-2 h-6 bg-blue-600 rounded-full mr-3"></div>
                            Identitas Pasien
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                                    <p className="text-gray-900 font-mono">{pasien.nik}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                                    <p className="text-gray-900">{pasien.tempat_lahir}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{formatTanggalLahir(pasien.tanggal_lahir)}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                                    <p className="text-gray-900">{getJenisKelaminLabel(pasien.jenis_kelamin)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Golongan Darah</label>
                                    <p className="text-gray-900">{pasien.golongan_darah || '-'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
                                    <div className="flex items-center space-x-2">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{pasien.pekerjaan || '-'}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Pernikahan</label>
                                    <p className="text-gray-900">{getStatusPernikahanLabel(pasien.status_pernikahan)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Umur</label>
                                    <p className="text-gray-900">{pasien.umur ? `${pasien.umur} tahun` : '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kontak & Info Tambahan */}
                    <div className="space-y-6">
                        {/* Kontak */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Phone className="w-5 h-5 mr-2 text-green-600" />
                                Kontak
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{pasien.telepon}</p>
                                    </div>
                                </div>

                                {pasien.kontak_darurat && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kontak Darurat</label>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-red-400" />
                                            <p className="text-gray-900">{pasien.kontak_darurat}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <p className="text-gray-900 leading-relaxed">{pasien.alamat}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Medical Info */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Heart className="w-5 h-5 mr-2 text-red-600" />
                                Informasi Medis
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alergi</label>
                                    {pasien.alergi ? (
                                        <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                            <p className="text-yellow-800 text-sm">{pasien.alergi}</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">Tidak ada riwayat alergi</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Registration Info */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                                Info Pendaftaran
                            </h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Terdaftar</label>
                                    <p className="text-gray-900 text-sm">{formatDate(pasien.created_at)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Terakhir Diperbarui</label>
                                    <p className="text-gray-900 text-sm">{formatDate(pasien.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical History Placeholder */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Riwayat Rekam Medis</h3>
                    <div className="text-center py-8">
                        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Riwayat rekam medis akan ditampilkan di sini</p>
                        <p className="text-sm text-gray-400 mt-1">Fitur ini akan dikembangkan selanjutnya</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
