import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Plus, Save, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pendaftaran Baru', href: '/pendaftaran/baru' },
    { title: 'Daftarkan Pasien', href: '/pendaftaran/baru/create' },
];

interface Pasien {
    id: number;
    kode_pasien: string;
    nik: string;
    nama_lengkap: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    telepon: string;
    email?: string;
    pekerjaan?: string;
    golongan_darah?: string;
}

interface Props {
    pasien?: Pasien;
}

export default function Create({ pasien }: Props) {
    const [selectedPasien, setSelectedPasien] = useState<Pasien | null>(pasien || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Pasien[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        pasien_id: pasien?.id || '',
        jenis_kunjungan: 'baru',
        keluhan_utama: '',
        cara_bayar: 'umum',
        nomor_asuransi: '',
        keterangan: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedPasien) {
            toast.error('Silakan pilih pasien terlebih dahulu');
            return;
        }

        post('/pendaftaran/baru', {
            onSuccess: () => {
                toast.success('Pendaftaran berhasil disimpan');
                reset();
            },
            onError: (errors) => {
                console.error('Error:', errors);
                if (errors.error) {
                    toast.error(errors.error);
                } else {
                    toast.error('Gagal menyimpan pendaftaran');
                }
            },
        });
    };

    const searchPasien = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`/pendaftaran/baru/search-pasien?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            setSearchResults(results);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Gagal mencari pasien');
        } finally {
            setIsSearching(false);
        }
    };

    const selectPasien = (pasien: Pasien) => {
        setSelectedPasien(pasien);
        setData('pasien_id', pasien.id.toString());
        setSearchQuery('');
        setShowSearchResults(false);
        
        // Set jenis kunjungan berdasarkan riwayat pasien
        // Untuk demo, kita anggap jika pasien sudah ada berarti kunjungan lama
        setData('jenis_kunjungan', 'lama');
    };

    const clearSelectedPasien = () => {
        setSelectedPasien(null);
        setData('pasien_id', '');
        setData('jenis_kunjungan', 'baru');
    };

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftarkan Pasien" />
            
            <div className="max-w-7xl mx-auto space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/pendaftaran/baru"
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Daftarkan Pasien</h1>
                            <p className="text-gray-600">Daftarkan pasien untuk pemeriksaan dan buat antrian</p>
                        </div>
                    </div>
                </div>

                {/* Search Pasien */}
                {!selectedPasien && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cari Pasien</h2>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        searchPasien(e.target.value);
                                    }}
                                    placeholder="Cari berdasarkan nama, NIK, kode pasien, atau telepon..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                            </div>

                            {/* Search Results */}
                            {showSearchResults && (
                                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                                    {searchResults.length > 0 ? (
                                        searchResults.map((pasien) => (
                                            <div
                                                key={pasien.id}
                                                onClick={() => selectPasien(pasien)}
                                                className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{pasien.nama_lengkap}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {pasien.kode_pasien} • NIK: {pasien.nik}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {pasien.telepon} • {calculateAge(pasien.tanggal_lahir)} tahun
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-blue-600 font-medium">
                                                        Pilih
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">
                                            <p>Tidak ada pasien ditemukan</p>
                                            <Link
                                                href="/pasien/create?redirect=pendaftaran-baru"
                                                className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-flex items-center"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Daftarkan pasien baru
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium">Informasi:</p>
                                        <p>Ketik minimal 2 karakter untuk mencari pasien. Jika pasien belum terdaftar, Anda dapat mendaftarkannya terlebih dahulu di menu Data Pasien.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Informasi Pasien & Form Pendaftaran */}
                {selectedPasien && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Informasi Pasien - Kiri */}
                        <div className="xl:col-span-1">
                            <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Informasi Pasien</h2>
                                    <button
                                        onClick={clearSelectedPasien}
                                        className="text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Ganti Pasien
                                    </button>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Nama Lengkap</p>
                                            <p className="font-medium text-gray-900">{selectedPasien.nama_lengkap}</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Kode Pasien</p>
                                                <p className="font-medium text-gray-900">{selectedPasien.kode_pasien}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">NIK</p>
                                                <p className="font-medium text-gray-900">{selectedPasien.nik}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Telepon</p>
                                            <p className="font-medium text-gray-900">{selectedPasien.telepon}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Tanggal Lahir</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(selectedPasien.tanggal_lahir).toLocaleDateString('id-ID')} 
                                                <span className="text-gray-600 ml-1">({calculateAge(selectedPasien.tanggal_lahir)} tahun)</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Jenis Kelamin</p>
                                            <p className="font-medium text-gray-900 capitalize">{selectedPasien.jenis_kelamin}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Alamat</p>
                                            <p className="font-medium text-gray-900">{selectedPasien.alamat}</p>
                                        </div>
                                        {selectedPasien.golongan_darah && (
                                            <div>
                                                <p className="text-sm text-gray-600">Golongan Darah</p>
                                                <p className="font-medium text-gray-900">{selectedPasien.golongan_darah}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Pendaftaran - Kanan */}
                        <div className="xl:col-span-2">
                            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Detail Pendaftaran</h2>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Jenis Kunjungan <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={data.jenis_kunjungan}
                                                onChange={(e) => setData('jenis_kunjungan', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="baru">Pasien Baru</option>
                                                <option value="lama">Pasien Lama</option>
                                            </select>
                                            {errors.jenis_kunjungan && (
                                                <p className="mt-1 text-sm text-red-600">{errors.jenis_kunjungan}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Cara Bayar <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={data.cara_bayar}
                                                onChange={(e) => setData('cara_bayar', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="umum">Umum</option>
                                                <option value="bpjs">BPJS</option>
                                                <option value="asuransi">Asuransi</option>
                                            </select>
                                            {errors.cara_bayar && (
                                                <p className="mt-1 text-sm text-red-600">{errors.cara_bayar}</p>
                                            )}
                                        </div>
                                    </div>

                                    {(data.cara_bayar === 'bpjs' || data.cara_bayar === 'asuransi') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nomor {data.cara_bayar === 'bpjs' ? 'BPJS' : 'Asuransi'}
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nomor_asuransi}
                                                onChange={(e) => setData('nomor_asuransi', e.target.value)}
                                                placeholder={`Masukkan nomor ${data.cara_bayar === 'bpjs' ? 'BPJS' : 'asuransi'}`}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {errors.nomor_asuransi && (
                                                <p className="mt-1 text-sm text-red-600">{errors.nomor_asuransi}</p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Keluhan Utama <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={data.keluhan_utama}
                                            onChange={(e) => setData('keluhan_utama', e.target.value)}
                                            placeholder="Jelaskan keluhan utama pasien..."
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.keluhan_utama && (
                                            <p className="mt-1 text-sm text-red-600">{errors.keluhan_utama}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Keterangan Tambahan
                                        </label>
                                        <textarea
                                            value={data.keterangan}
                                            onChange={(e) => setData('keterangan', e.target.value)}
                                            placeholder="Keterangan tambahan (opsional)..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.keterangan && (
                                            <p className="mt-1 text-sm text-red-600">{errors.keterangan}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                        <Link
                                            href="/pendaftaran/baru"
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Batal
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {processing ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            {processing ? 'Memproses...' : 'Daftarkan Pasien'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
