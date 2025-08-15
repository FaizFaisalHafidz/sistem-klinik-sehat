import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    Stethoscope,
    User
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

interface DibuatOleh {
    nama_lengkap: string;
}

interface RekamMedis {
    id: number;
    keluhan_utama: string;
    riwayat_penyakit: string;
    pemeriksaan_fisik: string;
    diagnosis: string;
    tindakan: string;
    resep: string;
    catatan: string;
    anjuran: string;
    tanggal_pemeriksaan: string;
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
    dibuatOleh: DibuatOleh;
    rekamMedis: RekamMedis;
}

interface Props {
    pendaftaran: Pendaftaran;
}

const getJenisKelaminBadge = (jenis_kelamin: string) => {
    return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
};

export default function Edit({ pendaftaran }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        keluhan_utama: pendaftaran.rekamMedis.keluhan_utama || '',
        riwayat_penyakit: pendaftaran.rekamMedis.riwayat_penyakit || '',
        pemeriksaan_fisik: pendaftaran.rekamMedis.pemeriksaan_fisik || '',
        diagnosis: pendaftaran.rekamMedis.diagnosis || '',
        tindakan: pendaftaran.rekamMedis.tindakan || '',
        resep: pendaftaran.rekamMedis.resep || '',
        catatan: pendaftaran.rekamMedis.catatan || '',
        anjuran: pendaftaran.rekamMedis.anjuran || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('dokter.pemeriksaan.update', pendaftaran.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Rekam Medis - ${pendaftaran.pasien.nama_lengkap}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('dokter.pemeriksaan.show', pendaftaran.id)}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Edit Rekam Medis
                            </h1>
                            <p className="text-gray-600">
                                {pendaftaran.pasien.nama_lengkap} • {pendaftaran.kode_pendaftaran}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informasi Pasien */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Informasi Pasien
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Kode Pasien</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">
                                    {pendaftaran.pasien.kode_pasien}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">
                                    {pendaftaran.pasien.nama_lengkap}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Umur / Jenis Kelamin</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {pendaftaran.pasien.umur} tahun / {getJenisKelaminBadge(pendaftaran.pasien.jenis_kelamin)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Jenis Pemeriksaan</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">
                                    {pendaftaran.jenis_pemeriksaan}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Tanggal Pemeriksaan</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {pendaftaran.rekamMedis.tanggal_pemeriksaan}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Edit Rekam Medis */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="w-5 h-5" />
                                Edit Rekam Medis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <Label htmlFor="keluhan_utama">
                                            Keluhan Utama <span className="text-red-500">*</span>
                                        </Label>
                                        <textarea
                                            id="keluhan_utama"
                                            value={data.keluhan_utama}
                                            onChange={(e) => setData('keluhan_utama', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Deskripsikan keluhan utama pasien..."
                                            required
                                        />
                                        {errors.keluhan_utama && (
                                            <p className="mt-1 text-sm text-red-600">{errors.keluhan_utama}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="riwayat_penyakit">Riwayat Penyakit</Label>
                                        <textarea
                                            id="riwayat_penyakit"
                                            value={data.riwayat_penyakit}
                                            onChange={(e) => setData('riwayat_penyakit', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Riwayat penyakit pasien..."
                                        />
                                        {errors.riwayat_penyakit && (
                                            <p className="mt-1 text-sm text-red-600">{errors.riwayat_penyakit}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="pemeriksaan_fisik">Pemeriksaan Fisik</Label>
                                        <textarea
                                            id="pemeriksaan_fisik"
                                            value={data.pemeriksaan_fisik}
                                            onChange={(e) => setData('pemeriksaan_fisik', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows={4}
                                            placeholder="Hasil pemeriksaan fisik (tekanan darah, denyut nadi, suhu, dll)..."
                                        />
                                        {errors.pemeriksaan_fisik && (
                                            <p className="mt-1 text-sm text-red-600">{errors.pemeriksaan_fisik}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="diagnosis">
                                            Diagnosis <span className="text-red-500">*</span>
                                        </Label>
                                        <textarea
                                            id="diagnosis"
                                            value={data.diagnosis}
                                            onChange={(e) => setData('diagnosis', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Diagnosis medis..."
                                            required
                                        />
                                        {errors.diagnosis && (
                                            <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="tindakan">Tindakan</Label>
                                        <textarea
                                            id="tindakan"
                                            value={data.tindakan}
                                            onChange={(e) => setData('tindakan', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Tindakan medis yang dilakukan..."
                                        />
                                        {errors.tindakan && (
                                            <p className="mt-1 text-sm text-red-600">{errors.tindakan}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="resep">Resep</Label>
                                        <textarea
                                            id="resep"
                                            value={data.resep}
                                            onChange={(e) => setData('resep', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows={4}
                                            placeholder="Resep obat dan dosis..."
                                        />
                                        {errors.resep && (
                                            <p className="mt-1 text-sm text-red-600">{errors.resep}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="catatan">Catatan</Label>
                                        <textarea
                                            id="catatan"
                                            value={data.catatan}
                                            onChange={(e) => setData('catatan', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Catatan tambahan..."
                                        />
                                        {errors.catatan && (
                                            <p className="mt-1 text-sm text-red-600">{errors.catatan}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="anjuran">Anjuran</Label>
                                        <textarea
                                            id="anjuran"
                                            value={data.anjuran}
                                            onChange={(e) => setData('anjuran', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Anjuran untuk pasien (istirahat, kontrol, dll)..."
                                        />
                                        {errors.anjuran && (
                                            <p className="mt-1 text-sm text-red-600">{errors.anjuran}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-6 border-t">
                                    <Link href={route('dokter.pemeriksaan.show', pendaftaran.id)}>
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </Link>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Menyimpan...' : 'Update Rekam Medis'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
