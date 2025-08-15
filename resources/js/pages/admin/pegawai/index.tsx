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
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    Eye,
    Filter,
    Plus,
    Search,
    Trash2,
    UserCheck,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    nama_pengguna: string;
    nama_lengkap: string;
    email: string;
}

interface Pegawai {
    id: number;
    kode_pegawai: string;
    nama_lengkap: string;
    jabatan: string;
    departemen: string | null;
    nomor_izin: string | null;
    spesialisasi: string | null;
    telepon: string | null;
    email: string | null;
    alamat: string | null;
    tanggal_masuk: string | null;
    is_aktif: boolean;
    user: User | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    pegawai: {
        data: Pegawai[];
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
        jabatan?: string;
        departemen?: string;
    };
}

const columnHelper = createColumnHelper<Pegawai>();

export default function Index({ pegawai, filters }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [jabatanFilter, setJabatanFilter] = useState(filters.jabatan || '');
    const [departemenFilter, setDepartemenFilter] = useState(filters.departemen || '');
    const [showFilters, setShowFilters] = useState(false);

    const columns = [
        columnHelper.accessor('kode_pegawai', {
            header: 'Kode Pegawai',
            cell: (info) => (
                <div className="font-medium text-gray-900">
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('nama_lengkap', {
            header: 'Nama Lengkap',
            cell: (info) => (
                <div className="font-medium text-gray-900">
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('jabatan', {
            header: 'Jabatan',
            cell: (info) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('departemen', {
            header: 'Departemen',
            cell: (info) => (
                <div className="text-sm text-gray-600">
                    {info.getValue() || '-'}
                </div>
            ),
        }),
        columnHelper.accessor('spesialisasi', {
            header: 'Spesialisasi',
            cell: (info) => (
                <div className="text-sm text-gray-600">
                    {info.getValue() || '-'}
                </div>
            ),
        }),
        columnHelper.accessor('telepon', {
            header: 'Telepon',
            cell: (info) => (
                <div className="text-sm text-gray-600">
                    {info.getValue() || '-'}
                </div>
            ),
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
                        href={`/admin/pegawai/${info.row.original.id}`}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Lihat Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                        href={`/admin/pegawai/${info.row.original.id}/edit`}
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
        data: pegawai.data,
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
        if (jabatanFilter) params.append('jabatan', jabatanFilter);
        if (departemenFilter) params.append('departemen', departemenFilter);
        
        router.get(`/admin/pegawai?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setJabatanFilter('');
        setDepartemenFilter('');
        router.get('/admin/pegawai');
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data pegawai ini?')) {
            router.delete(`/admin/pegawai/${id}`, {
                onSuccess: () => {
                    toast.success('Data pegawai berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus data pegawai');
                },
            });
        }
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', page.toString());
        router.get(`/admin/pegawai?${params.toString()}`);
    };

    return (
        <AppLayout>
            <Head title="Data Pegawai" />
            
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                            <UserCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Data Pegawai</h1>
                            <p className="text-sm text-gray-600">Kelola data pegawai klinik</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/pegawai/create"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Pegawai
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
                                        placeholder="Cari pegawai..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </button>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSearch}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Cari
                                </button>
                                {(searchTerm || statusFilter || jabatanFilter || departemenFilter) && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Semua Status</option>
                                            <option value="aktif">Aktif</option>
                                            <option value="tidak_aktif">Tidak Aktif</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                                        <select
                                            value={jabatanFilter}
                                            onChange={(e) => setJabatanFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Semua Jabatan</option>
                                            <option value="dokter">Dokter</option>
                                            <option value="perawat">Perawat</option>
                                            <option value="apoteker">Apoteker</option>
                                            <option value="pendaftaran">Pendaftaran</option>
                                            <option value="administrasi">Administrasi</option>
                                            <option value="keuangan">Keuangan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
                                        <select
                                            value={departemenFilter}
                                            onChange={(e) => setDepartemenFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Semua Departemen</option>
                                            <option value="umum">Umum</option>
                                            <option value="penyakit_dalam">Penyakit Dalam</option>
                                            <option value="anak">Anak</option>
                                            <option value="obstetri_ginekologi">Obstetri & Ginekologi</option>
                                            <option value="bedah">Bedah</option>
                                            <option value="farmasi">Farmasi</option>
                                            <option value="administrasi">Administrasi</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
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
                    {pegawai.data.length === 0 && (
                        <div className="text-center py-12">
                            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data pegawai</h3>
                            <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan pegawai baru.</p>
                            <div className="mt-6">
                                <Link
                                    href="/admin/pegawai/create"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Pegawai
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {pegawai.data.length > 0 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(pegawai.current_page - 1)}
                                    disabled={pegawai.current_page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(pegawai.current_page + 1)}
                                    disabled={pegawai.current_page === pegawai.last_page}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Menampilkan <span className="font-medium">{pegawai.from}</span> sampai{' '}
                                        <span className="font-medium">{pegawai.to}</span> dari{' '}
                                        <span className="font-medium">{pegawai.total}</span> hasil
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => handlePageChange(1)}
                                            disabled={pegawai.current_page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronsLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(pegawai.current_page - 1)}
                                            disabled={pegawai.current_page === 1}
                                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        
                                        {Array.from({ length: Math.min(5, pegawai.last_page) }, (_, i) => {
                                            const page = Math.max(1, Math.min(pegawai.last_page - 4, pegawai.current_page - 2)) + i;
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        page === pegawai.current_page
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                        
                                        <button
                                            onClick={() => handlePageChange(pegawai.current_page + 1)}
                                            disabled={pegawai.current_page === pegawai.last_page}
                                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(pegawai.last_page)}
                                            disabled={pegawai.current_page === pegawai.last_page}
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
