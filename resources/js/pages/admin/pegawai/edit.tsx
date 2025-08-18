import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Badge,
    Building,
    Calendar,
    FileText,
    Mail,
    MapPin,
    Phone,
    Save,
    Stethoscope,
    User,
    UserCheck,
} from 'lucide-react';
import { FormEvent } from 'react';
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
    user_id: number | null;
    nama_lengkap: string;
    jabatan: string;
    departemen: string | null;
    nomor_izin: string | null;
    spesialisasi: string | null;
    telepon: string | null;
    email: string | null;
    alamat: string | null;
    tanggal_masuk: string | null;
    biaya_konsultasi: number;
    is_aktif: boolean;
}

interface Props {
    pegawai: Pegawai;
    availableUsers: User[];
}

export default function Edit({ pegawai, availableUsers }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        kode_pegawai: pegawai.kode_pegawai,
        user_id: pegawai.user_id?.toString() || '',
        nama_lengkap: pegawai.nama_lengkap,
        jabatan: pegawai.jabatan,
        departemen: pegawai.departemen || '',
        nomor_izin: pegawai.nomor_izin || '',
        spesialisasi: pegawai.spesialisasi || '',
        telepon: pegawai.telepon || '',
        email: pegawai.email || '',
        alamat: pegawai.alamat || '',
        tanggal_masuk: pegawai.tanggal_masuk || '',
        biaya_konsultasi: pegawai.biaya_konsultasi?.toString() || '0',
        is_aktif: pegawai.is_aktif ? 'true' : 'false',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/pegawai/${pegawai.id}`, {
            onSuccess: () => {
                toast.success('Data pegawai berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui data pegawai');
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit Pegawai - ${pegawai.nama_lengkap}`} />
            
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/pegawai"
                            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-lg">
                            <UserCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Pegawai</h1>
                            <p className="text-sm text-gray-600">{pegawai.nama_lengkap}</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Kode Pegawai */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Badge className="w-4 h-4 mr-2 text-blue-500" />
                                        Kode Pegawai
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kode_pegawai}
                                        onChange={(e) => setData('kode_pegawai', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.kode_pegawai ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Masukkan kode pegawai"
                                    />
                                    {errors.kode_pegawai && (
                                        <p className="mt-1 text-sm text-red-600">{errors.kode_pegawai}</p>
                                    )}
                                </div>

                                {/* User Account */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4 mr-2 text-blue-500" />
                                        Akun Pengguna
                                    </label>
                                    <select
                                        value={data.user_id}
                                        onChange={(e) => setData('user_id', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.user_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Pilih akun pengguna (opsional)</option>
                                        {availableUsers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.nama_lengkap} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Hubungkan dengan akun pengguna untuk akses sistem
                                    </p>
                                </div>

                                {/* Nama Lengkap */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4 mr-2 text-blue-500" />
                                        Nama Lengkap
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_lengkap}
                                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.nama_lengkap ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Masukkan nama lengkap"
                                    />
                                    {errors.nama_lengkap && (
                                        <p className="mt-1 text-sm text-red-600">{errors.nama_lengkap}</p>
                                    )}
                                </div>

                                {/* Jabatan */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Building className="w-4 h-4 mr-2 text-blue-500" />
                                        Jabatan
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        value={data.jabatan}
                                        onChange={(e) => setData('jabatan', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.jabatan ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Pilih jabatan</option>
                                        <option value="dokter">Dokter</option>
                                        <option value="perawat">Perawat</option>
                                        <option value="apoteker">Apoteker</option>
                                        <option value="pendaftaran">Pendaftaran</option>
                                        <option value="administrasi">Administrasi</option>
                                        <option value="keuangan">Keuangan</option>
                                        <option value="cleaning_service">Cleaning Service</option>
                                        <option value="keamanan">Keamanan</option>
                                    </select>
                                    {errors.jabatan && (
                                        <p className="mt-1 text-sm text-red-600">{errors.jabatan}</p>
                                    )}
                                </div>

                                {/* Departemen */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Building className="w-4 h-4 mr-2 text-blue-500" />
                                        Departemen
                                    </label>
                                    <select
                                        value={data.departemen}
                                        onChange={(e) => setData('departemen', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.departemen ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Pilih departemen</option>
                                        <option value="umum">Umum</option>
                                        <option value="penyakit_dalam">Penyakit Dalam</option>
                                        <option value="anak">Anak</option>
                                        <option value="obstetri_ginekologi">Obstetri & Ginekologi</option>
                                        <option value="bedah">Bedah</option>
                                        <option value="farmasi">Farmasi</option>
                                        <option value="administrasi">Administrasi</option>
                                        <option value="keuangan">Keuangan</option>
                                        <option value="umum_support">Umum & Support</option>
                                    </select>
                                    {errors.departemen && (
                                        <p className="mt-1 text-sm text-red-600">{errors.departemen}</p>
                                    )}
                                </div>

                                {/* Nomor Izin */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                        Nomor Izin (SIP/STR)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nomor_izin}
                                        onChange={(e) => setData('nomor_izin', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.nomor_izin ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Masukkan nomor izin praktik"
                                    />
                                    {errors.nomor_izin && (
                                        <p className="mt-1 text-sm text-red-600">{errors.nomor_izin}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Khusus untuk dokter dan tenaga medis
                                    </p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Spesialisasi */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Stethoscope className="w-4 h-4 mr-2 text-blue-500" />
                                        Spesialisasi
                                    </label>
                                    <input
                                        type="text"
                                        value={data.spesialisasi}
                                        onChange={(e) => setData('spesialisasi', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.spesialisasi ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Masukkan spesialisasi"
                                    />
                                    {errors.spesialisasi && (
                                        <p className="mt-1 text-sm text-red-600">{errors.spesialisasi}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Contoh: Dokter Umum, Spesialis Penyakit Dalam, dll.
                                    </p>
                                </div>

                                {/* Biaya Konsultasi */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Badge className="w-4 h-4 mr-2 text-blue-500" />
                                        Biaya Konsultasi
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            value={data.biaya_konsultasi}
                                            onChange={(e) => setData('biaya_konsultasi', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.biaya_konsultasi ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="0"
                                            min="0"
                                            step="1000"
                                        />
                                    </div>
                                    {errors.biaya_konsultasi && (
                                        <p className="mt-1 text-sm text-red-600">{errors.biaya_konsultasi}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Biaya konsultasi per pemeriksaan (khusus untuk dokter)
                                    </p>
                                </div>

                                {/* Telepon */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 mr-2 text-blue-500" />
                                        Telepon
                                    </label>
                                    <input
                                        type="text"
                                        value={data.telepon}
                                        onChange={(e) => setData('telepon', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.telepon ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Masukkan nomor telepon"
                                    />
                                    {errors.telepon && (
                                        <p className="mt-1 text-sm text-red-600">{errors.telepon}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4 mr-2 text-blue-500" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Masukkan alamat email"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Alamat */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                                        Alamat
                                    </label>
                                    <textarea
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        rows={3}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.alamat ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Masukkan alamat lengkap"
                                    />
                                    {errors.alamat && (
                                        <p className="mt-1 text-sm text-red-600">{errors.alamat}</p>
                                    )}
                                </div>

                                {/* Tanggal Masuk */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                        Tanggal Masuk
                                    </label>
                                    <input
                                        type="date"
                                        value={data.tanggal_masuk}
                                        onChange={(e) => setData('tanggal_masuk', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.tanggal_masuk ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.tanggal_masuk && (
                                        <p className="mt-1 text-sm text-red-600">{errors.tanggal_masuk}</p>
                                    )}
                                </div>

                                {/* Status Aktif */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        Status Pegawai
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="is_aktif"
                                                checked={data.is_aktif === 'true'}
                                                onChange={() => setData('is_aktif', 'true')}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Aktif</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="is_aktif"
                                                checked={data.is_aktif === 'false'}
                                                onChange={() => setData('is_aktif', 'false')}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                                href="/admin/pegawai"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
