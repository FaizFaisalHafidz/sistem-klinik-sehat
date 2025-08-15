import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Edit,
    MapPin,
    Phone,
    Pill,
    Printer,
    Receipt,
    Trash2,
    User
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

interface Obat {
    nama_obat: string;
    jenis_obat: string;
    satuan: string;
}

interface DetailResep {
    id: number;
    obat: Obat;
    jumlah: number;
    harga_satuan: number;
    aturan_pakai: string;
    keterangan: string;
}

interface Resep {
    id: number;
    kode_resep: string;
    tanggal_resep: string;
    tanggal_resep_formatted: string;
    catatan_resep: string;
    status_resep: string;
    total_harga?: number;
    pasien: Pasien;
    dokter: Dokter;
    detail_resep?: DetailResep[];
}

interface Props {
    resep: Resep;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'belum_diambil':
            return <Badge variant="outline" className="border-orange-500 text-orange-700">Belum Diambil</Badge>;
        case 'sudah_diambil':
            return <Badge variant="default" className="bg-green-500">Sudah Diambil</Badge>;
        case 'dibatalkan':
            return <Badge variant="destructive">Dibatalkan</Badge>;
        default:
            return <Badge variant="secondary">Tidak Diketahui</Badge>;
    }
};

const getJenisKelaminBadge = (jenis_kelamin: string) => {
    return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(amount);
};

export default function Show({ resep }: Props) {
    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus resep ini?')) {
            router.delete(route('dokter.resep.destroy', resep.id));
        }
    };

    return (
        <AppLayout>
            <Head title={`Detail Resep ${resep.kode_resep} - ${resep.pasien.nama_lengkap}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('dokter.resep.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Detail Resep
                            </h1>
                            <p className="text-gray-600">
                                {resep.kode_resep} • {resep.pasien.nama_lengkap}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('dokter.resep.cetak', resep.id)}>
                            <Button variant="outline">
                                <Printer className="w-4 h-4 mr-2" />
                                Cetak
                            </Button>
                        </Link>
                        
                        {resep.status_resep === 'belum_diambil' && (
                            <>
                                <Link href={route('dokter.resep.edit', resep.id)}>
                                    <Button className="bg-orange-600 hover:bg-orange-700">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Resep
                                    </Button>
                                </Link>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Hapus
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Status dan Info Resep */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6 text-center">
                            <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                                <Receipt className="w-8 h-8" />
                            </div>
                            <h3 className="font-semibold text-blue-900 mb-1">Kode Resep</h3>
                            <p className="text-sm text-blue-600">{resep.kode_resep}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="mb-4">
                                {getStatusBadge(resep.status_resep)}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Status Resep</h3>
                            <p className="text-sm text-gray-600">Total: {resep.detail_resep?.length || 0} jenis obat</p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-6 text-center">
                            <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                                <DollarSign />
                            </div>
                            <h3 className="font-semibold text-green-900 mb-1">Total Harga</h3>
                            <p className="text-sm text-green-600">{formatCurrency(resep.total_harga || 0)}</p>
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
                                            {resep.pasien.kode_pasien}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                                    <p className="mt-1 text-sm text-gray-900 font-medium">
                                        {resep.pasien.nama_lengkap}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">
                                            {new Date(resep.pasien.tanggal_lahir).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Umur / Jenis Kelamin</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {resep.pasien.umur} tahun / {getJenisKelaminBadge(resep.pasien.jenis_kelamin)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Alamat</label>
                                <div className="mt-1 flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <p className="text-sm text-gray-900">
                                        {resep.pasien.alamat || 'Alamat tidak tersedia'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">
                                        {resep.pasien.telepon || 'Tidak tersedia'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informasi Resep */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="w-5 h-5" />
                                Informasi Resep
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Tanggal Resep</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">
                                    {resep.tanggal_resep_formatted}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Dokter Penulis</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">
                                    {resep.dokter.nama_lengkap}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <div className="mt-1">
                                    {getStatusBadge(resep.status_resep)}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Total Obat</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">
                                    {resep.detail_resep?.length || 0} jenis obat
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Total Harga</label>
                                <p className="mt-1 text-lg text-green-600 font-bold">
                                    {formatCurrency(resep.total_harga || 0)}
                                </p>
                            </div>

                            {resep.catatan_resep && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Catatan Resep</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {resep.catatan_resep}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Detail Obat */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="w-5 h-5" />
                            Detail Obat
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {resep.detail_resep && resep.detail_resep.length > 0 ? (
                                resep.detail_resep.map((detail: DetailResep, index: number) => (
                                    <div key={detail.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                                        #{index + 1}
                                                </span>
                                                <h4 className="font-semibold text-gray-900">
                                                    {detail.obat.nama_obat}
                                                </h4>
                                                <Badge variant="outline" className="text-xs">
                                                    {detail.obat.jenis_obat}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-600">
                                                {formatCurrency(detail.jumlah * detail.harga_satuan)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {detail.jumlah} × {formatCurrency(detail.harga_satuan)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="font-medium text-gray-700">Jumlah:</span>
                                                    <span className="ml-2 text-gray-900">
                                                        {detail.jumlah} {detail.obat.satuan}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Harga Satuan:</span>
                                                    <span className="ml-2 text-gray-900">
                                                        {formatCurrency(detail.harga_satuan)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="font-medium text-gray-700">Aturan Pakai:</span>
                                                    <p className="text-gray-900 bg-blue-50 p-2 rounded mt-1">
                                                        {detail.aturan_pakai}
                                                    </p>
                                                </div>
                                                {detail.keterangan && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">Keterangan:</span>
                                                        <p className="text-gray-900 mt-1">{detail.keterangan}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Pill className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p>Belum ada detail obat untuk resep ini</p>
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900">Total Keseluruhan:</span>
                                <span className="text-2xl font-bold text-green-600">
                                    {formatCurrency(resep.total_harga || 0)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
