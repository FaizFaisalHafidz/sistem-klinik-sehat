import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    FileText,
    Filter,
    Printer,
    RefreshCw,
    Search,
    Stethoscope,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Pasien {
    id: number;
    kode_pasien: string;
    nama_lengkap: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
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

interface RekamMedis {
    id: number;
    kode_rekam_medis: string;
    tanggal_pemeriksaan: string;
    anamnesis: string;
    pemeriksaan_fisik: string;
    diagnosa: string;
    rencana_pengobatan: string;
    catatan_dokter: string;
    status_rekam_medis: string;
    pasien: Pasien;
    dokter: Dokter;
    pendaftaran: Pendaftaran;
}

interface Props {
    rekamMedis: {
        data: RekamMedis[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_rekam_medis: number;
        rekam_medis_bulan_ini: number;
        rekam_medis_hari_ini: number;
        total_pasien_unik: number;
    };
    filters: {
        search?: string;
        tanggal_dari?: string;
        tanggal_sampai?: string;
        status?: string;
    };
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

export default function Index({ rekamMedis, stats, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [tanggalDari, setTanggalDari] = useState(filters.tanggal_dari || '');
    const [tanggalSampai, setTanggalSampai] = useState(filters.tanggal_sampai || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        router.get(route('dokter.rekam-medis.index'), {
            search: searchTerm,
            tanggal_dari: tanggalDari,
            tanggal_sampai: tanggalSampai,
            status: statusFilter,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setTanggalDari('');
        setTanggalSampai('');
        setStatusFilter('');
        router.get(route('dokter.rekam-medis.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchTerm !== filters.search || 
                tanggalDari !== filters.tanggal_dari || 
                tanggalSampai !== filters.tanggal_sampai ||
                statusFilter !== filters.status) {
                handleSearch();
            }
        }, 500);

        return () => clearTimeout(delayedSearch);
    }, [searchTerm, tanggalDari, tanggalSampai, statusFilter]);

    const handleDelete = (id: number, kodeRekamMedis: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus rekam medis ${kodeRekamMedis}?`)) {
            router.delete(route('dokter.rekam-medis.destroy', id), {
                onSuccess: () => {
                    // Redirect handled by controller
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Rekam Medis - Dokter" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Rekam Medis</h1>
                        <p className="text-gray-600">Kelola data rekam medis pasien</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={() => setShowFilters(!showFilters)}
                            variant="outline"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
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
                                    <p className="text-sm font-medium text-blue-600">Total Rekam Medis</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total_rekam_medis}</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Bulan Ini</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.rekam_medis_bulan_ini}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600">Hari Ini</p>
                                    <p className="text-2xl font-bold text-orange-900">{stats.rekam_medis_hari_ini}</p>
                                </div>
                                <Clock className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Pasien Unik</p>
                                    <p className="text-2xl font-bold text-purple-900">{stats.total_pasien_unik}</p>
                                </div>
                                <User className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                {showFilters && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Cari Pasien / Kode / Diagnosis
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            type="text"
                                            placeholder="Masukkan kata kunci..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Tanggal Dari
                                    </label>
                                    <Input
                                        type="date"
                                        value={tanggalDari}
                                        onChange={(e) => setTanggalDari(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Tanggal Sampai
                                    </label>
                                    <Input
                                        type="date"
                                        value={tanggalSampai}
                                        onChange={(e) => setTanggalSampai(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="draft">Draft</option>
                                        <option value="selesai">Selesai</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleSearch}>
                                    <Search className="w-4 h-4 mr-2" />
                                    Cari
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    <X className="w-4 h-4 mr-2" />
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Rekam Medis List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Daftar Rekam Medis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rekamMedis.data.length > 0 ? (
                            <div className="space-y-4">
                                {rekamMedis.data.map((item) => (
                                    <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-sm">
                                                                {item.kode_rekam_medis}
                                                            </Badge>
                                                            {getStatusBadge(item.status_rekam_medis)}
                                                        </div>
                                                        <h3 className="font-semibold text-lg text-gray-900">
                                                            {item.pasien.nama_lengkap}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {item.pasien.kode_pasien} • {item.pasien.umur} tahun • {getJenisKelaminBadge(item.pasien.jenis_kelamin)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {new Date(item.tanggal_pemeriksaan).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Pemeriksaan
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div className="space-y-2">
                                                        <div className="flex items-start gap-2">
                                                            <Stethoscope className="w-4 h-4 text-gray-400 mt-0.5" />
                                                            <div>
                                                                <p className="text-gray-600">Diagnosis:</p>
                                                                <p className="font-medium">{item.diagnosa}</p>
                                                            </div>
                                                        </div>
                                                        {item.anamnesis && (
                                                            <div className="flex items-start gap-2">
                                                                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                                                                <div>
                                                                    <p className="text-gray-600">Anamnesis:</p>
                                                                    <p className="font-medium">
                                                                        {item.anamnesis.length > 100 
                                                                            ? item.anamnesis.substring(0, 100) + '...'
                                                                            : item.anamnesis
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-start gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                                                            <div>
                                                                <p className="text-gray-600">Kode Pendaftaran:</p>
                                                                <p className="font-medium">{item.pendaftaran.kode_pendaftaran}</p>
                                                            </div>
                                                        </div>
                                                        {item.rencana_pengobatan && (
                                                            <div className="flex items-start gap-2">
                                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                                <div>
                                                                    <p className="text-gray-600">Rencana Pengobatan:</p>
                                                                    <p className="font-medium text-green-600">
                                                                        {item.rencana_pengobatan.length > 50 
                                                                            ? item.rencana_pengobatan.substring(0, 50) + '...'
                                                                            : item.rencana_pengobatan
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 lg:w-48">
                                                <Link href={route('dokter.rekam-medis.show', item.id)}>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Lihat Detail
                                                    </Button>
                                                </Link>
                                                
                                                <Link href={route('dokter.rekam-medis.edit', item.id)}>
                                                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                
                                                <Link href={route('dokter.rekam-medis.cetak', item.id)}>
                                                    <Button size="sm" variant="outline" className="w-full">
                                                        <Printer className="w-4 h-4 mr-2" />
                                                        Cetak
                                                    </Button>
                                                </Link>

                                                {item.status_rekam_medis === 'draft' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="destructive" 
                                                        className="w-full"
                                                        onClick={() => handleDelete(item.id, item.kode_rekam_medis)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Hapus
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Tidak ada rekam medis
                                </h3>
                                <p className="text-gray-600">
                                    Belum ada rekam medis yang dibuat.
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {rekamMedis.links && rekamMedis.links.length > 3 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    Menampilkan {((rekamMedis.current_page - 1) * rekamMedis.per_page) + 1} sampai{' '}
                                    {Math.min(rekamMedis.current_page * rekamMedis.per_page, rekamMedis.total)} dari{' '}
                                    {rekamMedis.total} hasil
                                </div>
                                <div className="flex items-center gap-2">
                                    {rekamMedis.links.map((link, index) => (
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
