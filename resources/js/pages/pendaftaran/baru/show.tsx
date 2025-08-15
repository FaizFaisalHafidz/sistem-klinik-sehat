import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    MapPin,
    Phone,
    Printer,
    Stethoscope,
    User,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pendaftaran Baru', href: '/pendaftaran/baru' },
    { title: 'Detail Pendaftaran', href: '#' },
];

interface Pasien {
    id: number;
    kode_pasien: string;
    nik: string;
    nama_lengkap: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    telepon: string;
    email?: string;
    pekerjaan?: string;
    golongan_darah?: string;
}

interface User {
    id: number;
    nama_lengkap: string;
}

interface Antrian {
    id: number;
    nomor_antrian: string;
    tanggal_antrian: string;
    waktu_pendaftaran: string;
    waktu_dipanggil?: string;
    waktu_selesai?: string;
    status_antrian: string;
    estimasi_waktu: string;
}

interface Pendaftaran {
    id: number;
    kode_pendaftaran: string;
    tanggal_pendaftaran: string;
    keluhan_utama: string;
    status_pendaftaran: string;
    created_at: string;
    pasien: Pasien;
    antrian: Antrian;
    dibuatOleh?: User;
}

interface Props {
    pendaftaran: Pendaftaran;
    posisiAntrian: number;
}

export default function Show({ pendaftaran, posisiAntrian }: Props) {
    const handlePrintTicket = () => {
        router.get(`/pendaftaran/baru/${pendaftaran.id}/print-ticket`);
    };

    const handleCancelRegistration = () => {
        if (confirm('Apakah Anda yakin ingin membatalkan pendaftaran ini?')) {
            router.delete(`/pendaftaran/baru/${pendaftaran.id}/cancel`, {
                onSuccess: () => {
                    toast.success('Pendaftaran berhasil dibatalkan');
                },
                onError: (errors) => {
                    console.error('Error:', errors);
                    toast.error('Gagal membatalkan pendaftaran');
                },
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'terdaftar':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'selesai':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'dibatalkan':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getAntrianStatusColor = (status: string) => {
        switch (status) {
            case 'menunggu':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'sedang_diperiksa':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'selesai':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'dibatalkan':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatEstimasiWaktu = (estimasiWaktu: string) => {
        try {
            // Jika estimasi_waktu adalah timestamp, convert ke format waktu
            const date = new Date(estimasiWaktu);
            if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            // Jika bukan timestamp, return as is
            return estimasiWaktu;
        } catch (error) {
            return estimasiWaktu;
        }
    };

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pendaftaran ${pendaftaran.kode_pendaftaran}`} />
            
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/pendaftaran/baru"
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Detail Pendaftaran</h1>
                            <p className="text-gray-600">{pendaftaran.kode_pendaftaran}</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        {pendaftaran.status_pendaftaran === 'terdaftar' && (
                            <>
                                <button
                                    onClick={handlePrintTicket}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Cetak Tiket
                                </button>
                                <button
                                    onClick={handleCancelRegistration}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Batalkan
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Status Alert */}
                <div className={`rounded-lg border p-4 ${getStatusColor(pendaftaran.status_pendaftaran)}`}>
                    <div className="flex items-center space-x-3">
                        {pendaftaran.status_pendaftaran === 'terdaftar' && <CheckCircle className="w-5 h-5" />}
                        {pendaftaran.status_pendaftaran === 'dibatalkan' && <XCircle className="w-5 h-5" />}
                        <div>
                            <p className="font-medium">
                                {pendaftaran.status_pendaftaran === 'terdaftar' ? 'Pendaftaran Berhasil' :
                                 pendaftaran.status_pendaftaran === 'selesai' ? 'Pemeriksaan Selesai' :
                                 pendaftaran.status_pendaftaran === 'dibatalkan' ? 'Pendaftaran Dibatalkan' : 
                                 'Status Tidak Diketahui'}
                            </p>
                            <p className="text-sm">
                                {pendaftaran.status_pendaftaran === 'terdaftar' ? 'Pasien telah terdaftar dan masuk dalam antrian' :
                                 pendaftaran.status_pendaftaran === 'selesai' ? 'Pemeriksaan telah selesai dilakukan' :
                                 pendaftaran.status_pendaftaran === 'dibatalkan' ? 'Pendaftaran telah dibatalkan' :
                                 'Status pendaftaran tidak diketahui'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Queue Ticket Card */}
                {pendaftaran.antrian && (
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">KARTU ANTRIAN</h2>
                            <div className="bg-white text-blue-600 rounded-lg p-6 mb-4">
                                <div className="text-6xl font-bold mb-2">{pendaftaran.antrian.nomor_antrian}</div>
                                <div className="text-lg font-medium">
                                    {new Date(pendaftaran.antrian.tanggal_antrian).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="opacity-90">Posisi Antrian</p>
                                    <p className="text-xl font-bold">{posisiAntrian}</p>
                                </div>
                                <div>
                                    <p className="opacity-90">Estimasi Waktu</p>
                                    <p className="text-xl font-bold">
                                        {formatEstimasiWaktu(pendaftaran.antrian.estimasi_waktu)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informasi Pasien */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <User className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Informasi Pasien</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Nama Lengkap</p>
                                <p className="font-medium text-gray-900">{pendaftaran.pasien.nama_lengkap}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Kode Pasien</p>
                                    <p className="font-medium text-gray-900">{pendaftaran.pasien.kode_pasien}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">NIK</p>
                                    <p className="font-medium text-gray-900">{pendaftaran.pasien.nik}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Tanggal Lahir</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(pendaftaran.pasien.tanggal_lahir).toLocaleDateString('id-ID')}
                                    <span className="text-gray-600 ml-2">({calculateAge(pendaftaran.pasien.tanggal_lahir)} tahun)</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Jenis Kelamin</p>
                                <p className="font-medium text-gray-900 capitalize">{pendaftaran.pasien.jenis_kelamin}</p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Phone className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Telepon</p>
                                    <p className="font-medium text-gray-900">{pendaftaran.pasien.telepon}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Alamat</p>
                                    <p className="font-medium text-gray-900">{pendaftaran.pasien.alamat}</p>
                                </div>
                            </div>
                            {pendaftaran.pasien.golongan_darah && (
                                <div>
                                    <p className="text-sm text-gray-600">Golongan Darah</p>
                                    <p className="font-medium text-gray-900">{pendaftaran.pasien.golongan_darah}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail Pendaftaran */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Detail Pendaftaran</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Kode Pendaftaran</p>
                                <p className="font-medium text-gray-900">{pendaftaran.kode_pendaftaran}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Tanggal Pendaftaran</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(pendaftaran.tanggal_pendaftaran).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(pendaftaran.status_pendaftaran)}`}>
                                        {pendaftaran.status_pendaftaran === 'terdaftar' ? 'Terdaftar' :
                                         pendaftaran.status_pendaftaran === 'selesai' ? 'Selesai' :
                                         pendaftaran.status_pendaftaran === 'dibatalkan' ? 'Dibatalkan' : pendaftaran.status_pendaftaran}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Stethoscope className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Keluhan Utama</p>
                                    <p className="font-medium text-gray-900">{pendaftaran.keluhan_utama}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Waktu Pendaftaran</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(pendaftaran.created_at).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Didaftarkan oleh</p>
                                <p className="font-medium text-gray-900">{pendaftaran.dibuatOleh?.nama_lengkap || 'Tidak diketahui'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informasi Antrian */}
                {pendaftaran.antrian && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Informasi Antrian</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Nomor Antrian</p>
                                <p className="text-2xl font-bold text-blue-600">{pendaftaran.antrian.nomor_antrian}</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Posisi</p>
                                <p className="text-2xl font-bold text-yellow-600">{posisiAntrian}</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Status Antrian</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAntrianStatusColor(pendaftaran.antrian.status_antrian)}`}>
                                    {pendaftaran.antrian.status_antrian === 'menunggu' ? 'Menunggu' :
                                     pendaftaran.antrian.status_antrian === 'sedang_diperiksa' ? 'Sedang Diperiksa' :
                                     pendaftaran.antrian.status_antrian === 'selesai' ? 'Selesai' :
                                     pendaftaran.antrian.status_antrian === 'dibatalkan' ? 'Dibatalkan' : pendaftaran.antrian.status_antrian}
                                </span>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Estimasi</p>
                                <p className="text-lg font-bold text-green-600">
                                    {formatEstimasiWaktu(pendaftaran.antrian.estimasi_waktu)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
