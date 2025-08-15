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
    Save,
    Stethoscope,
    User,
    UserCheck
} from 'lucide-react';

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
}

const getJenisKelaminBadge = (jenis_kelamin: string) => {
    return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
};

export default function Create({ pendaftaran }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        pendaftaran_id: pendaftaran.id,
        keluhan_utama: pendaftaran.keluhan || '',
        riwayat_penyakit: '',
        pemeriksaan_fisik: '',
        diagnosis: '',
        tindakan: '',
        resep: '',
        catatan: '',
        anjuran: '',
    });

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

                                    <div>
                                        <Label htmlFor="resep">Resep/Obat</Label>
                                        <Textarea
                                            id="resep"
                                            placeholder="Masukkan resep atau obat yang diberikan..."
                                            value={data.resep}
                                            onChange={(e) => setData('resep', e.target.value)}
                                            className={errors.resep ? 'border-red-500' : ''}
                                            rows={4}
                                        />
                                        {errors.resep && (
                                            <p className="text-sm text-red-600 mt-1">{errors.resep}</p>
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
