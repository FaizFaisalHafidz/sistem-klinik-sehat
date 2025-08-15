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
    Stethoscope,
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

interface RekamMedis {
    id: number;
    diagnosis: string;
    tindakan: string;
    resep: string;
    catatan: string;
}

interface Pendaftaran {
    id: number;
    kode_pendaftaran: string;
    tanggal_pendaftaran: string;
    tanggal_pendaftaran_formatted: string;
    jenis_pemeriksaan: string;
    keluhan: string;
    catatan: string;
    status_pendaftaran: string;
    created_at: string;
    created_at_formatted: string;
    pasien: Pasien;
    petugas: Petugas;
    rekam_medis: RekamMedis | null;
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
        case 'sedang_diperiksa':
            return <Badge variant="default" className="bg-blue-500"><AlertCircle className="w-3 h-3 mr-1" />Sedang Diperiksa</Badge>;
        case 'selesai':
            return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Selesai</Badge>;
        case 'dibatalkan':
            return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Dibatalkan</Badge>;
        default:
            return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Tidak Diketahui</Badge>;
    }
};

const getPendaftaranStatusBadge = (status: string) => {
    switch (status) {
        case 'terdaftar':
            return <Badge variant="outline" className="border-blue-500 text-blue-700">Terdaftar</Badge>;
        case 'sedang_diperiksa':
            return <Badge variant="default" className="bg-orange-500">Sedang Diperiksa</Badge>;
        case 'selesai':
            return <Badge variant="default" className="bg-green-500">Selesai</Badge>;
        case 'dibatalkan':
            return <Badge variant="destructive">Dibatalkan</Badge>;
        default:
            return <Badge variant="secondary">Tidak Diketahui</Badge>;
    }
};

const getJenisKelaminBadge = (jenis_kelamin: string) => {
    return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
};

export default function Show({ antrian }: Props) {
    const handleStartExamination = () => {
        router.post(route('dokter.antrian.start-examination', antrian.id));
    };

    const handleCompleteExamination = () => {
        if (confirm('Apakah Anda yakin ingin menyelesaikan pemeriksaan ini?')) {
            router.post(route('dokter.antrian.complete-examination', antrian.id));
        }
    };

    return (
        <AppLayout>
            <Head title={`Detail Antrian #${antrian.nomor_antrian} - ${antrian.pendaftaran.pasien.nama_lengkap}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('dokter.antrian.index')}>
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
                        {/* Action buttons based on status */}
                        {antrian.status_antrian === 'menunggu' && (
                            <Button 
                                onClick={handleStartExamination}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Mulai Pemeriksaan
                            </Button>
                        )}
                        
                        {antrian.pendaftaran.status_pendaftaran === 'sedang_diperiksa' && (
                            <Button 
                                onClick={handleCompleteExamination}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Selesai Pemeriksaan
                            </Button>
                        )}

                        {antrian.status_antrian === 'sedang_diperiksa' && antrian.pendaftaran.status_pendaftaran !== 'sedang_diperiksa' && (
                            <Button 
                                onClick={handleStartExamination}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                <Stethoscope className="w-4 h-4 mr-2" />
                                Mulai Periksa
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status dan Nomor Antrian */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6 text-center">
                            <div className={`text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mx-auto mb-4 ${
                                antrian.status_antrian === 'sedang_diperiksa' ? 'bg-blue-600' :
                                antrian.status_antrian === 'selesai' ? 'bg-green-600' :
                                antrian.pendaftaran.status_pendaftaran === 'sedang_diperiksa' ? 'bg-orange-600' :
                                'bg-gray-600'
                            }`}>
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
                            <div className="mb-4">
                                {getPendaftaranStatusBadge(antrian.pendaftaran.status_pendaftaran)}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Status Pemeriksaan</h3>
                            <p className="text-sm text-gray-600">
                                {antrian.pendaftaran.status_pendaftaran === 'sedang_diperiksa' ? 'Sedang berlangsung' : 'Menunggu'}
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
                                <label className="text-sm font-medium text-gray-700">Keluhan Utama</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {antrian.pendaftaran.keluhan || 'Tidak ada keluhan khusus'}
                                </p>
                            </div>

                            {antrian.pendaftaran.catatan && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Catatan Tambahan</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {antrian.pendaftaran.catatan}
                                    </p>
                                </div>
                            )}

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

                {/* Rekam Medis (jika sudah ada) */}
                {antrian.pendaftaran.rekam_medis && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="w-5 h-5" />
                                Rekam Medis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Diagnosis</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {antrian.pendaftaran.rekam_medis.diagnosis || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tindakan</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {antrian.pendaftaran.rekam_medis.tindakan || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Resep</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {antrian.pendaftaran.rekam_medis.resep || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Catatan</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {antrian.pendaftaran.rekam_medis.catatan || '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Keterangan Antrian */}
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
                            Timeline Pemeriksaan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 rounded-full p-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">Pendaftaran</h4>
                                    <p className="text-sm text-gray-600">
                                        Pasien mendaftar dan mendapatkan nomor antrian #{antrian.nomor_antrian}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {antrian.pendaftaran.created_at_formatted}
                                    </p>
                                </div>
                            </div>

                            {antrian.status_antrian !== 'menunggu' && (
                                <div className="flex items-start gap-4">
                                    <div className={`rounded-full p-2 ${
                                        antrian.status_antrian === 'sedang_diperiksa' ? 'bg-blue-100' :
                                        antrian.status_antrian === 'selesai' ? 'bg-green-100' :
                                        'bg-red-100'
                                    }`}>
                                        {antrian.status_antrian === 'sedang_diperiksa' && <Play className="w-4 h-4 text-blue-600" />}
                                        {antrian.status_antrian === 'selesai' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">
                                            {antrian.status_antrian === 'sedang_diperiksa' && 'Sedang Diperiksa'}
                                            {antrian.status_antrian === 'selesai' && 'Pemeriksaan Selesai'}
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

                            {antrian.pendaftaran.status_pendaftaran === 'sedang_diperiksa' && (
                                <div className="flex items-start gap-4">
                                    <div className="bg-orange-100 rounded-full p-2">
                                        <Stethoscope className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">Sedang Diperiksa</h4>
                                        <p className="text-sm text-gray-600">
                                            Pasien sedang dalam proses pemeriksaan dokter
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Dimulai: {antrian.updated_at_formatted}
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
