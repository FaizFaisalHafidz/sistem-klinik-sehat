<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Membuat Permissions
        $permissions = [
            // Dashboard
            'lihat_dashboard',
            
            // Manajemen Pasien
            'lihat_pasien',
            'tambah_pasien',
            'edit_pasien',
            'hapus_pasien',
            
            // Manajemen Pegawai
            'lihat_pegawai',
            'tambah_pegawai',
            'edit_pegawai',
            'hapus_pegawai',
            
            // Manajemen Obat
            'lihat_obat',
            'tambah_obat',
            'edit_obat',
            'hapus_obat',
            'kelola_stok',
            
            // Pendaftaran
            'lihat_pendaftaran',
            'tambah_pendaftaran',
            'edit_pendaftaran',
            'hapus_pendaftaran',
            'cetak_kartu_antrian',
            
            // Pemeriksaan
            'lihat_antrian',
            'panggil_pasien',
            'pemeriksaan_pasien',
            'buat_rekam_medis',
            'edit_rekam_medis',
            'buat_resep',
            'cetak_resep',
            
            // Laporan
            'lihat_laporan',
            'cetak_laporan',
            'export_laporan',
            
            // Sistem
            'kelola_pengguna',
            'kelola_role',
            'lihat_log_aktivitas',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Membuat Roles dan assign permissions
        
        // Role Admin
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Role Bagian Pendaftaran
        $pendaftaranRole = Role::create(['name' => 'pendaftaran']);
        $pendaftaranRole->givePermissionTo([
            'lihat_dashboard',
            'lihat_pasien',
            'tambah_pasien',
            'edit_pasien',
            'lihat_pendaftaran',
            'tambah_pendaftaran',
            'edit_pendaftaran',
            'cetak_kartu_antrian',
            'lihat_antrian',
            'lihat_laporan',
            'cetak_laporan',
        ]);

        // Role Dokter
        $dokterRole = Role::create(['name' => 'dokter']);
        $dokterRole->givePermissionTo([
            'lihat_dashboard',
            'lihat_pasien',
            'lihat_antrian',
            'panggil_pasien',
            'pemeriksaan_pasien',
            'buat_rekam_medis',
            'edit_rekam_medis',
            'buat_resep',
            'cetak_resep',
            'lihat_obat',
        ]);

        // Role Apoteker (jika diperlukan di masa depan)
        $apotekerRole = Role::create(['name' => 'apoteker']);
        $apotekerRole->givePermissionTo([
            'lihat_dashboard',
            'lihat_obat',
            'tambah_obat',
            'edit_obat',
            'kelola_stok',
        ]);
    }
}
