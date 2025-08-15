import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    MapPin,
    Phone,
    Search,
    Stethoscope,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Pasien {
    id: number;
    kode_pasien: string;
    nama_lengkap: string;
    tanggal_lahir: string;
    tanggal_lahir_formatted: string;
    jenis_kelamin: string;
    telepon: string;
    alamat: string;
    umur: number;
}

interface Props {
    pasien?: Pasien;
}

export default function Create({ pasien }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Pasien[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPasien, setSelectedPasien] = useState<Pasien | null>(pasien || null);

    const { data, setData, post, processing, errors, reset } = useForm({
        pasien_id: pasien?.id || '',
        jenis_pemeriksaan: '',
        keluhan: '',
        catatan: '',
    });

    // Search pasien function
    const searchPasien = async (searchValue: string) => {
        if (searchValue.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(route('pendaftaran.pemeriksaan.search-pasien', { search: searchValue }));
            const results = await response.json();
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching pasien:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle search input change
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchTerm && !selectedPasien) {
                searchPasien(searchTerm);
            }
        }, 300);

        return () => clearTimeout(delayedSearch);
    }, [searchTerm, selectedPasien]);

    // Handle pasien selection
    const handleSelectPasien = (pasien: Pasien) => {
        setSelectedPasien(pasien);
        setData('pasien_id', pasien.id);
        setSearchTerm('');
        setSearchResults([]);
    };

    // Handle clear selection
    const handleClearSelection = () => {
        setSelectedPasien(null);
        setData('pasien_id', '');
        setSearchTerm('');
        setSearchResults([]);
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('pendaftaran.pemeriksaan.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    const jenisPemeriksaanOptions = [
        'Pemeriksaan Umum',
        'Kontrol Rutin',
        'Konsultasi',
        'Pemeriksaan Kesehatan',
        'Follow Up',
        'Emergency',
        'Vaksinasi',
        'Medical Check Up',
        'Pemeriksaan Khusus',
    ];

    return (
        <AppLayout>
            <Head title="Daftar Pemeriksaan" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('pendaftaran.pemeriksaan.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pendaftaran Pemeriksaan</h1>
                        <p className="text-gray-600">Daftarkan pasien untuk pemeriksaan</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Patient Search/Selection Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Data Pasien
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!selectedPasien ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Cari Pasien</Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                <Input
                                                    placeholder="Nama, kode pasien, atau telepon..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.pasien_id && (
                                                <p className="text-sm text-red-600 mt-1">{errors.pasien_id}</p>
                                            )}
                                        </div>

                                        {/* Search Results */}
                                        {isSearching && (
                                            <div className="text-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                                <p className="text-sm text-gray-500 mt-2">Mencari pasien...</p>
                                            </div>
                                        )}

                                        {searchResults.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-700">Hasil Pencarian:</p>
                                                <div className="max-h-60 overflow-y-auto space-y-2">
                                                    {searchResults.map((pasien) => (
                                                        <div
                                                            key={pasien.id}
                                                            onClick={() => handleSelectPasien(pasien)}
                                                            className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-medium text-gray-900">{pasien.nama_lengkap}</h4>
                                                                <Badge variant="outline">{pasien.kode_pasien}</Badge>
                                                            </div>
                                                            <div className="text-xs text-gray-600 space-y-1">
                                                                <p>📅 {pasien.tanggal_lahir_formatted} ({pasien.umur} tahun)</p>
                                                                <p>👤 {pasien.jenis_kelamin}</p>
                                                                <p>📞 {pasien.telepon}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {searchTerm && searchResults.length === 0 && !isSearching && (
                                            <div className="text-center py-4">
                                                <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
                                                <p className="text-sm text-gray-500 mt-2">Pasien tidak ditemukan</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Pastikan nama, kode, atau telepon sudah benar
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Selected Patient Info */
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="font-medium text-green-600">Pasien Dipilih</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleClearSelection}
                                            >
                                                Ganti
                                            </Button>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold text-gray-900">{selectedPasien.nama_lengkap}</h3>
                                                <Badge variant="outline">{selectedPasien.kode_pasien}</Badge>
                                            </div>
                                            
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{selectedPasien.tanggal_lahir_formatted} ({selectedPasien.umur} tahun)</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <User className="w-4 h-4" />
                                                    <span>{selectedPasien.jenis_kelamin}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{selectedPasien.telepon}</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-gray-600">
                                                    <MapPin className="w-4 h-4 mt-0.5" />
                                                    <span className="text-xs">{selectedPasien.alamat}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registration Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5" />
                                    Informasi Pemeriksaan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="jenis_pemeriksaan">
                                                Jenis Pemeriksaan <span className="text-red-500">*</span>
                                            </Label>
                                            <select 
                                                id="jenis_pemeriksaan"
                                                value={data.jenis_pemeriksaan} 
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('jenis_pemeriksaan', e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">Pilih jenis pemeriksaan</option>
                                                {jenisPemeriksaanOptions.map((jenis) => (
                                                    <option key={jenis} value={jenis}>
                                                        {jenis}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.jenis_pemeriksaan && (
                                                <p className="text-sm text-red-600">{errors.jenis_pemeriksaan}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Waktu Pendaftaran</Label>
                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">
                                                    {new Date().toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="keluhan">Keluhan Utama</Label>
                                        <textarea
                                            id="keluhan"
                                            placeholder="Deskripsikan keluhan atau gejala yang dialami pasien..."
                                            value={data.keluhan}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('keluhan', e.target.value)}
                                            rows={3}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        {errors.keluhan && (
                                            <p className="text-sm text-red-600">{errors.keluhan}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="catatan">Catatan Tambahan</Label>
                                        <textarea
                                            id="catatan"
                                            placeholder="Catatan khusus untuk dokter atau petugas..."
                                            value={data.catatan}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('catatan', e.target.value)}
                                            rows={3}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        {errors.catatan && (
                                            <p className="text-sm text-red-600">{errors.catatan}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-4 pt-6 border-t">
                                        <Link href={route('pendaftaran.pemeriksaan.index')}>
                                            <Button variant="outline" type="button">
                                                Batal
                                            </Button>
                                        </Link>
                                        <Button 
                                            type="submit" 
                                            disabled={processing || !selectedPasien}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Memproses...
                                                </>
                                            ) : (
                                                <>
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    Daftar Pemeriksaan
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
