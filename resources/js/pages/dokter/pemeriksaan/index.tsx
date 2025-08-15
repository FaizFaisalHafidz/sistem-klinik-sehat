import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Plus,
    RefreshCw,
    Search,
    Stethoscope,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface RekamMedis {
    id: number;
    diagnosis: string;
    tindakan: string;
    resep: string;
    catatan: string;
    tanggal_pemeriksaan: string;
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
    keluhan: string;
    catatan: string;
    status_pendaftaran: string;
    created_at: string;
    created_at_formatted: string;
    pasien: Pasien;
    dibuatOleh: DibuatOleh | null;
    rekamMedis: RekamMedis | null;
    antrian: Antrian | null;
}

interface Props {
    pendaftaran: {
        data: Pendaftaran[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_pemeriksaan_hari_ini: number;
        total_selesai_hari_ini: number;
        total_rekam_medis_hari_ini: number;
        rata_rata_waktu_pemeriksaan: string;
    };
    filters: {
        search?: string;
        tanggal?: string;
    };
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

export default function Index({ pendaftaran, stats, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [tanggalFilter, setTanggalFilter] = useState(filters.tanggal || '');

    const handleSearch = () => {
        router.get(route('dokter.pemeriksaan.index'), {
            search: searchTerm,
            tanggal: tanggalFilter,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setTanggalFilter('');
        router.get(route('dokter.pemeriksaan.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchTerm !== filters.search || tanggalFilter !== filters.tanggal) {
                handleSearch();
            }
        }, 500);

        return () => clearTimeout(delayedSearch);
    }, [searchTerm, tanggalFilter]);

    return (
        <AppLayout>
            <Head title="Pemeriksaan Pasien - Dokter" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pemeriksaan Pasien</h1>
                        <p className="text-gray-600">Kelola pemeriksaan dan rekam medis pasien</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={() => window.location.reload()}
                            variant="outline"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600">Sedang Diperiksa</p>
                                    <p className="text-2xl font-bold text-orange-900">{stats.total_pemeriksaan_hari_ini}</p>
                                </div>
                                <Stethoscope className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Selesai Hari Ini</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.total_selesai_hari_ini}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Rekam Medis Dibuat</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total_rekam_medis_hari_ini}</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Rata-rata Waktu</p>
                                    <p className="text-lg font-bold text-purple-900">{stats.rata_rata_waktu_pemeriksaan}</p>
                                </div>
                                <Clock className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Cari Pasien / Kode Pendaftaran
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="text"
                                        placeholder="Masukkan nama pasien atau kode..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="md:w-48">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={tanggalFilter}
                                    onChange={(e) => setTanggalFilter(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSearch}>
                                    <Search className="w-4 h-4 mr-2" />
                                    Cari
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    <X className="w-4 h-4 mr-2" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pendaftaran List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Daftar Pemeriksaan Pasien</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendaftaran.data.length > 0 ? (
                            <div className="space-y-4">
                                {pendaftaran.data.map((item) => (
                                    <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-sm">
                                                                {item.kode_pendaftaran}
                                                            </Badge>
                                                            {getStatusBadge(item.status_pendaftaran)}
                                                        </div>
                                                        <h3 className="font-semibold text-lg text-gray-900">
                                                            {item.pasien.nama_lengkap}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {item.pasien.kode_pasien} • {item.pasien.umur} tahun • {getJenisKelaminBadge(item.pasien.jenis_kelamin)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">
                                                            {item.created_at_formatted}
                                                        </p>
                                                        {item.antrian && (
                                                            <p className="text-sm font-medium text-blue-600">
                                                                Antrian #{item.antrian.nomor_antrian}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div className="space-y-2">
                                                        <div className="flex items-start gap-2">
                                                            {/* <User className="w-4 h-4 text-gray-400 mt-0.5" /> */}
                                                            {/* <div>
                                                                <p className="text-gray-600">Jenis Pemeriksaan:</p>
                                                                <p className="font-medium">{item.jenis_pemeriksaan}</p>
                                                            </div> */}
                                                        </div>
                                                        {item.keluhan && (
                                                            <div className="flex items-start gap-2">
                                                                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                                                                <div>
                                                                    <p className="text-gray-600">Keluhan:</p>
                                                                    <p className="font-medium">{item.keluhan}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-start gap-2">
                                                            {/* <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                                                            <div>
                                                                <p className="text-gray-600">Didaftarkan oleh:</p>
                                                                <p className="font-medium">{item.dibuatOleh?.nama_lengkap || 'Tidak diketahui'}</p>
                                                            </div> */}
                                                        </div>
                                                        {item.rekamMedis && (
                                                            <div className="flex items-start gap-2">
                                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                                <div>
                                                                    <p className="text-gray-600">Status:</p>
                                                                    <p className="font-medium text-green-600">Rekam medis sudah dibuat</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 lg:w-48">
                                                <Link href={route('dokter.pemeriksaan.show', item.id)}>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Lihat Detail
                                                    </Button>
                                                </Link>
                                                
                                                {!item.rekamMedis && item.status_pendaftaran !== 'selesai' && (
                                                    <Link href={route('dokter.pemeriksaan.create', { pendaftaran_id: item.id })}>
                                                        <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Buat Rekam Medis
                                                        </Button>
                                                    </Link>
                                                )}
                                                
                                                {item.rekamMedis && item.status_pendaftaran === 'selesai' && (
                                                    <Link href={route('dokter.pemeriksaan.edit', item.id)}>
                                                        <Button size="sm" variant="outline" className="w-full">
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            Edit Rekam Medis
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Tidak ada pasien sedang diperiksa
                                </h3>
                                <p className="text-gray-600">
                                    Belum ada pasien yang sedang dalam proses pemeriksaan saat ini.
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pendaftaran.links && pendaftaran.links.length > 3 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    Menampilkan {((pendaftaran.current_page - 1) * pendaftaran.per_page) + 1} sampai{' '}
                                    {Math.min(pendaftaran.current_page * pendaftaran.per_page, pendaftaran.total)} dari{' '}
                                    {pendaftaran.total} hasil
                                </div>
                                <div className="flex items-center gap-2">
                                    {pendaftaran.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm rounded-md ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}