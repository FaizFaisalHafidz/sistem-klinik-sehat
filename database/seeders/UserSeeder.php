<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Membuat User Admin
        $admin = User::create([
            'nama_pengguna' => 'admin',
            'email' => 'admin@klinik.com',
            'password' => Hash::make('password123'),
            'nama_lengkap' => 'Administrator Sistem',
            'telepon' => '081234567890',
            'is_aktif' => true,
        ]);
        $admin->assignRole('admin');

        // Membuat User Bagian Pendaftaran
        $pendaftaran = User::create([
            'nama_pengguna' => 'pendaftaran',
            'email' => 'pendaftaran@klinik.com',
            'password' => Hash::make('password123'),
            'nama_lengkap' => 'Bagian Pendaftaran',
            'telepon' => '081234567891',
            'is_aktif' => true,
        ]);
        $pendaftaran->assignRole('pendaftaran');

        // Membuat User Dokter
        $dokter = User::create([
            'nama_pengguna' => 'dokter',
            'email' => 'dokter@klinik.com',
            'password' => Hash::make('password123'),
            'nama_lengkap' => 'Dr. John Doe',
            'telepon' => '081234567892',
            'is_aktif' => true,
        ]);
        $dokter->assignRole('dokter');

        // Membuat User Apoteker (optional)
        $apoteker = User::create([
            'nama_pengguna' => 'apoteker',
            'email' => 'apoteker@klinik.com',
            'password' => Hash::make('password123'),
            'nama_lengkap' => 'Apoteker Klinik',
            'telepon' => '081234567893',
            'is_aktif' => true,
        ]);
        $apoteker->assignRole('apoteker');

        echo "Users created successfully!\n";
        echo "Admin: admin@klinik.com / password123\n";
        echo "Pendaftaran: pendaftaran@klinik.com / password123\n";
        echo "Dokter: dokter@klinik.com / password123\n";
        echo "Apoteker: apoteker@klinik.com / password123\n";
    }
}
