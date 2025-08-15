import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import {
    Activity,
    BarChart3,
    Calendar,
    Clock,
    Download,
    Eye,
    FileText,
    Filter,
    Search,
    TrendingUp,
    UserCheck
} from 'lucide-react';
import { useState } from 'react';

interface RekamMedis {
    id: number;
    tanggal_pemeriksaan: string;
    tanggal_pemeriksaan_formatted: string;
    pasien: {
        id: number;
        nama_lengkap: string;
        kode_pasien: string;
        tanggal_lahir: string;
        jenis_kelamin: string;
    };
    dokter: {
        id: number;
        nama_lengkap: string;
        jabatan: string;
    };
    anamnesis: string | null;
    diagnosa: string | null;
    pemeriksaan_fisik: string | null;
    rencana_pengobatan: string | null;
    catatan_dokter: string | null;
    tanda_vital: {
        tekanan_darah?: string;
        suhu?: string;
        berat_badan?: string;
        tinggi_badan?: string;
    };
    status_rekam_medis: string;
}

interface Pasien {
    id: number;
    nama_lengkap: string;
    kode_pasien: string;
}

interface Dokter {
    id: number;
    nama_lengkap: string;
}

interface Diagnosa {
    diagnosa: string;
    total: number;
}

interface Props {
    rekamMedis: {
        data: RekamMedis[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        tanggal_dari?: string;
        tanggal_sampai?: string;
        pasien_id?: string;
        dokter_id?: string;
        jenis_pemeriksaan?: string;
    };
    statistics: {
        total_rekam_medis: number;
        rekam_medis_hari_ini: number;
        rekam_medis_minggu_ini: number;
        rekam_medis_bulan_ini: number;
    };
    pasienList: Pasien[];
    dokterList: Dokter[];
    diagnosaTerbanyak: Diagnosa[];
}

const columnHelper = createColumnHelper<RekamMedis>();

export default function Index({ 
    rekamMedis, 
    filters, 
    statistics, 
    pasienList, 
    dokterList, 
    diagnosaTerbanyak 
}: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Filter states
    const [tanggalDari, setTanggalDari] = useState(filters.tanggal_dari || '');
    const [tanggalSampai, setTanggalSampai] = useState(filters.tanggal_sampai || '');
    const [pasienId, setPasienId] = useState(filters.pasien_id || '');
    const [dokterId, setDokterId] = useState(filters.dokter_id || '');
    const [jenisPemeriksaan, setJenisPemeriksaan] = useState(filters.jenis_pemeriksaan || '');

    const columns = [
        columnHelper.accessor('tanggal_pemeriksaan_formatted', {
            header: 'Tanggal',
            cell: (info) => (
                <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{info.getValue()}</span>
                </div>
            ),
        }),
        columnHelper.accessor('pasien.kode_pasien', {
            header: 'No. RM',
            cell: (info) => (
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {String(info.getValue())}
                </span>
            ),
        }),
        columnHelper.accessor('pasien.nama_lengkap', {
            header: 'Nama Pasien',
            cell: (info) => (
                <div>
                    <div className="font-medium text-gray-900">{info.getValue()}</div>
                    <div className="text-xs text-gray-500 capitalize">
                        {info.row.original.pasien.jenis_kelamin}
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('dokter.nama_lengkap', {
            header: 'Dokter',
            cell: (info) => (
                <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{String(info.getValue())}</span>
                </div>
            ),
        }),
        columnHelper.accessor('diagnosa', {
            header: 'Diagnosa',
            cell: (info) => (
                <div className="max-w-xs">
                    <span className="text-sm text-gray-900 line-clamp-2">
                        {String(info.getValue() || '-')}
                    </span>
                </div>
            ),
        }),
        columnHelper.accessor('anamnesis', {
            header: 'Anamnesis',
            cell: (info) => (
                <div className="max-w-xs">
                    <span className="text-sm text-gray-600 line-clamp-2">
                        {String(info.getValue() || '-')}
                    </span>
                </div>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: (info) => (
                <div className="flex items-center space-x-2">
                    <Link
                        href={`/admin/laporan/${info.row.original.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Lihat Detail"
                    >
                        <Eye className="w-4 h-4 text-blue-600" />
                    </Link>
                </div>
            ),
        }),
    ];

    const table = useReactTable({
        data: rekamMedis.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    const handleFilter = () => {
        const params = new URLSearchParams();
        
        if (tanggalDari) params.append('tanggal_dari', tanggalDari);
        if (tanggalSampai) params.append('tanggal_sampai', tanggalSampai);
        if (pasienId) params.append('pasien_id', pasienId);
        if (dokterId) params.append('dokter_id', dokterId);
        if (jenisPemeriksaan) params.append('jenis_pemeriksaan', jenisPemeriksaan);

        router.get('/admin/laporan', Object.fromEntries(params));
    };

    const handleClearFilters = () => {
        setTanggalDari('');
        setTanggalSampai('');
        setPasienId('');
        setDokterId('');
        setJenisPemeriksaan('');
        router.get('/admin/laporan');
    };

    const handleExport = () => {
        setIsExporting(true);
        
        const params = new URLSearchParams();
        if (tanggalDari) params.append('tanggal_dari', tanggalDari);
        if (tanggalSampai) params.append('tanggal_sampai', tanggalSampai);
        if (pasienId) params.append('pasien_id', pasienId);
        if (dokterId) params.append('dokter_id', dokterId);
        if (jenisPemeriksaan) params.append('jenis_pemeriksaan', jenisPemeriksaan);

        const url = `/admin/laporan-export?${params.toString()}`;
        window.open(url, '_blank');
        
        setTimeout(() => setIsExporting(false), 2000);
    };

    return (
        <AppLayout>
            <Head title="Laporan Rekam Medis" />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Laporan Rekam Medis</h1>
                            <p className="text-sm text-gray-600">Kelola dan lihat laporan rekam medis pasien</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </button>
                        
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 border border-transparent rounded-lg font-medium text-white hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {isExporting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            {isExporting ? 'Mengekspor...' : 'Export'}
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Total Rekam Medis</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.total_rekam_medis.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-green-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Hari Ini</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.rekam_medis_hari_ini.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <TrendingUp className="w-8 h-8 text-purple-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Minggu Ini</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.rekam_medis_minggu_ini.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <BarChart3 className="w-8 h-8 text-orange-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Bulan Ini</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.rekam_medis_bulan_ini.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Dari
                                </label>
                                <input
                                    type="date"
                                    value={tanggalDari}
                                    onChange={(e) => setTanggalDari(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Sampai
                                </label>
                                <input
                                    type="date"
                                    value={tanggalSampai}
                                    onChange={(e) => setTanggalSampai(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pasien
                                </label>
                                <select
                                    value={pasienId}
                                    onChange={(e) => setPasienId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Semua Pasien</option>
                                    {pasienList.map((pasien) => (
                                        <option key={pasien.id} value={pasien.id}>
                                            {pasien.kode_pasien} - {pasien.nama_lengkap}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dokter
                                </label>
                                <select
                                    value={dokterId}
                                    onChange={(e) => setDokterId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Semua Dokter</option>
                                    {dokterList.map((dokter) => (
                                        <option key={dokter.id} value={dokter.id}>
                                            {dokter.nama_lengkap}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jenis Pemeriksaan
                                </label>
                                <input
                                    type="text"
                                    value={jenisPemeriksaan}
                                    onChange={(e) => setJenisPemeriksaan(e.target.value)}
                                    placeholder="Cari berdasarkan keluhan..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 mt-4">
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Reset Filter
                            </button>
                            <button
                                onClick={handleFilter}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Terapkan Filter
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Daftar Rekam Medis</h2>
                                    <span className="text-sm text-gray-500">
                                        Menampilkan {rekamMedis.from} - {rekamMedis.to} dari {rekamMedis.total} data
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <tr key={headerGroup.id} className="border-b border-gray-200">
                                                    {headerGroup.headers.map((header) => (
                                                        <th
                                                            key={header.id}
                                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                                        </th>
                                                    ))}
                                                </tr>
                                            ))}
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {table.getRowModel().rows.map((row) => (
                                                <tr key={row.id} className="hover:bg-gray-50">
                                                    {row.getVisibleCells().map((cell) => (
                                                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {rekamMedis.data.length === 0 && (
                                    <div className="text-center py-8">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">Tidak ada data rekam medis yang ditemukan</p>
                                    </div>
                                )}

                                {/* Pagination */}
                                {rekamMedis.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                                        <div className="text-sm text-gray-700">
                                            Halaman {rekamMedis.current_page} dari {rekamMedis.last_page}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {/* Pagination buttons would go here */}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Diagnosa Terbanyak */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                                Diagnosa Terbanyak
                            </h3>
                            
                            <div className="space-y-3">
                                {diagnosaTerbanyak.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                {item.diagnosa}
                                            </p>
                                        </div>
                                        <div className="ml-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {item.total}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {diagnosaTerbanyak.length === 0 && (
                                <div className="text-center py-4">
                                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Belum ada data diagnosa</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
