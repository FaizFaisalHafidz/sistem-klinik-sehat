import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Calendar,
    ClipboardList,
    Eye,
    FileText,
    Hash,
    Heart,
    MapPin,
    Phone,
    Pill,
    Ruler,
    Stethoscope,
    StickyNote,
    Thermometer,
    User,
    UserCheck,
    Weight,
} from 'lucide-react';

interface RekamMedis {
    id: number;
    tanggal_pemeriksaan: string;
    tanggal_pemeriksaan_formatted: string;
    pasien: {
        id: number;
        nama_lengkap: string;
        kode_pasien: string;
        tanggal_lahir: string;
        tanggal_lahir_formatted: string;
        jenis_kelamin: string;
        alamat: string;
        nomor_telepon: string;
        umur: number;
    };
    dokter: {
        id: number;
        nama_lengkap: string;
        jabatan: string;
        nomor_sip: string;
    };
    anamnesis: string | null;
    diagnosa: string | null;
    pemeriksaan_fisik: string | null;
    rencana_pengobatan: string | null;
    catatan_dokter: string | null;
    tanda_vital: {
        tekanan_darah?: string;
        suhu?: string;
        berat_badan?: string;
        tinggi_badan?: string;
    };
    status_rekam_medis: string;
}

interface RiwayatRekamMedis {
    id: number;
    tanggal_pemeriksaan: string;
    diagnosa: string;
    dokter: string;
}

interface Props {
    rekamMedis: RekamMedis;
    riwayatRekamMedis: RiwayatRekamMedis[];
}

export default function Show({ rekamMedis, riwayatRekamMedis }: Props) {
    return (
        <AppLayout>
            <Head title={`Detail Rekam Medis - ${rekamMedis.pasien.nama_lengkap}`} />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/laporan"
                            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Detail Rekam Medis</h1>
                            <p className="text-sm text-gray-600">
                                {rekamMedis.pasien.nama_lengkap} - {rekamMedis.tanggal_pemeriksaan_formatted}
                            </p>
                        </div>
                    </div>

                    <Link
                        href={`/admin/laporan/${rekamMedis.id}/cetak`}
                        target="_blank"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl print:hidden"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Cetak
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informasi Pasien */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-500" />
                                    Informasi Pasien
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">No. Rekam Medis</p>
                                                <p className="text-base font-semibold text-gray-900 font-mono">
                                                    {rekamMedis.pasien.kode_pasien}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Nama Lengkap</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {rekamMedis.pasien.nama_lengkap}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Tanggal Lahir</p>
                                                <p className="text-base text-gray-900">
                                                    {rekamMedis.pasien.tanggal_lahir_formatted} ({rekamMedis.pasien.umur} tahun)
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Jenis Kelamin</p>
                                                <p className="text-base text-gray-900 capitalize">
                                                    {rekamMedis.pasien.jenis_kelamin}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">No. Telepon</p>
                                                <p className="text-base text-gray-900">
                                                    {rekamMedis.pasien.nomor_telepon || '-'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Alamat</p>
                                                <p className="text-base text-gray-900">
                                                    {rekamMedis.pasien.alamat || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informasi Pemeriksaan */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Stethoscope className="w-5 h-5 mr-2 text-green-500" />
                                    Informasi Pemeriksaan
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Tanggal Pemeriksaan</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {rekamMedis.tanggal_pemeriksaan_formatted}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <UserCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Dokter Pemeriksa</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {rekamMedis.dokter.nama_lengkap}
                                                </p>
                                                {rekamMedis.dokter.nomor_sip && rekamMedis.dokter.nomor_sip !== '-' && (
                                                    <p className="text-sm text-gray-600">
                                                        SIP: {rekamMedis.dokter.nomor_sip}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vital Signs */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Activity className="w-5 h-5 mr-2 text-red-500" />
                                    Tanda Vital
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                                        <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                                        <p className="text-xs font-medium text-gray-500 uppercase">Tekanan Darah</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {rekamMedis.tanda_vital.tekanan_darah || '-'}
                                        </p>
                                    </div>

                                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <Thermometer className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                                        <p className="text-xs font-medium text-gray-500 uppercase">Suhu Tubuh</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {rekamMedis.tanda_vital.suhu ? `${rekamMedis.tanda_vital.suhu}°C` : '-'}
                                        </p>
                                    </div>

                                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <Weight className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                        <p className="text-xs font-medium text-gray-500 uppercase">Berat Badan</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {rekamMedis.tanda_vital.berat_badan ? `${rekamMedis.tanda_vital.berat_badan} kg` : '-'}
                                        </p>
                                    </div>

                                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                        <Ruler className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                        <p className="text-xs font-medium text-gray-500 uppercase">Tinggi Badan</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {rekamMedis.tanda_vital.tinggi_badan ? `${rekamMedis.tanda_vital.tinggi_badan} cm` : '-'}
                                        </p>
                                    </div>

                                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <Heart className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                        <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                                        <p className="text-lg font-bold text-gray-900 capitalize">
                                            {rekamMedis.status_rekam_medis}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Anamnesis & Diagnosa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <ClipboardList className="w-5 h-5 mr-2 text-yellow-500" />
                                        Anamnesis
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {rekamMedis.anamnesis || 'Tidak ada anamnesis yang dicatat'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Stethoscope className="w-5 h-5 mr-2 text-blue-500" />
                                        Diagnosa
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {rekamMedis.diagnosa || 'Belum ada diagnosa'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pemeriksaan Fisik & Rencana Pengobatan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-green-500" />
                                        Pemeriksaan Fisik
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {rekamMedis.pemeriksaan_fisik || 'Tidak ada pemeriksaan fisik khusus'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Pill className="w-5 h-5 mr-2 text-purple-500" />
                                        Rencana Pengobatan
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {rekamMedis.rencana_pengobatan || 'Tidak ada rencana pengobatan'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Catatan Dokter */}
                        {rekamMedis.catatan_dokter && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <StickyNote className="w-5 h-5 mr-2 text-orange-500" />
                                        Catatan Dokter
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {rekamMedis.catatan_dokter}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Riwayat */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-blue-500" />
                                    Riwayat Rekam Medis
                                </h3>
                            </div>
                            <div className="p-6">
                                {riwayatRekamMedis.length > 0 ? (
                                    <div className="space-y-3">
                                        {riwayatRekamMedis.map((riwayat, index) => (
                                            <Link
                                                key={riwayat.id}
                                                href={`/admin/laporan/${riwayat.id}`}
                                                className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {riwayat.tanggal_pemeriksaan}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                            {riwayat.diagnosa || 'Tidak ada diagnosa'}
                                                        </p>
                                                        <p className="text-xs text-blue-600 mt-1">
                                                            Dr. {riwayat.dokter}
                                                        </p>
                                                    </div>
                                                    <Eye className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Belum ada riwayat rekam medis lain</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .print\\:hidden {
                        display: none !important;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </AppLayout>
    );
}
