import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Badge,
    Building,
    Calendar,
    CheckCircle,
    Edit,
    FileText,
    Mail,
    MapPin,
    Phone,
    Stethoscope,
    User,
    UserCheck,
    XCircle,
} from 'lucide-react';

interface User {
    id: number;
    nama_pengguna: string;
    nama_lengkap: string;
    email: string;
}

interface Pegawai {
    id: number;
    kode_pegawai: string;
    nama_lengkap: string;
    jabatan: string;
    departemen: string | null;
    nomor_izin: string | null;
    spesialisasi: string | null;
    telepon: string | null;
    email: string | null;
    alamat: string | null;
    tanggal_masuk: string | null;
    biaya_konsultasi: number;
    biaya_konsultasi_formatted: string;
    is_aktif: boolean;
    user: User | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    pegawai: Pegawai;
}

export default function Show({ pegawai }: Props) {
    return (
        <AppLayout>
            <Head title={`Detail Pegawai - ${pegawai.nama_lengkap}`} />
            
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/pegawai"
                            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                            <UserCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Detail Pegawai</h1>
                            <p className="text-sm text-gray-600">{pegawai.nama_lengkap}</p>
                        </div>
                    </div>
                    <Link
                        href={`/admin/pegawai/${pegawai.id}/edit`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 border border-transparent rounded-lg font-medium text-white hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Data
                    </Link>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                        {/* Status Badge */}
                        <div className="mb-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                pegawai.is_aktif 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {pegawai.is_aktif ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Pegawai Aktif
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Pegawai Tidak Aktif
                                    </>
                                )}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <User className="w-5 h-5 mr-2 text-blue-500" />
                                        Informasi Dasar
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <Badge className="w-4 h-4 mr-3 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Kode Pegawai</p>
                                                <p className="text-sm font-medium text-gray-900">{pegawai.kode_pegawai}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-3 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Nama Lengkap</p>
                                                <p className="text-sm font-medium text-gray-900">{pegawai.nama_lengkap}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Building className="w-4 h-4 mr-3 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Jabatan</p>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {pegawai.jabatan}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Building className="w-4 h-4 mr-3 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Departemen</p>
                                                <p className="text-sm font-medium text-gray-900">{pegawai.departemen || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Stethoscope className="w-5 h-5 mr-2 text-blue-500" />
                                        Informasi Medis
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <FileText className="w-4 h-4 mr-3 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Nomor Izin (SIP/STR)</p>
                                                <p className="text-sm font-medium text-gray-900">{pegawai.nomor_izin || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Stethoscope className="w-4 h-4 mr-3 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Spesialisasi</p>
                                                <p className="text-sm font-medium text-gray-900">{pegawai.spesialisasi || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Badge className="w-4 h-4 mr-3 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Biaya Konsultasi</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {pegawai.biaya_konsultasi > 0 ? pegawai.biaya_konsultasi_formatted : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {pegawai.user && (
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <User className="w-5 h-5 mr-2 text-blue-500" />
                                            Akun Pengguna
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 mr-3 text-gray-400" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500">Nama Pengguna</p>
                                                    <p className="text-sm font-medium text-gray-900">{pegawai.user.nama_pengguna}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 mr-3 text-gray-400" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500">Nama Lengkap</p>
                                                    <p className="text-sm font-medium text-gray-900">{pegawai.user.nama_lengkap}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500">Email Akun</p>
                                                    <p className="text-sm font-medium text-gray-900">{pegawai.user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Phone className="w-5 h-5 mr-2 text-blue-500" />
                                        Kontak & Alamat
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 mr-3 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Telepon</p>
                                                <p className="text-sm font-medium text-gray-900">{pegawai.telepon || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-3 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="text-sm font-medium text-gray-900">{pegawai.email || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Alamat</p>
                                                <p className="text-sm font-medium text-gray-900">{pegawai.alamat || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                                        Informasi Lainnya
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Tanggal Masuk</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {pegawai.tanggal_masuk 
                                                        ? new Date(pegawai.tanggal_masuk).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }) 
                                                        : '-'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {new Date(pegawai.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Terakhir Diperbarui</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {new Date(pegawai.updated_at).toLocaleDateString('id-ID', {
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
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
