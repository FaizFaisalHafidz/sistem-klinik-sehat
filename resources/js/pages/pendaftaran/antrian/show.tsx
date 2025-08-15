import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    MapPin,
    Phone,
    Play,
    Printer,
    User,
    UserCheck,
    XCircle,
} from 'lucide-react';

interface Pasien {
    id: number;
    kode_pasien: string;
    nama_lengkap: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    telepon: string;
    umur: number;
}

interface Petugas {
    nama_lengkap: string;
}

interface Pendaftaran {
    id: number;
    kode_pendaftaran: string;
    jenis_pemeriksaan: string;
    keluhan: string;
    status_pendaftaran: string;
    created_at: string;
    created_at_formatted: string;
    pasien: Pasien;
    petugas: Petugas;
}

interface Antrian {
    id: number;
    nomor_antrian: number;
    status_antrian: string;
    estimasi_waktu: string;
    estimasi_waktu_formatted: string;
    keterangan: string;
    created_at: string;
    created_at_formatted: string;
    updated_at: string;
    updated_at_formatted: string;
    pendaftaran: Pendaftaran;
}

interface Props {
    antrian: Antrian;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'menunggu':
            return <Badge variant="outline" className="border-yellow-500 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Menunggu</Badge>;
        case 'dipanggil':
            return <Badge variant="default" className="bg-blue-500"><AlertCircle className="w-3 h-3 mr-1" />Dipanggil</Badge>;
        case 'selesai':
            return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Selesai</Badge>;
        case 'dibatalkan':
            return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Dibatalkan</Badge>;
        default:
            return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Tidak Diketahui</Badge>;
    }
};

const getJenisKelaminBadge = (jenis_kelamin: string) => {
    return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
};

export default function Show({ antrian }: Props) {
    const handleUpdateStatus = (status: string) => {
        const keterangan = status === 'selesai' ? 'Pemeriksaan selesai' : 
                         status === 'dibatalkan' ? 'Antrian dibatalkan' : 
                         status === 'dipanggil' ? 'Pasien sedang dipanggil' : '';

        router.patch(route('pendaftaran.antrian.update-status', antrian.id), {
            status: status,
            keterangan: keterangan,
        });
    };

    return (
        <AppLayout>
            <Head title={`Detail Antrian #${antrian.nomor_antrian} - ${antrian.pendaftaran.pasien.nama_lengkap}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('pendaftaran.antrian.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Detail Antrian #{antrian.nomor_antrian}
                            </h1>
                            <p className="text-gray-600">
                                {antrian.pendaftaran.pasien.nama_lengkap} • {antrian.created_at_formatted}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('pendaftaran.antrian.print-ticket', antrian.id)}>
                            <Button variant="outline">
                                <Printer className="w-4 h-4 mr-2" />
                                Cetak Tiket
                            </Button>
                        </Link>
                        
                        {/* Action buttons based on status */}
                        {antrian.status_antrian === 'menunggu' && (
                            <Button 
                                onClick={() => handleUpdateStatus('dipanggil')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Panggil Pasien
                            </Button>
                        )}
                        
                        {antrian.status_antrian === 'dipanggil' && (
                            <Button 
                                onClick={() => handleUpdateStatus('selesai')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Selesai Pemeriksaan
                            </Button>
                        )}
                        
                        {(antrian.status_antrian === 'menunggu' || antrian.status_antrian === 'dipanggil') && (
                            <Button 
                                onClick={() => handleUpdateStatus('dibatalkan')}
                                variant="destructive"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Batalkan Antrian
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status dan Nomor Antrian */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6 text-center">
                            <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                                #{antrian.nomor_antrian}
                            </div>
                            <h3 className="font-semibold text-blue-900 mb-1">Nomor Antrian</h3>
                            <p className="text-sm text-blue-600">Antrian hari ini</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="mb-4">
                                {getStatusBadge(antrian.status_antrian)}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Status Antrian</h3>
                            <p className="text-sm text-gray-600">Terakhir diperbarui: {antrian.updated_at_formatted}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <Clock className="h-8 w-8 text-gray-600 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-900 mb-1">Estimasi Waktu</h3>
                            <p className="text-sm text-gray-600">
                                {antrian.estimasi_waktu_formatted || 'Belum diatur'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informasi Pasien */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Informasi Pasien
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Kode Pasien</label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className="text-sm">
                                            {antrian.pendaftaran.pasien.kode_pasien}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                                    <p className="mt-1 text-sm text-gray-900 font-medium">
                                        {antrian.pendaftaran.pasien.nama_lengkap}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">
                                            {antrian.pendaftaran.pasien.tanggal_lahir}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Umur / Jenis Kelamin</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {antrian.pendaftaran.pasien.umur} tahun / {getJenisKelaminBadge(antrian.pendaftaran.pasien.jenis_kelamin)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Alamat</label>
                                <div className="mt-1 flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <p className="text-sm text-gray-900">
                                        {antrian.pendaftaran.pasien.alamat || 'Alamat tidak tersedia'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">
                                        {antrian.pendaftaran.pasien.telepon || 'Tidak tersedia'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informasi Pendaftaran */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Informasi Pendaftaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kode Pendaftaran</label>
                                <div className="mt-1">
                                    <Badge variant="outline" className="text-sm">
                                        {antrian.pendaftaran.kode_pendaftaran}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Jenis Pemeriksaan</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">
                                    {antrian.pendaftaran.jenis_pemeriksaan}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Keluhan</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {antrian.pendaftaran.keluhan || 'Tidak ada keluhan khusus'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Status Pendaftaran</label>
                                <div className="mt-1">
                                    <Badge variant="outline" className="text-sm capitalize">
                                        {antrian.pendaftaran.status_pendaftaran}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Didaftarkan oleh</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">
                                        {antrian.pendaftaran.petugas.nama_lengkap}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Waktu Pendaftaran</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">
                                        {antrian.pendaftaran.created_at_formatted}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Riwayat dan Keterangan */}
                {antrian.keterangan && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Keterangan Antrian
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-700">
                                    {antrian.keterangan}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Timeline Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Timeline Antrian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 rounded-full p-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">Antrian Dibuat</h4>
                                    <p className="text-sm text-gray-600">
                                        Pasien mendaftar dan mendapatkan nomor antrian #{antrian.nomor_antrian}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {antrian.created_at_formatted}
                                    </p>
                                </div>
                            </div>

                            {antrian.status_antrian !== 'menunggu' && (
                                <div className="flex items-start gap-4">
                                    <div className={`rounded-full p-2 ${
                                        antrian.status_antrian === 'dipanggil' ? 'bg-blue-100' :
                                        antrian.status_antrian === 'selesai' ? 'bg-green-100' :
                                        'bg-red-100'
                                    }`}>
                                        {antrian.status_antrian === 'dipanggil' && <Play className="w-4 h-4 text-blue-600" />}
                                        {antrian.status_antrian === 'selesai' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                        {antrian.status_antrian === 'dibatalkan' && <XCircle className="w-4 h-4 text-red-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">
                                            {antrian.status_antrian === 'dipanggil' && 'Pasien Dipanggil'}
                                            {antrian.status_antrian === 'selesai' && 'Pemeriksaan Selesai'}
                                            {antrian.status_antrian === 'dibatalkan' && 'Antrian Dibatalkan'}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {antrian.keterangan || 'Status antrian diperbarui'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {antrian.updated_at_formatted}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
