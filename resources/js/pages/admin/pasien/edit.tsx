import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PasienData {
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
}

interface EditPasienProps {
    pasien: PasienData;
}

export default function EditPasien({ pasien }: EditPasienProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Pasien', href: '/admin/pasien' },
        { title: 'Detail Pasien', href: `/admin/pasien/${pasien.id}` },
        { title: 'Edit Pasien', href: '' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        no_rm: pasien.no_rm,
        nik: pasien.nik,
        nama_lengkap: pasien.nama_lengkap,
        tempat_lahir: pasien.tempat_lahir,
        tanggal_lahir: pasien.tanggal_lahir,
        jenis_kelamin: pasien.jenis_kelamin,
        alamat: pasien.alamat,
        telepon: pasien.telepon,
        golongan_darah: pasien.golongan_darah || '',
        pekerjaan: pasien.pekerjaan || '',
        status_pernikahan: pasien.status_pernikahan || '',
        kontak_darurat: pasien.kontak_darurat || '',
        alergi: pasien.alergi || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(`/admin/pasien/${pasien.id}`, {
            onSuccess: () => {
                toast.success('Data pasien berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui data pasien. Periksa kembali data yang dimasukkan.');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Pasien - ${pasien.nama_lengkap}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Edit className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Pasien</h1>
                            <p className="text-gray-600">Perbarui data pasien: {pasien.nama_lengkap}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/admin/pasien/${pasien.id}`}
                            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Link>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Identitas Dasar */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <div className="w-2 h-6 bg-blue-600 rounded-full mr-3"></div>
                                Identitas Dasar
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* No. RM */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        No. Rekam Medis <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.no_rm}
                                        onChange={(e) => setData('no_rm', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.no_rm ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="RM202400001"
                                    />
                                    {errors.no_rm && (
                                        <p className="mt-1 text-sm text-red-600">{errors.no_rm}</p>
                                    )}
                                </div>

                                {/* NIK */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        NIK <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nik}
                                        onChange={(e) => setData('nik', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.nik ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="1234567890123456"
                                        maxLength={16}
                                    />
                                    {errors.nik && (
                                        <p className="mt-1 text-sm text-red-600">{errors.nik}</p>
                                    )}
                                </div>

                                {/* Nama Lengkap */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_lengkap}
                                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.nama_lengkap ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Masukkan nama lengkap pasien"
                                    />
                                    {errors.nama_lengkap && (
                                        <p className="mt-1 text-sm text-red-600">{errors.nama_lengkap}</p>
                                    )}
                                </div>

                                {/* Tempat Lahir */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tempat Lahir <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.tempat_lahir}
                                        onChange={(e) => setData('tempat_lahir', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.tempat_lahir ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Kota tempat lahir"
                                    />
                                    {errors.tempat_lahir && (
                                        <p className="mt-1 text-sm text-red-600">{errors.tempat_lahir}</p>
                                    )}
                                </div>

                                {/* Tanggal Lahir */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal Lahir <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="date"
                                            value={data.tanggal_lahir}
                                            onChange={(e) => setData('tanggal_lahir', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.tanggal_lahir ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                    </div>
                                    {errors.tanggal_lahir && (
                                        <p className="mt-1 text-sm text-red-600">{errors.tanggal_lahir}</p>
                                    )}
                                </div>

                                {/* Jenis Kelamin */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jenis Kelamin <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.jenis_kelamin}
                                        onChange={(e) => setData('jenis_kelamin', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.jenis_kelamin ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Pilih jenis kelamin</option>
                                        <option value="laki-laki">Laki-laki</option>
                                        <option value="perempuan">Perempuan</option>
                                    </select>
                                    {errors.jenis_kelamin && (
                                        <p className="mt-1 text-sm text-red-600">{errors.jenis_kelamin}</p>
                                    )}
                                </div>

                                {/* Golongan Darah */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Golongan Darah
                                    </label>
                                    <select
                                        value={data.golongan_darah}
                                        onChange={(e) => setData('golongan_darah', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.golongan_darah ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Pilih golongan darah</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                    {errors.golongan_darah && (
                                        <p className="mt-1 text-sm text-red-600">{errors.golongan_darah}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Kontak & Alamat */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <div className="w-2 h-6 bg-green-600 rounded-full mr-3"></div>
                                Kontak & Alamat
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Telepon */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telepon <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.telepon}
                                        onChange={(e) => setData('telepon', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.telepon ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="08xxxxxxxxxx"
                                    />
                                    {errors.telepon && (
                                        <p className="mt-1 text-sm text-red-600">{errors.telepon}</p>
                                    )}
                                </div>

                                {/* Kontak Darurat */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kontak Darurat
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kontak_darurat}
                                        onChange={(e) => setData('kontak_darurat', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.kontak_darurat ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Nomor kontak keluarga"
                                    />
                                    {errors.kontak_darurat && (
                                        <p className="mt-1 text-sm text-red-600">{errors.kontak_darurat}</p>
                                    )}
                                </div>

                                {/* Alamat */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alamat <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                        <textarea
                                            value={data.alamat}
                                            onChange={(e) => setData('alamat', e.target.value)}
                                            rows={3}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.alamat ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Alamat lengkap pasien"
                                        />
                                    </div>
                                    {errors.alamat && (
                                        <p className="mt-1 text-sm text-red-600">{errors.alamat}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Informasi Tambahan */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <div className="w-2 h-6 bg-purple-600 rounded-full mr-3"></div>
                                Informasi Tambahan
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pekerjaan */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pekerjaan
                                    </label>
                                    <input
                                        type="text"
                                        value={data.pekerjaan}
                                        onChange={(e) => setData('pekerjaan', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.pekerjaan ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Pekerjaan pasien"
                                    />
                                    {errors.pekerjaan && (
                                        <p className="mt-1 text-sm text-red-600">{errors.pekerjaan}</p>
                                    )}
                                </div>

                                {/* Status Pernikahan */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status Pernikahan
                                    </label>
                                    <select
                                        value={data.status_pernikahan}
                                        onChange={(e) => setData('status_pernikahan', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.status_pernikahan ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Pilih status</option>
                                        <option value="belum_menikah">Belum Menikah</option>
                                        <option value="menikah">Menikah</option>
                                        <option value="cerai">Cerai</option>
                                    </select>
                                    {errors.status_pernikahan && (
                                        <p className="mt-1 text-sm text-red-600">{errors.status_pernikahan}</p>
                                    )}
                                </div>

                                {/* Alergi */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alergi
                                    </label>
                                    <textarea
                                        value={data.alergi}
                                        onChange={(e) => setData('alergi', e.target.value)}
                                        rows={3}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.alergi ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Riwayat alergi obat, makanan, atau lainnya"
                                    />
                                    {errors.alergi && (
                                        <p className="mt-1 text-sm text-red-600">{errors.alergi}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link
                                href={`/admin/pasien/${pasien.id}`}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
