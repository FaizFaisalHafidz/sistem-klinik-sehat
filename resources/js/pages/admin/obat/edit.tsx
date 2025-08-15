import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Building,
    Calendar,
    DollarSign,
    FileText,
    Hash,
    Package,
    Pill,
    Save,
    Tag,
} from 'lucide-react';
import { FormEvent } from 'react';
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
}

interface Props {
    obat: Obat;
}

export default function Edit({ obat }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        kode_obat: obat.kode_obat,
        nama_obat: obat.nama_obat,
        nama_generik: obat.nama_generik || '',
        pabrik: obat.pabrik || '',
        kategori: obat.kategori || '',
        satuan: obat.satuan,
        harga: obat.harga.toString(),
        stok_tersedia: obat.stok_tersedia.toString(),
        stok_minimum: obat.stok_minimum.toString(),
        tanggal_kadaluarsa: obat.tanggal_kadaluarsa || '',
        deskripsi: obat.deskripsi || '',
        is_aktif: obat.is_aktif ? 'true' : 'false',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/obat/${obat.id}`, {
            onSuccess: () => {
                toast.success('Data obat berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui data obat');
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit Obat - ${obat.nama_obat}`} />
            
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/obat"
                            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-lg">
                            <Pill className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Obat</h1>
                            <p className="text-sm text-gray-600">{obat.nama_obat}</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Kode Obat */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Hash className="w-4 h-4 mr-2 text-green-500" />
                                        Kode Obat
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kode_obat}
                                        onChange={(e) => setData('kode_obat', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                            errors.kode_obat ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Contoh: OBT001"
                                    />
                                    {errors.kode_obat && (
                                        <p className="mt-1 text-sm text-red-600">{errors.kode_obat}</p>
                                    )}
                                </div>

                                {/* Nama Obat */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Pill className="w-4 h-4 mr-2 text-green-500" />
                                        Nama Obat
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_obat}
                                        onChange={(e) => setData('nama_obat', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <FileText className="w-4 h-4 mr-2 text-green-500" />
                                        Nama Generik
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_generik}
                                        onChange={(e) => setData('nama_generik', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                            errors.nama_generik ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Masukkan nama generik obat"
                                    />
                                    {errors.nama_generik && (
                                        <p className="mt-1 text-sm text-red-600">{errors.nama_generik}</p>
                                    )}
                                </div>

                                {/* Pabrik */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Building className="w-4 h-4 mr-2 text-green-500" />
                                        Pabrik
                                    </label>
                                    <input
                                        type="text"
                                        value={data.pabrik}
                                        onChange={(e) => setData('pabrik', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                            errors.pabrik ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Masukkan nama pabrik"
                                    />
                                    {errors.pabrik && (
                                        <p className="mt-1 text-sm text-red-600">{errors.pabrik}</p>
                                    )}
                                </div>

                                {/* Kategori */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Tag className="w-4 h-4 mr-2 text-green-500" />
                                        Kategori
                                    </label>
                                    <select
                                        value={data.kategori}
                                        onChange={(e) => setData('kategori', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                            errors.kategori ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Pilih kategori</option>
                                        <option value="antibiotik">Antibiotik</option>
                                        <option value="analgesik">Analgesik</option>
                                        <option value="antihistamin">Antihistamin</option>
                                        <option value="vitamin">Vitamin & Suplemen</option>
                                        <option value="antiseptik">Antiseptik</option>
                                        <option value="kardiovaskular">Kardiovaskular</option>
                                        <option value="diabetes">Diabetes</option>
                                        <option value="gastrointestinal">Gastrointestinal</option>
                                        <option value="dermatologi">Dermatologi</option>
                                        <option value="neurologis">Neurologis</option>
                                        <option value="oftalmologi">Oftalmologi</option>
                                        <option value="otc">Over The Counter (OTC)</option>
                                    </select>
                                    {errors.kategori && (
                                        <p className="mt-1 text-sm text-red-600">{errors.kategori}</p>
                                    )}
                                </div>

                                {/* Satuan */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Package className="w-4 h-4 mr-2 text-green-500" />
                                        Satuan
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        value={data.satuan}
                                        onChange={(e) => setData('satuan', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                            errors.satuan ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Pilih satuan</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="kapsul">Kapsul</option>
                                        <option value="botol">Botol</option>
                                        <option value="tube">Tube</option>
                                        <option value="ampul">Ampul</option>
                                        <option value="vial">Vial</option>
                                        <option value="sachet">Sachet</option>
                                        <option value="strip">Strip</option>
                                        <option value="box">Box</option>
                                        <option value="ml">ml</option>
                                        <option value="mg">mg</option>
                                        <option value="gram">Gram</option>
                                    </select>
                                    {errors.satuan && (
                                        <p className="mt-1 text-sm text-red-600">{errors.satuan}</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Harga */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                                        Harga per Satuan
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.harga}
                                            onChange={(e) => setData('harga', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                                errors.harga ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="0"
                                        />
                                    </div>
                                    {errors.harga && (
                                        <p className="mt-1 text-sm text-red-600">{errors.harga}</p>
                                    )}
                                </div>

                                {/* Stok Tersedia */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Package className="w-4 h-4 mr-2 text-green-500" />
                                        Stok Tersedia
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.stok_tersedia}
                                        onChange={(e) => setData('stok_tersedia', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <AlertTriangle className="w-4 h-4 mr-2 text-green-500" />
                                        Stok Minimum
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.stok_minimum}
                                        onChange={(e) => setData('stok_minimum', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                            errors.stok_minimum ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="10"
                                    />
                                    {errors.stok_minimum && (
                                        <p className="mt-1 text-sm text-red-600">{errors.stok_minimum}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Peringatan akan muncul ketika stok mencapai batas minimum
                                    </p>
                                </div>

                                {/* Tanggal Kadaluarsa */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 mr-2 text-green-500" />
                                        Tanggal Kadaluarsa
                                    </label>
                                    <input
                                        type="date"
                                        value={data.tanggal_kadaluarsa}
                                        onChange={(e) => setData('tanggal_kadaluarsa', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                            errors.tanggal_kadaluarsa ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.tanggal_kadaluarsa && (
                                        <p className="mt-1 text-sm text-red-600">{errors.tanggal_kadaluarsa}</p>
                                    )}
                                </div>

                                {/* Deskripsi */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <FileText className="w-4 h-4 mr-2 text-green-500" />
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={data.deskripsi}
                                        onChange={(e) => setData('deskripsi', e.target.value)}
                                        rows={3}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                            errors.deskripsi ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Masukkan deskripsi, indikasi, atau informasi tambahan..."
                                    />
                                    {errors.deskripsi && (
                                        <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>
                                    )}
                                </div>

                                {/* Status Aktif */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        Status Obat
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="is_aktif"
                                                checked={data.is_aktif === 'true'}
                                                onChange={() => setData('is_aktif', 'true')}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Aktif</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="is_aktif"
                                                checked={data.is_aktif === 'false'}
                                                onChange={() => setData('is_aktif', 'false')}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Tidak Aktif</span>
                                        </label>
                                    </div>
                                    {errors.is_aktif && (
                                        <p className="mt-1 text-sm text-red-600">{errors.is_aktif}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="mt-8 flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link
                                href="/admin/obat"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 border border-transparent rounded-lg font-medium text-white hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                {processing ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
