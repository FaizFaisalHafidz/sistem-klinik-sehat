import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    MapPin,
    Phone,
    Stethoscope,
    User,
    UserCheck
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

interface DibuatOleh {
    nama_lengkap: string;
}

interface Dokter {
    nama_lengkap: string;
}

interface RekamMedis {
    id: number;
    keluhan_utama: string;
    riwayat_penyakit: string;
    pemeriksaan_fisik: string;
    diagnosis: string;
    tindakan: string;
    resep: string;
    catatan: string;
    anjuran: string;
    tanggal_pemeriksaan: string;
    dokter: Dokter;
    biaya_konsultasi: number;
    biaya_obat: number;
    total_biaya: number;
    biaya_konsultasi_formatted: string;
    biaya_obat_formatted: string;
    total_biaya_formatted: string;
}

interface Antrian {
    id: number;
    nomor_antrian: number;
    status_antrian: string;
}

interface Pendaftaran {
    id: number;
    kode_pendaftaran: string;
    tanggal_pendaftaran: string;
    tanggal_pendaftaran_formatted: string;
    jenis_pemeriksaan: string;
    keluhan_utama: string;
    catatan: string;
    status_pendaftaran: string;
    created_at: string;
    created_at_formatted: string;
    pasien: Pasien;
    dibuat_oleh: DibuatOleh | null;
    rekamMedis: RekamMedis | null;
    antrian: Antrian | null;
}

interface Props {
    pendaftaran: Pendaftaran;
}

const getStatusBadge = (status: string) => {
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

export default function Show({ pendaftaran }: Props) {
    return (
        <AppLayout>
            <Head title={`Detail Pemeriksaan - ${pendaftaran.pasien.nama_lengkap}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('dokter.pemeriksaan.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Detail Pemeriksaan
                            </h1>
                            <p className="text-gray-600">
                                {pendaftaran.pasien.nama_lengkap} • {pendaftaran.created_at_formatted}
                            </p>
                        </div>
                    </div>
                    {/* <div className="flex items-center gap-2">
                        {pendaftaran.rekamMedis && (
                            <Link href={route('dokter.pemeriksaan.edit', pendaftaran.id)}>
                                <Button className="bg-orange-600 hover:bg-orange-700">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Rekam Medis
                                </Button>
                            </Link>
                        )}
                        
                        {!pendaftaran.rekamMedis && (
                            <Link href={route('dokter.pemeriksaan.create', { pendaftaran_id: pendaftaran.id })}>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Buat Rekam Medis
                                </Button>
                            </Link>
                        )}
                    </div> */}
                </div>

                {/* Status dan Info Pendaftaran */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6 text-center">
                            <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="font-semibold text-blue-900 mb-1">Kode Pendaftaran</h3>
                            <p className="text-sm text-blue-600">{pendaftaran.kode_pendaftaran}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="mb-4">
                                {getStatusBadge(pendaftaran.status_pendaftaran)}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Status Pendaftaran</h3>
                            {/* <p className="text-sm text-gray-600">Jenis: {pendaftaran.jenis_pemeriksaan || 'Tidak ditentukan'}</p> */}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="mb-4">
                                {pendaftaran.antrian ? (
                                    <div className="bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mx-auto">
                                        #{pendaftaran.antrian.nomor_antrian}
                                    </div>
                                ) : (
                                    <div className="bg-gray-400 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mx-auto">
                                        -
                                    </div>
                                )}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Nomor Antrian</h3>
                            <p className="text-sm text-gray-600">
                                {pendaftaran.antrian ? 'Antrian aktif' : 'Tidak ada antrian'}
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
                                            {pendaftaran.pasien.kode_pasien}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                                    <p className="mt-1 text-sm text-gray-900 font-medium">
                                        {pendaftaran.pasien.nama_lengkap}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">
                                            {new Date(pendaftaran.pasien.tanggal_lahir).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Umur / Jenis Kelamin</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftaran.pasien.umur || 'Tidak diketahui'} tahun / {getJenisKelaminBadge(pendaftaran.pasien.jenis_kelamin)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Alamat</label>
                                <div className="mt-1 flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <p className="text-sm text-gray-900">
                                        {pendaftaran.pasien.alamat || 'Alamat tidak tersedia'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">
                                        {pendaftaran.pasien.telepon || 'Tidak tersedia'}
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
                            {/* <div>
                                <label className="text-sm font-medium text-gray-700">Jenis Pemeriksaan</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">
                                    {pendaftaran.jenis_pemeriksaan || 'Tidak ditentukan'}
                                </p>
                            </div> */}

                            <div>
                                <label className="text-sm font-medium text-gray-700">Keluhan Utama</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {pendaftaran.keluhan_utama || 'Tidak ada keluhan khusus'}
                                </p>
                            </div>

                            {pendaftaran.catatan && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Catatan Tambahan</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftaran.catatan}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-700">Didaftarkan oleh</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">
                                        {pendaftaran.dibuat_oleh?.nama_lengkap || 'Tidak diketahui'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Waktu Pendaftaran</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">
                                        {pendaftaran.created_at_formatted || 'Tidak tersedia'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Rekam Medis (jika sudah ada) */}
                {pendaftaran.rekamMedis && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="w-5 h-5" />
                                Rekam Medis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Keluhan Utama</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {pendaftaran.rekamMedis.keluhan_utama || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Riwayat Penyakit</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {pendaftaran.rekamMedis.riwayat_penyakit || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Pemeriksaan Fisik</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {pendaftaran.rekamMedis.pemeriksaan_fisik || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Diagnosis</label>
                                        <p className="mt-1 text-sm text-gray-900 font-medium">
                                            {pendaftaran.rekamMedis.diagnosis || '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Tindakan</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {pendaftaran.rekamMedis.tindakan || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Resep</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {pendaftaran.rekamMedis.resep || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Catatan</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {pendaftaran.rekamMedis.catatan || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Anjuran</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {pendaftaran.rekamMedis.anjuran || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4" />
                                        <span>Dokter: {pendaftaran.rekamMedis.dokter.nama_lengkap}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Tanggal: {pendaftaran.rekamMedis.tanggal_pemeriksaan}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Rincian Biaya */}
                {pendaftaran.rekamMedis && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Rincian Biaya
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Biaya Konsultasi */}
                                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                    <div>
                                        <p className="font-medium text-gray-900">Biaya Pemeriksaan</p>
                                        <p className="text-sm text-gray-600">
                                            oleh {pendaftaran.rekamMedis.dokter.nama_lengkap}
                                        </p>
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {pendaftaran.rekamMedis.biaya_konsultasi_formatted}
                                    </span>
                                </div>

                                {/* Biaya Obat */}
                                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                    <div>
                                        <p className="font-medium text-gray-900">Biaya Obat</p>
                                        <p className="text-sm text-gray-600">Total biaya semua obat</p>
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {pendaftaran.rekamMedis.biaya_obat_formatted}
                                    </span>
                                </div>

                                {/* Total Biaya */}
                                <div className="flex justify-between items-center py-3 pt-4 border-t-2 border-gray-300 bg-blue-50 px-4 rounded-lg">
                                    <div>
                                        <p className="text-lg font-bold text-blue-900">Total Biaya</p>
                                        <p className="text-sm text-blue-700">Biaya keseluruhan pemeriksaan</p>
                                    </div>
                                    <span className="text-xl font-bold text-blue-900">
                                        {pendaftaran.rekamMedis.total_biaya_formatted}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Timeline Pemeriksaan */}
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
                                        Pasien mendaftar untuk pemeriksaan {pendaftaran.jenis_pemeriksaan}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {pendaftaran.created_at_formatted}
                                    </p>
                                </div>
                            </div>

                            {pendaftaran.status_pendaftaran === 'sedang_diperiksa' && (
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
                                            Status aktif
                                        </p>
                                    </div>
                                </div>
                            )}

                            {pendaftaran.rekamMedis && (
                                <div className="flex items-start gap-4">
                                    <div className="bg-green-100 rounded-full p-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">Rekam Medis Dibuat</h4>
                                        <p className="text-sm text-gray-600">
                                            Rekam medis telah dibuat oleh {pendaftaran.rekamMedis.dokter.nama_lengkap}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {pendaftaran.rekamMedis.tanggal_pemeriksaan}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {pendaftaran.status_pendaftaran === 'selesai' && (
                                <div className="flex items-start gap-4">
                                    <div className="bg-green-100 rounded-full p-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">Pemeriksaan Selesai</h4>
                                        <p className="text-sm text-gray-600">
                                            Pemeriksaan telah selesai dilakukan
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
