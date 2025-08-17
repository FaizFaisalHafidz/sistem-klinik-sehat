import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

interface Pasien {
    id: number;
    kode_pasien: string;
    nama_lengkap: string;
    telepon: string;
}

interface Antrian {
    id: number;
    nomor_antrian: string;
    tanggal_antrian: string;
    waktu_pendaftaran: string;
    estimasi_waktu: string;
}

interface Pendaftaran {
    id: number;
    kode_pendaftaran: string;
    jenis_kunjungan: string;
    cara_bayar: string;
    created_at: string;
    pasien: Pasien;
    antrian: Antrian;
}

interface Props {
    pendaftaran: Pendaftaran;
}

export default function PrintTicket({ pendaftaran }: Props) {
    const formatEstimasiWaktu = (estimasiWaktu: string) => {
        try {
            // Jika estimasi_waktu adalah timestamp, convert ke format waktu
            const date = new Date(estimasiWaktu);
            if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            // Jika bukan timestamp, return as is
            return estimasiWaktu;
        } catch (error) {
            return estimasiWaktu;
        }
    };

    useEffect(() => {
        // Auto print when component loads
        const timer = setTimeout(() => {
            window.print();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title="Cetak Tiket Antrian" />
            
            <div className="min-h-screen bg-white">
                <div className="max-w-md mx-auto p-8">
                    {/* Header Klinik */}
                    <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
                        <h1 className="text-2xl font-bold text-gray-900">KLINIK SEHAT</h1>
                        <p className="text-sm text-gray-600">Jl. Mahmud No.93, Mekar Rahayu, Kec. Margaasih, Kabupaten Bandung, Jawa Barat 40218</p>
                        <p className="text-sm text-gray-600">Telp: (021) 123-4567</p>
                    </div>

                    {/* Nomor Antrian */}
                    <div className="text-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">KARTU ANTRIAN</h2>
                        <div className="border-4 border-blue-500 rounded-lg p-6 bg-blue-50">
                            <div className="text-6xl font-bold text-blue-600 mb-2">
                                {pendaftaran.antrian.nomor_antrian}
                            </div>
                            <div className="text-lg font-medium text-gray-700">
                                {new Date(pendaftaran.antrian.tanggal_antrian).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Informasi Pasien */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
                            INFORMASI PASIEN
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Nama:</span>
                                <span className="font-medium">{pendaftaran.pasien.nama_lengkap}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Kode Pasien:</span>
                                <span className="font-medium">{pendaftaran.pasien.kode_pasien}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">No. Pendaftaran:</span>
                                <span className="font-medium">{pendaftaran.kode_pendaftaran}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Jenis Kunjungan:</span>
                                <span className="font-medium capitalize">{pendaftaran.jenis_kunjungan}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Cara Bayar:</span>
                                <span className="font-medium capitalize">{pendaftaran.cara_bayar}</span>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Waktu */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
                            INFORMASI WAKTU
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Jam Daftar:</span>
                                <span className="font-medium">
                                    {new Date(pendaftaran.created_at).toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Estimasi Dipanggil:</span>
                                <span className="font-medium">
                                    {formatEstimasiWaktu(pendaftaran.antrian.estimasi_waktu)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Instruksi */}
                    <div className="border-t-2 border-gray-300 pt-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">PERHATIAN:</h3>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Harap datang 15 menit sebelum jam estimasi</li>
                            <li>• Bawa kartu identitas dan kartu asuransi (jika ada)</li>
                            <li>• Simpan tiket ini dengan baik</li>
                            <li>• Hubungi petugas jika ada pertanyaan</li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            Terima kasih atas kepercayaan Anda
                        </p>
                        <p className="text-xs text-gray-500">
                            Dicetak: {new Date().toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        @page {
                            size: A5;
                            margin: 10mm;
                        }
                        
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.4;
                        }
                        
                        .no-print {
                            display: none !important;
                        }
                    }
                `
            }} />
        </>
    );
}
