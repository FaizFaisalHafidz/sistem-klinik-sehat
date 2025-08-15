import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Phone,
    Save,
    Stethoscope,
    Thermometer,
    User,
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

interface Pendaftaran {
    id: number;
    kode_pendaftaran: string;
    tanggal_pendaftaran: string;
    jenis_pemeriksaan?: string;
}

interface TandaVital {
    tekanan_darah?: string;
    suhu?: string;
    berat_badan?: string;
    tinggi_badan?: string;
}

interface RekamMedis {
    id: number;
    kode_rekam_medis: string;
    tanggal_pemeriksaan: string;
    anamnesis: string;
    pemeriksaan_fisik: string;
    diagnosa: string;
    rencana_pengobatan: string;
    catatan_dokter: string;
    tanggal_kontrol: string;
    status_rekam_medis: string;
    tanda_vital: TandaVital | null;
    pasien: Pasien;
    pendaftaran: Pendaftaran;
}

interface Props {
    rekamMedis: RekamMedis;
}

const getJenisKelaminBadge = (jenis_kelamin: string) => {
    return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
};

export default function Edit({ rekamMedis }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        anamnesis: rekamMedis.anamnesis || '',
        pemeriksaan_fisik: rekamMedis.pemeriksaan_fisik || '',
        diagnosa: rekamMedis.diagnosa || '',
        rencana_pengobatan: rekamMedis.rencana_pengobatan || '',
        catatan_dokter: rekamMedis.catatan_dokter || '',
        tanggal_kontrol: rekamMedis.tanggal_kontrol || '',
        tanda_vital: {
            tekanan_darah: rekamMedis.tanda_vital?.tekanan_darah || '',
            suhu: rekamMedis.tanda_vital?.suhu || '',
            berat_badan: rekamMedis.tanda_vital?.berat_badan || '',
            tinggi_badan: rekamMedis.tanda_vital?.tinggi_badan || '',
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('dokter.rekam-medis.update', rekamMedis.id), {
            onSuccess: () => {
                // Redirect handled by controller
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit Rekam Medis - ${rekamMedis.pasien.nama_lengkap}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('dokter.rekam-medis.show', rekamMedis.id)}>
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
                                {rekamMedis.pasien.nama_lengkap} • {rekamMedis.kode_rekam_medis}
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
                                        {rekamMedis.pasien.kode_pasien}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Nama Lengkap</Label>
                                    <p className="text-sm text-gray-900 font-medium">
                                        {rekamMedis.pasien.nama_lengkap}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Umur</Label>
                                        <p className="text-sm text-gray-900">{rekamMedis.pasien.umur} tahun</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Jenis Kelamin</Label>
                                        <p className="text-sm text-gray-900">
                                            {getJenisKelaminBadge(rekamMedis.pasien.jenis_kelamin)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Alamat</Label>
                                    <div className="flex items-start gap-2 mt-1">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <p className="text-sm text-gray-900">
                                            {rekamMedis.pasien.alamat || 'Alamat tidak tersedia'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Telepon</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-900">
                                            {rekamMedis.pasien.telepon || 'Tidak tersedia'}
                                        </p>
                                    </div>
                                </div>

                                <hr className="border-gray-200" />

                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Kode Pendaftaran</Label>
                                    <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                                        {rekamMedis.pendaftaran.kode_pendaftaran}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Tanggal Pemeriksaan</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-900">
                                            {new Date(rekamMedis.tanggal_pemeriksaan).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Edit Rekam Medis */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Tanda Vital */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Thermometer className="w-5 h-5" />
                                        Tanda Vital
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="tekanan_darah">Tekanan Darah</Label>
                                            <Input
                                                id="tekanan_darah"
                                                placeholder="Contoh: 120/80"
                                                value={data.tanda_vital.tekanan_darah}
                                                onChange={(e) => setData('tanda_vital', {
                                                    ...data.tanda_vital,
                                                    tekanan_darah: e.target.value
                                                })}
                                                className={errors['tanda_vital.tekanan_darah'] ? 'border-red-500' : ''}
                                            />
                                            {errors['tanda_vital.tekanan_darah'] && (
                                                <p className="text-sm text-red-600 mt-1">{errors['tanda_vital.tekanan_darah']}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="suhu">Suhu Tubuh (°C)</Label>
                                            <Input
                                                id="suhu"
                                                type="number"
                                                step="0.1"
                                                placeholder="36.5"
                                                value={data.tanda_vital.suhu}
                                                onChange={(e) => setData('tanda_vital', {
                                                    ...data.tanda_vital,
                                                    suhu: e.target.value
                                                })}
                                                className={errors['tanda_vital.suhu'] ? 'border-red-500' : ''}
                                            />
                                            {errors['tanda_vital.suhu'] && (
                                                <p className="text-sm text-red-600 mt-1">{errors['tanda_vital.suhu']}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="berat_badan">Berat Badan (kg)</Label>
                                            <Input
                                                id="berat_badan"
                                                type="number"
                                                step="0.1"
                                                placeholder="70"
                                                value={data.tanda_vital.berat_badan}
                                                onChange={(e) => setData('tanda_vital', {
                                                    ...data.tanda_vital,
                                                    berat_badan: e.target.value
                                                })}
                                                className={errors['tanda_vital.berat_badan'] ? 'border-red-500' : ''}
                                            />
                                            {errors['tanda_vital.berat_badan'] && (
                                                <p className="text-sm text-red-600 mt-1">{errors['tanda_vital.berat_badan']}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="tinggi_badan">Tinggi Badan (cm)</Label>
                                            <Input
                                                id="tinggi_badan"
                                                type="number"
                                                placeholder="170"
                                                value={data.tanda_vital.tinggi_badan}
                                                onChange={(e) => setData('tanda_vital', {
                                                    ...data.tanda_vital,
                                                    tinggi_badan: e.target.value
                                                })}
                                                className={errors['tanda_vital.tinggi_badan'] ? 'border-red-500' : ''}
                                            />
                                            {errors['tanda_vital.tinggi_badan'] && (
                                                <p className="text-sm text-red-600 mt-1">{errors['tanda_vital.tinggi_badan']}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detail Pemeriksaan */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Stethoscope className="w-5 h-5" />
                                        Detail Pemeriksaan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <Label htmlFor="anamnesis">
                                            Anamnesis <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="anamnesis"
                                            placeholder="Masukkan anamnesis (keluhan utama, riwayat penyakit, dll)..."
                                            value={data.anamnesis}
                                            onChange={(e) => setData('anamnesis', e.target.value)}
                                            className={errors.anamnesis ? 'border-red-500' : ''}
                                            rows={4}
                                        />
                                        {errors.anamnesis && (
                                            <p className="text-sm text-red-600 mt-1">{errors.anamnesis}</p>
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
                                        <Label htmlFor="diagnosa">
                                            Diagnosis <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="diagnosa"
                                            placeholder="Masukkan diagnosis..."
                                            value={data.diagnosa}
                                            onChange={(e) => setData('diagnosa', e.target.value)}
                                            className={errors.diagnosa ? 'border-red-500' : ''}
                                            rows={3}
                                        />
                                        {errors.diagnosa && (
                                            <p className="text-sm text-red-600 mt-1">{errors.diagnosa}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="rencana_pengobatan">Rencana Pengobatan</Label>
                                        <Textarea
                                            id="rencana_pengobatan"
                                            placeholder="Masukkan rencana pengobatan, resep, anjuran..."
                                            value={data.rencana_pengobatan}
                                            onChange={(e) => setData('rencana_pengobatan', e.target.value)}
                                            className={errors.rencana_pengobatan ? 'border-red-500' : ''}
                                            rows={4}
                                        />
                                        {errors.rencana_pengobatan && (
                                            <p className="text-sm text-red-600 mt-1">{errors.rencana_pengobatan}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="catatan_dokter">Catatan Dokter</Label>
                                        <Textarea
                                            id="catatan_dokter"
                                            placeholder="Masukkan catatan tambahan..."
                                            value={data.catatan_dokter}
                                            onChange={(e) => setData('catatan_dokter', e.target.value)}
                                            className={errors.catatan_dokter ? 'border-red-500' : ''}
                                            rows={3}
                                        />
                                        {errors.catatan_dokter && (
                                            <p className="text-sm text-red-600 mt-1">{errors.catatan_dokter}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="tanggal_kontrol">Tanggal Kontrol</Label>
                                        <Input
                                            id="tanggal_kontrol"
                                            type="date"
                                            value={data.tanggal_kontrol}
                                            onChange={(e) => setData('tanggal_kontrol', e.target.value)}
                                            className={errors.tanggal_kontrol ? 'border-red-500' : ''}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.tanggal_kontrol && (
                                            <p className="text-sm text-red-600 mt-1">{errors.tanggal_kontrol}</p>
                                        )}
                                        <p className="text-sm text-gray-600 mt-1">
                                            Opsional: Tanggal untuk kontrol berikutnya
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end gap-4 pt-6 border-t">
                                        <Link href={route('dokter.rekam-medis.show', rekamMedis.id)}>
                                            <Button type="button" variant="outline">
                                                Batal
                                            </Button>
                                        </Link>
                                        <Button 
                                            type="submit" 
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Simpan Perubahan
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
