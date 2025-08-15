import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    Clock,
    Download,
    Eye,
    Filter,
    Monitor,
    RefreshCw,
    Search,
    TrendingUp,
    User
} from 'lucide-react';
import { useState } from 'react';

interface LogAktivitas {
    id: number;
    user: {
        id: number;
        nama_lengkap: string;
        nama_pengguna: string;
        email: string;
    } | null;
    nama_tabel: string;
    record_id: number;
    aksi: string;
    ip_address: string;
    user_agent: string;
    data_lama: any;
    data_baru: any;
    created_at: string;
    created_at_formatted: string;
    created_at_diff: string;
}

interface User {
    id: number;
    nama_lengkap: string;
    nama_pengguna: string;
    email: string;
}

interface Statistics {
    total_logs: number;
    logs_hari_ini: number;
    logs_minggu_ini: number;
    logs_bulan_ini: number;
}

interface TabelTerbanyak {
    nama_tabel: string;
    total: number;
}

interface AksiStats {
    aksi: string;
    total: number;
}

interface UserPalingAktif {
    user: {
        id: number;
        nama_lengkap: string;
        nama_pengguna: string;
    } | null;
    total: number;
}

interface Props {
    logAktivitas: {
        data: LogAktivitas[];
        links: any[];
        meta: any;
    };
    filters: {
        tanggal_dari?: string;
        tanggal_sampai?: string;
        user_id?: string;
        nama_tabel?: string;
        aksi?: string;
        ip_address?: string;
    };
    statistics: Statistics;
    userList: User[];
    tabelTerbanyak: TabelTerbanyak[];
    aksiStats: AksiStats[];
    userPalingAktif: UserPalingAktif[];
}

export default function Index({ 
    logAktivitas, 
    filters, 
    statistics, 
    userList,
    tabelTerbanyak,
    aksiStats,
    userPalingAktif
}: Props) {
    const [showFilters, setShowFilters] = useState(false);
    const [formData, setFormData] = useState({
        tanggal_dari: filters.tanggal_dari || '',
        tanggal_sampai: filters.tanggal_sampai || '',
        user_id: filters.user_id || '',
        nama_tabel: filters.nama_tabel || '',
        aksi: filters.aksi || '',
        ip_address: filters.ip_address || '',
    });

    const handleFilter = () => {
        router.get(route('admin.log-aktivitas.index'), formData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        const resetData = {
            tanggal_dari: '',
            tanggal_sampai: '',
            user_id: '',
            nama_tabel: '',
            aksi: '',
            ip_address: '',
        };
        setFormData(resetData);
        router.get(route('admin.log-aktivitas.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        window.open(route('admin.log-aktivitas.export', formData));
    };

    const getAksiBadge = (aksi: string) => {
        const variants: Record<string, string> = {
            'CREATE': 'bg-blue-100 text-blue-800',
            'UPDATE': 'bg-yellow-100 text-yellow-800',
            'DELETE': 'bg-red-100 text-red-800',
        };
        
        return variants[aksi] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout>
            <Head title="Log Aktivitas" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="h-6 w-6" />
                            Log Aktivitas
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Monitor aktivitas pengguna sistem
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.reload()}
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Log</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statistics.total_logs.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Hari Ini</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statistics.logs_hari_ini.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Minggu Ini</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statistics.logs_minggu_ini.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Calendar className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Bulan Ini</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statistics.logs_bulan_ini.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tabel Terbanyak */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Tabel Terbanyak</CardTitle>
                            <CardDescription>Tabel yang paling sering mengalami perubahan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {tabelTerbanyak?.slice(0, 5).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 truncate capitalize">{item.nama_tabel}</span>
                                        <Badge variant="secondary">{item.total}</Badge>
                                    </div>
                                )) || (
                                    <div className="text-center text-gray-500">Tidak ada data</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistik Aksi */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Statistik Aksi</CardTitle>
                            <CardDescription>Distribusi berdasarkan jenis aksi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {aksiStats?.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 capitalize">{item.aksi.toLowerCase()}</span>
                                        <Badge variant="secondary">{item.total}</Badge>
                                    </div>
                                )) || (
                                    <div className="text-center text-gray-500">Tidak ada data</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Paling Aktif */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">User Paling Aktif</CardTitle>
                            <CardDescription>Pengguna dengan aktivitas terbanyak</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {userPalingAktif.slice(0, 5).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 truncate">
                                            {item.user?.nama_lengkap || 'Unknown'}
                                        </span>
                                        <Badge variant="secondary">{item.total}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filter Log Aktivitas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal_dari">Tanggal Dari</Label>
                                    <Input
                                        id="tanggal_dari"
                                        type="date"
                                        value={formData.tanggal_dari}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tanggal_dari: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tanggal_sampai">Tanggal Sampai</Label>
                                    <Input
                                        id="tanggal_sampai"
                                        type="date"
                                        value={formData.tanggal_sampai}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tanggal_sampai: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="user_id">Pengguna</Label>
                                    <Select
                                        value={formData.user_id}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih pengguna" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Semua Pengguna</SelectItem>
                                            {userList.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.nama_lengkap}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nama_tabel">Nama Tabel</Label>
                                    <Input
                                        id="nama_tabel"
                                        placeholder="Cari nama tabel..."
                                        value={formData.nama_tabel}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nama_tabel: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="aksi">Aksi</Label>
                                    <Select
                                        value={formData.aksi}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, aksi: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih aksi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Semua Aksi</SelectItem>
                                            <SelectItem value="CREATE">Create</SelectItem>
                                            <SelectItem value="UPDATE">Update</SelectItem>
                                            <SelectItem value="DELETE">Delete</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ip_address">IP Address</Label>
                                    <Input
                                        id="ip_address"
                                        placeholder="Cari IP address..."
                                        value={formData.ip_address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <Button onClick={handleFilter} className="gap-2">
                                    <Search className="h-4 w-4" />
                                    Filter
                                </Button>
                                <Button variant="outline" onClick={handleReset} className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Log Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Log Aktivitas</CardTitle>
                        <CardDescription>
                            Menampilkan {logAktivitas.meta?.from || 0} - {logAktivitas.meta?.to || 0} dari {logAktivitas.meta?.total || 0} log
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(logAktivitas.data?.length || 0) === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Tidak ada log aktivitas yang ditemukan
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Waktu</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Pengguna</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Tabel</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Record ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Aksi</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">IP Address</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logAktivitas.data?.map((log) => (
                                            <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">
                                                            {log.created_at_formatted}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {log.created_at_diff}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        <div className="text-sm">
                                                            <div className="font-medium text-gray-900">
                                                                {log.user?.nama_lengkap || 'System'}
                                                            </div>
                                                            <div className="text-gray-500">
                                                                {log.user?.email || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900 capitalize">
                                                            {log.nama_tabel}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm text-gray-600">
                                                        {log.record_id}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge 
                                                        className={getAksiBadge(log.aksi)}
                                                        variant="secondary"
                                                    >
                                                        {log.aksi}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Monitor className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">
                                                            {log.ip_address}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Link
                                                        href={route('admin.log-aktivitas.show', log.id)}
                                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {(logAktivitas.meta?.last_page || 0) > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Menampilkan {logAktivitas.meta?.from || 0} - {logAktivitas.meta?.to || 0} dari {logAktivitas.meta?.total || 0} data
                                </div>
                                <div className="flex items-center gap-2">
                                    {logAktivitas.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )) || null}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
