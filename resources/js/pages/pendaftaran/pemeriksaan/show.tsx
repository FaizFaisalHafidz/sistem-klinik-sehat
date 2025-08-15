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
    Printer,
    Stethoscope,
    User,
    X,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

interface Pasien {
    id: number;
    kode_pasien: string;
    nama_lengkap: string;
    tanggal_lahir: string;
    tanggal_lahir_formatted: string;
    jenis_kelamin: string;
    telepon: string;
    alamat: string;
    umur: number;
}

interface Antrian {
    id: number;
    nomor_antrian: number;
    status_antrian: string;
    estimasi_waktu: string;
    estimasi_waktu_formatted: string;
    keterangan: string;
}

interface User {
    nama_lengkap: string;
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
    antrian: Antrian | null;
    user: User;
}

interface Props {
    pendaftaran: Pendaftaran;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'terdaftar':
            return <Badge variant="default" className="bg-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Terdaftar</Badge>;
        case 'selesai':
            return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Selesai</Badge>;
        case 'dibatalkan':
            return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Dibatalkan</Badge>;
        default:
            return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Tidak Diketahui</Badge>;
    }
};

const getAntrianStatusBadge = (status: string) => {
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
            return <Badge variant="secondary">-</Badge>;
    }
};

const formatEstimasiWaktu = (estimasiWaktu: string | null): string => {
    if (!estimasiWaktu) return '-';
    
    try {
        // If it's already in HH:mm format, return as is
        if (estimasiWaktu.match(/^\d{2}:\d{2}$/)) {
            return estimasiWaktu;
        }
        
        // If it's a full datetime string, extract time
        const date = new Date(estimasiWaktu);
        if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        }
        
        return estimasiWaktu;
    } catch (error) {
        return '-';
    }
};

export default function Show({ pendaftaran }: Props) {
    const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

    const handleCancel = () => {
        if (confirm('Apakah Anda yakin ingin membatalkan pendaftaran pemeriksaan ini?')) {
            router.delete(route('pendaftaran.pemeriksaan.cancel', pendaftaran.id), {
                onSuccess: () => {
                    setIsConfirmingCancel(false);
                },
            });
        }
    };

    const handlePrint = () => {
        window.open(route('pendaftaran.pemeriksaan.print-ticket', pendaftaran.id), '_blank');
    };

    return (
        <AppLayout>
            <Head title={`Detail Pendaftaran - ${pendaftaran.pasien.nama_lengkap}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('pendaftaran.pemeriksaan.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Detail Pendaftaran Pemeriksaan</h1>
                            <p className="text-gray-600">Kode: {pendaftaran.kode_pendaftaran}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handlePrint} variant="outline">
                            <Printer className="w-4 h-4 mr-2" />
                            Cetak Tiket
                        </Button>
                        {pendaftaran.status_pendaftaran === 'terdaftar' && (
                            <Button 
                                onClick={handleCancel}
                                variant="destructive"
                                disabled={isConfirmingCancel}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Batalkan
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Patient Information Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Informasi Pasien
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <User className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900">{pendaftaran.pasien.nama_lengkap}</h3>
                                    <Badge variant="outline" className="mt-2">{pendaftaran.pasien.kode_pasien}</Badge>
                                </div>
                                
                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <div className="text-sm">
                                            <p className="font-medium">Tanggal Lahir</p>
                                            <p className="text-gray-600">{pendaftaran.pasien.tanggal_lahir_formatted} ({pendaftaran.pasien.umur} tahun)</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <div className="text-sm">
                                            <p className="font-medium">Jenis Kelamin</p>
                                            <p className="text-gray-600">{pendaftaran.pasien.jenis_kelamin}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <div className="text-sm">
                                            <p className="font-medium">Telepon</p>
                                            <p className="text-gray-600">{pendaftaran.pasien.telepon}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-medium">Alamat</p>
                                            <p className="text-gray-600 text-xs leading-relaxed">{pendaftaran.pasien.alamat}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registration Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Registration Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Status Pendaftaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">
                                            {pendaftaran.status_pendaftaran === 'terdaftar' ? 'Pendaftaran Berhasil' :
                                             pendaftaran.status_pendaftaran === 'selesai' ? 'Pemeriksaan Selesai' :
                                             pendaftaran.status_pendaftaran === 'dibatalkan' ? 'Pendaftaran Dibatalkan' :
                                             'Status Tidak Diketahui'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {pendaftaran.status_pendaftaran === 'terdaftar' ? 'Pasien telah terdaftar untuk pemeriksaan' :
                                             pendaftaran.status_pendaftaran === 'selesai' ? 'Pemeriksaan telah selesai dilakukan' :
                                             pendaftaran.status_pendaftaran === 'dibatalkan' ? 'Pendaftaran telah dibatalkan' :
                                             'Status pendaftaran tidak diketahui'}
                                        </p>
                                    </div>
                                    {getStatusBadge(pendaftaran.status_pendaftaran)}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Queue Information Card */}
                        {pendaftaran.antrian && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Informasi Antrian
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white p-6">
                                        <div className="text-center">
                                            <div className="text-4xl font-bold mb-2">#{pendaftaran.antrian.nomor_antrian}</div>
                                            <div className="text-blue-100 mb-4">Nomor Antrian Anda</div>
                                            <div className="flex items-center justify-center gap-4 text-sm">
                                                <div>
                                                    <p className="text-blue-100">Estimasi Waktu</p>
                                                    <p className="font-semibold">{formatEstimasiWaktu(pendaftaran.antrian.estimasi_waktu)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-blue-100">Status</p>
                                                    <div className="mt-1">
                                                        {getAntrianStatusBadge(pendaftaran.antrian.status_antrian)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {pendaftaran.antrian.keterangan && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                <strong>Keterangan:</strong> {pendaftaran.antrian.keterangan}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Examination Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5" />
                                    Detail Pemeriksaan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Tanggal Pendaftaran</Label>
                                        <p className="text-gray-900">{pendaftaran.tanggal_pendaftaran_formatted}</p>
                                    </div>
                                    
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Jam Pendaftaran</Label>
                                        <p className="text-gray-900">{pendaftaran.created_at_formatted}</p>
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <Label className="text-sm font-medium text-gray-500">Jenis Pemeriksaan</Label>
                                        <p className="text-gray-900">{pendaftaran.jenis_pemeriksaan}</p>
                                    </div>
                                </div>

                                {pendaftaran.keluhan && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Keluhan Utama</Label>
                                        <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-gray-900 text-sm">{pendaftaran.keluhan}</p>
                                        </div>
                                    </div>
                                )}

                                {pendaftaran.catatan && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Catatan Tambahan</Label>
                                        <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-gray-900 text-sm">{pendaftaran.catatan}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <Label className="text-sm font-medium text-gray-500">Petugas Pendaftaran</Label>
                                    <p className="text-gray-900">{pendaftaran.user.nama_lengkap}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function Label({ className, children, ...props }: { className?: string; children: React.ReactNode; [key: string]: any }) {
    return (
        <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`} {...props}>
            {children}
        </label>
    );
}
