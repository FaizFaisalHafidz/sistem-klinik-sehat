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
    Play,
    Printer,
    RefreshCw,
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
    jenis_kelamin: string;
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
    pendaftaran: Pendaftaran;
}

interface Props {
    stats: {
        total_antrian_hari_ini: number;
        antrian_menunggu: number;
        antrian_dipanggil: number;
        antrian_selesai: number;
    };
    antrianHariIni: {
        data: Antrian[];
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

export default function Index({ stats, antrianHariIni, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [isCallingNext, setIsCallingNext] = useState(false);

    const handleSearch = () => {
        router.get(route('pendaftaran.antrian.index'), {
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
        router.get(route('pendaftaran.antrian.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCallNext = () => {
        setIsCallingNext(true);
        router.post(route('pendaftaran.antrian.call-next'), {}, {
            onFinish: () => setIsCallingNext(false),
        });
    };

    const handleUpdateStatus = (antrianId: number, status: string) => {
        const keterangan = status === 'selesai' ? 'Pemeriksaan selesai' : 
                         status === 'dibatalkan' ? 'Antrian dibatalkan' : '';

        router.patch(route('pendaftaran.antrian.update-status', antrianId), {
            status: status,
            keterangan: keterangan,
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
            <Head title="Antrian Pasien" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Antrian Pasien</h1>
                        <p className="text-gray-600">Kelola antrian pasien dan status pemeriksaan</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={handleCallNext}
                            disabled={isCallingNext}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isCallingNext ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Memanggil...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Panggil Antrian Berikutnya
                                </>
                            )}
                        </Button>
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
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total Antrian Hari Ini</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total_antrian_hari_ini}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-600">Menunggu</p>
                                    <p className="text-2xl font-bold text-yellow-900">{stats.antrian_menunggu}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Sedang Dipanggil</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.antrian_dipanggil}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Selesai</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.antrian_selesai}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
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
                                    Status Antrian
                                </label>
                                <select 
                                    value={statusFilter} 
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="menunggu">Menunggu</option>
                                    <option value="dipanggil">Dipanggil</option>
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

                {/* Queue List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Daftar Antrian Hari Ini</CardTitle>
                        <p className="text-sm text-gray-600">
                            Menampilkan {antrianHariIni.total} antrian
                        </p>
                    </CardHeader>
                    <CardContent>
                        {antrianHariIni.data.length === 0 ? (
                            <div className="text-center py-8">
                                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada antrian</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Antrian akan muncul setelah pasien melakukan pendaftaran.
                                </p>
                                <div className="mt-6">
                                    <Link href={route('pendaftaran.baru.index')}>
                                        <Button>
                                            <Users className="w-4 h-4 mr-2" />
                                            Kelola Pendaftaran
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {antrianHariIni.data.map((antrian) => (
                                    <div key={antrian.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                                                    #{antrian.nomor_antrian}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {antrian.pendaftaran.pasien.nama_lengkap}
                                                        </h3>
                                                        <Badge variant="outline">
                                                            {antrian.pendaftaran.pasien.kode_pasien}
                                                        </Badge>
                                                        {getStatusBadge(antrian.status_antrian)}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                                                        <div>
                                                            <span className="font-medium">Jenis Pemeriksaan:</span><br />
                                                            {antrian.pendaftaran.jenis_pemeriksaan}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Keluhan:</span><br />
                                                            {antrian.pendaftaran.keluhan || 'Tidak ada keluhan'}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Jam Daftar:</span><br />
                                                            {antrian.created_at_formatted}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Estimasi:</span><br />
                                                            {antrian.estimasi_waktu_formatted || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Link href={route('pendaftaran.antrian.show', antrian.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Detail
                                                    </Button>
                                                </Link>
                                                <Link href={route('pendaftaran.antrian.print-ticket', antrian.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Printer className="w-4 h-4 mr-1" />
                                                        Cetak
                                                    </Button>
                                                </Link>
                                                
                                                {/* Action buttons based on status */}
                                                {antrian.status_antrian === 'menunggu' && (
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(antrian.id, 'dipanggil')}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Play className="w-4 h-4 mr-1" />
                                                        Panggil
                                                    </Button>
                                                )}
                                                
                                                {antrian.status_antrian === 'dipanggil' && (
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(antrian.id, 'selesai')}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Selesai
                                                    </Button>
                                                )}
                                                
                                                {(antrian.status_antrian === 'menunggu' || antrian.status_antrian === 'dipanggil') && (
                                                    <Button 
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleUpdateStatus(antrian.id, 'dibatalkan')}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Batal
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {antrian.keterangan && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-700">
                                                    <strong>Keterangan:</strong> {antrian.keterangan}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Pagination */}
                                {antrianHariIni.last_page > 1 && (
                                    <div className="flex items-center justify-between pt-4">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {((antrianHariIni.current_page - 1) * antrianHariIni.per_page) + 1} sampai{' '}
                                            {Math.min(antrianHariIni.current_page * antrianHariIni.per_page, antrianHariIni.total)} dari{' '}
                                            {antrianHariIni.total} hasil
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {antrianHariIni.links.map((link, index) => (
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
