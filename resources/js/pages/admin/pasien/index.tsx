import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    Calendar,
    Edit,
    Eye,
    Filter,
    MapPin,
    Phone,
    Plus,
    Search,
    Trash2,
    User,
    UsersRound
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data Pasien', href: '/admin/pasien' },
];

interface Pasien {
    id: number;
    no_rm: string;
    nik: string;
    nama_lengkap: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    telepon: string;
    golongan_darah?: string;
    pekerjaan?: string;
    status_pernikahan?: string;
    kontak_darurat?: string;
    alergi?: string;
    created_at: string;
    updated_at: string;
    umur?: number;
}

interface PasienIndexProps {
    pasien: {
        data: Pasien[];
        links?: any[];
        meta?: {
            total: number;
            from: number;
            to: number;
            current_page: number;
            last_page: number;
            per_page: number;
        };
    };
    filters: {
        search?: string;
        jenis_kelamin?: string;
        golongan_darah?: string;
    };
}

export default function PasienIndex({ pasien, filters }: PasienIndexProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [jenisKelaminFilter, setJenisKelaminFilter] = useState(filters.jenis_kelamin || '');
    const [golonganDarahFilter, setGolonganDarahFilter] = useState(filters.golongan_darah || '');

    const deletePasien = (pasienId: number, namaPasien: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data pasien ${namaPasien}?`)) {
            router.delete(`/admin/pasien/${pasienId}`, {
                onSuccess: () => {
                    toast.success('Data pasien berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus data pasien');
                }
            });
        }
    };

    const columns: ColumnDef<Pasien>[] = [
        {
            accessorKey: 'no_rm',
            header: ({ column }) => (
                <button
                    className="flex items-center space-x-2 hover:text-gray-600"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    <span>No. RM</span>
                    <ArrowUpDown className="w-4 h-4" />
                </button>
            ),
            cell: ({ row }) => (
                <div className="font-mono text-sm font-medium text-blue-600">
                    {row.getValue('no_rm')}
                </div>
            ),
        },
        {
            accessorKey: 'nik',
            header: 'NIK',
            cell: ({ row }) => (
                <div className="font-mono text-sm">
                    {row.getValue('nik')}
                </div>
            ),
        },
        {
            accessorKey: 'nama_lengkap',
            header: ({ column }) => (
                <button
                    className="flex items-center space-x-2 hover:text-gray-600"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    <span>Nama Lengkap</span>
                    <ArrowUpDown className="w-4 h-4" />
                </button>
            ),
            cell: ({ row }) => (
                <div>
                    <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{row.getValue('nama_lengkap')}</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{row.original.umur} tahun</span>
                        <span className="mx-1">•</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            row.original.jenis_kelamin === 'laki-laki' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-pink-100 text-pink-800'
                        }`}>
                            {row.original.jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'telepon',
            header: 'Kontak',
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{row.getValue('telepon')}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                        <MapPin className="w-3 h-3 text-gray-400 mt-0.5" />
                        <span className="text-xs text-gray-500 line-clamp-2">
                            {row.original.alamat}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'golongan_darah',
            header: 'Gol. Darah',
            cell: ({ row }) => {
                const golDarah = row.getValue('golongan_darah') as string;
                return golDarah ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {golDarah}
                    </span>
                ) : (
                    <span className="text-gray-400">-</span>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <button
                    className="flex items-center space-x-2 hover:text-gray-600"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    <span>Terdaftar</span>
                    <ArrowUpDown className="w-4 h-4" />
                </button>
            ),
            cell: ({ row }) => (
                <div className="text-sm text-gray-600">
                    {row.getValue('created_at')}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const pasien = row.original;
                return (
                    <div className="flex items-center space-x-2">
                        <Link
                            href={`/admin/pasien/${pasien.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            title="Lihat Detail"
                        >
                            <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                            href={`/admin/pasien/${pasien.id}/edit`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => deletePasien(pasien.id, pasien.nama_lengkap)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            title="Hapus"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: pasien?.data || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    const handleSearch = () => {
        router.get('/admin/pasien', {
            search: searchValue,
            jenis_kelamin: jenisKelaminFilter,
            golongan_darah: golonganDarahFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearchValue('');
        setJenisKelaminFilter('');
        setGolonganDarahFilter('');
        router.get('/admin/pasien');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Pasien" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <UsersRound className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Data Pasien</h1>
                            <p className="text-gray-600">Kelola data pasien rumah sakit</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/pasien/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Pasien
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pencarian
                            </label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    placeholder="Cari nama, NIK, No. RM, telepon..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Jenis Kelamin
                            </label>
                            <select
                                value={jenisKelaminFilter}
                                onChange={(e) => setJenisKelaminFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Semua</option>
                                <option value="laki-laki">Laki-laki</option>
                                <option value="perempuan">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Golongan Darah
                            </label>
                            <select
                                value={golonganDarahFilter}
                                onChange={(e) => setGolonganDarahFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Semua</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div className="flex items-end space-x-2">
                            <button
                                onClick={handleSearch}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Filter className="w-4 h-4 mx-auto" />
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <UsersRound className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Pasien</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {pasien?.meta?.total || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Laki-laki</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {pasien?.data?.filter(p => p.jenis_kelamin === 'laki-laki').length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-pink-100 rounded-lg">
                                <User className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Perempuan</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {pasien?.data?.filter(p => p.jenis_kelamin === 'perempuan').length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Hari Ini</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {pasien?.data?.filter(p => 
                                        new Date(p.created_at).toDateString() === new Date().toDateString()
                                    ).length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="px-6 py-8 text-center text-gray-500"
                                        >
                                            {pasien?.data ? 'Tidak ada data pasien.' : 'Memuat data...'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pasien.meta && pasien.meta.total > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {pasien.meta.from} - {pasien.meta.to} dari {pasien.meta.total} hasil
                                </div>
                                <div className="flex items-center space-x-2">
                                    {pasien.links && pasien.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm rounded-md ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                    ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
