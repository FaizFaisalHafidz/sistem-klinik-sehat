import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    Phone,
    Printer,
    User
} from 'lucide-react';
import { useEffect } from 'react';

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

interface Pendaftaran {
    id: number;
    kode_pendaftaran: string;
    jenis_pemeriksaan: string;
    keluhan: string;
    status_pendaftaran: string;
    created_at: string;
    created_at_formatted: string;
    pasien: Pasien;
    petugas: Petugas;
}

interface Antrian {
    id: number;
    nomor_antrian: number;
    status_antrian: string;
    estimasi_waktu: string;
    estimasi_waktu_formatted: string;
    keterangan: string;
    created_at: string;
    created_at_formatted: string;
    pendaftaran: Pendaftaran;
}

interface Props {
    antrian: Antrian;
}

const getJenisKelaminBadge = (jenis_kelamin: string) => {
    return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
};

export default function PrintTicket({ antrian }: Props) {
    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        // Auto print when page loads (optional)
        // setTimeout(() => {
        //     window.print();
        // }, 500);
    }, []);

    return (
        <AppLayout>
            <Head title={`Tiket Antrian #${antrian.nomor_antrian} - ${antrian.pendaftaran.pasien.nama_lengkap}`} />
            
            <div className="space-y-6 p-6">
                {/* Header - Hidden on print */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('pendaftaran.antrian.show', antrian.id)}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Tiket Antrian #{antrian.nomor_antrian}
                            </h1>
                            <p className="text-gray-600">
                                Cetak tiket antrian untuk {antrian.pendaftaran.pasien.nama_lengkap}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                            <Printer className="w-4 h-4 mr-2" />
                            Cetak Tiket
                        </Button>
                    </div>
                </div>

                {/* Ticket Content - Optimized for printing */}
                <div className="max-w-md mx-auto print:max-w-none print:mx-0">
                    <Card className="border-2 border-dashed border-gray-300 print:border-solid print:border-gray-800">
                        <CardContent className="p-6 print:p-4">
                            {/* Header */}
                            <div className="text-center mb-6 print:mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 print:text-xl">
                                    KLINIK KESEHATAN
                                </h2>
                                <p className="text-sm text-gray-600 print:text-xs">
                                    Jl. Contoh No. 123, Kota ABC
                                </p>
                                <p className="text-sm text-gray-600 print:text-xs">
                                    Telp: (021) 1234-5678
                                </p>
                                <div className="border-t border-gray-300 my-4 print:my-2"></div>
                                <h3 className="text-lg font-semibold text-gray-900 print:text-base">
                                    TIKET ANTRIAN
                                </h3>
                            </div>

                            {/* Nomor Antrian - Large and prominent */}
                            <div className="text-center mb-6 print:mb-4">
                                <div className="bg-blue-600 text-white rounded-lg p-6 print:p-4 mb-4">
                                    <div className="text-sm font-medium mb-2 print:text-xs">NOMOR ANTRIAN</div>
                                    <div className="text-5xl font-bold print:text-4xl">#{antrian.nomor_antrian}</div>
                                </div>
                                <div className="text-sm text-gray-600 print:text-xs">
                                    {new Date().toLocaleDateString('id-ID', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="space-y-3 print:space-y-2 mb-6 print:mb-4">
                                <div className="flex items-center gap-2 text-sm print:text-xs">
                                    <User className="w-4 h-4 text-gray-400 print:w-3 print:h-3" />
                                    <div>
                                        <span className="font-medium">Nama:</span> {antrian.pendaftaran.pasien.nama_lengkap}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm print:text-xs">
                                    <FileText className="w-4 h-4 text-gray-400 print:w-3 print:h-3" />
                                    <div>
                                        <span className="font-medium">Kode Pasien:</span> {antrian.pendaftaran.pasien.kode_pasien}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm print:text-xs">
                                    <Calendar className="w-4 h-4 text-gray-400 print:w-3 print:h-3" />
                                    <div>
                                        <span className="font-medium">Umur:</span> {antrian.pendaftaran.pasien.umur} tahun
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm print:text-xs">
                                    <Phone className="w-4 h-4 text-gray-400 print:w-3 print:h-3" />
                                    <div>
                                        <span className="font-medium">Telepon:</span> {antrian.pendaftaran.pasien.telepon || '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Medical Info */}
                            <div className="bg-gray-50 rounded-lg p-4 print:p-3 print:bg-gray-100 mb-6 print:mb-4">
                                <h4 className="font-semibold text-gray-900 mb-3 print:mb-2 print:text-sm">Informasi Pemeriksaan</h4>
                                <div className="space-y-2 print:space-y-1">
                                    <div className="text-sm print:text-xs">
                                        <span className="font-medium">Jenis Pemeriksaan:</span><br />
                                        {antrian.pendaftaran.jenis_pemeriksaan}
                                    </div>
                                    <div className="text-sm print:text-xs">
                                        <span className="font-medium">Keluhan:</span><br />
                                        {antrian.pendaftaran.keluhan || 'Tidak ada keluhan khusus'}
                                    </div>
                                </div>
                            </div>

                            {/* Timing Info */}
                            <div className="text-center space-y-2 print:space-y-1 mb-6 print:mb-4">
                                <div className="text-sm print:text-xs text-gray-600">
                                    <Clock className="w-4 h-4 inline mr-1 print:w-3 print:h-3" />
                                    Waktu Pendaftaran: {antrian.created_at_formatted}
                                </div>
                                {antrian.estimasi_waktu_formatted && (
                                    <div className="text-sm print:text-xs text-gray-600">
                                        Estimasi Pelayanan: {antrian.estimasi_waktu_formatted}
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div className="text-center mb-6 print:mb-4">
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm print:text-xs bg-yellow-100 text-yellow-800 border border-yellow-300">
                                    <Clock className="w-3 h-3 mr-1 print:w-2 print:h-2" />
                                    Status: {antrian.status_antrian === 'menunggu' ? 'Menunggu' : 
                                            antrian.status_antrian === 'dipanggil' ? 'Dipanggil' : 
                                            antrian.status_antrian === 'selesai' ? 'Selesai' : 'Dibatalkan'}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="border-t border-gray-300 pt-4 print:pt-2">
                                <h4 className="font-semibold text-gray-900 mb-2 print:mb-1 print:text-sm">Petunjuk:</h4>
                                <ul className="text-xs print:text-xs text-gray-600 space-y-1">
                                    <li>• Harap menunggu hingga nomor antrian Anda dipanggil</li>
                                    <li>• Tunjukkan tiket ini kepada petugas</li>
                                    <li>• Datang 15 menit sebelum estimasi waktu</li>
                                    <li>• Tiket berlaku hanya untuk hari ini</li>
                                </ul>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-300 pt-4 print:pt-2 text-center">
                                <p className="text-xs text-gray-500">
                                    Terima kasih telah menggunakan layanan kami
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Dicetak pada: {new Date().toLocaleString('id-ID')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Print Info - Hidden on print */}
                <div className="print:hidden">
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Printer className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-900">Petunjuk Cetak</h3>
                                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                        <li>• Pastikan printer terkoneksi dengan baik</li>
                                        <li>• Gunakan ukuran kertas A4 atau sesuaikan dengan printer tiket</li>
                                        <li>• Untuk hasil terbaik, gunakan mode cetak "Normal" atau "High Quality"</li>
                                        <li>• Tiket akan tercetak dalam ukuran yang sesuai untuk dibawa pasien</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Print-specific styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        @page {
                            margin: 0.5in;
                            size: A4;
                        }
                        
                        body {
                            font-size: 12px !important;
                            line-height: 1.3 !important;
                        }
                        
                        .print\\:hidden {
                            display: none !important;
                        }
                        
                        .print\\:block {
                            display: block !important;
                        }
                        
                        .print\\:text-xs {
                            font-size: 10px !important;
                        }
                        
                        .print\\:text-sm {
                            font-size: 11px !important;
                        }
                        
                        .print\\:text-base {
                            font-size: 12px !important;
                        }
                        
                        .print\\:text-xl {
                            font-size: 18px !important;
                        }
                        
                        .print\\:text-4xl {
                            font-size: 32px !important;
                        }
                        
                        .print\\:p-2 {
                            padding: 8px !important;
                        }
                        
                        .print\\:p-3 {
                            padding: 12px !important;
                        }
                        
                        .print\\:p-4 {
                            padding: 16px !important;
                        }
                        
                        .print\\:m-0 {
                            margin: 0 !important;
                        }
                        
                        .print\\:mb-1 {
                            margin-bottom: 4px !important;
                        }
                        
                        .print\\:mb-2 {
                            margin-bottom: 8px !important;
                        }
                        
                        .print\\:mb-4 {
                            margin-bottom: 16px !important;
                        }
                        
                        .print\\:my-2 {
                            margin-top: 8px !important;
                            margin-bottom: 8px !important;
                        }
                        
                        .print\\:space-y-1 > * + * {
                            margin-top: 4px !important;
                        }
                        
                        .print\\:space-y-2 > * + * {
                            margin-top: 8px !important;
                        }
                        
                        .print\\:w-2 {
                            width: 8px !important;
                        }
                        
                        .print\\:w-3 {
                            width: 12px !important;
                        }
                        
                        .print\\:h-2 {
                            height: 8px !important;
                        }
                        
                        .print\\:h-3 {
                            height: 12px !important;
                        }
                        
                        .print\\:bg-gray-100 {
                            background-color: #f3f4f6 !important;
                        }
                        
                        .print\\:border-solid {
                            border-style: solid !important;
                        }
                        
                        .print\\:border-gray-800 {
                            border-color: #1f2937 !important;
                        }
                        
                        .print\\:max-w-none {
                            max-width: none !important;
                        }
                        
                        .print\\:mx-0 {
                            margin-left: 0 !important;
                            margin-right: 0 !important;
                        }
                        
                        .print\\:pt-2 {
                            padding-top: 8px !important;
                        }
                    }
                `
            }} />
        </AppLayout>
    );
}
