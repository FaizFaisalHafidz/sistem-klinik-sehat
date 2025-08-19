import { Head } from '@inertiajs/react';
import {
    FileText,
    Heart,
    Pill,
    User
} from 'lucide-react';
import { useEffect } from 'react';

interface TandaVital {
    tekanan_darah?: string;
    suhu?: string;
    berat_badan?: string;
    tinggi_badan?: string;
    nadi?: string;
}

interface Obat {
    id: number;
    nama_obat: string;
    satuan: string;
}

interface DetailResep {
    id: number;
    obat_id: number;
    obat: Obat;
    jumlah: number;
    dosis: string;
    aturan_minum: string;
    harga_satuan: number;
}

interface Resep {
    id: number;
    detailResep: DetailResep[];
}

interface Pasien {
    id: number;
    nama_lengkap: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    telepon?: string;
    alamat?: string;
    kode_pasien?: string;
}

interface Dokter {
    id: number;
    nama_lengkap: string;
    spesialisasi?: string;
    telepon?: string;
}

interface Pendaftaran {
    id: number;
    kode_pendaftaran: string;
    jenis_pemeriksaan: string;
    status_pendaftaran: string;
    keluhan_utama?: string;
    created_at: string;
}

interface RekamMedis {
    id: number;
    kode_rekam_medis: string;
    tanggal_pemeriksaan: string;
    tanda_vital: TandaVital;
    anamnesis: string;
    pemeriksaan_fisik: string;
    diagnosa: string;
    rencana_pengobatan: string;
    catatan_dokter?: string;
    tanggal_kontrol?: string;
    status_rekam_medis: string;
    biaya_konsultasi: number;
    biaya_obat: number;
    total_biaya: number;
    pasien: Pasien;
    dokter: Dokter;
    pendaftaran: Pendaftaran;
    resep: any;
}

interface Props {
    data: RekamMedis | any;
    jenisLaporan: 'rekam_medis' | 'pendaftaran' | 'pasien' | 'antrian';
}

export default function Cetak({ data, jenisLaporan }: Props) {
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Auto print when component mounts
    useEffect(() => {
        // Small delay to ensure content is fully rendered
        const timer = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const getTitle = () => {
        switch (jenisLaporan) {
            case 'rekam_medis':
                return `Detail Rekam Medis - ${data.kode_rekam_medis}`;
            case 'pendaftaran':
                return `Detail Pendaftaran - ${data.kode_pendaftaran}`;
            case 'pasien':
                return `Detail Pasien - ${data.nama_lengkap}`;
            case 'antrian':
                return `Detail Antrian - #${data.nomor_antrian}`;
            default:
                return 'Cetak Laporan';
        }
    };

    const renderRekamMedis = () => (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
                <h1 className="text-3xl font-bold text-blue-800 mb-2">KLINIK SEHAT</h1>
                <p className="text-gray-600 mb-4">Jl. Kesehatan No. 123, Jakarta</p>
                <h2 className="text-2xl font-semibold text-gray-800">REKAM MEDIS PASIEN</h2>
                <p className="text-lg text-gray-700 mt-2">{data.kode_rekam_medis}</p>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                        <User className="inline w-5 h-5 mr-2" />
                        Informasi Pasien
                    </h3>
                    <div className="space-y-2">
                        <p><strong>Nama:</strong> {data.pasien.nama_lengkap}</p>
                        <p><strong>Kode Pasien:</strong> {data.pasien.kode_pasien}</p>
                        <p><strong>Jenis Kelamin:</strong> {data.pasien.jenis_kelamin}</p>
                        <p><strong>Umur:</strong> {calculateAge(data.pasien.tanggal_lahir)} tahun</p>
                        <p><strong>Tanggal Lahir:</strong> {formatDate(data.pasien.tanggal_lahir)}</p>
                        {data.pasien.telepon && <p><strong>Telepon:</strong> {data.pasien.telepon}</p>}
                        {data.pasien.alamat && <p><strong>Alamat:</strong> {data.pasien.alamat}</p>}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                        <FileText className="inline w-5 h-5 mr-2" />
                        Informasi Pemeriksaan
                    </h3>
                    <div className="space-y-2">
                        <p><strong>Tanggal:</strong> {formatDateTime(data.tanggal_pemeriksaan)}</p>
                        <p><strong>Dokter:</strong> {data.dokter.nama_lengkap}</p>
                        {data.dokter.spesialisasi && <p><strong>Spesialisasi:</strong> {data.dokter.spesialisasi}</p>}
                        <p><strong>Kode Pendaftaran:</strong> {data.pendaftaran.kode_pendaftaran}</p>
                        <p><strong>Jenis Pemeriksaan:</strong> {data.pendaftaran.jenis_pemeriksaan}</p>
                    </div>
                </div>
            </div>

            {/* Vital Signs */}
            {data.tanda_vital && (data.tanda_vital.tekanan_darah || data.tanda_vital.suhu || data.tanda_vital.berat_badan || data.tanda_vital.tinggi_badan) && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                        <Heart className="inline w-5 h-5 mr-2 text-red-500" />
                        Tanda Vital
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        {data.tanda_vital.tekanan_darah && (
                            <div>
                                <p className="font-medium">Tekanan Darah</p>
                                <p>{data.tanda_vital.tekanan_darah} mmHg</p>
                            </div>
                        )}
                        {data.tanda_vital.suhu && (
                            <div>
                                <p className="font-medium">Suhu</p>
                                <p>{data.tanda_vital.suhu}°C</p>
                            </div>
                        )}
                        {data.tanda_vital.berat_badan && (
                            <div>
                                <p className="font-medium">Berat Badan</p>
                                <p>{data.tanda_vital.berat_badan} kg</p>
                            </div>
                        )}
                        {data.tanda_vital.tinggi_badan && (
                            <div>
                                <p className="font-medium">Tinggi Badan</p>
                                <p>{data.tanda_vital.tinggi_badan} cm</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Medical Information */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Anamnesis</h4>
                    <p className="bg-gray-50 p-3 rounded border">{data.anamnesis}</p>
                </div>
                <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Pemeriksaan Fisik</h4>
                    <p className="bg-gray-50 p-3 rounded border">{data.pemeriksaan_fisik}</p>
                </div>
                <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Diagnosa</h4>
                    <p className="bg-blue-50 p-3 rounded border border-blue-200 font-medium text-lg">{data.diagnosa}</p>
                </div>
                <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Rencana Pengobatan</h4>
                    <p className="bg-gray-50 p-3 rounded border">{data.rencana_pengobatan}</p>
                </div>
            </div>

            {/* Prescription */}
            {data.resep && data.resep.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                        <Pill className="inline w-5 h-5 mr-2 text-blue-500" />
                        Resep Obat
                    </h3>
                    {data.resep.map((resep: any, index: number) => (
                        <div key={resep.id} className="mb-4">
                            {index > 0 && <div className="border-t pt-4 mb-4" />}
                            <div className="space-y-2">
                                {resep.detailResep && resep.detailResep.length > 0 && resep.detailResep.map((detail: any) => (
                                    <div key={detail.id} className="flex justify-between items-start p-3 bg-gray-50 rounded border">
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{detail.obat.nama_obat}</h4>
                                            <p className="text-sm">Dosis: {detail.dosis || '-'}</p>
                                            <p className="text-sm">Aturan: {detail.aturan_minum || '-'}</p>
                                            <p className="text-sm">Jumlah: {detail.jumlah} {detail.obat.satuan}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm">Harga Satuan</p>
                                            <p className="font-semibold">{formatCurrency(detail.harga_satuan)}</p>
                                            <p className="text-xs">Total: {formatCurrency(detail.harga_satuan * detail.jumlah)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Cost Summary */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">Ringkasan Biaya</h3>
                <div className="bg-gray-50 p-4 rounded border">
                    <div className="flex justify-between py-2 border-b">
                        <span>Biaya Konsultasi</span>
                        <span className="font-semibold">{formatCurrency(data.biaya_konsultasi)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span>Biaya Obat</span>
                        <span className="font-semibold">{formatCurrency(data.biaya_obat)}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-blue-50 rounded px-4 mt-3 border border-blue-200">
                        <span className="text-lg font-semibold text-blue-800">Total Biaya</span>
                        <span className="text-xl font-bold text-blue-800">{formatCurrency(data.total_biaya)}</span>
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            {(data.catatan_dokter || data.tanggal_kontrol) && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">Informasi Tambahan</h3>
                    {data.catatan_dokter && (
                        <div className="mb-4">
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Catatan Dokter</h4>
                            <p className="bg-gray-50 p-3 rounded border">{data.catatan_dokter}</p>
                        </div>
                    )}
                    {data.tanggal_kontrol && (
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Tanggal Kontrol</h4>
                            <p className="bg-gray-50 p-3 rounded border">{formatDate(data.tanggal_kontrol)}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 border-t pt-6 mt-8">
                <p>Dicetak pada: {formatDateTime(new Date().toISOString())}</p>
                <p>Dokumen ini dicetak secara elektronik dan sah tanpa tanda tangan basah</p>
            </div>
        </div>
    );

    const renderPendaftaran = () => (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
                <h1 className="text-3xl font-bold text-blue-800 mb-2">KLINIK SEHAT</h1>
                <p className="text-gray-600 mb-4">Jl. Kesehatan No. 123, Jakarta</p>
                <h2 className="text-2xl font-semibold text-gray-800">BUKTI PENDAFTARAN</h2>
                <p className="text-lg text-gray-700 mt-2">{data.kode_pendaftaran}</p>
            </div>

            {/* Content */}
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                        <User className="inline w-5 h-5 mr-2" />
                        Informasi Pasien
                    </h3>
                    <div className="space-y-2">
                        <p><strong>Nama:</strong> {data.pasien.nama_lengkap}</p>
                        <p><strong>Kode Pasien:</strong> {data.pasien.kode_pasien}</p>
                        <p><strong>Jenis Kelamin:</strong> {data.pasien.jenis_kelamin}</p>
                        <p><strong>Umur:</strong> {calculateAge(data.pasien.tanggal_lahir)} tahun</p>
                        {data.pasien.telepon && <p><strong>Telepon:</strong> {data.pasien.telepon}</p>}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                        <FileText className="inline w-5 h-5 mr-2" />
                        Detail Pendaftaran
                    </h3>
                    <div className="space-y-2">
                        <p><strong>Tanggal:</strong> {formatDateTime(data.created_at)}</p>
                        <p><strong>Jenis Pemeriksaan:</strong> {data.jenis_pemeriksaan}</p>
                        {data.dokter && <p><strong>Dokter:</strong> {data.dokter.nama_lengkap}</p>}
                        {data.keluhan_utama && <p><strong>Keluhan:</strong> {data.keluhan_utama}</p>}
                        <p><strong>Status:</strong> {data.status_pendaftaran}</p>
                    </div>
                </div>
            </div>

            {/* Antrian Info */}
            {data.antrian && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                        Informasi Antrian
                    </h3>
                    <div className="bg-blue-50 p-6 rounded border border-blue-200 text-center">
                        <p className="text-sm text-gray-600 mb-2">Nomor Antrian Anda</p>
                        <p className="text-4xl font-bold text-blue-600 mb-2">#{data.antrian.nomor_antrian}</p>
                        <p className="text-sm text-gray-600">Status: {data.antrian.status_antrian}</p>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 border-t pt-6 mt-8">
                <p>Dicetak pada: {formatDateTime(new Date().toISOString())}</p>
                <p>Harap simpan bukti pendaftaran ini untuk keperluan pemeriksaan</p>
            </div>
        </div>
    );

    const renderDefault = () => (
        <div className="space-y-8">
            <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
                <h1 className="text-3xl font-bold text-blue-800 mb-2">KLINIK SEHAT</h1>
                <p className="text-gray-600 mb-4">Jl. Kesehatan No. 123, Jakarta</p>
                <h2 className="text-2xl font-semibold text-gray-800">LAPORAN {jenisLaporan.toUpperCase()}</h2>
            </div>
            
            <div className="text-center py-12">
                <p className="text-lg text-gray-600">Template cetak untuk {jenisLaporan} sedang dalam pengembangan</p>
            </div>

            <div className="text-center text-sm text-gray-600 border-t pt-6 mt-8">
                <p>Dicetak pada: {formatDateTime(new Date().toISOString())}</p>
            </div>
        </div>
    );

    return (
        <div className="print:m-0 print:p-0">
            <Head title={getTitle()} />
            
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
                {jenisLaporan === 'rekam_medis' && renderRekamMedis()}
                {jenisLaporan === 'pendaftaran' && renderPendaftaran()}
                {(jenisLaporan === 'pasien' || jenisLaporan === 'antrian') && renderDefault()}
            </div>
        </div>
    );
}
