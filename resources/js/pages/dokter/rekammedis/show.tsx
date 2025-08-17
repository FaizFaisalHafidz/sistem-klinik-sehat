import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Edit,
    FileText,
    MapPin,
    Phone,
    Printer,
    Stethoscope,
    Thermometer,
    User,
    Weight,
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

interface Dokter {
    nama_lengkap: string;
}

interface Pendaftaran {
    id: number;
    kode_pendaftaran: string;
    tanggal_pendaftaran: string;
    jenis_pemeriksaan?: string;
}

interface TandaVital {
    tekanan_darah?: string;
    suhu?: string;
    berat_badan?: string;
    tinggi_badan?: string;
}

interface RekamMedis {
    id: number;
    kode_rekam_medis: string;
    tanggal_pemeriksaan: string;
    anamnesis: string;
    pemeriksaan_fisik: string;
    diagnosa: string;
    rencana_pengobatan: string;
    catatan_dokter: string;
    tanggal_kontrol: string;
    status_rekam_medis: string;
    tanda_vital: string | TandaVital | null; // Could be JSON string or parsed object
    pasien: Pasien;
    dokter: Dokter;
    pendaftaran: Pendaftaran;
}

interface Props {
    rekamMedis: RekamMedis;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'draft':
            return <Badge variant="outline" className="border-orange-500 text-orange-700">Draft</Badge>;
        case 'selesai':
            return <Badge variant="default" className="bg-green-500">Selesai</Badge>;
        default:
            return <Badge variant="secondary">Tidak Diketahui</Badge>;
    }
};

const getJenisKelaminBadge = (jenis_kelamin: string) => {
    return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
};

export default function Show({ rekamMedis }: Props) {
    // Parse tanda_vital dari JSON string jika diperlukan
    const getTandaVital = (): TandaVital | null => {
        if (!rekamMedis.tanda_vital) return null;
        
        if (typeof rekamMedis.tanda_vital === 'string') {
            try {
                return JSON.parse(rekamMedis.tanda_vital);
            } catch (error) {
                console.error('Error parsing tanda_vital JSON:', error);
                return null;
            }
        }
        
        return rekamMedis.tanda_vital as TandaVital;
    };

    // Fungsi untuk membersihkan unit dari nilai
    const cleanValue = (value: string | undefined): string => {
        if (!value) return '-';
        
        // Hapus unit seperti 'cm', 'kg', dll dan trim whitespace
        return value.replace(/\s*(cm|kg|°C|mmHg)\s*$/i, '').trim() || '-';
    };

    // Fungsi untuk mendapatkan unit dari nilai
    const getUnit = (value: string | undefined, defaultUnit: string): string => {
        if (!value) return defaultUnit;
        
        // Cek apakah ada unit dalam value
        if (value.match(/cm$/i)) return 'cm';
        if (value.match(/kg$/i)) return 'kg';
        if (value.match(/°C$/i)) return '°C';
        if (value.match(/mmHg$/i)) return 'mmHg';
        
        return defaultUnit;
    };

    // Fungsi untuk format tanggal lahir
    const formatTanggalLahir = (tanggalLahir: string): string => {
        try {
            const date = new Date(tanggalLahir);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting tanggal lahir:', error);
            return tanggalLahir;
        }
    };

    // Fungsi untuk menghitung umur yang benar
    const calculateAge = (tanggalLahir: string): number => {
        try {
            const birthDate = new Date(tanggalLahir);
            const today = new Date();
            
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            return Math.max(0, age); // Pastikan umur tidak negatif
        } catch (error) {
            console.error('Error calculating age:', error);
            return rekamMedis.pasien.umur || 0;
        }
    };

    const tandaVital = getTandaVital();
    const umurSebenarnya = calculateAge(rekamMedis.pasien.tanggal_lahir);

    return (
        <AppLayout>
            <Head title={`Detail Rekam Medis - ${rekamMedis.pasien.nama_lengkap}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('dokter.rekam-medis.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Detail Rekam Medis
                            </h1>
                            <p className="text-gray-600">
                                {rekamMedis.pasien.nama_lengkap} • {rekamMedis.kode_rekam_medis}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('dokter.rekam-medis.cetak', rekamMedis.id)}>
                            <Button variant="outline">
                                <Printer className="w-4 h-4 mr-2" />
                                Cetak
                            </Button>
                        </Link>
                        <Link href={route('dokter.rekam-medis.edit', rekamMedis.id)}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Status dan Info Rekam Medis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6 text-center">
                            <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="font-semibold text-blue-900 mb-1">Kode Rekam Medis</h3>
                            <p className="text-sm text-blue-600">{rekamMedis.kode_rekam_medis}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="mb-4">
                                {getStatusBadge(rekamMedis.status_rekam_medis)}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Status Rekam Medis</h3>
                            <p className="text-sm text-gray-600">
                                {new Date(rekamMedis.tanggal_pemeriksaan).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                                <Stethoscope className="w-8 h-8" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Dokter Pemeriksa</h3>
                            <p className="text-sm text-gray-600">{rekamMedis.dokter.nama_lengkap}</p>
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
                                            {rekamMedis.pasien.kode_pasien}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                                    <p className="mt-1 text-sm text-gray-900 font-medium">
                                        {rekamMedis.pasien.nama_lengkap}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">
                                            {formatTanggalLahir(rekamMedis.pasien.tanggal_lahir)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Umur / Jenis Kelamin</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {umurSebenarnya} tahun / {getJenisKelaminBadge(rekamMedis.pasien.jenis_kelamin)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Alamat</label>
                                <div className="mt-1 flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <p className="text-sm text-gray-900">
                                        {rekamMedis.pasien.alamat || 'Alamat tidak tersedia'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">
                                        {rekamMedis.pasien.telepon || 'Tidak tersedia'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tanda Vital */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Thermometer className="w-5 h-5" />
                                Tanda Vital
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tandaVital ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                        <div className="text-2xl font-bold text-red-600 mb-1">
                                            {cleanValue(tandaVital.tekanan_darah)}
                                        </div>
                                        <div className="text-sm text-red-700">Tekanan Darah</div>
                                        <div className="text-xs text-gray-500">{getUnit(tandaVital.tekanan_darah, 'mmHg')}</div>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600 mb-1">
                                            {cleanValue(tandaVital.suhu)}
                                        </div>
                                        <div className="text-sm text-orange-700">Suhu Tubuh</div>
                                        <div className="text-xs text-gray-500">{getUnit(tandaVital.suhu, '°C')}</div>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600 mb-1">
                                            {cleanValue(tandaVital.berat_badan)}
                                        </div>
                                        <div className="text-sm text-blue-700">Berat Badan</div>
                                        <div className="text-xs text-gray-500">{getUnit(tandaVital.berat_badan, 'kg')}</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 mb-1">
                                            {cleanValue(tandaVital.tinggi_badan)}
                                        </div>
                                        <div className="text-sm text-green-700">Tinggi Badan</div>
                                        <div className="text-xs text-gray-500">{getUnit(tandaVital.tinggi_badan, 'cm')}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Weight className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500">Tanda vital tidak direkam</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Rekam Medis Detail */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="w-5 h-5" />
                            Detail Pemeriksaan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Anamnesis</label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                            {rekamMedis.anamnesis || 'Tidak ada anamnesis'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Pemeriksaan Fisik</label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                            {rekamMedis.pemeriksaan_fisik || 'Tidak ada pemeriksaan fisik'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Diagnosis</label>
                                    <div className="mt-1 p-3 bg-blue-50 rounded-md border border-blue-200">
                                        <p className="text-sm text-blue-900 font-medium">
                                            {rekamMedis.diagnosa}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Rencana Pengobatan</label>
                                    <div className="mt-1 p-3 bg-green-50 rounded-md border border-green-200">
                                        <p className="text-sm text-green-900 whitespace-pre-wrap">
                                            {rekamMedis.rencana_pengobatan || 'Tidak ada rencana pengobatan'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Catatan Dokter</label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                            {rekamMedis.catatan_dokter || 'Tidak ada catatan khusus'}
                                        </p>
                                    </div>
                                </div>
                                {rekamMedis.tanggal_kontrol && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Tanggal Kontrol</label>
                                        <div className="mt-1 flex items-center gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                                            <Calendar className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm text-yellow-800 font-medium">
                                                {new Date(rekamMedis.tanggal_kontrol).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                )}
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
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kode Pendaftaran</label>
                                <div className="mt-1">
                                    <Badge variant="outline" className="text-sm">
                                        {rekamMedis.pendaftaran.kode_pendaftaran}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Tanggal Pendaftaran</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {new Date(rekamMedis.pendaftaran.tanggal_pendaftaran).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Jenis Pemeriksaan</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {rekamMedis.pendaftaran.jenis_pemeriksaan || 'Tidak ditentukan'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
