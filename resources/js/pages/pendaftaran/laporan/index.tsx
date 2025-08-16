import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    FileText,
    Filter,
    LineChart,
    PieChart,
    Printer,
    RefreshCw,
    Search,
    TrendingUp,
    UserCheck,
    Users,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

interface ChartDataItem {
    tanggal: string;
    total: number;
}

interface Stats {
    total_pendaftaran?: number;
    pendaftaran_aktif?: number;
    pendaftaran_dibatalkan?: number;
    pendaftaran_selesai?: number;
    total_antrian?: number;
    antrian_menunggu?: number;
    antrian_dipanggil?: number;
    antrian_selesai?: number;
    avg_waiting_time?: number;
    total_rekam_medis?: number;
    rekam_medis_hari_ini?: number;
    total_pasien?: number;
    pasien_baru_hari_ini?: number;
    pasien_laki_laki?: number;
    pasien_perempuan?: number;
    chart_data?: ChartDataItem[];
    top_diagnoses?: Array<{diagnosis: string; total: number}>;
    age_distribution?: Array<{age_group: string; total: number}>;
}

interface DataItem {
    id: number;
    created_at: string;
    [key: string]: any;
}

interface Props {
    stats: Stats;
    data: {
        data: DataItem[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        tanggal_mulai: string;
        tanggal_akhir: string;
        jenis_laporan: string;
        search: string;
    };
}

export default function Index({ stats, data, filters }: Props) {
    const [formData, setFormData] = useState({
        tanggal_mulai: filters.tanggal_mulai,
        tanggal_akhir: filters.tanggal_akhir,
        jenis_laporan: filters.jenis_laporan,
        search: filters.search,
    });

    const handleFilter = () => {
        router.get(route('pendaftaran.laporan.index'), formData, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        const resetData = {
            tanggal_mulai: '',
            tanggal_akhir: '',
            jenis_laporan: 'pendaftaran',
            search: '',
        };
        setFormData(resetData);
        router.get(route('pendaftaran.laporan.index'), resetData, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = (format: string) => {
        const params = new URLSearchParams({
            ...formData,
            format: format,
        });
        
        // Create download URL
        const url = `${route('pendaftaran.laporan.export')}?${params.toString()}`;
        
        // Open in new window for download
        window.open(url, '_blank');
    };

    const getStatsCards = () => {
        switch (formData.jenis_laporan) {
            case 'pendaftaran':
                return [
                    {
                        title: 'Total Pendaftaran',
                        value: stats.total_pendaftaran || 0,
                        icon: FileText,
                        color: 'blue',
                    },
                    {
                        title: 'Pendaftaran Aktif',
                        value: stats.pendaftaran_aktif || 0,
                        icon: CheckCircle,
                        color: 'green',
                    },
                    {
                        title: 'Pendaftaran Selesai',
                        value: stats.pendaftaran_selesai || 0,
                        icon: Activity,
                        color: 'purple',
                    },
                    {
                        title: 'Pendaftaran Dibatalkan',
                        value: stats.pendaftaran_dibatalkan || 0,
                        icon: XCircle,
                        color: 'red',
                    },
                ];

            case 'antrian':
                return [
                    {
                        title: 'Total Antrian',
                        value: stats.total_antrian || 0,
                        icon: Clock,
                        color: 'blue',
                    },
                    {
                        title: 'Menunggu',
                        value: stats.antrian_menunggu || 0,
                        icon: Clock,
                        color: 'yellow',
                    },
                    {
                        title: 'Dipanggil',
                        value: stats.antrian_dipanggil || 0,
                        icon: AlertCircle,
                        color: 'blue',
                    },
                    {
                        title: 'Selesai',
                        value: stats.antrian_selesai || 0,
                        icon: CheckCircle,
                        color: 'green',
                    },
                ];

            case 'rekam_medis':
                return [
                    {
                        title: 'Total Rekam Medis',
                        value: stats.total_rekam_medis || 0,
                        icon: FileText,
                        color: 'blue',
                    },
                    {
                        title: 'Rekam Medis Hari Ini',
                        value: stats.rekam_medis_hari_ini || 0,
                        icon: Calendar,
                        color: 'green',
                    },
                ];

            case 'pasien':
                return [
                    {
                        title: 'Total Pasien Baru',
                        value: stats.total_pasien || 0,
                        icon: Users,
                        color: 'blue',
                    },
                    {
                        title: 'Pasien Baru Hari Ini',
                        value: stats.pasien_baru_hari_ini || 0,
                        icon: UserCheck,
                        color: 'green',
                    },
                    {
                        title: 'Laki-laki',
                        value: stats.pasien_laki_laki || 0,
                        icon: Users,
                        color: 'blue',
                    },
                    {
                        title: 'Perempuan',
                        value: stats.pasien_perempuan || 0,
                        icon: Users,
                        color: 'pink',
                    },
                ];

            default:
                return [];
        }
    };

    const getColorClasses = (color: string) => {
        const colors = {
            blue: 'border-blue-200 bg-blue-50 text-blue-600',
            green: 'border-green-200 bg-green-50 text-green-600',
            yellow: 'border-yellow-200 bg-yellow-50 text-yellow-600',
            red: 'border-red-200 bg-red-50 text-red-600',
            purple: 'border-purple-200 bg-purple-50 text-purple-600',
            pink: 'border-pink-200 bg-pink-50 text-pink-600',
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title="Laporan Rekam Medis" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Laporan & Analisis</h1>
                        <p className="text-gray-600">Laporan dan analisis data klinik secara komprehensif</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={() => handleExport('pdf')}
                            variant="outline"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Export PDF
                        </Button>
                        <Button 
                            onClick={() => handleExport('excel')}
                            variant="outline"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export Excel
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

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filter Laporan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Jenis Laporan
                                </label>
                                <select 
                                    value={formData.jenis_laporan} 
                                    onChange={(e) => setFormData({...formData, jenis_laporan: e.target.value})}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="pendaftaran">Pendaftaran</option>
                                    <option value="antrian">Antrian</option>
                                    <option value="rekam_medis">Rekam Medis</option>
                                    <option value="pasien">Pasien Baru</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Tanggal Mulai
                                </label>
                                <Input
                                    type="date"
                                    value={formData.tanggal_mulai}
                                    onChange={(e) => setFormData({...formData, tanggal_mulai: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Tanggal Akhir
                                </label>
                                <Input
                                    type="date"
                                    value={formData.tanggal_akhir}
                                    onChange={(e) => setFormData({...formData, tanggal_akhir: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Pencarian
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Cari..."
                                        value={formData.search}
                                        onChange={(e) => setFormData({...formData, search: e.target.value})}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={handleFilter} className="flex-1">
                                    <Search className="w-4 h-4 mr-2" />
                                    Tampilkan
                                </Button>
                                <Button onClick={handleReset} variant="outline">
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {getStatsCards().map((stat, index) => (
                        <Card key={index} className={getColorClasses(stat.color)}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{stat.title}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                    <stat.icon className="h-8 w-8" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Chart Section */}
                {stats.chart_data && stats.chart_data.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Main Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Trend {formData.jenis_laporan === 'pendaftaran' ? 'Pendaftaran' : 
                                           formData.jenis_laporan === 'antrian' ? 'Antrian' :
                                           formData.jenis_laporan === 'rekam_medis' ? 'Rekam Medis' : 'Pasien Baru'} per Hari
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">Chart akan ditampilkan di sini</p>
                                        <p className="text-sm text-gray-500">
                                            Data tersedia: {stats.chart_data.length} hari
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="w-5 h-5" />
                                    Informasi Tambahan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {formData.jenis_laporan === 'antrian' && stats.avg_waiting_time !== undefined && (
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-medium">Rata-rata Waktu Tunggu</span>
                                            </div>
                                            <Badge variant="outline">{stats.avg_waiting_time} menit</Badge>
                                        </div>
                                    )}

                                    {formData.jenis_laporan === 'rekam_medis' && stats.top_diagnoses && (
                                        <div>
                                            <h4 className="font-medium mb-2">Top 5 Diagnosis</h4>
                                            <div className="space-y-2">
                                                {stats.top_diagnoses.slice(0, 5).map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                        <span className="text-sm">{item.diagnosis}</span>
                                                        <Badge variant="outline">{item.total}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {formData.jenis_laporan === 'pasien' && stats.age_distribution && (
                                        <div>
                                            <h4 className="font-medium mb-2">Distribusi Umur</h4>
                                            <div className="space-y-2">
                                                {stats.age_distribution.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                        <span className="text-sm">{item.age_group} tahun</span>
                                                        <Badge variant="outline">{item.total} orang</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium">Periode Laporan</span>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {formData.tanggal_mulai} - {formData.tanggal_akhir}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Data {formData.jenis_laporan === 'pendaftaran' ? 'Pendaftaran' : 
                                 formData.jenis_laporan === 'antrian' ? 'Antrian' :
                                 formData.jenis_laporan === 'rekam_medis' ? 'Rekam Medis' : 'Pasien Baru'}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                            Menampilkan {data.total} data
                        </p>
                    </CardHeader>
                    <CardContent>
                        {data.data.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">Tidak ada data</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Tidak ada data ditemukan untuk periode yang dipilih.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.data.map((item) => (
                                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">ID:</span>
                                                <p className="text-sm text-gray-900">#{item.id}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Tanggal:</span>
                                                <p className="text-sm text-gray-900">{formatDate(item.created_at)}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Detail:</span>
                                                <p className="text-sm text-gray-900">
                                                    {/* Render different details based on report type */}
                                                    {formData.jenis_laporan === 'pendaftaran' && item.kode_pendaftaran}
                                                    {formData.jenis_laporan === 'antrian' && `Antrian #${item.nomor_antrian}`}
                                                    {formData.jenis_laporan === 'rekam_medis' && item.diagnosis}
                                                    {formData.jenis_laporan === 'pasien' && item.nama_lengkap}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {data.last_page > 1 && (
                                    <div className="flex items-center justify-between pt-4">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {((data.current_page - 1) * data.per_page) + 1} sampai{' '}
                                            {Math.min(data.current_page * data.per_page, data.total)} dari{' '}
                                            {data.total} hasil
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {data.links.map((link, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        if (link.url) {
                                                            router.get(link.url, formData);
                                                        }
                                                    }}
                                                    disabled={!link.url}
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
