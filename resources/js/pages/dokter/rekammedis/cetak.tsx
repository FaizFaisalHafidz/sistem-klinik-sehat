import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Printer
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

interface Dokter {
    nama_lengkap: string;
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
    tanda_vital: string | TandaVital | null; // Could be JSON string or parsed object
    pasien: Pasien;
    dokter: Dokter;
    pendaftaran: Pendaftaran;
}

interface Props {
    rekamMedis: RekamMedis;
}

const getJenisKelaminBadge = (jenis_kelamin: string) => {
    return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
};

export default function Cetak({ rekamMedis }: Props) {
    // Parse tanda_vital dari JSON string jika diperlukan
    const getTandaVital = (): TandaVital | null => {
        if (!rekamMedis.tanda_vital) return null;
        
        if (typeof rekamMedis.tanda_vital === 'string') {
            try {
                return JSON.parse(rekamMedis.tanda_vital);
            } catch (error) {
                console.error('Error parsing tanda_vital JSON:', error);
                return null;
            }
        }
        
        return rekamMedis.tanda_vital as TandaVital;
    };

    // Fungsi untuk membersihkan unit dari nilai
    const cleanValue = (value: string | undefined): string => {
        if (!value) return '-';
        
        // Hapus unit seperti 'cm', 'kg', dll dan trim whitespace
        return value.replace(/\s*(cm|kg|°C|mmHg)\s*$/i, '').trim() || '-';
    };

    // Fungsi untuk mendapatkan unit dari nilai
    const getUnit = (value: string | undefined, defaultUnit: string): string => {
        if (!value) return defaultUnit;
        
        // Cek apakah ada unit dalam value
        if (value.match(/cm$/i)) return 'cm';
        if (value.match(/kg$/i)) return 'kg';
        if (value.match(/°C$/i)) return '°C';
        if (value.match(/mmHg$/i)) return 'mmHg';
        
        return defaultUnit;
    };

    // Fungsi untuk format tanggal lahir
    const formatTanggalLahir = (tanggalLahir: string): string => {
        try {
            const date = new Date(tanggalLahir);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting tanggal lahir:', error);
            return tanggalLahir;
        }
    };

    // Fungsi untuk menghitung umur yang benar
    const calculateAge = (tanggalLahir: string): number => {
        try {
            const birthDate = new Date(tanggalLahir);
            const today = new Date();
            
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            return Math.max(0, age); // Pastikan umur tidak negatif
        } catch (error) {
            console.error('Error calculating age:', error);
            return rekamMedis.pasien.umur || 0;
        }
    };

    const tandaVital = getTandaVital();
    const umurSebenarnya = calculateAge(rekamMedis.pasien.tanggal_lahir);

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout>
            <Head title={`Cetak Rekam Medis - ${rekamMedis.pasien.nama_lengkap}`} />
            
            <div className="space-y-6 p-6">
                {/* Header - Hidden when printing */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('dokter.rekam-medis.show', rekamMedis.id)}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Cetak Rekam Medis
                            </h1>
                            <p className="text-gray-600">
                                {rekamMedis.pasien.nama_lengkap} • {rekamMedis.kode_rekam_medis}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                            <Printer className="w-4 h-4 mr-2" />
                            Cetak
                        </Button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:rounded-none print:p-0">
                    {/* Header Klinik */}
                    <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
                        <h1 className="text-2xl font-bold text-blue-900">KLINIK SEHAT BERSAMA</h1>
                        <p className="text-gray-600">Jl. Mahmud No.93, Mekar Rahayu, Kec. Margaasih, Kabupaten Bandung, Jawa Barat 40218</p>
                        <p className="text-gray-600">Telp: (021) 1234567 | Email: info@kliniksehat.com</p>
                        <div className="mt-4">
                            <h2 className="text-xl font-semibold text-gray-800">REKAM MEDIS</h2>
                            <p className="text-gray-600">No. Rekam Medis: {rekamMedis.kode_rekam_medis}</p>
                        </div>
                    </div>

                    {/* Informasi Pasien */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                            INFORMASI PASIEN
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <table className="w-full text-sm">
                                    <tr>
                                        <td className="py-1 font-medium text-gray-700 w-1/3">Kode Pasien</td>
                                        <td className="py-1">: {rekamMedis.pasien.kode_pasien}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-medium text-gray-700">Nama Lengkap</td>
                                        <td className="py-1">: {rekamMedis.pasien.nama_lengkap}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-medium text-gray-700">Tanggal Lahir</td>
                                        <td className="py-1">: {formatTanggalLahir(rekamMedis.pasien.tanggal_lahir)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-medium text-gray-700">Umur</td>
                                        <td className="py-1">: {umurSebenarnya} tahun</td>
                                    </tr>
                                </table>
                            </div>
                            <div>
                                <table className="w-full text-sm">
                                    <tr>
                                        <td className="py-1 font-medium text-gray-700 w-1/3">Jenis Kelamin</td>
                                        <td className="py-1">: {getJenisKelaminBadge(rekamMedis.pasien.jenis_kelamin)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-medium text-gray-700">Alamat</td>
                                        <td className="py-1">: {rekamMedis.pasien.alamat || 'Tidak tersedia'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-medium text-gray-700">Telepon</td>
                                        <td className="py-1">: {rekamMedis.pasien.telepon || 'Tidak tersedia'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-medium text-gray-700">Kode Pendaftaran</td>
                                        <td className="py-1">: {rekamMedis.pendaftaran.kode_pendaftaran}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Pemeriksaan */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                            INFORMASI PEMERIKSAAN
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <table className="w-full text-sm">
                                    <tr>
                                        <td className="py-1 font-medium text-gray-700 w-1/3">Tanggal Pemeriksaan</td>
                                        <td className="py-1">: {new Date(rekamMedis.tanggal_pemeriksaan).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-medium text-gray-700">Dokter Pemeriksa</td>
                                        <td className="py-1">: {rekamMedis.dokter.nama_lengkap}</td>
                                    </tr>
                                </table>
                            </div>
                            <div>
                                <table className="w-full text-sm">
                                    {/* <tr>
                                        <td className="py-1 font-medium text-gray-700 w-1/3">Jenis Pemeriksaan</td>
                                        <td className="py-1">: {rekamMedis.pendaftaran.jenis_pemeriksaan || 'Tidak ditentukan'}</td>
                                    </tr> */}
                                    {rekamMedis.tanggal_kontrol && (
                                        <tr>
                                            <td className="py-1 font-medium text-gray-700">Tanggal Kontrol</td>
                                            <td className="py-1">: {new Date(rekamMedis.tanggal_kontrol).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}</td>
                                        </tr>
                                    )}
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Tanda Vital */}
                    {tandaVital && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                TANDA VITAL
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="text-center border border-gray-300 p-3 rounded">
                                    <div className="text-lg font-bold text-red-600">
                                        {cleanValue(tandaVital.tekanan_darah)}
                                    </div>
                                    <div className="text-sm text-gray-700">Tekanan Darah</div>
                                    <div className="text-xs text-gray-500">{getUnit(tandaVital.tekanan_darah, 'mmHg')}</div>
                                </div>
                                <div className="text-center border border-gray-300 p-3 rounded">
                                    <div className="text-lg font-bold text-orange-600">
                                        {cleanValue(tandaVital.suhu)}
                                    </div>
                                    <div className="text-sm text-gray-700">Suhu Tubuh</div>
                                    <div className="text-xs text-gray-500">{getUnit(tandaVital.suhu, '°C')}</div>
                                </div>
                                <div className="text-center border border-gray-300 p-3 rounded">
                                    <div className="text-lg font-bold text-blue-600">
                                        {cleanValue(tandaVital.berat_badan)}
                                    </div>
                                    <div className="text-sm text-gray-700">Berat Badan</div>
                                    <div className="text-xs text-gray-500">{getUnit(tandaVital.berat_badan, 'kg')}</div>
                                </div>
                                <div className="text-center border border-gray-300 p-3 rounded">
                                    <div className="text-lg font-bold text-green-600">
                                        {cleanValue(tandaVital.tinggi_badan)}
                                    </div>
                                    <div className="text-sm text-gray-700">Tinggi Badan</div>
                                    <div className="text-xs text-gray-500">{getUnit(tandaVital.tinggi_badan, 'cm')}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detail Pemeriksaan */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                            DETAIL PEMERIKSAAN
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Anamnesis:</h4>
                                <div className="border border-gray-300 p-3 rounded bg-gray-50 min-h-[60px]">
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                        {rekamMedis.anamnesis || 'Tidak ada anamnesis'}
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Pemeriksaan Fisik:</h4>
                                <div className="border border-gray-300 p-3 rounded bg-gray-50 min-h-[60px]">
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                        {rekamMedis.pemeriksaan_fisik || 'Tidak ada pemeriksaan fisik'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Diagnosis:</h4>
                                <div className="border border-blue-300 p-3 rounded bg-blue-50 min-h-[60px]">
                                    <p className="text-sm text-blue-900 font-medium">
                                        {rekamMedis.diagnosa}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Rencana Pengobatan:</h4>
                                <div className="border border-green-300 p-3 rounded bg-green-50 min-h-[60px]">
                                    <p className="text-sm text-green-900 whitespace-pre-wrap">
                                        {rekamMedis.rencana_pengobatan || 'Tidak ada rencana pengobatan'}
                                    </p>
                                </div>
                            </div>

                            {rekamMedis.catatan_dokter && (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Catatan Dokter:</h4>
                                    <div className="border border-gray-300 p-3 rounded bg-gray-50 min-h-[60px]">
                                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                            {rekamMedis.catatan_dokter}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tanda Tangan */}
                    <div className="mt-12 pt-8 border-t border-gray-300">
                        <div className="flex justify-between">
                            <div className="text-center">
                                <p className="text-sm text-gray-700 mb-16">Pasien/Keluarga</p>
                                <div className="border-t border-gray-800 w-48">
                                    <p className="text-sm text-gray-700 mt-2">
                                        {rekamMedis.pasien.nama_lengkap}
                                    </p>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-700 mb-2">
                                    Bandung, {new Date(rekamMedis.tanggal_pemeriksaan).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                                <p className="text-sm text-gray-700 mb-16">Dokter Pemeriksa</p>
                                <div className="border-t border-gray-800 w-48">
                                    <p className="text-sm text-gray-700 mt-2">
                                        {rekamMedis.dokter.nama_lengkap}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
