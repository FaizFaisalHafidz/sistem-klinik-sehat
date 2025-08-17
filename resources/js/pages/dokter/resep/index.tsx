import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Eye,
    FileText,
    Pill,
    Plus,
    Receipt,
    RefreshCw,
    Search,
    Users,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Pasien {
    id: number;
    kode_pasien: string;
    nama_lengkap: string;
    telepon: string;
    umur: number;
}

interface Dokter {
    nama_lengkap: string;
}

interface DetailResep {
    id: number;
    obat: {
        nama_obat: string;
        satuan: string;
    };
    jumlah: number;
    aturan_pakai: string;
}

interface Resep {
    id: number;
    kode_resep: string;
    tanggal_resep: string;
    tanggal_resep_formatted: string;
    catatan_resep: string;
    status_resep: string;
    total_obat: number;
    pasien: Pasien;
    dokter: Dokter;
    detail_resep?: DetailResep[];
}

interface Props {
    resep: {
        data: Resep[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_resep: number;
        resep_bulan_ini: number;
        resep_hari_ini: number;
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

export default function Index({ resep, stats, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [tanggalDari, setTanggalDari] = useState(filters.tanggal_dari || '');
    const [tanggalSampai, setTanggalSampai] = useState(filters.tanggal_sampai || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleSearch = () => {
        router.get(route('dokter.resep.index'), {
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
        router.get(route('dokter.resep.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleToggleStatus = (id: number, currentStatus: string) => {
        const action = currentStatus === 'belum_diambil' ? 'menandai sudah diambil' : 'menandai belum diambil';
        
        if (confirm(`Apakah Anda yakin ingin ${action} resep ini?`)) {
            router.patch(route('dokter.resep.toggle-status', id), {}, {
                preserveState: true,
                onSuccess: () => {
                    // Refresh the page to show updated data
                    window.location.reload();
                }
            });
        }
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

    return (
        <AppLayout>
            <Head title="Resep - Dokter" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manajemen Resep</h1>
                        <p className="text-gray-600">Kelola resep obat untuk pasien</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={() => window.location.reload()}
                            variant="outline"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Link href={route('dokter.resep.create')}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Buat Resep Baru
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total Resep</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total_resep}</p>
                                </div>
                                <Receipt className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Resep Bulan Ini</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.resep_bulan_ini}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600">Resep Hari Ini</p>
                                    <p className="text-2xl font-bold text-orange-900">{stats.resep_hari_ini}</p>
                                </div>
                                <FileText className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Total Pasien</p>
                                    <p className="text-2xl font-bold text-purple-900">{stats.total_pasien_unik}</p>
                                </div>
                                <Users className="h-8 w-8 text-purple-600" />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Cari Resep / Pasien
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="text"
                                        placeholder="Kode resep atau nama pasien..."
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="belum_diambil">Belum Diambil</option>
                                    <option value="sudah_diambil">Sudah Diambil</option>
                                    <option value="dibatalkan">Dibatalkan</option>
                                </select>
                            </div>
                            <div className="flex gap-2 items-end">
                                <Button onClick={handleSearch} className="flex-1">
                                    <Search className="w-4 h-4 mr-2" />
                                    Cari
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resep List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Daftar Resep</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {resep.data.length > 0 ? (
                            <div className="space-y-4">
                                {resep.data.map((item) => (
                                    <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-sm">
                                                                {item.kode_resep}
                                                            </Badge>
                                                            {getStatusBadge(item.status_resep)}
                                                        </div>
                                                        <h3 className="font-semibold text-lg text-gray-900">
                                                            {item.pasien.nama_lengkap}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {item.pasien.kode_pasien} • {item.pasien.umur} tahun
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">
                                                            {item.tanggal_resep_formatted}
                                                        </p>
                                                        <p className="text-sm font-medium text-blue-600">
                                                            {item.total_obat} jenis obat
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div className="space-y-2">
                                                        <div className="flex items-start gap-2">
                                                            <Pill className="w-4 h-4 text-gray-400 mt-0.5" />
                                                            <div>
                                                                <p className="text-gray-600">Obat yang diresepkan:</p>
                                                                <div className="font-medium">
                                                                    {item.detail_resep && item.detail_resep.length > 0 ? (
                                                                        <>
                                                                            {item.detail_resep.slice(0, 2).map((detail: DetailResep, index: number) => (
                                                                                <p key={index} className="text-sm">
                                                                                    • {detail.obat.nama_obat} ({detail.jumlah} {detail.obat.satuan})
                                                                                </p>
                                                                            ))}
                                                                            {item.detail_resep.length > 2 && (
                                                                                <p className="text-xs text-gray-500">
                                                                                    +{item.detail_resep.length - 2} obat lainnya
                                                                                </p>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <p className="text-sm text-gray-500">Belum ada obat</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {item.catatan_resep && (
                                                            <div className="flex items-start gap-2">
                                                                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                                                                <div>
                                                                    <p className="text-gray-600">Catatan:</p>
                                                                    <p className="font-medium">{item.catatan_resep}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 lg:w-48">
                                                <Link href={route('dokter.resep.show', item.id)}>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Lihat Detail
                                                    </Button>
                                                </Link>
                                                
                                                {item.status_resep !== 'dibatalkan' && (
                                                    <Button
                                                        size="sm"
                                                        variant={item.status_resep === 'belum_diambil' ? "default" : "outline"}
                                                        className={`w-full ${
                                                            item.status_resep === 'belum_diambil' 
                                                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                                                : 'border-orange-500 text-orange-700 hover:bg-orange-50'
                                                        }`}
                                                        onClick={() => handleToggleStatus(item.id, item.status_resep)}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        {item.status_resep === 'belum_diambil' ? 'Tandai Diambil' : 'Tandai Belum Diambil'}
                                                    </Button>
                                                )}

                                                {item.status_resep === 'belum_diambil' && (
                                                    <Link href={route('dokter.resep.edit', item.id)}>
                                                        <Button size="sm" variant="outline" className="w-full">
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            Edit Resep
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
                                <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Tidak ada resep ditemukan
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Belum ada resep yang dibuat atau sesuai dengan filter yang dipilih.
                                </p>
                                <Link href={route('dokter.resep.create')}>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Buat Resep Pertama
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {resep.links && resep.links.length > 3 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    Menampilkan {((resep.current_page - 1) * resep.per_page) + 1} sampai{' '}
                                    {Math.min(resep.current_page * resep.per_page, resep.total)} dari{' '}
                                    {resep.total} hasil
                                </div>
                                <div className="flex items-center gap-2">
                                    {resep.links.map((link, index) => (
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
