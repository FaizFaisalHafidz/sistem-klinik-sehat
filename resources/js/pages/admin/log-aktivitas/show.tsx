import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Clock,
    FileText,
    Globe,
    Monitor,
    User
} from 'lucide-react';

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

interface RiwayatAktivitas {
    id: number;
    nama_tabel: string;
    aksi: string;
    created_at: string;
    created_at_diff: string;
}

interface Props {
    logAktivitas: LogAktivitas;
    riwayatAktivitas: RiwayatAktivitas[];
}

export default function Show({ logAktivitas, riwayatAktivitas }: Props) {
    const getTipeAktivitasBadge = (tipe: string) => {
        const variants: Record<string, string> = {
            'login': 'bg-green-100 text-green-800',
            'logout': 'bg-gray-100 text-gray-800',
            'create': 'bg-blue-100 text-blue-800',
            'update': 'bg-yellow-100 text-yellow-800',
            'delete': 'bg-red-100 text-red-800',
            'view': 'bg-purple-100 text-purple-800',
        };
        
        return variants[tipe] || 'bg-gray-100 text-gray-800';
    };

    const formatUserAgent = (userAgent: string) => {
        if (!userAgent) return 'Unknown';
        
        // Extract browser info
        const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
        const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/);
        
        let result = '';
        if (browserMatch) {
            result += browserMatch[0];
        }
        if (osMatch) {
            result += ` on ${osMatch[1]}`;
        }
        
        return result || userAgent.substring(0, 50) + '...';
    };

    return (
        <AppLayout>
            <Head title={`Detail Log - ${logAktivitas.aktivitas}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.log-aktivitas.index')}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Activity className="h-6 w-6" />
                                Detail Log Aktivitas
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Informasi lengkap log aktivitas sistem
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Log Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Informasi Log
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">ID Log</label>
                                        <p className="text-gray-900 font-medium">#{logAktivitas.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Tipe Aktivitas</label>
                                        <div className="mt-1">
                                            <Badge 
                                                className={getTipeAktivitasBadge(logAktivitas.tipe_aktivitas)}
                                                variant="secondary"
                                            >
                                                {logAktivitas.tipe_aktivitas}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Aktivitas</label>
                                    <p className="text-gray-900 font-medium">{logAktivitas.aktivitas}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Deskripsi</label>
                                    <p className="text-gray-700">{logAktivitas.deskripsi || 'Tidak ada deskripsi'}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Waktu</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-gray-900 font-medium">{logAktivitas.created_at_formatted}</p>
                                                <p className="text-sm text-gray-500">{logAktivitas.created_at_diff}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">IP Address</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Globe className="h-4 w-4 text-gray-400" />
                                            <p className="text-gray-900 font-medium">{logAktivitas.ip_address}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Informasi Pengguna
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {logAktivitas.user ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                                                <p className="text-gray-900 font-medium">{logAktivitas.user.nama_lengkap}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Username</label>
                                                <p className="text-gray-900 font-medium">{logAktivitas.user.nama_pengguna}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Email</label>
                                            <p className="text-gray-900 font-medium">{logAktivitas.user.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                        <p>Aktivitas sistem tanpa user</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Technical Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Monitor className="h-5 w-5" />
                                    Informasi Teknis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">User Agent</label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-700 font-mono break-all">
                                                {logAktivitas.user_agent || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatUserAgent(logAktivitas.user_agent)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Changes */}
                        {(logAktivitas.data_lama || logAktivitas.data_baru) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Perubahan Data
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {logAktivitas.data_lama && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Data Lama</label>
                                                <div className="mt-1 p-3 bg-red-50 rounded-lg border border-red-200">
                                                    <pre className="text-xs text-gray-700 overflow-auto">
                                                        {JSON.stringify(logAktivitas.data_lama, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {logAktivitas.data_baru && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Data Baru</label>
                                                <div className="mt-1 p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <pre className="text-xs text-gray-700 overflow-auto">
                                                        {JSON.stringify(logAktivitas.data_baru, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={route('admin.log-aktivitas.index')} className="w-full">
                                    <Button variant="outline" className="w-full gap-2">
                                        <Activity className="h-4 w-4" />
                                        Semua Log
                                    </Button>
                                </Link>
                                
                                {logAktivitas.user && (
                                    <Link 
                                        href={route('admin.log-aktivitas.index', { user_id: logAktivitas.user.id })} 
                                        className="w-full"
                                    >
                                        <Button variant="outline" className="w-full gap-2">
                                            <User className="h-4 w-4" />
                                            Log User Ini
                                        </Button>
                                    </Link>
                                )}
                                
                                <Link 
                                    href={route('admin.log-aktivitas.index', { tipe_aktivitas: logAktivitas.tipe_aktivitas })} 
                                    className="w-full"
                                >
                                    <Button variant="outline" className="w-full gap-2">
                                        <FileText className="h-4 w-4" />
                                        Log Tipe Ini
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        {riwayatAktivitas.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Riwayat Aktivitas User</CardTitle>
                                    <CardDescription>10 aktivitas terakhir dari user yang sama</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {riwayatAktivitas.map((item) => (
                                            <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                                                <div className="p-1 bg-gray-100 rounded">
                                                    <Activity className="h-3 w-3 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {item.aktivitas}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge 
                                                            className={getTipeAktivitasBadge(item.tipe_aktivitas)}
                                                            variant="secondary"
                                                        >
                                                            {item.tipe_aktivitas}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500">
                                                            {item.created_at_diff}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link href={route('admin.log-aktivitas.show', item.id)}>
                                                    <Button variant="ghost" size="sm">
                                                        <FileText className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
