import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import {
    Calendar,
    ChevronDown,
    ChevronUp,
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
import { useMemo, useState } from 'react';

interface Pasien {
    id: number;
    kode_pasien: string;
    nik: string;
    nama_lengkap: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: 'laki-laki' | 'perempuan';
    alamat: string;
    telepon: string;
    email?: string;
    pekerjaan?: string;
    golongan_darah?: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedPasien {
    data: Pasien[];
    meta: {
        total: number;
        from: number;
        to: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    pasien: PaginatedPasien;
    filters: {
        search?: string;
        jenis_kelamin?: string;
        golongan_darah?: string;
    };
}

export default function Index({ pasien, filters }: Props) {
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [jenisKelaminFilter, setJenisKelaminFilter] = useState(filters.jenis_kelamin || '');
    const [golonganDarahFilter, setGolonganDarahFilter] = useState(filters.golongan_darah || '');
    const [sorting, setSorting] = useState<SortingState>([]);

    const handleSearch = () => {
        const searchParams = new URLSearchParams();
        if (searchValue) searchParams.set('search', searchValue);
        if (jenisKelaminFilter) searchParams.set('jenis_kelamin', jenisKelaminFilter);
        if (golonganDarahFilter) searchParams.set('golongan_darah', golonganDarahFilter);
        
        router.get(`/pendaftaran/pasien?${searchParams.toString()}`);
    };

    const handleReset = () => {
        setSearchValue('');
        setJenisKelaminFilter('');
        setGolonganDarahFilter('');
        router.get('/pendaftaran/pasien');
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data pasien ini?')) {
            router.delete(`/pendaftaran/pasien/${id}`);
        }
    };

    const columns = useMemo<ColumnDef<Pasien>[]>(
        () => [
            {
                accessorKey: 'kode_pasien',
                header: ({ column }) => (
                    <button
                        className="flex items-center space-x-1 text-left"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        <span>Kode Pasien</span>
                        {column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : null}
                    </button>
                ),
                cell: ({ row }) => (
                    <div className="font-medium text-blue-600">
                        {row.getValue('kode_pasien')}
                    </div>
                ),
            },
            {
                accessorKey: 'nik',
                header: 'NIK',
                cell: ({ row }) => (
                    <div className="text-gray-900">
                        {row.getValue('nik')}
                    </div>
                ),
            },
            {
                accessorKey: 'nama_lengkap',
                header: ({ column }) => (
                    <button
                        className="flex items-center space-x-1 text-left"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        <span>Nama Lengkap</span>
                        {column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : null}
                    </button>
                ),
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium text-gray-900">
                            {row.getValue('nama_lengkap')}
                        </div>
                        <div className="text-sm text-gray-500">
                            {row.original.jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan'}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'telepon',
                header: 'Telepon',
                cell: ({ row }) => (
                    <div className="text-gray-900 flex items-center space-x-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{row.getValue('telepon')}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'alamat',
                header: 'Alamat',
                cell: ({ row }) => (
                    <div className="text-gray-900 flex items-center space-x-1 max-w-xs">
                        <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{row.getValue('alamat')}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <button
                        className="flex items-center space-x-1 text-left"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        <span>Tanggal Daftar</span>
                        {column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : null}
                    </button>
                ),
                cell: ({ row }) => (
                    <div className="text-gray-900">
                        {new Date(row.getValue('created_at')).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </div>
                ),
            },
            {
                id: 'actions',
                header: 'Aksi',
                cell: ({ row }) => (
                    <div className="flex items-center space-x-2">
                        <Link
                            href={`/pendaftaran/pasien/${row.original.id}`}
                            className="inline-flex items-center p-1 text-blue-600 hover:text-blue-800"
                            title="Lihat Detail"
                        >
                            <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                            href={`/pendaftaran/pasien/${row.original.id}/edit`}
                            className="inline-flex items-center p-1 text-yellow-600 hover:text-yellow-800"
                            title="Edit"
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={() => handleDelete(row.original.id)}
                            className="inline-flex items-center p-1 text-red-600 hover:text-red-800"
                            title="Hapus"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data: pasien?.data || [],
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <AppLayout>
            <Head title="Data Pasien" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Data Pasien</h1>
                        <p className="text-gray-600">Kelola data pasien untuk pendaftaran</p>
                    </div>
                    <Link
                        href="/pendaftaran/pasien/create"
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
                                    placeholder="Cari nama, NIK, kode pasien, telepon..."
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