import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, Edit, MapPin, Phone, User } from 'lucide-react';

interface RekamMedis {
    id: number;
    kode_rekam_medis: string;
    diagnosa: string;
    status_rekam_medis: string;
}

interface RiwayatPendaftaran {
    id: number;
    kode_pendaftaran: string;
    tanggal_pendaftaran: string;
    jenis_pemeriksaan: string;
    keluhan: string;
    status_pendaftaran: string;
    rekam_medis?: RekamMedis;
}

interface Statistics {
    total_kunjungan: number;
    kunjungan_selesai: number;
    rekam_medis_count: number;
}

interface PasienData {
    id: number;
    kode_pasien: string;
    nik: string;
    nama_lengkap: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    telepon: string;
    email?: string;
    created_at: string;
    updated_at: string;
    umur?: number;
}

interface ShowPasienProps {
    pasien: PasienData;
    riwayatPendaftaran: RiwayatPendaftaran[];
    statistics: Statistics;
}

export default function ShowPasien({ pasien, riwayatPendaftaran, statistics }: ShowPasienProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Pasien', href: '/pendaftaran/pasien' },
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

    const getJenisKelaminLabel = (jenis_kelamin: string) => {
        return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
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
                            href={`/pendaftaran/pasien/${pasien.id}/edit`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Data
                        </Link>
                        <Link
                            href="/pendaftaran/pasien"
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
                                    <p className="text-gray-600 font-mono">{pasien.kode_pasien}</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            pasien.jenis_kelamin === 'laki-laki' 
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pasien</label>
                                    <p className="text-gray-900 font-mono">{pasien.kode_pasien}</p>
                                </div>

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
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                                    <p className="text-gray-900">{getJenisKelaminLabel(pasien.jenis_kelamin)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Umur</label>
                                    <p className="text-gray-900">{pasien.umur ? `${pasien.umur} tahun` : '-'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p className="text-gray-900">{pasien.email || '-'}</p>
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <p className="text-gray-900 leading-relaxed">{pasien.alamat}</p>
                                    </div>
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

                        {/* Statistics */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Kunjungan</h3>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{statistics.total_kunjungan}</div>
                                    <div className="text-sm text-gray-600">Total Kunjungan</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{statistics.kunjungan_selesai}</div>
                                    <div className="text-sm text-gray-600">Selesai</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{statistics.rekam_medis_count}</div>
                                    <div className="text-sm text-gray-600">Rekam Medis</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical History */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Riwayat Pendaftaran</h3>
                    
                    {riwayatPendaftaran && riwayatPendaftaran.length > 0 ? (
                        <div className="space-y-4">
                            {riwayatPendaftaran.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{item.kode_pendaftaran}</h4>
                                            <p className="text-sm text-gray-600">{item.tanggal_pendaftaran}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                item.status_pendaftaran === 'selesai' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : item.status_pendaftaran === 'sedang_diperiksa'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {item.status_pendaftaran?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                                            </span>
                                            {item.rekam_medis && (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                                    Ada Rekam Medis
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <label className="block text-gray-600 mb-1">Jenis Pemeriksaan</label>
                                            <p className="text-gray-900 capitalize">{item.jenis_pemeriksaan?.replace('_', ' ') || 'Tidak diketahui'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-gray-600 mb-1">Keluhan</label>
                                            <p className="text-gray-900">{item.keluhan || 'Tidak ada keluhan'}</p>
                                        </div>
                                        {item.rekam_medis && (
                                            <>
                                                <div>
                                                    <label className="block text-gray-600 mb-1">Kode Rekam Medis</label>
                                                    <p className="text-gray-900 font-mono">{item.rekam_medis.kode_rekam_medis}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-gray-600 mb-1">Diagnosis</label>
                                                    <p className="text-gray-900">{item.rekam_medis.diagnosa}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Belum ada riwayat pendaftaran</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
