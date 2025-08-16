import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    MapPin,
    Phone,
    Pill,
    Save,
    Search,
    Stethoscope,
    Trash2,
    User,
    UserCheck
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface Pasien {
    id: number;
    kode_pasien: string;
    nama_lengkap: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    telepon: string;
    umur: number;
}

interface Petugas {
    nama_lengkap: string;
}

interface RekamMedis {
    id: number;
    diagnosis: string;
    tindakan: string;
    resep: string;
    catatan: string;
}

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    nama_generik: string;
    kategori: string;
    satuan: string;
    harga: number;
    stok_tersedia: number;
}

interface ResepObat {
    obat_id: number;
    obat?: Obat;
    jumlah: string;
    dosis: string;
    aturan_pakai: string;
    keterangan: string;
}

interface Pendaftaran {
    id: number;
    kode_pendaftaran: string;
    tanggal_pendaftaran: string;
    tanggal_pendaftaran_formatted: string;
    jenis_pemeriksaan: string;
    keluhan: string;
    catatan: string;
    status_pendaftaran: string;
    created_at: string;
    created_at_formatted: string;
    pasien: Pasien;
    dibuat_oleh: Petugas | null;
    rekamMedis: RekamMedis | null;
}

interface Props {
    pendaftaran: Pendaftaran;
    obatList: Obat[];
}

const getJenisKelaminBadge = (jenis_kelamin: string) => {
    return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
};

export default function Create({ pendaftaran, obatList }: Props) {
    const [searchObat, setSearchObat] = useState('');
    const [selectedObatList, setSelectedObatList] = useState<ResepObat[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        pendaftaran_id: pendaftaran.id,
        keluhan_utama: pendaftaran.keluhan || '',
        riwayat_penyakit: '',
        // Vital Signs
        tekanan_darah: '',
        tinggi_badan: '',
        berat_badan: '',
        pemeriksaan_fisik: '',
        diagnosis: '',
        tindakan: '',
        resep_obat: [] as any[],
        catatan: '',
        anjuran: '',
    });

    // Filter obat berdasarkan pencarian
    const filteredObat = useMemo(() => {
        if (!searchObat) return [];
        return obatList.filter(obat => 
            obat.nama_obat.toLowerCase().includes(searchObat.toLowerCase()) ||
            obat.nama_generik.toLowerCase().includes(searchObat.toLowerCase()) ||
            obat.kode_obat.toLowerCase().includes(searchObat.toLowerCase())
        );
    }, [obatList, searchObat]);

    const addObatToResep = (obat: Obat) => {
        const newResepObat: ResepObat = {
            obat_id: obat.id,
            obat: obat,
            jumlah: '1',
            dosis: '',
            aturan_pakai: '',
            keterangan: ''
        };
        
        const updatedResep = [...selectedObatList, newResepObat];
        setSelectedObatList(updatedResep);
        setData('resep_obat', updatedResep);
        setSearchObat('');
    };

    const removeObatFromResep = (index: number) => {
        const updatedResep = selectedObatList.filter((_, i) => i !== index);
        setSelectedObatList(updatedResep);
        setData('resep_obat', updatedResep);
    };

    const updateResepObat = (index: number, field: keyof ResepObat, value: string) => {
        const updatedResep = [...selectedObatList];
        updatedResep[index] = { ...updatedResep[index], [field]: value };
        setSelectedObatList(updatedResep);
        setData('resep_obat', updatedResep);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dokter.pemeriksaan.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Buat Rekam Medis - ${pendaftaran.pasien.nama_lengkap}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('dokter.pemeriksaan.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Buat Rekam Medis
                            </h1>
                            <p className="text-gray-600">
                                {pendaftaran.pasien.nama_lengkap} • {pendaftaran.kode_pendaftaran}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informasi Pasien - Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Informasi Pasien
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Kode Pasien</Label>
                                    <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                                        {pendaftaran.pasien.kode_pasien}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Nama Lengkap</Label>
                                    <p className="text-sm text-gray-900 font-medium">
                                        {pendaftaran.pasien.nama_lengkap}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Umur</Label>
                                        <p className="text-sm text-gray-900">{pendaftaran.pasien.umur} tahun</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Jenis Kelamin</Label>
                                        <p className="text-sm text-gray-900">
                                            {getJenisKelaminBadge(pendaftaran.pasien.jenis_kelamin)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Alamat</Label>
                                    <div className="flex items-start gap-2 mt-1">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <p className="text-sm text-gray-900">
                                            {pendaftaran.pasien.alamat || 'Alamat tidak tersedia'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Telepon</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-900">
                                            {pendaftaran.pasien.telepon || 'Tidak tersedia'}
                                        </p>
                                    </div>
                                </div>

                                <hr className="border-gray-200" />

                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Jenis Pemeriksaan</Label>
                                    <p className="text-sm text-gray-900 font-medium">
                                        {pendaftaran.jenis_pemeriksaan}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Didaftarkan oleh</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <UserCheck className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-900">
                                            {pendaftaran.dibuat_oleh?.nama_lengkap || 'Tidak diketahui'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Rekam Medis */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5" />
                                    Form Rekam Medis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <Label htmlFor="keluhan_utama">
                                            Keluhan Utama <span className="text-red-500">*</span>
                                        </Label>
                                        <textarea
                                            id="keluhan_utama"
                                            placeholder="Masukkan keluhan utama pasien..."
                                            value={data.keluhan_utama}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('keluhan_utama', e.target.value)}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.keluhan_utama ? 'border-red-500' : ''}`}
                                            rows={3}
                                        />
                                        {errors.keluhan_utama && (
                                            <p className="text-sm text-red-600 mt-1">{errors.keluhan_utama}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="riwayat_penyakit">Riwayat Penyakit</Label>
                                        <textarea
                                            id="riwayat_penyakit"
                                            placeholder="Masukkan riwayat penyakit pasien (jika ada)..."
                                            value={data.riwayat_penyakit}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('riwayat_penyakit', e.target.value)}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.riwayat_penyakit ? 'border-red-500' : ''}`}
                                            rows={3}
                                        />
                                        {errors.riwayat_penyakit && (
                                            <p className="text-sm text-red-600 mt-1">{errors.riwayat_penyakit}</p>
                                        )}
                                    </div>

                                    {/* Vital Signs Section */}
                                    <div className="border rounded-lg p-4 bg-blue-50">
                                        <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                            <Stethoscope className="w-4 h-4" />
                                            Tanda Vital
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="tekanan_darah">Tekanan Darah</Label>
                                                <input
                                                    type="text"
                                                    id="tekanan_darah"
                                                    placeholder="120/80 mmHg"
                                                    value={data.tekanan_darah}
                                                    onChange={(e) => setData('tekanan_darah', e.target.value)}
                                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.tekanan_darah ? 'border-red-500' : ''}`}
                                                />
                                                {errors.tekanan_darah && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.tekanan_darah}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="tinggi_badan">Tinggi Badan (cm)</Label>
                                                <input
                                                    type="number"
                                                    id="tinggi_badan"
                                                    placeholder="170"
                                                    value={data.tinggi_badan}
                                                    onChange={(e) => setData('tinggi_badan', e.target.value)}
                                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.tinggi_badan ? 'border-red-500' : ''}`}
                                                />
                                                {errors.tinggi_badan && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.tinggi_badan}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="berat_badan">Berat Badan (kg)</Label>
                                                <input
                                                    type="number"
                                                    id="berat_badan"
                                                    placeholder="65"
                                                    value={data.berat_badan}
                                                    onChange={(e) => setData('berat_badan', e.target.value)}
                                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.berat_badan ? 'border-red-500' : ''}`}
                                                />
                                                {errors.berat_badan && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.berat_badan}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="pemeriksaan_fisik">Pemeriksaan Fisik</Label>
                                        <Textarea
                                            id="pemeriksaan_fisik"
                                            placeholder="Masukkan hasil pemeriksaan fisik..."
                                            value={data.pemeriksaan_fisik}
                                            onChange={(e) => setData('pemeriksaan_fisik', e.target.value)}
                                            className={errors.pemeriksaan_fisik ? 'border-red-500' : ''}
                                            rows={4}
                                        />
                                        {errors.pemeriksaan_fisik && (
                                            <p className="text-sm text-red-600 mt-1">{errors.pemeriksaan_fisik}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="diagnosis">
                                            Diagnosis <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="diagnosis"
                                            placeholder="Masukkan diagnosis..."
                                            value={data.diagnosis}
                                            onChange={(e) => setData('diagnosis', e.target.value)}
                                            className={errors.diagnosis ? 'border-red-500' : ''}
                                            rows={3}
                                        />
                                        {errors.diagnosis && (
                                            <p className="text-sm text-red-600 mt-1">{errors.diagnosis}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="tindakan">Tindakan</Label>
                                        <Textarea
                                            id="tindakan"
                                            placeholder="Masukkan tindakan yang dilakukan..."
                                            value={data.tindakan}
                                            onChange={(e) => setData('tindakan', e.target.value)}
                                            className={errors.tindakan ? 'border-red-500' : ''}
                                            rows={3}
                                        />
                                        {errors.tindakan && (
                                            <p className="text-sm text-red-600 mt-1">{errors.tindakan}</p>
                                        )}
                                    </div>

                                    {/* Resep Obat Section */}
                                    <div className="border rounded-lg p-4 bg-green-50">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-semibold text-green-900 flex items-center gap-2">
                                                <Pill className="w-4 h-4" />
                                                Resep Obat
                                            </h3>
                                        </div>

                                        {/* Search Obat */}
                                        <div className="mb-4">
                                            <Label htmlFor="search_obat">Cari Obat</Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    id="search_obat"
                                                    type="text"
                                                    placeholder="Cari nama obat, nama generik, atau kode obat..."
                                                    value={searchObat}
                                                    onChange={(e) => setSearchObat(e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </div>
                                            
                                            {/* Dropdown hasil pencarian */}
                                            {searchObat && filteredObat.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                    {filteredObat.slice(0, 10).map((obat) => (
                                                        <button
                                                            key={obat.id}
                                                            type="button"
                                                            onClick={() => addObatToResep(obat)}
                                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{obat.nama_obat}</p>
                                                                    <p className="text-sm text-gray-600">{obat.nama_generik}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {obat.kode_obat} • {obat.kategori} • Stok: {obat.stok_tersedia} {obat.satuan}
                                                                    </p>
                                                                </div>
                                                                <span className="text-sm font-medium text-green-600">
                                                                    Rp {obat.harga.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Obat List */}
                                        {selectedObatList.length > 0 && (
                                            <div className="space-y-4">
                                                <Label>Obat yang Diresepkan</Label>
                                                {selectedObatList.map((resepItem, index) => (
                                                    <div key={index} className="border border-gray-200 rounded-md p-4 bg-white">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{resepItem.obat?.nama_obat}</h4>
                                                                <p className="text-sm text-gray-600">{resepItem.obat?.nama_generik}</p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeObatFromResep(index)}
                                                                className="text-red-600 border-red-300 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <Label>Jumlah</Label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    placeholder="1"
                                                                    value={resepItem.jumlah}
                                                                    onChange={(e) => updateResepObat(index, 'jumlah', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label>Dosis</Label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="3x1 tablet"
                                                                    value={resepItem.dosis}
                                                                    onChange={(e) => updateResepObat(index, 'dosis', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <Label>Aturan Pakai</Label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Sesudah makan"
                                                                    value={resepItem.aturan_pakai}
                                                                    onChange={(e) => updateResepObat(index, 'aturan_pakai', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <Label>Keterangan (Opsional)</Label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Keterangan tambahan..."
                                                                    value={resepItem.keterangan}
                                                                    onChange={(e) => updateResepObat(index, 'keterangan', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {errors.resep_obat && (
                                            <p className="text-sm text-red-600 mt-1">{errors.resep_obat}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="anjuran">Anjuran</Label>
                                        <Textarea
                                            id="anjuran"
                                            placeholder="Masukkan anjuran untuk pasien..."
                                            value={data.anjuran}
                                            onChange={(e) => setData('anjuran', e.target.value)}
                                            className={errors.anjuran ? 'border-red-500' : ''}
                                            rows={3}
                                        />
                                        {errors.anjuran && (
                                            <p className="text-sm text-red-600 mt-1">{errors.anjuran}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="catatan">Catatan Tambahan</Label>
                                        <Textarea
                                            id="catatan"
                                            placeholder="Masukkan catatan tambahan (jika ada)..."
                                            value={data.catatan}
                                            onChange={(e) => setData('catatan', e.target.value)}
                                            className={errors.catatan ? 'border-red-500' : ''}
                                            rows={3}
                                        />
                                        {errors.catatan && (
                                            <p className="text-sm text-red-600 mt-1">{errors.catatan}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-4 pt-6 border-t">
                                        <Link href={route('dokter.pemeriksaan.index')}>
                                            <Button type="button" variant="outline">
                                                Batal
                                            </Button>
                                        </Link>
                                        <Button 
                                            type="submit" 
                                            disabled={processing}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Simpan Rekam Medis
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
