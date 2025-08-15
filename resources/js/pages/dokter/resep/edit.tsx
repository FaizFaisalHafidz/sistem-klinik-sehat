import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CalendarDays,
    MapPin,
    Phone,
    Pill,
    Plus,
    Receipt,
    Save,
    User,
    X
} from 'lucide-react';
import { useState } from 'react';

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
    id: number;
    nama_obat: string;
    jenis_obat: string;
    satuan: string;
    harga: number;
    stok_tersedia: number;
}

interface DetailResep {
    id: number;
    obat: {
        id: number;
        nama_obat: string;
        jenis_obat: string;
        satuan: string;
    };
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
    total_harga: number;
    pasien: Pasien;
    dokter: Dokter;
    detail_resep?: DetailResep[];
}

interface Props {
    resep: Resep;
    obat?: Obat[];
    errors?: Record<string, string>;
}

interface ObatResepForm {
    obat_id: number;
    jumlah: number;
    aturan_pakai: string;
    keterangan: string;
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

export default function Edit({ resep, obat = [], errors = {} }: Props) {
    const [formData, setFormData] = useState({
        tanggal_resep: resep.tanggal_resep,
        catatan_resep: resep.catatan_resep || '',
        obat_resep: resep.detail_resep?.map((detail: DetailResep) => ({
            obat_id: detail.obat.id,
            jumlah: detail.jumlah,
            aturan_pakai: detail.aturan_pakai,
            keterangan: detail.keterangan || ''
        })) as ObatResepForm[] || []
    });

    const [loading, setLoading] = useState(false);

    const addObatResep = () => {
        setFormData(prev => ({
            ...prev,
            obat_resep: [
                ...prev.obat_resep,
                {
                    obat_id: 0,
                    jumlah: 1,
                    aturan_pakai: '',
                    keterangan: ''
                }
            ]
        }));
    };

    const removeObatResep = (index: number) => {
        setFormData(prev => ({
            ...prev,
            obat_resep: prev.obat_resep.filter((_, i) => i !== index)
        }));
    };

    const updateObatResep = (index: number, field: keyof ObatResepForm, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            obat_resep: prev.obat_resep.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const getSelectedObat = (obatId: number) => {
        return obat?.find((obatItem: Obat) => obatItem.id === obatId);
    };

    const calculateTotal = () => {
        return formData.obat_resep.reduce((total, obatResep) => {
            const selectedObat = getSelectedObat(obatResep.obat_id);
            return total + (selectedObat ? selectedObat.harga * obatResep.jumlah : 0);
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.put(route('dokter.resep.update', resep.id), formData as any, {
            onFinish: () => setLoading(false),
            onSuccess: () => {
                // Redirect handled by controller
            }
        });
    };

    const totalHarga = calculateTotal();

    return (
        <AppLayout>
            <Head title={`Edit Resep ${resep.kode_resep} - ${resep.pasien.nama_lengkap}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('dokter.resep.show', resep.id)}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Edit Resep
                            </h1>
                            <p className="text-gray-600">
                                {resep.kode_resep} • {resep.pasien.nama_lengkap}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Warning untuk status */}
                {resep.status_resep !== 'belum_diambil' && (
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-yellow-800">
                                <Calendar className="w-5 h-5" />
                                <p className="font-medium">
                                    Peringatan: Resep ini sudah {resep.status_resep === 'sudah_diambil' ? 'diambil' : 'dibatalkan'}. 
                                    Perubahan mungkin tidak disarankan.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Informasi Pasien - Read Only */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Informasi Pasien
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Kode Pasien</label>
                                        <div className="mt-1">
                                            <Badge variant="outline" className="text-sm">
                                                {resep.pasien.kode_pasien}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                                        <p className="mt-1 text-sm text-gray-900 font-medium">
                                            {resep.pasien.nama_lengkap}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-900">
                                                {new Date(resep.pasien.tanggal_lahir).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Umur / Jenis Kelamin</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {resep.pasien.umur} tahun / {getJenisKelaminBadge(resep.pasien.jenis_kelamin)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Alamat</label>
                                    <div className="mt-1 flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <p className="text-sm text-gray-900">
                                            {resep.pasien.alamat || 'Alamat tidak tersedia'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">
                                            {resep.pasien.telepon || 'Tidak tersedia'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Resep */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="w-5 h-5" />
                                    Edit Informasi Resep
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="kode_resep">Kode Resep</Label>
                                    <Input
                                        id="kode_resep"
                                        type="text"
                                        value={resep.kode_resep}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tanggal_resep">Tanggal Resep</Label>
                                    <div className="relative">
                                        <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            id="tanggal_resep"
                                            type="date"
                                            value={formData.tanggal_resep}
                                            onChange={(e) => setFormData(prev => ({ ...prev, tanggal_resep: e.target.value }))}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    {errors.tanggal_resep && (
                                        <p className="text-sm text-red-600 mt-1">{errors.tanggal_resep}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="catatan_resep">Catatan Resep</Label>
                                    <Textarea
                                        id="catatan_resep"
                                        value={formData.catatan_resep}
                                        onChange={(e) => setFormData(prev => ({ ...prev, catatan_resep: e.target.value }))}
                                        placeholder="Masukkan catatan resep (opsional)"
                                        rows={3}
                                    />
                                    {errors.catatan_resep && (
                                        <p className="text-sm text-red-600 mt-1">{errors.catatan_resep}</p>
                                    )}
                                </div>

                                {/* Total Harga Preview */}
                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Total Harga:</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {formatCurrency(totalHarga)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daftar Obat */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Pill className="w-5 h-5" />
                                    Edit Daftar Obat
                                </CardTitle>
                                <Button
                                    type="button"
                                    onClick={addObatResep}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Obat
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {formData.obat_resep.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Belum ada obat yang dipilih</p>
                                    <Button
                                        type="button"
                                        onClick={addObatResep}
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Tambah Obat Pertama
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formData.obat_resep.map((obatResep, index) => {
                                        const selectedObat = getSelectedObat(obatResep.obat_id);
                                        const isStokCukup = selectedObat ? selectedObat.stok_tersedia >= obatResep.jumlah : true;
                                        const subtotal = selectedObat ? selectedObat.harga * obatResep.jumlah : 0;

                                        return (
                                            <div key={index} className="border rounded-lg p-4 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium text-gray-900">
                                                        Obat #{index + 1}
                                                    </h4>
                                                    {formData.obat_resep.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => removeObatResep(index)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Pilih Obat</Label>
                                                        <Select
                                                            value={obatResep.obat_id.toString()}
                                                            onValueChange={(value) => updateObatResep(index, 'obat_id', parseInt(value))}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih obat..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {obat?.map((obatItem: Obat) => (
                                                                    <SelectItem key={obatItem.id} value={obatItem.id.toString()}>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{obatItem.nama_obat}</span>
                                                                            <span className="text-xs text-gray-500">
                                                                                {obatItem.jenis_obat} • Stok: {obatItem.stok_tersedia} {obatItem.satuan} • {formatCurrency(obatItem.harga)}
                                                                            </span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors[`obat_resep.${index}.obat_id`] && (
                                                            <p className="text-sm text-red-600 mt-1">
                                                                {errors[`obat_resep.${index}.obat_id`]}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label>Jumlah</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                max={selectedObat?.stok_tersedia || 999}
                                                                value={obatResep.jumlah}
                                                                onChange={(e) => updateObatResep(index, 'jumlah', parseInt(e.target.value) || 1)}
                                                                className={!isStokCukup ? 'border-red-500' : ''}
                                                            />
                                                            <span className="text-sm text-gray-500">
                                                                {selectedObat?.satuan || ''}
                                                            </span>
                                                        </div>
                                                        {!isStokCukup && (
                                                            <p className="text-sm text-red-600 mt-1">
                                                                Stok tidak mencukupi! Tersedia: {selectedObat?.stok_tersedia}
                                                            </p>
                                                        )}
                                                        {errors[`obat_resep.${index}.jumlah`] && (
                                                            <p className="text-sm text-red-600 mt-1">
                                                                {errors[`obat_resep.${index}.jumlah`]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Aturan Pakai</Label>
                                                        <Input
                                                            type="text"
                                                            value={obatResep.aturan_pakai}
                                                            onChange={(e) => updateObatResep(index, 'aturan_pakai', e.target.value)}
                                                            placeholder="Contoh: 3x1 sehari sebelum makan"
                                                            required
                                                        />
                                                        {errors[`obat_resep.${index}.aturan_pakai`] && (
                                                            <p className="text-sm text-red-600 mt-1">
                                                                {errors[`obat_resep.${index}.aturan_pakai`]}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label>Keterangan (Opsional)</Label>
                                                        <Input
                                                            type="text"
                                                            value={obatResep.keterangan}
                                                            onChange={(e) => updateObatResep(index, 'keterangan', e.target.value)}
                                                            placeholder="Keterangan tambahan"
                                                        />
                                                    </div>
                                                </div>

                                                {selectedObat && (
                                                    <div className="flex justify-between items-center pt-2 border-t bg-gray-50 px-3 py-2 rounded">
                                                        <div className="text-sm">
                                                            <span className="text-gray-600">Harga satuan: </span>
                                                            <span className="font-medium">{formatCurrency(selectedObat.harga)}</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="text-gray-600">Subtotal: </span>
                                                            <span className="font-bold text-green-600">{formatCurrency(subtotal)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Total */}
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-900">Total Keseluruhan:</span>
                                            <span className="text-2xl font-bold text-green-600">
                                                {formatCurrency(totalHarga)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {errors.obat_resep && (
                                <p className="text-sm text-red-600 mt-2">{errors.obat_resep}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4">
                        <Link href={route('dokter.resep.show', resep.id)}>
                            <Button variant="outline" type="button">
                                Batal
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={loading || formData.obat_resep.length === 0}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin w-4 h-4 mr-2">⟳</span>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
