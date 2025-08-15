<?php

namespace Database\Seeders;

use App\Models\LogAktivitas;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class LogAktivitasSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        
        if ($users->isEmpty()) {
            echo "No users found. Please seed users first.\n";
            return;
        }

        // Sample log aktivitas data
        $activities = [
            ['nama_tabel' => 'users', 'aksi' => 'CREATE'],
            ['nama_tabel' => 'users', 'aksi' => 'UPDATE'],
            ['nama_tabel' => 'pasien', 'aksi' => 'CREATE'],
            ['nama_tabel' => 'pasien', 'aksi' => 'UPDATE'],
            ['nama_tabel' => 'pasien', 'aksi' => 'DELETE'],
            ['nama_tabel' => 'pegawai', 'aksi' => 'CREATE'],
            ['nama_tabel' => 'pegawai', 'aksi' => 'UPDATE'],
            ['nama_tabel' => 'obat', 'aksi' => 'CREATE'],
            ['nama_tabel' => 'obat', 'aksi' => 'UPDATE'],
            ['nama_tabel' => 'obat', 'aksi' => 'DELETE'],
            ['nama_tabel' => 'rekam_medis', 'aksi' => 'CREATE'],
            ['nama_tabel' => 'rekam_medis', 'aksi' => 'UPDATE'],
            ['nama_tabel' => 'antrian', 'aksi' => 'CREATE'],
            ['nama_tabel' => 'antrian', 'aksi' => 'UPDATE'],
            ['nama_tabel' => 'pendaftaran', 'aksi' => 'CREATE'],
            ['nama_tabel' => 'pendaftaran', 'aksi' => 'UPDATE'],
        ];

        $ipAddresses = [
            '127.0.0.1',
            '192.168.1.100',
            '192.168.1.101',
            '192.168.1.102',
            '10.0.0.1',
            '172.16.0.1',
        ];

        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ];

        // Create sample logs for the last 30 days
        for ($i = 0; $i < 100; $i++) {
            $user = $users->random();
            $activity = $activities[array_rand($activities)];
            $createdAt = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
            
            // Sample data based on action type
            $dataLama = null;
            $dataBaru = null;
            
            if ($activity['aksi'] === 'UPDATE') {
                $dataLama = [
                    'nama' => 'Data Lama',
                    'status' => 'inactive',
                    'updated_at' => $createdAt->subMinutes(5)->toDateTimeString(),
                ];
                $dataBaru = [
                    'nama' => 'Data Baru',
                    'status' => 'active',
                    'updated_at' => $createdAt->toDateTimeString(),
                ];
            } elseif ($activity['aksi'] === 'CREATE') {
                $dataBaru = [
                    'nama' => 'Data Baru',
                    'status' => 'active',
                    'created_at' => $createdAt->toDateTimeString(),
                ];
            } elseif ($activity['aksi'] === 'DELETE') {
                $dataLama = [
                    'nama' => 'Data Yang Dihapus',
                    'status' => 'active',
                    'deleted_at' => $createdAt->toDateTimeString(),
                ];
            }

            LogAktivitas::create([
                'user_id' => $user->id,
                'nama_tabel' => $activity['nama_tabel'],
                'record_id' => rand(1, 100),
                'aksi' => $activity['aksi'],
                'data_lama' => $dataLama,
                'data_baru' => $dataBaru,
                'ip_address' => $ipAddresses[array_rand($ipAddresses)],
                'user_agent' => $userAgents[array_rand($userAgents)],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        echo "Created 100 sample log aktivitas records.\n";
    }
}
