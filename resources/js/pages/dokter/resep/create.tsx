import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    MapPin,
    Minus,
    Phone,
    Pill,
    Plus,
    Save,
    Search,
    User,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface Obat {
    id: number;
    nama_obat: string;
    jenis_obat: string;
    satuan: string;
    harga: number;
    stok_tersedia: number;
}

interface DetailResep {
    obat_id: string;
    jumlah: number;
    aturan_pakai: string;
    keterangan: string;
}

interface FormData {
    pasien_id: string;
    catatan_resep: string;
    detail_resep: DetailResep[];
}

interface Props {
    obat: Obat[];
    selectedPasien?: Pasien;
}

const getJenisKelaminBadge = (jenis_kelamin: string) => {
    return jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan';
};

export default function Create({ obat, selectedPasien }: Props) {
    const [searchPasien, setSearchPasien] = useState('');
    const [searchResults, setSearchResults] = useState<Pasien[]>([]);
    const [showPasienSearch, setShowPasienSearch] = useState(!selectedPasien);
    const [processing, setProcessing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPasienData, setSelectedPasienData] = useState<Pasien | null>(selectedPasien || null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<FormData>({
        pasien_id: selectedPasien?.id.toString() || '',
        catatan_resep: '',
        detail_resep: [
            {
                obat_id: '',
                jumlah: 1,
                aturan_pakai: '',
                keterangan: ''
            }
        ]
    });

    // Auto search when typing
    useEffect(() => {
        const searchPasienData = async () => {
            if (searchPasien.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(`/dokter/resep/search-pasien?search=${encodeURIComponent(searchPasien)}`);
                const result = await response.json();
                setSearchResults(result.data || []);
            } catch (error) {
                console.error('Error searching pasien:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        // Debounce search - tunggu 500ms setelah user berhenti mengetik
        const timeoutId = setTimeout(searchPasienData, 500);
        
        return () => clearTimeout(timeoutId);
    }, [searchPasien]);

    const handleSearchPasien = async () => {
        // This function is now mostly handled by useEffect
        if (searchPasien.length < 2) return;
        // Manual search jika diperlukan
    };

    const selectPasien = (pasien: Pasien) => {
        setFormData(prev => ({ ...prev, pasien_id: pasien.id.toString() }));
        setSelectedPasienData(pasien);
        setShowPasienSearch(false);
        setSearchResults([]);
        setSearchPasien('');
    };

    const addDetailResep = () => {
        setFormData(prev => ({
            ...prev,
            detail_resep: [
                ...prev.detail_resep,
                {
                    obat_id: '',
                    jumlah: 1,
                    aturan_pakai: '',
                    keterangan: ''
                }
            ]
        }));
    };

    const removeDetailResep = (index: number) => {
        if (formData.detail_resep.length > 1) {
            const newDetails = formData.detail_resep.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, detail_resep: newDetails }));
        }
    };

    const updateDetailResep = (index: number, field: keyof DetailResep, value: any) => {
        const newDetails = [...formData.detail_resep];
        newDetails[index] = { ...newDetails[index], [field]: value };
        setFormData(prev => ({ ...prev, detail_resep: newDetails }));
    };

    const getObatById = (obatId: string) => {
        return obat.find(o => o.id.toString() === obatId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // Validate form data before submitting
        console.log('Form data being submitted:', formData);

        router.post(route('dokter.resep.store'), formData as any, {
            onError: (errors) => {
                console.log('Validation errors:', errors);
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => {
                console.log('Resep created successfully');
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Buat Resep Baru - Dokter" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('dokter.resep.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Buat Resep Baru
                            </h1>
                            <p className="text-gray-600">
                                Buat resep obat untuk pasien
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Pilih Pasien */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Pilih Pasien
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!selectedPasienData && showPasienSearch && (
                                <div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                type="text"
                                                placeholder="Ketik nama atau kode pasien (min 2 karakter)..."
                                                value={searchPasien}
                                                onChange={(e) => setSearchPasien(e.target.value)}
                                                className="pl-10"
                                            />
                                            {isSearching && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {searchPasien.length > 0 && searchPasien.length < 2 && (
                                        <p className="text-sm text-gray-500 mt-2">Masukkan minimal 2 karakter untuk pencarian</p>
                                    )}

                                    {searchResults.length > 0 && (
                                        <div className="mt-4 border rounded-lg max-h-60 overflow-y-auto">
                                            {searchResults.map((pasien) => (
                                                <div
                                                    key={pasien.id}
                                                    className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => selectPasien(pasien)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {pasien.nama_lengkap}
                                                            </h4>
                                                            <p className="text-sm text-gray-600">
                                                                {pasien.kode_pasien} • {pasien.umur} tahun • {getJenisKelaminBadge(pasien.jenis_kelamin)}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline">Pilih</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {searchPasien.length >= 2 && searchResults.length === 0 && !isSearching && (
                                        <div className="mt-4 p-4 text-center text-gray-500 border rounded-lg">
                                            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                            <p>Tidak ada pasien yang ditemukan</p>
                                            <p className="text-sm">Coba gunakan kata kunci yang berbeda</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedPasienData && (
                                <div className="border rounded-lg p-4 bg-blue-50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-blue-900 mb-2">
                                                Pasien Terpilih
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-sm font-medium text-blue-700">Nama:</span>
                                                        <p className="text-sm text-blue-900">{selectedPasienData.nama_lengkap}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-blue-700">Kode:</span>
                                                        <p className="text-sm text-blue-900">{selectedPasienData.kode_pasien}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-blue-700">Umur:</span>
                                                        <p className="text-sm text-blue-900">{selectedPasienData.umur} tahun</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-blue-500" />
                                                        <span className="text-sm text-blue-900">{selectedPasienData.telepon}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                                                        <span className="text-sm text-blue-900">{selectedPasienData.alamat}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, pasien_id: '' }));
                                                setSelectedPasienData(null);
                                                setShowPasienSearch(true);
                                            }}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Ganti
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {errors.pasien_id && (
                                <p className="text-sm text-red-600">{errors.pasien_id}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Detail Resep */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                    <Pill className="w-5 h-5" />
                                    Detail Resep
                                </CardTitle>
                                <Button type="button" onClick={addDetailResep} size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Obat
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.detail_resep.map((detail: DetailResep, index: number) => (
                                <div key={index} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium text-gray-900">Obat #{index + 1}</h4>
                                        {formData.detail_resep.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeDetailResep(index)}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Pilih Obat *
                                            </label>
                                            <select
                                                value={detail.obat_id}
                                                onChange={(e) => updateDetailResep(index, 'obat_id', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Pilih obat...</option>
                                                {obat.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.nama_obat} - Stok: {item.stok_tersedia} {item.satuan}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors[`detail_resep.${index}.obat_id`] && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {errors[`detail_resep.${index}.obat_id`]}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Jumlah *
                                            </label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={detail.jumlah}
                                                    onChange={(e) => updateDetailResep(index, 'jumlah', parseInt(e.target.value) || 1)}
                                                    className="flex-1"
                                                    required
                                                />
                                                {detail.obat_id && (
                                                    <span className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
                                                        {getObatById(detail.obat_id)?.satuan}
                                                    </span>
                                                )}
                                            </div>
                                            {errors[`detail_resep.${index}.jumlah`] && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {errors[`detail_resep.${index}.jumlah`]}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Aturan Pakai *
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Contoh: 3x sehari 1 tablet sesudah makan"
                                            value={detail.aturan_pakai}
                                            onChange={(e) => updateDetailResep(index, 'aturan_pakai', e.target.value)}
                                            required
                                        />
                                        {errors[`detail_resep.${index}.aturan_pakai`] && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors[`detail_resep.${index}.aturan_pakai`]}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Keterangan
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Keterangan tambahan (opsional)"
                                            value={detail.keterangan}
                                            onChange={(e) => updateDetailResep(index, 'keterangan', e.target.value)}
                                        />
                                        {errors[`detail_resep.${index}.keterangan`] && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors[`detail_resep.${index}.keterangan`]}
                                            </p>
                                        )}
                                    </div>

                                    {detail.obat_id && (
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <div className="text-sm text-gray-600">
                                                <strong>Info Obat:</strong> {getObatById(detail.obat_id)?.nama_obat} - 
                                                Stok tersedia: {getObatById(detail.obat_id)?.stok_tersedia} {getObatById(detail.obat_id)?.satuan}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {errors.detail_resep && (
                                <p className="text-sm text-red-600">{errors.detail_resep}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Catatan Resep */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Catatan Resep</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Catatan Tambahan
                                </label>
                                <textarea
                                    placeholder="Catatan atau instruksi khusus untuk resep ini..."
                                    value={formData.catatan_resep}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, catatan_resep: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.catatan_resep && (
                                    <p className="text-sm text-red-600 mt-1">{errors.catatan_resep}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-2">
                        <Link href={route('dokter.resep.index')}>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Resep'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
