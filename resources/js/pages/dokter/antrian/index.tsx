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
    RefreshCw,
    Search,
    Stethoscope,
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
        antrian_sedang_diperiksa: number;
        antrian_selesai: number;
        pasien_diperiksa: number;
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

export default function Index({ stats, antrianHariIni, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [isCallingNext, setIsCallingNext] = useState(false);

    const handleSearch = () => {
        router.get(route('dokter.antrian.index'), {
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
        router.get(route('dokter.antrian.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCallNext = () => {
        setIsCallingNext(true);
        router.post(route('dokter.antrian.call-next'), {}, {
            onFinish: () => setIsCallingNext(false),
        });
    };

    const handleStartExamination = (antrianId: number) => {
        router.post(route('dokter.antrian.start-examination', antrianId));
    };

    const handleCompleteExamination = (antrianId: number) => {
        if (confirm('Apakah Anda yakin ingin menyelesaikan pemeriksaan ini?')) {
            router.post(route('dokter.antrian.complete-examination', antrianId));
        }
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
            <Head title="Antrian Pasien - Dokter" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Antrian Pasien</h1>
                        <p className="text-gray-600">Kelola antrian dan pemeriksaan pasien</p>
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
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

                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600">Sedang Diperiksa</p>
                                    <p className="text-2xl font-bold text-orange-900">{stats.pasien_diperiksa}</p>
                                </div>
                                <Stethoscope className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Sedang Diperiksa</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.antrian_sedang_diperiksa}</p>
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
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {antrianHariIni.data.map((antrian) => (
                                    <div key={antrian.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg ${
                                                    antrian.status_antrian === 'dipanggil' ? 'bg-blue-600' :
                                                    antrian.status_antrian === 'selesai' ? 'bg-green-600' :
                                                    antrian.pendaftaran.status_pendaftaran === 'sedang_diperiksa' ? 'bg-orange-600' :
                                                    'bg-gray-600'
                                                }`}>
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
                                                        {getPendaftaranStatusBadge(antrian.pendaftaran.status_pendaftaran)}
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
                                                            <span className="font-medium">Umur / JK:</span><br />
                                                            {antrian.pendaftaran.pasien.umur} tahun / {antrian.pendaftaran.pasien.jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan'}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Jam Daftar:</span><br />
                                                            {antrian.created_at_formatted}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Link href={route('dokter.antrian.show', antrian.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Detail
                                                    </Button>
                                                </Link>
                                                
                                                {/* Action buttons based on status */}
                                                {antrian.status_antrian === 'menunggu' && (
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => handleStartExamination(antrian.id)}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Play className="w-4 h-4 mr-1" />
                                                        Mulai Periksa
                                                    </Button>
                                                )}
                                                
                                                {antrian.status_antrian === 'sedang_diperiksa' && (
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => handleCompleteExamination(antrian.id)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Selesai
                                                    </Button>
                                                )}

                                                {antrian.status_antrian === 'dipanggil' && antrian.pendaftaran.status_pendaftaran !== 'sedang_diperiksa' && (
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => handleStartExamination(antrian.id)}
                                                        className="bg-orange-600 hover:bg-orange-700"
                                                    >
                                                        <Stethoscope className="w-4 h-4 mr-1" />
                                                        Periksa
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
