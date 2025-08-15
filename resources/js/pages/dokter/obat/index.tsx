import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ColumnFiltersState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import {
    AlertTriangle,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    Eye,
    Filter,
    Package,
    Pill,
    Plus,
    Search,
    Trash2,
    X
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    nama_generik: string | null;
    kategori: string;
    satuan: string;
    stok_tersedia: number;
    stok_minimum: number;
    harga: number;
    pabrik: string | null;
    tanggal_kadaluarsa: string | null;
    tanggal_kadaluarsa_formatted: string | null;
    status_stok: 'habis' | 'menipis' | 'tersedia';
    is_expired: boolean;
    days_to_expire: number | null;
    is_aktif: boolean;
}

interface Stats {
    total_obat: number;
    stok_habis: number;
    stok_menipis: number;
    akan_kadaluwarsa: number;
    sudah_kadaluwarsa: number;
}

interface Props {
    obat: {
        data: Obat[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    categories: string[];
    stats: Stats;
    filters: {
        search?: string;
        kategori?: string;
        status_stok?: string;
        sort_by?: string;
        sort_order?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data Obat', href: '/dokter/obat' },
];

const columnHelper = createColumnHelper<Obat>();

export default function Index({ obat, categories, stats, filters }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori || '');
    const [statusStokFilter, setStatusStokFilter] = useState(filters.status_stok || '');
    const [showFilters, setShowFilters] = useState(false);

    const getStatusBadge = (status: string) => {
        const variants = {
            habis: 'bg-red-100 text-red-800 border-red-200',
            menipis: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            tersedia: 'bg-green-100 text-green-800 border-green-200',
        };
        
        return `px-2 py-1 text-xs font-medium rounded-full border ${variants[status as keyof typeof variants]}`;
    };

    const getStatusText = (status: string) => {
        const texts = {
            habis: 'Habis',
            menipis: 'Menipis',
            tersedia: 'Tersedia',
        };
        
        return texts[status as keyof typeof texts];
    };

    const columns = [
        columnHelper.accessor('kode_obat', {
            header: 'Kode Obat',
            cell: (info) => (
                <div className="font-medium text-gray-900">
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('nama_obat', {
            header: 'Nama Obat',
            cell: (info) => (
                <div>
                    <div className="font-medium text-gray-900">{info.getValue()}</div>
                    <div className="text-sm text-gray-500">
                        {info.row.original.pabrik || 'Tidak diketahui'}
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('kategori', {
            header: 'Kategori',
            cell: (info) => (
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('satuan', {
            header: 'Satuan & Generik',
            cell: (info) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{info.getValue()}</div>
                    <div className="text-sm text-gray-500">
                        {info.row.original.nama_generik || 'Generik tidak diketahui'}
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('stok_tersedia', {
            header: 'Stok',
            cell: (info) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">{info.getValue()}</div>
                    <div className="text-gray-500">Min: {info.row.original.stok_minimum}</div>
                </div>
            ),
        }),
        columnHelper.accessor('harga', {
            header: 'Harga',
            cell: (info) => (
                <div className="text-sm font-medium text-gray-900">
                    Rp {info.getValue().toLocaleString('id-ID')}
                </div>
            ),
        }),
        columnHelper.display({
            id: 'status_kadaluarsa',
            header: 'Status & Kadaluarsa',
            cell: (info) => (
                <div className="space-y-1">
                    <span className={getStatusBadge(info.row.original.status_stok)}>
                        {getStatusText(info.row.original.status_stok)}
                    </span>
                    {info.row.original.tanggal_kadaluarsa_formatted && (
                        <div className="text-xs text-gray-500">
                            {info.row.original.is_expired ? (
                                <span className="text-red-600 font-medium">
                                    Kadaluwarsa {info.row.original.tanggal_kadaluarsa_formatted}
                                </span>
                            ) : info.row.original.days_to_expire !== null && info.row.original.days_to_expire <= 30 ? (
                                <span className="text-orange-600 font-medium">
                                    {info.row.original.days_to_expire} hari lagi
                                </span>
                            ) : (
                                <span>
                                    Exp: {info.row.original.tanggal_kadaluarsa_formatted}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: (info) => (
                <div className="flex items-center space-x-2">
                    <Link
                        href={`/dokter/obat/${info.row.original.id}`}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Lihat Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                        href={`/dokter/obat/${info.row.original.id}/edit`}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-md text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(info.row.original.id, info.row.original.nama_obat)}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-md text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        }),
    ];

    const table = useReactTable({
        data: obat.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
    });

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (kategoriFilter) params.append('kategori', kategoriFilter);
        if (statusStokFilter) params.append('status_stok', statusStokFilter);
        
        router.get(`/dokter/obat?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setKategoriFilter('');
        setStatusStokFilter('');
        router.get('/dokter/obat');
    };

    const handleDelete = (id: number, namaObat: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus obat "${namaObat}"?`)) {
            router.delete(`/dokter/obat/${id}`, {
                onSuccess: () => {
                    toast.success('Data obat berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus data obat');
                },
            });
        }
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', page.toString());
        router.get(`/dokter/obat?${params.toString()}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Obat" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Data Obat</h1>
                        <p className="text-gray-600">Kelola data obat dan stok</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <Link
                            href="/dokter/obat/create"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Obat
                        </Link>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                            <Package className="w-8 h-8 text-blue-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Total Obat</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_obat}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Stok Habis</p>
                                <p className="text-2xl font-bold text-red-600">{stats.stok_habis}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                            <AlertTriangle className="w-8 h-8 text-yellow-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Stok Menipis</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.stok_menipis}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                            <Calendar className="w-8 h-8 text-orange-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Akan Kadaluwarsa</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.akan_kadaluwarsa}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                            <X className="w-8 h-8 text-red-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Kadaluwarsa</p>
                                <p className="text-2xl font-bold text-red-600">{stats.sudah_kadaluwarsa}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cari Obat
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Nama obat, kategori, pabrik..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kategori
                                </label>
                                <select
                                    value={kategoriFilter}
                                    onChange={(e) => setKategoriFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((kategori) => (
                                        <option key={kategori} value={kategori}>
                                            {kategori}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status Stok
                                </label>
                                <select
                                    value={statusStokFilter}
                                    onChange={(e) => setStatusStokFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="tersedia">Tersedia</option>
                                    <option value="menipis">Menipis</option>
                                    <option value="habis">Habis</option>
                                </select>
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleSearch}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Terapkan Filter
                                </button>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                    </span>
                                                    <span className="text-gray-400">
                                                        {{
                                                            asc: '↑',
                                                            desc: '↓',
                                                        }[header.column.getIsSorted() as string] ?? '↕'}
                                                    </span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {obat.data.length === 0 && (
                        <div className="text-center py-12">
                            <Pill className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data obat</h3>
                            <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan obat baru.</p>
                            <div className="mt-6">
                                <Link
                                    href="/dokter/obat/create"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Obat
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {obat.data.length > 0 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(obat.current_page - 1)}
                                    disabled={obat.current_page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(obat.current_page + 1)}
                                    disabled={obat.current_page === obat.last_page}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Menampilkan <span className="font-medium">{obat.from}</span> sampai{' '}
                                        <span className="font-medium">{obat.to}</span> dari{' '}
                                        <span className="font-medium">{obat.total}</span> hasil
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => handlePageChange(1)}
                                            disabled={obat.current_page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronsLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(obat.current_page - 1)}
                                            disabled={obat.current_page === 1}
                                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        
                                        {Array.from({ length: Math.min(5, obat.last_page) }, (_, i) => {
                                            const page = Math.max(1, Math.min(obat.last_page - 4, obat.current_page - 2)) + i;
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        page === obat.current_page
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                        
                                        <button
                                            onClick={() => handlePageChange(obat.current_page + 1)}
                                            disabled={obat.current_page === obat.last_page}
                                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(obat.last_page)}
                                            disabled={obat.current_page === obat.last_page}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronsRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
