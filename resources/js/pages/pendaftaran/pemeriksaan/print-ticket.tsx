import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

interface Pasien {
    id: number;
    kode_pasien: string;
    nama_lengkap: string;
    tanggal_lahir: string;
    tanggal_lahir_formatted: string;
    jenis_kelamin: string;
    telepon: string;
    umur: number;
}

interface Antrian {
    nomor_antrian: string | number;
    status_antrian: string;
    estimasi_waktu: string;
    keterangan: string;
}

interface Pendaftaran {
    id: number;
    kode_pendaftaran: string;
    tanggal_pendaftaran: string;
    tanggal_pendaftaran_formatted: string;
    jenis_pemeriksaan: string;
    keluhan: string;
    status_pendaftaran: string;
    created_at: string;
    jam_daftar: string;
    pasien: Pasien;
    antrian: Antrian;
}

interface Props {
    pendaftaran: Pendaftaran;
}

const formatEstimasiWaktu = (estimasiWaktu: string | null): string => {
    if (!estimasiWaktu || estimasiWaktu === '-') return '-';
    
    try {
        // If it's already in HH:mm format, return as is
        if (estimasiWaktu.match(/^\d{2}:\d{2}$/)) {
            return estimasiWaktu;
        }
        
        // If it's a full datetime string, extract time
        const date = new Date(estimasiWaktu);
        if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        }
        
        return estimasiWaktu;
    } catch (error) {
        return '-';
    }
};

export default function PrintTicket({ pendaftaran }: Props) {
    useEffect(() => {
        // Auto print when page loads
        const timer = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Head title={`Tiket Antrian - ${pendaftaran.pasien.nama_lengkap}`} />
            
            <div className="max-w-sm mx-auto p-4">
                {/* Ticket Container */}
                <div className="border-2 border-dashed border-gray-300 p-6 bg-white">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold text-gray-900 mb-1">KLINIK SEHAT</h1>
                        <p className="text-sm text-gray-600 mb-3">Tiket Antrian Pemeriksaan</p>
                        <div className="border-b border-gray-300"></div>
                    </div>

                    {/* Queue Number */}
                    <div className="text-center mb-6">
                        <div className="bg-blue-600 text-white rounded-lg p-4 mb-3">
                            <p className="text-sm mb-1">NOMOR ANTRIAN</p>
                            <p className="text-4xl font-bold">#{pendaftaran.antrian.nomor_antrian}</p>
                        </div>
                        <p className="text-xs text-gray-500">Simpan tiket ini dengan baik</p>
                    </div>

                    {/* Patient Information */}
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Kode Pendaftaran:</span>
                            <span className="font-medium">{pendaftaran.kode_pendaftaran}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Nama Pasien:</span>
                            <span className="font-medium">{pendaftaran.pasien.nama_lengkap}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Kode Pasien:</span>
                            <span className="font-medium">{pendaftaran.pasien.kode_pasien}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Umur:</span>
                            <span className="font-medium">{pendaftaran.pasien.umur} tahun</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Jenis Kelamin:</span>
                            <span className="font-medium">{pendaftaran.pasien.jenis_kelamin}</span>
                        </div>
                    </div>

                    <div className="border-b border-gray-300 mb-4"></div>

                    {/* Examination Information */}
                    <div className="space-y-3 mb-6">
                        <div className="text-sm">
                            <span className="text-gray-600 block">Jenis Pemeriksaan:</span>
                            <span className="font-medium">{pendaftaran.jenis_pemeriksaan}</span>
                        </div>
                        
                        <div className="text-sm">
                            <span className="text-gray-600 block">Keluhan:</span>
                            <span className="font-medium">{pendaftaran.keluhan || 'Tidak ada keluhan khusus'}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tanggal Daftar:</span>
                            <span className="font-medium">{pendaftaran.tanggal_pendaftaran_formatted}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Jam Daftar:</span>
                            <span className="font-medium">{pendaftaran.jam_daftar}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Estimasi Waktu:</span>
                            <span className="font-medium">{formatEstimasiWaktu(pendaftaran.antrian.estimasi_waktu)}</span>
                        </div>
                    </div>

                    <div className="border-b border-gray-300 mb-4"></div>

                    {/* Instructions */}
                    <div className="text-xs text-gray-600 space-y-2 mb-6">
                        <h3 className="font-semibold text-gray-800">PETUNJUK:</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Harap datang 15 menit sebelum estimasi waktu</li>
                            <li>Tunjukkan tiket ini kepada petugas</li>
                            <li>Siapkan dokumen identitas dan kartu BPJS (jika ada)</li>
                            <li>Jika terlambat lebih dari 30 menit, silakan daftar ulang</li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="text-center border-t border-gray-300 pt-4">
                        <p className="text-xs text-gray-500 mb-2">
                            Dicetak pada: {new Date().toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: '2-digit', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                        <p className="text-xs text-gray-400">
                            Terima kasih atas kepercayaan Anda
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        body { margin: 0; padding: 0; }
                        .max-w-sm { max-width: none; width: 80mm; }
                        .mx-auto { margin: 0; }
                        .p-4 { padding: 8px; }
                        .border-2 { border-width: 1px; }
                        .p-6 { padding: 12px; }
                        .mb-6 { margin-bottom: 12px; }
                        .mb-3 { margin-bottom: 8px; }
                        .mb-4 { margin-bottom: 10px; }
                        .p-4 { padding: 8px; }
                        .text-4xl { font-size: 28px; }
                        .text-xl { font-size: 16px; }
                        .text-sm { font-size: 11px; }
                        .text-xs { font-size: 9px; }
                        @page { 
                            size: 80mm auto; 
                            margin: 0;
                        }
                    }
                `
            }} />
        </div>
    );
}
