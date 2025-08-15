import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Plus,
    Printer,
    Search,
    Users,
    X,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    stats: {
        total_pendaftaran_hari_ini: number;
        total_antrian_aktif: number;
        total_pasien_aktif: number;
        pendaftaran_bulan_ini: number;
    };
    pendaftaranHariIni: {
        data: Pendaftaran[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        status?: string;
        search?: string;
    };
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

export default function Index({ stats, pendaftaranHariIni, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleSearch = () => {
        router.get(route('pendaftaran.pemeriksaan.index'), {
            search: searchTerm,
            status: statusFilter,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setStatusFilter('');
        router.get(route('pendaftaran.pemeriksaan.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchTerm !== filters.search) {
                handleSearch();
            }
        }, 500);

        return () => clearTimeout(delayedSearch);
    }, [searchTerm]);

    return (
        <AppLayout>
            <Head title="Pendaftaran Pemeriksaan" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pendaftaran Pemeriksaan</h1>
                        <p className="text-gray-600">Kelola pendaftaran pemeriksaan pasien yang sudah terdaftar</p>
                    </div>
                    <Link href={route('pendaftaran.pemeriksaan.create')}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Daftar Pemeriksaan
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Pendaftaran Hari Ini</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total_pendaftaran_hari_ini}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-600">Antrian Aktif</p>
                                    <p className="text-2xl font-bold text-yellow-900">{stats.total_antrian_aktif}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Total Pasien</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.total_pasien_aktif}</p>
                                </div>
                                <Users className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Bulan Ini</p>
                                    <p className="text-2xl font-bold text-purple-900">{stats.pendaftaran_bulan_ini}</p>
                                </div>
                                <FileText className="h-8 w-8 text-purple-600" />
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
                                    Cari Pasien
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Nama pasien atau kode pasien..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Status
                                </label>
                                <select 
                                    value={statusFilter} 
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="terdaftar">Terdaftar</option>
                                    <option value="selesai">Selesai</option>
                                    <option value="dibatalkan">Dibatalkan</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSearch} variant="outline">
                                    <Search className="w-4 h-4 mr-2" />
                                    Cari
                                </Button>
                                <Button onClick={handleReset} variant="outline">
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
                        <CardTitle className="text-lg">Pendaftaran Pemeriksaan Hari Ini</CardTitle>
                        <p className="text-sm text-gray-600">
                            Menampilkan {pendaftaranHariIni.total} pendaftaran
                        </p>
                    </CardHeader>
                    <CardContent>
                        {pendaftaranHariIni.data.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada pendaftaran</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Mulai dengan mendaftarkan pasien untuk pemeriksaan.
                                </p>
                                <div className="mt-6">
                                    <Link href={route('pendaftaran.pemeriksaan.create')}>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Daftar Pemeriksaan
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendaftaranHariIni.data.map((pendaftaran) => (
                                    <div key={pendaftaran.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {pendaftaran.pasien.nama_lengkap}
                                                    </h3>
                                                    <Badge variant="outline">
                                                        {pendaftaran.pasien.kode_pasien}
                                                    </Badge>
                                                    {getStatusBadge(pendaftaran.status_pendaftaran)}
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Jenis Pemeriksaan:</span><br />
                                                        {pendaftaran.jenis_pemeriksaan}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Keluhan:</span><br />
                                                        {pendaftaran.keluhan || '-'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Jam Daftar:</span><br />
                                                        {pendaftaran.created_at_formatted}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Antrian:</span><br />
                                                        {pendaftaran.antrian ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-lg">#{pendaftaran.antrian.nomor_antrian}</span>
                                                                {getAntrianStatusBadge(pendaftaran.antrian.status_antrian)}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">Tidak ada</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Link href={route('pendaftaran.pemeriksaan.show', pendaftaran.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Detail
                                                    </Button>
                                                </Link>
                                                <Link href={route('pendaftaran.pemeriksaan.print-ticket', pendaftaran.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Printer className="w-4 h-4 mr-1" />
                                                        Cetak
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {pendaftaranHariIni.last_page > 1 && (
                                    <div className="flex items-center justify-between pt-4">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {((pendaftaranHariIni.current_page - 1) * pendaftaranHariIni.per_page) + 1} sampai{' '}
                                            {Math.min(pendaftaranHariIni.current_page * pendaftaranHariIni.per_page, pendaftaranHariIni.total)} dari{' '}
                                            {pendaftaranHariIni.total} hasil
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {pendaftaranHariIni.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`px-3 py-1 text-sm rounded ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white'
                                                            : link.url
                                                                ? 'text-blue-600 hover:bg-blue-50'
                                                                : 'text-gray-400 cursor-not-allowed'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
