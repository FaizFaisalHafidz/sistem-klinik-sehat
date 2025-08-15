import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Package, Pill, Save } from 'lucide-react';
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
    deskripsi: string | null;
    is_aktif: boolean;
}

interface Props {
    obat: Obat;
    categories: string[];
    satuan_options: string[];
}

export default function Edit({ obat, categories, satuan_options }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Obat', href: '/dokter/obat' },
        { title: obat.nama_obat, href: `/dokter/obat/${obat.id}` },
        { title: 'Edit', href: `/dokter/obat/${obat.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nama_obat: obat.nama_obat || '',
        nama_generik: obat.nama_generik || '',
        kategori: obat.kategori || '',
        satuan: obat.satuan || '',
        stok_tersedia: obat.stok_tersedia?.toString() || '',
        stok_minimum: obat.stok_minimum?.toString() || '',
        harga: obat.harga?.toString() || '',
        pabrik: obat.pabrik || '',
        tanggal_kadaluarsa: obat.tanggal_kadaluarsa || '',
        deskripsi: obat.deskripsi || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(`/dokter/obat/${obat.id}`, {
            onSuccess: () => {
                toast.success('Data obat berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui data obat');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Obat - ${obat.nama_obat}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Obat</h1>
                        <p className="text-gray-600">Perbarui informasi obat {obat.nama_obat}</p>
                    </div>
                    
                    <Link
                        href={`/dokter/obat/${obat.id}`}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </Link>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Informasi Dasar */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Pill className="w-5 h-5 mr-2 text-blue-600" />
                                    Informasi Dasar
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Nama Obat */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Obat <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nama_obat}
                                            onChange={(e) => setData('nama_obat', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.nama_obat ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Masukkan nama obat"
                                        />
                                        {errors.nama_obat && (
                                            <p className="mt-1 text-sm text-red-600">{errors.nama_obat}</p>
                                        )}
                                    </div>

                                    {/* Nama Generik */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Generik
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nama_generik}
                                            onChange={(e) => setData('nama_generik', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.nama_generik ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Masukkan nama generik"
                                        />
                                        {errors.nama_generik && (
                                            <p className="mt-1 text-sm text-red-600">{errors.nama_generik}</p>
                                        )}
                                    </div>

                                    {/* Kategori */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kategori <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex">
                                            <select
                                                value={data.kategori}
                                                onChange={(e) => setData('kategori', e.target.value)}
                                                className={`flex-1 px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.kategori ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            >
                                                <option value="">Pilih kategori</option>
                                                {categories.map((kategori) => (
                                                    <option key={kategori} value={kategori}>
                                                        {kategori}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                value={data.kategori}
                                                onChange={(e) => setData('kategori', e.target.value)}
                                                className={`flex-1 px-4 py-2 border-l-0 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.kategori ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Atau ketik kategori baru"
                                            />
                                        </div>
                                        {errors.kategori && (
                                            <p className="mt-1 text-sm text-red-600">{errors.kategori}</p>
                                        )}
                                    </div>

                                    {/* Satuan */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Satuan <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.satuan}
                                            onChange={(e) => setData('satuan', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.satuan ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">Pilih satuan</option>
                                            {satuan_options.map((satuan) => (
                                                <option key={satuan} value={satuan}>
                                                    {satuan}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.satuan && (
                                            <p className="mt-1 text-sm text-red-600">{errors.satuan}</p>
                                        )}
                                    </div>

                                    {/* Pabrik */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pabrik/Produsen
                                        </label>
                                        <input
                                            type="text"
                                            value={data.pabrik}
                                            onChange={(e) => setData('pabrik', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.pabrik ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Nama perusahaan pabrik/produsen"
                                        />
                                        {errors.pabrik && (
                                            <p className="mt-1 text-sm text-red-600">{errors.pabrik}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stok & Harga */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-green-600" />
                                    Stok & Harga
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Stok Tersedia */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Stok Tersedia <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.stok_tersedia}
                                            onChange={(e) => setData('stok_tersedia', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.stok_tersedia ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="0"
                                        />
                                        {errors.stok_tersedia && (
                                            <p className="mt-1 text-sm text-red-600">{errors.stok_tersedia}</p>
                                        )}
                                    </div>

                                    {/* Stok Minimum */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Stok Minimum <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.stok_minimum}
                                            onChange={(e) => setData('stok_minimum', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.stok_minimum ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="0"
                                        />
                                        {errors.stok_minimum && (
                                            <p className="mt-1 text-sm text-red-600">{errors.stok_minimum}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Batas minimum untuk warning stok menipis
                                        </p>
                                    </div>

                                    {/* Harga */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Harga <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                Rp
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.harga}
                                                onChange={(e) => setData('harga', e.target.value)}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.harga ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="0"
                                            />
                                        </div>
                                        {errors.harga && (
                                            <p className="mt-1 text-sm text-red-600">{errors.harga}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Informasi Tambahan */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                                    Informasi Tambahan
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tanggal Kadaluarsa */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Kadaluarsa
                                        </label>
                                        <input
                                            type="date"
                                            value={data.tanggal_kadaluarsa}
                                            onChange={(e) => setData('tanggal_kadaluarsa', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.tanggal_kadaluarsa ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.tanggal_kadaluarsa && (
                                            <p className="mt-1 text-sm text-red-600">{errors.tanggal_kadaluarsa}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Opsional - Tanggal kadaluarsa obat
                                        </p>
                                    </div>

                                    {/* Deskripsi */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Deskripsi
                                        </label>
                                        <textarea
                                            value={data.deskripsi}
                                            onChange={(e) => setData('deskripsi', e.target.value)}
                                            rows={3}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.deskripsi ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Deskripsi umum obat"
                                        />
                                        {errors.deskripsi && (
                                            <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-6 border-t border-gray-200">
                                <div className="flex space-x-3">
                                    <Link
                                        href={`/dokter/obat/${obat.id}`}
                                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                                            processing ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        <Save className="w-4 h-4" />
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
