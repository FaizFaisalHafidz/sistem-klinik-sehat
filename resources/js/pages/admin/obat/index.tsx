import AppLayout from '@/layouts/app-layout';
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
    CheckCircle,
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
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    nama_generik: string | null;
    pabrik: string | null;
    kategori: string | null;
    satuan: string;
    harga: number;
    stok_tersedia: number;
    stok_minimum: number;
    tanggal_kadaluarsa: string | null;
    deskripsi: string | null;
    is_aktif: boolean;
    is_stok_menipis: boolean;
    is_akan_kadaluarsa: boolean;
    is_kadaluarsa: boolean;
    created_at: string;
    updated_at: string;
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
    filters: {
        search?: string;
        status?: string;
        kategori?: string;
        stok?: string;
        expiry?: string;
    };
}

const columnHelper = createColumnHelper<Obat>();

export default function Index({ obat, filters }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori || '');
    const [stokFilter, setStokFilter] = useState(filters.stok || '');
    const [expiryFilter, setExpiryFilter] = useState(filters.expiry || '');
    const [showFilters, setShowFilters] = useState(false);

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
                    {info.row.original.nama_generik && (
                        <div className="text-xs text-gray-500">
                            Generik: {info.row.original.nama_generik}
                        </div>
                    )}
                </div>
            ),
        }),
        columnHelper.accessor('kategori', {
            header: 'Kategori',
            cell: (info) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {info.getValue() || 'Umum'}
                </span>
            ),
        }),
        columnHelper.accessor('pabrik', {
            header: 'Pabrik',
            cell: (info) => (
                <div className="text-sm text-gray-600">
                    {info.getValue() || '-'}
                </div>
            ),
        }),
        columnHelper.accessor('harga', {
            header: 'Harga',
            cell: (info) => (
                <div className="text-sm font-medium text-gray-900">
                    Rp {new Intl.NumberFormat('id-ID').format(info.getValue())}
                    <div className="text-xs text-gray-500">/{info.row.original.satuan}</div>
                </div>
            ),
        }),
        columnHelper.accessor('stok_tersedia', {
            header: 'Stok',
            cell: (info) => {
                const stok = info.getValue();
                const minimum = info.row.original.stok_minimum;
                const isLow = stok <= minimum;
                const isEmpty = stok === 0;
                
                return (
                    <div className="text-sm">
                        <div className={`font-medium ${isEmpty ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900'}`}>
                            {stok} {info.row.original.satuan}
                        </div>
                        <div className="text-xs text-gray-500">
                            Min: {minimum}
                        </div>
                        {isLow && (
                            <div className="flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
                                <span className="text-xs text-amber-600">
                                    {isEmpty ? 'Habis' : 'Menipis'}
                                </span>
                            </div>
                        )}
                    </div>
                );
            },
        }),
        columnHelper.accessor('tanggal_kadaluarsa', {
            header: 'Kadaluarsa',
            cell: (info) => {
                const tanggal = info.getValue();
                const isExpired = info.row.original.is_kadaluarsa;
                const willExpire = info.row.original.is_akan_kadaluarsa;
                
                if (!tanggal) return <span className="text-gray-400">-</span>;
                
                return (
                    <div className="text-sm">
                        <div className={`${isExpired ? 'text-red-600' : willExpire ? 'text-amber-600' : 'text-gray-900'}`}>
                            {new Date(tanggal).toLocaleDateString('id-ID')}
                        </div>
                        {(isExpired || willExpire) && (
                            <div className="flex items-center mt-1">
                                <Calendar className="w-3 h-3 mr-1 text-amber-500" />
                                <span className="text-xs text-amber-600">
                                    {isExpired ? 'Kadaluarsa' : 'Akan Kadaluarsa'}
                                </span>
                            </div>
                        )}
                    </div>
                );
            },
        }),
        columnHelper.accessor('is_aktif', {
            header: 'Status',
            cell: (info) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    info.getValue() 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {info.getValue() ? (
                        <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Aktif
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Tidak Aktif
                        </>
                    )}
                </span>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Aksi',
            cell: (info) => (
                <div className="flex items-center space-x-2">
                    <Link
                        href={`/admin/obat/${info.row.original.id}`}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Lihat Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                        href={`/admin/obat/${info.row.original.id}/edit`}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-md text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(info.row.original.id)}
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
        if (statusFilter) params.append('status', statusFilter);
        if (kategoriFilter) params.append('kategori', kategoriFilter);
        if (stokFilter) params.append('stok', stokFilter);
        if (expiryFilter) params.append('expiry', expiryFilter);
        
        router.get(`/admin/obat?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setKategoriFilter('');
        setStokFilter('');
        setExpiryFilter('');
        router.get('/admin/obat');
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data obat ini?')) {
            router.delete(`/admin/obat/${id}`, {
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
        router.get(`/admin/obat?${params.toString()}`);
    };

    return (
        <AppLayout>
            <Head title="Data Obat" />
            
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
                            <Pill className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Data Obat</h1>
                            <p className="text-sm text-gray-600">Kelola inventori obat dan farmasi</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/obat/create"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 border border-transparent rounded-lg font-medium text-white hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Obat
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Cari obat..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            {/* Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </button>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSearch}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-lg font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Cari
                                </button>
                                {(searchTerm || statusFilter || kategoriFilter || stokFilter || expiryFilter) && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">Semua Status</option>
                                            <option value="aktif">Aktif</option>
                                            <option value="tidak_aktif">Tidak Aktif</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                        <select
                                            value={kategoriFilter}
                                            onChange={(e) => setKategoriFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">Semua Kategori</option>
                                            <option value="antibiotik">Antibiotik</option>
                                            <option value="analgesik">Analgesik</option>
                                            <option value="antihistamin">Antihistamin</option>
                                            <option value="vitamin">Vitamin & Suplemen</option>
                                            <option value="antiseptik">Antiseptik</option>
                                            <option value="kardiovaskular">Kardiovaskular</option>
                                            <option value="diabetes">Diabetes</option>
                                            <option value="gastrointestinal">Gastrointestinal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                                        <select
                                            value={stokFilter}
                                            onChange={(e) => setStokFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">Semua Stok</option>
                                            <option value="menipis">Stok Menipis</option>
                                            <option value="habis">Stok Habis</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kadaluarsa</label>
                                        <select
                                            value={expiryFilter}
                                            onChange={(e) => setExpiryFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">Semua</option>
                                            <option value="akan_kadaluarsa">Akan Kadaluarsa</option>
                                            <option value="kadaluarsa">Sudah Kadaluarsa</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <Package className="w-8 h-8 text-green-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Total Obat</p>
                                <p className="text-2xl font-bold text-gray-900">{obat.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Stok Menipis</p>
                                <p className="text-2xl font-bold text-amber-600">
                                    {obat.data.filter(item => item.is_stok_menipis).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <Calendar className="w-8 h-8 text-orange-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Akan Kadaluarsa</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {obat.data.filter(item => item.is_akan_kadaluarsa).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <XCircle className="w-8 h-8 text-red-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Kadaluarsa</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {obat.data.filter(item => item.is_kadaluarsa).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                                    href="/admin/obat/create"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                                                            ? 'z-10 bg-green-50 border-green-500 text-green-600'
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
