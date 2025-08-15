import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
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

interface Filters {
    search?: string;
    kategori?: string;
    status_stok?: string;
    sort_by?: string;
    sort_order?: string;
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
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data Obat', href: '/dokter/obat' },
];

export default function Index({ obat, categories, stats, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedKategori, setSelectedKategori] = useState(filters.kategori || '');
    const [selectedStatusStok, setSelectedStatusStok] = useState(filters.status_stok || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'nama_obat');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        router.get('/dokter/obat', {
            search: searchTerm,
            kategori: selectedKategori,
            status_stok: selectedStatusStok,
            sort_by: sortBy,
            sort_order: sortOrder,
        });
    };

    const handleSort = (field: string) => {
        const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortOrder(newSortOrder);
        
        router.get('/dokter/obat', {
            search: searchTerm,
            kategori: selectedKategori,
            status_stok: selectedStatusStok,
            sort_by: field,
            sort_order: newSortOrder,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedKategori('');
        setSelectedStatusStok('');
        setSortBy('nama_obat');
        setSortOrder('asc');
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
                }
            });
        }
    };

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Obat" />

            <div className="space-y-6">
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
                                    value={selectedKategori}
                                    onChange={(e) => setSelectedKategori(e.target.value)}
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
                                    value={selectedStatusStok}
                                    onChange={(e) => setSelectedStatusStok(e.target.value)}
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
                                    onClick={clearFilters}
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
                                <tr>
                                    <th 
                                        onClick={() => handleSort('nama_obat')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Nama Obat</span>
                                            {sortBy === 'nama_obat' && (
                                                sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Satuan & Generik
                                    </th>
                                    <th 
                                        onClick={() => handleSort('stok_tersedia')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Stok</span>
                                            {sortBy === 'stok_tersedia' && (
                                                sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('harga')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Harga</span>
                                            {sortBy === 'harga' && (
                                                sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status & Kadaluwarsa
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {obat.data.length > 0 ? (
                                    obat.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.nama_obat}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {item.pabrik || 'Tidak diketahui'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                    {item.kategori}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div>{item.satuan}</div>
                                                <div className="text-gray-500">{item.nama_generik || 'Generik tidak diketahui'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {item.stok_tersedia}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        Min: {item.stok_minimum}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                Rp {item.harga.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <span className={getStatusBadge(item.status_stok)}>
                                                        {getStatusText(item.status_stok)}
                                                    </span>
                                                    {item.tanggal_kadaluarsa_formatted && (
                                                        <div className="text-xs text-gray-500">
                                                            {item.is_expired ? (
                                                                <span className="text-red-600 font-medium">
                                                                    Kadaluwarsa {item.tanggal_kadaluarsa_formatted}
                                                                </span>
                                                            ) : item.days_to_expire !== null && item.days_to_expire <= 30 ? (
                                                                <span className="text-orange-600 font-medium">
                                                                    {item.days_to_expire} hari lagi
                                                                </span>
                                                            ) : (
                                                                <span>
                                                                    Exp: {item.tanggal_kadaluarsa_formatted}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        href={`/dokter/obat/${item.id}`}
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/dokter/obat/${item.id}/edit`}
                                                        className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(item.id, item.nama_obat)}
                                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <Pill className="w-12 h-12 text-gray-400 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    Tidak ada data obat
                                                </h3>
                                                <p className="text-gray-500 mb-6">
                                                    Belum ada data obat yang tersedia atau sesuai dengan filter.
                                                </p>
                                                <Link
                                                    href="/dokter/obat/create"
                                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Tambah Obat Pertama
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {obat.data.length > 0 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center">
                                <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                                    Menampilkan {((obat.meta.current_page - 1) * obat.meta.per_page) + 1} sampai{' '}
                                    {Math.min(obat.meta.current_page * obat.meta.per_page, obat.meta.total)} dari{' '}
                                    {obat.meta.total} entri
                                </div>
                                
                                <div className="flex space-x-1">
                                    {obat.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                                                link.active
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : link.url
                                                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveScroll
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
