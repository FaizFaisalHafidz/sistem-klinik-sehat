import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    FileText,
    Heart,
    MapPin,
    Phone,
    Pill,
    Printer,
    Stethoscope,
    Thermometer,
    User,
    UserCheck,
    Weight
} from 'lucide-react';

interface TandaVital {
    tekanan_darah?: string;
    suhu?: string;
    berat_badan?: string;
    tinggi_badan?: string;
    nadi?: string;
}

interface Obat {
    id: number;
    nama_obat: string;
    satuan: string;
}

interface DetailResep {
    id: number;
    obat_id: number;
    obat: Obat;
    jumlah: number;
    dosis: string;
    aturan_minum: string;
    harga_satuan: number;
}

interface Resep {
    id: number;
    detailResep: DetailResep[];
}

interface Pasien {
    id: number;
    nama_lengkap: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    telepon?: string;
    alamat?: string;
}

interface Dokter {
    id: number;
    nama_lengkap: string;
    spesialisasi?: string;
    telepon?: string;
}

interface Pendaftaran {
    id: number;
    kode_pendaftaran: string;
    jenis_pemeriksaan: string;
    status_pendaftaran: string;
}

interface RekamMedis {
    id: number;
    kode_rekam_medis: string;
    tanggal_pemeriksaan: string;
    tanda_vital: TandaVital;
    anamnesis: string;
    pemeriksaan_fisik: string;
    diagnosa: string;
    rencana_pengobatan: string;
    catatan_dokter?: string;
    tanggal_kontrol?: string;
    status_rekam_medis: string;
    biaya_konsultasi: number;
    biaya_obat: number;
    total_biaya: number;
    pasien: Pasien;
    dokter: Dokter;
    pendaftaran: Pendaftaran;
    resep: any; // Support Laravel Collection structure
}

interface Props {
    rekamMedis?: RekamMedis;
    pendaftaran?: any;
    pasien?: any;
    antrian?: any;
    jenisLaporan: 'rekam_medis' | 'pendaftaran' | 'pasien' | 'antrian';
}

export default function Show({ rekamMedis, pendaftaran, pasien, antrian, jenisLaporan }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handlePrint = () => {
        // Determine the current data ID based on the report type
        let currentId;
        if (jenisLaporan === 'rekam_medis' && rekamMedis) {
            currentId = rekamMedis.id;
        } else if (jenisLaporan === 'pendaftaran' && pendaftaran) {
            currentId = pendaftaran.id;
        } else if (jenisLaporan === 'pasien' && pasien) {
            currentId = pasien.id;
        } else if (jenisLaporan === 'antrian' && antrian) {
            currentId = antrian.id;
        }

        if (currentId) {
            // Navigate to print page
            window.open(
                route('pendaftaran.laporan.cetak', { 
                    id: currentId,
                    jenis_laporan: jenisLaporan 
                }),
                '_blank'
            );
        }
    };

    if (jenisLaporan === 'rekam_medis' && rekamMedis) {
        return (
            <AppLayout>
                <Head title={`Detail Rekam Medis - ${rekamMedis.kode_rekam_medis}`} />
                
                <div className="space-y-6 p-6 max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link href={route('pendaftaran.laporan.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Detail Rekam Medis</h1>
                                <p className="text-gray-600">{rekamMedis.kode_rekam_medis}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={rekamMedis.status_rekam_medis === 'selesai' ? 'default' : 'secondary'}
                            >
                                {rekamMedis.status_rekam_medis === 'selesai' ? 'Selesai' : 'Draft'}
                            </Badge>
                            <Button onClick={handlePrint} variant="outline">
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Patient Information */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Informasi Pasien
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                                    <p className="text-lg font-semibold text-gray-900">{rekamMedis.pasien.nama_lengkap}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
                                        <p className="text-gray-900 capitalize">{rekamMedis.pasien.jenis_kelamin}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Umur</label>
                                        <p className="text-gray-900">{calculateAge(rekamMedis.pasien.tanggal_lahir)} tahun</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
                                    <p className="text-gray-900">{formatDate(rekamMedis.pasien.tanggal_lahir)}</p>
                                </div>
                                {rekamMedis.pasien.telepon && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-900">{rekamMedis.pasien.telepon}</span>
                                    </div>
                                )}
                                {rekamMedis.pasien.alamat && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                                        <span className="text-gray-900 text-sm">{rekamMedis.pasien.alamat}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Medical Record Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Informasi Pemeriksaan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Tanggal Pemeriksaan</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <p className="text-gray-900">{formatDateTime(rekamMedis.tanggal_pemeriksaan)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Dokter Pemeriksa</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <UserCheck className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-gray-900 font-medium">{rekamMedis.dokter.nama_lengkap}</p>
                                                {rekamMedis.dokter.spesialisasi && (
                                                    <p className="text-xs text-gray-500">{rekamMedis.dokter.spesialisasi}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Kode Pendaftaran</label>
                                        <p className="text-gray-900">{rekamMedis.pendaftaran.kode_pendaftaran}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Jenis Pemeriksaan</label>
                                        <p className="text-gray-900">{rekamMedis.pendaftaran.jenis_pemeriksaan}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Vital Signs */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-red-500" />
                                        Tanda Vital
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {rekamMedis.tanda_vital?.tekanan_darah && (
                                            <div className="text-center p-3 bg-red-50 rounded-lg">
                                                <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                                                <p className="text-sm text-gray-600">Tekanan Darah</p>
                                                <p className="font-semibold text-red-600">{rekamMedis.tanda_vital.tekanan_darah} mmHg</p>
                                            </div>
                                        )}
                                        {rekamMedis.tanda_vital?.suhu && (
                                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                                <Thermometer className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                                                <p className="text-sm text-gray-600">Suhu</p>
                                                <p className="font-semibold text-yellow-600">{rekamMedis.tanda_vital.suhu}°C</p>
                                            </div>
                                        )}
                                        {rekamMedis.tanda_vital?.berat_badan && (
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <Weight className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                                                <p className="text-sm text-gray-600">Berat Badan</p>
                                                <p className="font-semibold text-blue-600">{rekamMedis.tanda_vital.berat_badan} kg</p>
                                            </div>
                                        )}
                                        {rekamMedis.tanda_vital?.tinggi_badan && (
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <Stethoscope className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                                <p className="text-sm text-gray-600">Tinggi Badan</p>
                                                <p className="font-semibold text-green-600">{rekamMedis.tanda_vital.tinggi_badan} cm</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Clinical Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Anamnesis</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 whitespace-pre-wrap">{rekamMedis.anamnesis}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Pemeriksaan Fisik</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 whitespace-pre-wrap">{rekamMedis.pemeriksaan_fisik}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Diagnosa</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 font-medium text-lg">{rekamMedis.diagnosa}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Rencana Pengobatan</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 whitespace-pre-wrap">{rekamMedis.rencana_pengobatan}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Prescription */}
                            {rekamMedis.resep && rekamMedis.resep.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Pill className="w-5 h-5 text-blue-500" />
                                            Resep Obat
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {rekamMedis.resep.map((resep: any, index: number) => (
                                            <div key={resep.id} className="space-y-3">
                                                {index > 0 && <div className="border-t pt-4" />}
                                                <div className="space-y-2">
                                                    {resep.detailResep && resep.detailResep.length > 0 && resep.detailResep.map((detail: any) => (
                                                        <div key={detail.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-gray-900">{detail.obat.nama_obat}</h4>
                                                                <p className="text-sm text-gray-600">Dosis: {detail.dosis}</p>
                                                                <p className="text-sm text-gray-600">Aturan: {detail.aturan_minum}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    Jumlah: {detail.jumlah} {detail.obat.satuan}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm text-gray-600">Harga Satuan</p>
                                                                <p className="font-semibold text-gray-900">
                                                                    {formatCurrency(detail.harga_satuan)}
                                                                </p>
                                                                <p className="text-xs text-gray-500">Total: {formatCurrency(detail.harga_satuan * detail.jumlah)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Cost Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan Biaya</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-gray-600">Biaya Konsultasi</span>
                                            <span className="font-semibold">{formatCurrency(rekamMedis.biaya_konsultasi)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-gray-600">Biaya Obat</span>
                                            <span className="font-semibold">{formatCurrency(rekamMedis.biaya_obat)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-4 border border-blue-200">
                                            <span className="text-lg font-semibold text-blue-800">Total Biaya</span>
                                            <span className="text-xl font-bold text-blue-800">{formatCurrency(rekamMedis.total_biaya)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            {(rekamMedis.catatan_dokter || rekamMedis.tanggal_kontrol) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informasi Tambahan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {rekamMedis.catatan_dokter && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Catatan Dokter</label>
                                                <p className="text-gray-700 mt-1 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                                                    {rekamMedis.catatan_dokter}
                                                </p>
                                            </div>
                                        )}
                                        {rekamMedis.tanggal_kontrol && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Tanggal Kontrol</label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <p className="text-gray-900">{formatDate(rekamMedis.tanggal_kontrol)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Detail Pendaftaran
    if (jenisLaporan === 'pendaftaran' && pendaftaran) {
        return (
            <AppLayout>
                <Head title={`Detail Pendaftaran - ${pendaftaran.kode_pendaftaran}`} />
                
                <div className="space-y-6 p-6 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link href={route('pendaftaran.laporan.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Detail Pendaftaran</h1>
                                <p className="text-gray-600">{pendaftaran.kode_pendaftaran}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={pendaftaran.status_pendaftaran === 'selesai' ? 'default' : 'secondary'}
                            >
                                {pendaftaran.status_pendaftaran === 'selesai' ? 'Selesai' : 
                                 pendaftaran.status_pendaftaran === 'sedang_diperiksa' ? 'Sedang Diperiksa' : 'Aktif'}
                            </Badge>
                            <Button onClick={handlePrint} variant="outline">
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Patient Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Informasi Pasien
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                                    <p className="text-lg font-semibold text-gray-900">{pendaftaran.pasien.nama_lengkap}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
                                        <p className="text-gray-900 capitalize">{pendaftaran.pasien.jenis_kelamin}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Umur</label>
                                        <p className="text-gray-900">{calculateAge(pendaftaran.pasien.tanggal_lahir)} tahun</p>
                                    </div>
                                </div>
                                {pendaftaran.pasien.telepon && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-900">{pendaftaran.pasien.telepon}</span>
                                    </div>
                                )}
                                {pendaftaran.pasien.alamat && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                                        <span className="text-gray-900 text-sm">{pendaftaran.pasien.alamat}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Registration Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Informasi Pendaftaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tanggal Pendaftaran</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <p className="text-gray-900">{formatDateTime(pendaftaran.created_at)}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Jenis Pemeriksaan</label>
                                    <p className="text-gray-900">{pendaftaran.jenis_pemeriksaan}</p>
                                </div>
                                {pendaftaran.dokter && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Dokter</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <UserCheck className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-gray-900 font-medium">{pendaftaran.dokter.nama_lengkap}</p>
                                                {pendaftaran.dokter.spesialisasi && (
                                                    <p className="text-xs text-gray-500">{pendaftaran.dokter.spesialisasi}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {pendaftaran.keluhan_utama && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Keluhan Utama</label>
                                        <p className="text-gray-700 mt-1 p-3 bg-gray-50 rounded-lg">{pendaftaran.keluhan_utama}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Antrian Information */}
                        {pendaftaran.antrian && (
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Informasi Antrian
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Nomor Antrian</label>
                                        <p className="text-xl font-bold text-blue-600">#{pendaftaran.antrian.nomor_antrian}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Status Antrian</label>
                                        <Badge className="mt-1">
                                            {pendaftaran.antrian.status_antrian === 'selesai' ? 'Selesai' :
                                             pendaftaran.antrian.status_antrian === 'dipanggil' ? 'Dipanggil' :
                                             pendaftaran.antrian.status_antrian === 'sedang_diperiksa' ? 'Sedang Diperiksa' : 'Menunggu'}
                                        </Badge>
                                    </div>
                                    {pendaftaran.antrian.waktu_dipanggil && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Waktu Dipanggil</label>
                                            <p className="text-gray-900">{formatDateTime(pendaftaran.antrian.waktu_dipanggil)}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Detail Pasien
    if (jenisLaporan === 'pasien' && pasien) {
        return (
            <AppLayout>
                <Head title={`Detail Pasien - ${pasien.nama_lengkap}`} />
                
                <div className="space-y-6 p-6 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link href={route('pendaftaran.laporan.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Detail Pasien</h1>
                                <p className="text-gray-600">{pasien.kode_pasien}</p>
                            </div>
                        </div>
                        <Button onClick={handlePrint} variant="outline">
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                    </div>

                    {/* Patient Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Informasi Pasien
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                                    <p className="text-lg font-semibold text-gray-900">{pasien.nama_lengkap}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Kode Pasien</label>
                                    <p className="text-gray-900">{pasien.kode_pasien}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
                                        <p className="text-gray-900 capitalize">{pasien.jenis_kelamin}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Umur</label>
                                        <p className="text-gray-900">{calculateAge(pasien.tanggal_lahir)} tahun</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
                                    <p className="text-gray-900">{formatDate(pasien.tanggal_lahir)}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {pasien.telepon && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-900">{pasien.telepon}</span>
                                    </div>
                                )}
                                {pasien.alamat && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                                        <span className="text-gray-900 text-sm">{pasien.alamat}</span>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Terdaftar Sejak</label>
                                    <p className="text-gray-900">{formatDate(pasien.created_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Records */}
                    {pasien.rekamMedis && Array.isArray(pasien.rekamMedis) && pasien.rekamMedis.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Rekam Medis Terakhir</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {pasien.rekamMedis.slice(0, 3).map((rekam: any) => (
                                        <div key={rekam.id} className="p-3 border rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">{rekam.diagnosa}</p>
                                                    <p className="text-sm text-gray-600">{formatDate(rekam.created_at)}</p>
                                                </div>
                                                <p className="text-sm font-semibold text-green-600">
                                                    {formatCurrency(rekam.total_biaya)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </AppLayout>
        );
    }

    // Detail Antrian
    if (jenisLaporan === 'antrian' && antrian) {
        return (
            <AppLayout>
                <Head title={`Detail Antrian - #${antrian.nomor_antrian}`} />
                
                <div className="space-y-6 p-6 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link href={route('pendaftaran.laporan.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Detail Antrian</h1>
                                <p className="text-gray-600">#{antrian.nomor_antrian}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={antrian.status_antrian === 'selesai' ? 'default' : 'secondary'}
                            >
                                {antrian.status_antrian === 'selesai' ? 'Selesai' :
                                 antrian.status_antrian === 'dipanggil' ? 'Dipanggil' :
                                 antrian.status_antrian === 'sedang_diperiksa' ? 'Sedang Diperiksa' : 'Menunggu'}
                            </Badge>
                            <Button onClick={handlePrint} variant="outline">
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Queue Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Informasi Antrian
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nomor Antrian</label>
                                    <p className="text-3xl font-bold text-blue-600">#{antrian.nomor_antrian}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tanggal Antrian</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <p className="text-gray-900">{formatDate(antrian.tanggal_antrian)}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Waktu Pendaftaran</label>
                                    <p className="text-gray-900">{formatDateTime(antrian.waktu_pendaftaran)}</p>
                                </div>
                                {antrian.waktu_dipanggil && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Waktu Dipanggil</label>
                                        <p className="text-gray-900">{formatDateTime(antrian.waktu_dipanggil)}</p>
                                    </div>
                                )}
                                {antrian.estimasi_waktu && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Estimasi Selesai</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <p className="text-gray-900">{formatDateTime(antrian.estimasi_waktu)}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Patient Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Informasi Pasien
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                                    <p className="text-lg font-semibold text-gray-900">{antrian.pendaftaran.pasien.nama_lengkap}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
                                        <p className="text-gray-900 capitalize">{antrian.pendaftaran.pasien.jenis_kelamin}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Umur</label>
                                        <p className="text-gray-900">{calculateAge(antrian.pendaftaran.pasien.tanggal_lahir)} tahun</p>
                                    </div>
                                </div>
                                {antrian.pendaftaran.pasien.telepon && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-900">{antrian.pendaftaran.pasien.telepon}</span>
                                    </div>
                                )}
                                {antrian.pendaftaran.dokter && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Dokter</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <UserCheck className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-gray-900 font-medium">{antrian.pendaftaran.dokter.nama_lengkap}</p>
                                                {antrian.pendaftaran.dokter.spesialisasi && (
                                                    <p className="text-xs text-gray-500">{antrian.pendaftaran.dokter.spesialisasi}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Placeholder untuk jenis laporan lainnya
    return (
        <AppLayout>
            <Head title="Detail Laporan" />
            
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <Link href={route('pendaftaran.laporan.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Detail {jenisLaporan === 'pendaftaran' ? 'Pendaftaran' : 
                               jenisLaporan === 'pasien' ? 'Pasien' : 
                               jenisLaporan === 'antrian' ? 'Antrian' : 'Laporan'}
                    </h1>
                </div>
                
                <Card>
                    <CardContent className="p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Detail {jenisLaporan} sedang dalam pengembangan
                        </h3>
                        <p className="text-gray-600">
                            Halaman detail untuk jenis laporan ini akan segera tersedia.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
