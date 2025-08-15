import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Plus,
    Search,
    TrendingUp,
    UserPlus,
    Users,
    XCircle
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pendaftaran Baru', href: '/pendaftaran/baru' },
];

interface Stats {
    total_pendaftaran_hari_ini: number;
    total_antrian_aktif: number;
    total_pasien_terdaftar: number;
    rata_rata_waktu_tunggu: number;
}

interface Pasien {
    id: number;
    kode_pasien: string;
    nama_lengkap: string;
    telepon: string;
}

interface Antrian {
    id: number;
    nomor_antrian: string;
    status_antrian: string;
}

interface PendaftaranHariIni {
    id: number;
    kode_pendaftaran: string;
    status_pendaftaran: string;
    created_at: string;
    pasien: Pasien;
    antrian: Antrian;
}

interface Props {
    stats: Stats;
    pendaftaranHariIni: PendaftaranHariIni[];
}

export default function Index({ stats, pendaftaranHariIni }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'terdaftar':
                return 'bg-blue-100 text-blue-800';
            case 'selesai':
                return 'bg-green-100 text-green-800';
            case 'dibatalkan':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getAntrianStatusColor = (status: string) => {
        switch (status) {
            case 'menunggu':
                return 'bg-yellow-100 text-yellow-800';
            case 'dipanggil':
                return 'bg-blue-100 text-blue-800';
            case 'selesai':
                return 'bg-green-100 text-green-800';
            case 'dibatalkan':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pendaftaran Baru" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pendaftaran Baru</h1>
                        <p className="text-gray-600">Kelola pendaftaran pasien dan antrian</p>
                    </div>
                    <Link
                        href="/pendaftaran/baru/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Daftarkan Pasien
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <UserPlus className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pendaftaran Hari Ini</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.total_pendaftaran_hari_ini}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Antrian Aktif</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.total_antrian_aktif}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Pasien</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.total_pasien_terdaftar}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rata-rata Tunggu</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.rata_rata_waktu_tunggu} min
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Link
                            href="/pendaftaran/baru/create"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
                        >
                            <UserPlus className="w-8 h-8 text-blue-600 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900">Daftar Pasien Baru</p>
                                <p className="text-sm text-gray-600">Daftarkan pasien untuk pemeriksaan</p>
                            </div>
                        </Link>

                        <Link
                            href="/pendaftaran/pasien"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all"
                        >
                            <Search className="w-8 h-8 text-green-600 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900">Cari Pasien</p>
                                <p className="text-sm text-gray-600">Cari data pasien terdaftar</p>
                            </div>
                        </Link>

                        <Link
                            href="/pendaftaran/antrian"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-all"
                        >
                            <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900">Kelola Antrian</p>
                                <p className="text-sm text-gray-600">Monitor antrian pasien</p>
                            </div>
                        </Link>

                        <Link
                            href="/pendaftaran/cetak-antrian"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all"
                        >
                            <FileText className="w-8 h-8 text-purple-600 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900">Cetak Antrian</p>
                                <p className="text-sm text-gray-600">Cetak kartu antrian pasien</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Pendaftaran Hari Ini */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Pendaftaran Hari Ini</h2>
                        <p className="text-sm text-gray-600">Daftar pendaftaran terbaru hari ini</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No. Pendaftaran
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pasien
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No. Antrian
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Jenis Layanan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Waktu Daftar
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendaftaranHariIni.length > 0 ? (
                                    pendaftaranHariIni.map((pendaftaran) => (
                                        <tr key={pendaftaran.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {pendaftaran.kode_pendaftaran}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {pendaftaran.pasien.nama_lengkap}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {pendaftaran.pasien.kode_pasien} • {pendaftaran.pasien.telepon}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {pendaftaran.antrian.nomor_antrian}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 capitalize">
                                                    Pemeriksaan
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pendaftaran.status_pendaftaran)}`}>
                                                    {pendaftaran.status_pendaftaran === 'terdaftar' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                    {pendaftaran.status_pendaftaran === 'dibatalkan' && <XCircle className="w-3 h-3 mr-1" />}
                                                    {pendaftaran.status_pendaftaran === 'terdaftar' ? 'Terdaftar' : 
                                                     pendaftaran.status_pendaftaran === 'selesai' ? 'Selesai' : 
                                                     pendaftaran.status_pendaftaran === 'dibatalkan' ? 'Dibatalkan' : pendaftaran.status_pendaftaran}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(pendaftaran.created_at).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={`/pendaftaran/baru/${pendaftaran.id}`}
                                                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                                                <p>Belum ada pendaftaran hari ini</p>
                                                <p className="text-sm">Mulai daftarkan pasien untuk pemeriksaan</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
