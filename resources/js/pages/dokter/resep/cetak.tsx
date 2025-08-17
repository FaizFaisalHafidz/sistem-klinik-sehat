import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import {
    Calendar,
    Pill,
    Printer,
    Receipt,
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

interface Dokter {
    nama_lengkap: string;
}

interface Obat {
    nama_obat: string;
    jenis_obat: string;
    satuan: string;
}

interface DetailResep {
    id: number;
    obat: Obat;
    jumlah: number;
    harga_satuan: number;
    aturan_pakai: string;
    keterangan: string;
}

interface Resep {
    id: number;
    kode_resep: string;
    tanggal_resep: string;
    tanggal_resep_formatted: string;
    catatan_resep: string;
    status_resep: string;
    total_harga?: number;
    pasien: Pasien;
    dokter: Dokter;
    detail_resep?: DetailResep[];
}

interface Props {
    resep: Resep;
}

const getJenisKelaminBadge = (jenis_kelamin: string) => {
    return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(amount);
};

export default function Cetak({ resep }: Props) {
    const handlePrint = () => {
        window.print();
    };

    // Auto print dialog when component loads
    useEffect(() => {
        // Small delay to ensure content is rendered
        const timer = setTimeout(() => {
            window.print();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title={`Cetak Resep ${resep.kode_resep}`} />
            
            {/* Print Button - Hidden when printing */}
            <div className="no-print fixed top-4 right-4 z-50">
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                    <Printer className="w-4 h-4 mr-2" />
                    Cetak Ulang
                </Button>
            </div>

            {/* Print Content */}
            <div className="print-content bg-white min-h-screen">
                {/* Header Klinik */}
                <div className="text-center border-b-4 border-blue-600 pb-6 mb-6">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <img 
                            src="/logo-clinic.png" 
                            alt="Logo Klinik" 
                            className="w-16 h-16 object-contain"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-blue-900">KLINIK SEHAT BERSAMA</h1>
                            <p className="text-lg text-blue-700">Medical Center</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>Jl. Mahmud No.93, Mekar Rahayu, Kec. Margaasih, Kabupaten Bandung, Jawa Barat 40218</p>
                        <p>Telp: (021) 1234-5678 | Email: info@kliniksehat.com</p>
                        <p>SIP: 123/SIP/2024 | Izin Praktik: 456/IP/2024</p>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">RESEP OBAT</h2>
                    <div className="flex items-center justify-center gap-2">
                        <Receipt className="w-5 h-5 text-blue-600" />
                        <span className="text-lg font-semibold text-blue-600">{resep.kode_resep}</span>
                    </div>
                </div>

                {/* Informasi Pasien dan Dokter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Informasi Pasien */}
                    <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            INFORMASI PASIEN
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex">
                                <span className="font-medium w-32">Kode Pasien:</span>
                                <span>{resep.pasien.kode_pasien}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium w-32">Nama Lengkap:</span>
                                <span className="font-semibold">{resep.pasien.nama_lengkap}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium w-32">Tanggal Lahir:</span>
                                <span>{new Date(resep.pasien.tanggal_lahir).toLocaleDateString('id-ID')}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium w-32">Umur/JK:</span>
                                <span>{resep.pasien.umur} tahun / {getJenisKelaminBadge(resep.pasien.jenis_kelamin)}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium w-32">Alamat:</span>
                                <span>{resep.pasien.alamat || 'Tidak tersedia'}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium w-32">Telepon:</span>
                                <span>{resep.pasien.telepon || 'Tidak tersedia'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Resep */}
                    <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            INFORMASI RESEP
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex">
                                <span className="font-medium w-32">Tanggal Resep:</span>
                                <span className="font-semibold">{resep.tanggal_resep_formatted}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium w-32">Dokter:</span>
                                <span className="font-semibold">{resep.dokter.nama_lengkap}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium w-32">Status:</span>
                                <span className="capitalize">{resep.status_resep.replace('_', ' ')}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium w-32">Jumlah Obat:</span>
                                <span>{resep.detail_resep?.length || 0} jenis</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium w-32">Total Harga:</span>
                                <span className="font-bold text-green-600">{formatCurrency(resep.total_harga || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detail Obat */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Pill className="w-5 h-5" />
                        DETAIL OBAT
                    </h3>
                    
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Obat</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aturan Pakai</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {resep.detail_resep && resep.detail_resep.length > 0 ? (
                                    resep.detail_resep.map((detail: DetailResep, index: number) => (
                                        <tr key={detail.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 text-sm text-gray-900">
                                                {index + 1}
                                            </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {detail.obat.nama_obat}
                                                </div>
                                                {detail.keterangan && (
                                                    <div className="text-xs text-gray-500 italic">
                                                        {detail.keterangan}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900">
                                            <Badge variant="outline" className="text-xs">
                                                {detail.obat.jenis_obat}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-center text-gray-900 font-medium">
                                            {detail.jumlah} {detail.obat.satuan}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-900 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                                                {detail.aturan_pakai}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-right font-medium text-gray-900">
                                            {formatCurrency(detail.jumlah * detail.harga_satuan)}
                                        </td>
                                    </tr>
                                ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            Belum ada detail obat
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={5} className="px-4 py-4 text-right text-lg font-bold text-gray-900">
                                        TOTAL:
                                    </td>
                                    <td className="px-4 py-4 text-right text-lg font-bold text-green-600">
                                        {formatCurrency(resep.total_harga || 0)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Catatan Resep */}
                {resep.catatan_resep && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">CATATAN RESEP</h3>
                        <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                            <p className="text-sm text-gray-900">{resep.catatan_resep}</p>
                        </div>
                    </div>
                )}

                {/* Peringatan dan Informasi Tambahan */}
                <div className="border-t pt-6 space-y-4 text-sm text-gray-600">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-bold text-red-800 mb-2">PERHATIAN:</h4>
                        <ul className="space-y-1 text-red-700">
                            <li>• Minumlah obat sesuai dengan aturan pakai yang tertera</li>
                            <li>• Jangan menghentikan pengobatan tanpa konsultasi dengan dokter</li>
                            <li>• Simpan obat di tempat yang sejuk dan kering</li>
                            <li>• Jauhkan obat dari jangkauan anak-anak</li>
                            <li>• Segera hubungi dokter jika terjadi efek samping</li>
                        </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div className="text-center">
                            <p className="mb-8">Pasien / Keluarga</p>
                            <div className="border-b border-gray-400 w-48 mx-auto"></div>
                            <p className="mt-2">( {resep.pasien.nama_lengkap} )</p>
                        </div>
                        <div className="text-center">
                            <p className="mb-8">Dokter Penulis Resep</p>
                            <div className="border-b border-gray-400 w-48 mx-auto"></div>
                            <p className="mt-2">( {resep.dokter.nama_lengkap} )</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
                    <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
                    <p>Resep ini dicetak dari sistem informasi klinik dan sah tanpa tanda tangan basah</p>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .print-content {
                        margin: 0;
                        padding: 20px;
                        font-size: 12px;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    table {
                        page-break-inside: auto;
                    }
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    .page-break {
                        page-break-before: always;
                    }
                }
                
                @page {
                    size: A4;
                    margin: 1cm;
                }
            `}</style>
        </>
    );
}
