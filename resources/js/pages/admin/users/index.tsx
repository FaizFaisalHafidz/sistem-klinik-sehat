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
    Edit,
    Eye,
    Filter,
    Plus, Search,
    ToggleLeft, ToggleRight, UserCheck, UserX,
    Users
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen Pengguna', href: '/admin/users' },
];

interface User {
    id: number;
    nama_pengguna: string;
    nama_lengkap: string;
    email: string;
    telepon: string;
    is_aktif: boolean;
    roles: string[];
    foto_profil: string;
    created_at: string;
    updated_at: string;
}

interface UsersIndexProps {
    users: {
        data: User[];
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
    roles: Record<string, string>;
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
}

export default function UsersIndex({ users, roles, filters }: UsersIndexProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const toggleUserStatus = (userId: number, currentStatus: boolean) => {
        router.post(`/admin/users/${userId}/toggle-status`, {}, {
            onSuccess: () => {
                const status = currentStatus ? 'dinonaktifkan' : 'diaktifkan';
                toast.success(`Pengguna berhasil ${status}`);
            },
            onError: () => {
                toast.error('Gagal mengubah status pengguna');
            }
        });
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'foto_profil',
            header: 'Foto',
            cell: ({ row }) => (
                <img
                    src={row.getValue('foto_profil')}
                    alt={row.original.nama_lengkap}
                    className="w-10 h-10 rounded-full object-cover"
                />
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
                    <div className="font-medium text-gray-900">{row.getValue('nama_lengkap')}</div>
                    <div className="text-sm text-gray-500">@{row.original.nama_pengguna}</div>
                </div>
            ),
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <button
                    className="flex items-center space-x-2 hover:text-gray-600"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    <span>Email</span>
                    <ArrowUpDown className="w-4 h-4" />
                </button>
            ),
        },
        {
            accessorKey: 'telepon',
            header: 'Telepon',
            cell: ({ row }) => row.getValue('telepon') || '-',
        },
        {
            accessorKey: 'roles',
            header: 'Role',
            cell: ({ row }) => {
                const roles = row.getValue('roles') as string[];
                return (
                    <div className="flex flex-wrap gap-1">
                        {roles.map((role) => (
                            <span
                                key={role}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize"
                            >
                                {role}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: 'is_aktif',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.getValue('is_aktif') as boolean;
                return (
                    <div className="flex items-center space-x-2">
                        {isActive ? (
                            <>
                                <UserCheck className="w-4 h-4 text-green-600" />
                                <span className="text-green-600 font-medium">Aktif</span>
                            </>
                        ) : (
                            <>
                                <UserX className="w-4 h-4 text-red-600" />
                                <span className="text-red-600 font-medium">Nonaktif</span>
                            </>
                        )}
                    </div>
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
                    <span>Dibuat</span>
                    <ArrowUpDown className="w-4 h-4" />
                </button>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center space-x-2">
                        <Link
                            href={`/admin/users/${user.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            title="Lihat Detail"
                        >
                            <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => toggleUserStatus(user.id, user.is_aktif)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                                user.is_aktif
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={user.is_aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                            {user.is_aktif ? (
                                <ToggleRight className="w-4 h-4" />
                            ) : (
                                <ToggleLeft className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: users?.data || [],
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
        router.get('/admin/users', {
            search: searchValue,
            role: roleFilter,
            status: statusFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearchValue('');
        setRoleFilter('');
        setStatusFilter('');
        router.get('/admin/users');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
                            <p className="text-gray-600">Kelola pengguna sistem klinik</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/users/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Pengguna
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
                                    placeholder="Cari nama, email, username..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Semua Role</option>
                                {Object.entries(roles).map(([key, value]) => (
                                    <option key={key} value={key} className="capitalize">
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
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
                                            {users?.data ? 'Tidak ada data pengguna.' : 'Memuat data...'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.meta && users.meta.total > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {users.meta.from} - {users.meta.to} dari {users.meta.total} hasil
                                </div>
                                <div className="flex items-center space-x-2">
                                    {users.links && users.links.map((link, index) => (
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
