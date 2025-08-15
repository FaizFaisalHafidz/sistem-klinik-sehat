import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Package, Pill, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Obat {
    id: number;
    nama_obat: string;
    kategori: string;
    bentuk_sediaan: string;
    dosis: string;
    stok_tersedia: number;
    stok_minimum: number;
    harga: number;
    produsen: string;
    tanggal_kadaluwarsa: string | null;
    deskripsi: string | null;
    efek_samping: string | null;
    kontraindikasi: string | null;
    indikasi: string | null;
}

interface Props {
    obat: Obat;
    categories: string[];
    bentuk_sediaan: string[];
}

export default function Edit({ obat, categories, bentuk_sediaan }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Obat', href: '/dokter/obat' },
        { title: obat.nama_obat, href: `/dokter/obat/${obat.id}` },
        { title: 'Edit', href: `/dokter/obat/${obat.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nama_obat: obat.nama_obat || '',
        kategori: obat.kategori || '',
        bentuk_sediaan: obat.bentuk_sediaan || '',
        dosis: obat.dosis || '',
        stok_tersedia: obat.stok_tersedia?.toString() || '',
        stok_minimum: obat.stok_minimum?.toString() || '',
        harga: obat.harga?.toString() || '',
        produsen: obat.produsen || '',
        tanggal_kadaluwarsa: obat.tanggal_kadaluwarsa || '',
        deskripsi: obat.deskripsi || '',
        efek_samping: obat.efek_samping || '',
        kontraindikasi: obat.kontraindikasi || '',
        indikasi: obat.indikasi || '',
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

                                    {/* Bentuk Sediaan */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bentuk Sediaan <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.bentuk_sediaan}
                                            onChange={(e) => setData('bentuk_sediaan', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.bentuk_sediaan ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">Pilih bentuk sediaan</option>
                                            {bentuk_sediaan.map((bentuk) => (
                                                <option key={bentuk} value={bentuk}>
                                                    {bentuk}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.bentuk_sediaan && (
                                            <p className="mt-1 text-sm text-red-600">{errors.bentuk_sediaan}</p>
                                        )}
                                    </div>

                                    {/* Dosis */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Dosis <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.dosis}
                                            onChange={(e) => setData('dosis', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.dosis ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Contoh: 500mg, 10ml, 250mg/5ml"
                                        />
                                        {errors.dosis && (
                                            <p className="mt-1 text-sm text-red-600">{errors.dosis}</p>
                                        )}
                                    </div>

                                    {/* Produsen */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Produsen <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.produsen}
                                            onChange={(e) => setData('produsen', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.produsen ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Nama perusahaan produsen"
                                        />
                                        {errors.produsen && (
                                            <p className="mt-1 text-sm text-red-600">{errors.produsen}</p>
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

                                    {/* Tanggal Kadaluwarsa */}
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Tanggal Kadaluwarsa
                                        </label>
                                        <input
                                            type="date"
                                            value={data.tanggal_kadaluwarsa}
                                            onChange={(e) => setData('tanggal_kadaluwarsa', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.tanggal_kadaluwarsa ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.tanggal_kadaluwarsa && (
                                            <p className="mt-1 text-sm text-red-600">{errors.tanggal_kadaluwarsa}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Opsional - Tanggal kadaluwarsa obat
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Informasi Medis */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Informasi Medis
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Indikasi */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Indikasi
                                        </label>
                                        <textarea
                                            value={data.indikasi}
                                            onChange={(e) => setData('indikasi', e.target.value)}
                                            rows={3}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.indikasi ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Kegunaan atau indikasi obat"
                                        />
                                        {errors.indikasi && (
                                            <p className="mt-1 text-sm text-red-600">{errors.indikasi}</p>
                                        )}
                                    </div>

                                    {/* Kontraindikasi */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kontraindikasi
                                        </label>
                                        <textarea
                                            value={data.kontraindikasi}
                                            onChange={(e) => setData('kontraindikasi', e.target.value)}
                                            rows={3}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.kontraindikasi ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Kondisi yang tidak boleh menggunakan obat ini"
                                        />
                                        {errors.kontraindikasi && (
                                            <p className="mt-1 text-sm text-red-600">{errors.kontraindikasi}</p>
                                        )}
                                    </div>

                                    {/* Efek Samping */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Efek Samping
                                        </label>
                                        <textarea
                                            value={data.efek_samping}
                                            onChange={(e) => setData('efek_samping', e.target.value)}
                                            rows={3}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.efek_samping ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Efek samping yang mungkin terjadi"
                                        />
                                        {errors.efek_samping && (
                                            <p className="mt-1 text-sm text-red-600">{errors.efek_samping}</p>
                                        )}
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
