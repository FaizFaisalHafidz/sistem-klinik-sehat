import { Head } from '@inertiajs/react';
import {
    FileText,
    Heart,
    User
} from 'lucide-react';
import { useEffect } from 'react';

interface RekamMedis {
    id: number;
    kode_rekam_medis: string;
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

interface Props {
    rekamMedis: RekamMedis;
}

export default function Cetak({ rekamMedis }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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

    // Auto print when component mounts
    useEffect(() => {
        // Small delay to ensure content is fully rendered
        const timer = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="print:m-0 print:p-0">
            <Head title={`Cetak Rekam Medis - ${rekamMedis.pasien.nama_lengkap}`} />
            
            {/* Print Styles */}
            <style>{`
                @media print {
                    body { margin: 0; }
                    .print\\:hidden { display: none !important; }
                    .print\\:m-0 { margin: 0 !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    @page { 
                        margin: 1cm; 
                        size: A4;
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
                        <h1 className="text-3xl font-bold text-blue-800 mb-2">KLINIK SEHAT</h1>
                        <p className="text-gray-600 mb-4">Jl. Mahmud No.93, Mekar Rahayu, Kec. Margaasih, Kabupaten Bandung, Jawa Barat 40218</p>
                        <h2 className="text-2xl font-semibold text-gray-800">REKAM MEDIS PASIEN</h2>
                        <p className="text-lg text-gray-700 mt-2">{rekamMedis.kode_rekam_medis}</p>
                    </div>

                    {/* Patient Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                <User className="inline w-5 h-5 mr-2" />
                                Informasi Pasien
                            </h3>
                            <div className="space-y-2">
                                <p><strong>Nama:</strong> {rekamMedis.pasien.nama_lengkap}</p>
                                <p><strong>Kode Pasien:</strong> {rekamMedis.pasien.kode_pasien}</p>
                                <p><strong>Jenis Kelamin:</strong> {rekamMedis.pasien.jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan'}</p>
                                <p><strong>Umur:</strong> {rekamMedis.pasien.umur} tahun</p>
                                <p><strong>Tanggal Lahir:</strong> {rekamMedis.pasien.tanggal_lahir_formatted}</p>
                                {rekamMedis.pasien.nomor_telepon && <p><strong>Telepon:</strong> {rekamMedis.pasien.nomor_telepon}</p>}
                                {rekamMedis.pasien.alamat && <p><strong>Alamat:</strong> {rekamMedis.pasien.alamat}</p>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                <FileText className="inline w-5 h-5 mr-2" />
                                Informasi Pemeriksaan
                            </h3>
                            <div className="space-y-2">
                                <p><strong>Tanggal:</strong> {rekamMedis.tanggal_pemeriksaan_formatted}</p>
                                <p><strong>Dokter:</strong> {rekamMedis.dokter.nama_lengkap}</p>
                                <p><strong>Jabatan:</strong> {rekamMedis.dokter.jabatan}</p>
                                <p><strong>No. SIP:</strong> {rekamMedis.dokter.nomor_sip}</p>
                            </div>
                        </div>
                    </div>

                    {/* Vital Signs */}
                    {rekamMedis.tanda_vital && (rekamMedis.tanda_vital.tekanan_darah || rekamMedis.tanda_vital.suhu || rekamMedis.tanda_vital.berat_badan || rekamMedis.tanda_vital.tinggi_badan) && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                <Heart className="inline w-5 h-5 mr-2 text-red-500" />
                                Tanda Vital
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                {rekamMedis.tanda_vital.tekanan_darah && (
                                    <div>
                                        <p className="font-medium">Tekanan Darah</p>
                                        <p>{rekamMedis.tanda_vital.tekanan_darah}</p>
                                    </div>
                                )}
                                {rekamMedis.tanda_vital.suhu && (
                                    <div>
                                        <p className="font-medium">Suhu</p>
                                        <p>{rekamMedis.tanda_vital.suhu}</p>
                                    </div>
                                )}
                                {rekamMedis.tanda_vital.berat_badan && (
                                    <div>
                                        <p className="font-medium">Berat Badan</p>
                                        <p>{rekamMedis.tanda_vital.berat_badan}</p>
                                    </div>
                                )}
                                {rekamMedis.tanda_vital.tinggi_badan && (
                                    <div>
                                        <p className="font-medium">Tinggi Badan</p>
                                        <p>{rekamMedis.tanda_vital.tinggi_badan}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Medical Information */}
                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Anamnesis</h4>
                            <p className="bg-gray-50 p-3 rounded border">{rekamMedis.anamnesis || '-'}</p>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Pemeriksaan Fisik</h4>
                            <p className="bg-gray-50 p-3 rounded border">{rekamMedis.pemeriksaan_fisik || '-'}</p>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Diagnosa</h4>
                            <p className="bg-blue-50 p-3 rounded border border-blue-200 font-medium text-lg">{rekamMedis.diagnosa}</p>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Rencana Pengobatan</h4>
                            <p className="bg-gray-50 p-3 rounded border">{rekamMedis.rencana_pengobatan || '-'}</p>
                        </div>
                    </div>

                    {/* Additional Information */}
                    {rekamMedis.catatan_dokter && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">Informasi Tambahan</h3>
                            <div className="mb-4">
                                <h4 className="text-md font-semibold text-gray-800 mb-2">Catatan Dokter</h4>
                                <p className="bg-gray-50 p-3 rounded border">{rekamMedis.catatan_dokter}</p>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center text-sm text-gray-600 border-t pt-6 mt-8">
                        <p>Dicetak pada: {formatDateTime(new Date().toISOString())}</p>
                        <p>Dokumen ini dicetak secara elektronik dan sah tanpa tanda tangan basah</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
