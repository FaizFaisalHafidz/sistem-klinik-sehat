import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PasienData {
    id: number;
    kode_pasien: string;
    nik: string;
    nama_lengkap: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    telepon: string;
    email?: string;
}

interface EditPasienProps {
    pasien: PasienData;
}

export default function EditPasien({ pasien }: EditPasienProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Pasien', href: '/pendaftaran/pasien' },
        { title: 'Detail Pasien', href: `/pendaftaran/pasien/${pasien.id}` },
        { title: 'Edit Pasien', href: '' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        kode_pasien: pasien.kode_pasien,
        nik: pasien.nik,
        nama_lengkap: pasien.nama_lengkap,
        tempat_lahir: pasien.tempat_lahir,
        tanggal_lahir: pasien.tanggal_lahir,
        jenis_kelamin: pasien.jenis_kelamin,
        alamat: pasien.alamat,
        telepon: pasien.telepon,
        email: pasien.email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(`/pendaftaran/pasien/${pasien.id}`, {
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
                            href={`/pendaftaran/pasien/${pasien.id}`}
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
                                {/* Kode Pasien */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kode Pasien <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kode_pasien}
                                        onChange={(e) => setData('kode_pasien', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.kode_pasien ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="PSN202400001"
                                    />
                                    {errors.kode_pasien && (
                                        <p className="mt-1 text-sm text-red-600">{errors.kode_pasien}</p>
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

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="email@example.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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

                        {/* Submit Button */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link
                                href={`/pendaftaran/pasien/${pasien.id}`}
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
                                        Perbarui Data Pasien
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
