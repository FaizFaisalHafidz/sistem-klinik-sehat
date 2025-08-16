<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\PasienController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\ObatController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\LogAktivitasController;
use App\Http\Controllers\Pendaftaran\PasienController as PendaftaranPasienController;
use App\Http\Controllers\Pendaftaran\PendaftaranBaruController;
use App\Http\Controllers\Pendaftaran\PendaftaranPemeriksaanController;
use App\Http\Controllers\Pendaftaran\AntrianController;
use App\Http\Controllers\Pendaftaran\LaporanController as PendaftaranLaporanController;
use App\Http\Controllers\Dokter\AntrianController as DokterAntrianController;
use App\Http\Controllers\Dokter\PemeriksaanController as DokterPemeriksaanController;
use App\Http\Controllers\Dokter\RekamMedisController as DokterRekamMedisController;
use App\Http\Controllers\Dokter\ResepController as DokterResepController;
use App\Http\Controllers\Dokter\ObatController as DokterObatController;


Route::redirect('/', '/dashboard')->name('home');


// Route untuk halaman akun tidak aktif (diakses langsung tanpa middleware)
Route::get('/account-inactive', function () {
    return Inertia::render('Auth/account-inactive', [
        'user' => Auth::user() ? [
            'nama_lengkap' => Auth::user()->nama_lengkap,
            'email' => Auth::user()->email,
            'telepon' => Auth::user()->telepon,
        ] : null,
        'message' => 'Akun Anda sedang tidak aktif. Silahkan hubungi administrator untuk mengaktifkan kembali akun Anda.'
    ]);
})->name('account.inactive');

// Dashboard routes dengan middleware
Route::middleware(['auth', 'verified', 'active.user'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', UserController::class);
        Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
        
        Route::resource('pasien', PasienController::class);
        Route::resource('pegawai', PegawaiController::class);
        Route::resource('obat', ObatController::class);
        
        // Laporan routes
        Route::get('laporan', [LaporanController::class, 'index'])->name('laporan.index');
        Route::get('laporan/{rekamMedis}', [LaporanController::class, 'show'])->name('laporan.show');
        Route::get('laporan-export', [LaporanController::class, 'export'])->name('laporan.export');
        
        // Log Aktivitas routes
        Route::get('log-aktivitas', [LogAktivitasController::class, 'index'])->name('log-aktivitas.index');
        Route::get('log-aktivitas/{logAktivitas}', [LogAktivitasController::class, 'show'])->name('log-aktivitas.show');
        Route::get('log-aktivitas-export', [LogAktivitasController::class, 'export'])->name('log-aktivitas.export');
        Route::delete('log-aktivitas-clear', [LogAktivitasController::class, 'clear'])->name('log-aktivitas.clear');
    });

    // Pendaftaran routes
    Route::middleware(['role:admin|pendaftaran'])->prefix('pendaftaran')->name('pendaftaran.')->group(function () {
        Route::resource('pasien', PendaftaranPasienController::class);
        Route::get('pasien-export', [PendaftaranPasienController::class, 'export'])->name('pasien.export');
        
        // Pendaftaran Baru routes
        Route::get('baru', [PendaftaranBaruController::class, 'index'])->name('baru.index');
        Route::get('baru/create', [PendaftaranBaruController::class, 'create'])->name('baru.create');
        Route::get('baru/search-pasien', [PendaftaranBaruController::class, 'searchPasien'])->name('baru.search-pasien');
        Route::post('baru', [PendaftaranBaruController::class, 'store'])->name('baru.store');
        Route::get('baru/{id}', [PendaftaranBaruController::class, 'show'])->name('baru.show');
        Route::delete('baru/{id}/cancel', [PendaftaranBaruController::class, 'cancel'])->name('baru.cancel');
        Route::get('baru/{id}/print-ticket', [PendaftaranBaruController::class, 'printTicket'])->name('baru.print-ticket');
        
        // Pendaftaran Pemeriksaan routes
        Route::get('pemeriksaan', [PendaftaranPemeriksaanController::class, 'index'])->name('pemeriksaan.index');
        Route::get('pemeriksaan/create', [PendaftaranPemeriksaanController::class, 'create'])->name('pemeriksaan.create');
        Route::get('pemeriksaan/search-pasien', [PendaftaranPemeriksaanController::class, 'searchPasien'])->name('pemeriksaan.search-pasien');
        Route::post('pemeriksaan', [PendaftaranPemeriksaanController::class, 'store'])->name('pemeriksaan.store');
        Route::get('pemeriksaan/{id}', [PendaftaranPemeriksaanController::class, 'show'])->name('pemeriksaan.show');
        Route::delete('pemeriksaan/{id}/cancel', [PendaftaranPemeriksaanController::class, 'cancel'])->name('pemeriksaan.cancel');
        Route::get('pemeriksaan/{id}/print-ticket', [PendaftaranPemeriksaanController::class, 'printTicket'])->name('pemeriksaan.print-ticket');
        
        // Antrian routes
        Route::get('antrian', [AntrianController::class, 'index'])->name('antrian.index');
        Route::get('antrian/{id}', [AntrianController::class, 'show'])->name('antrian.show');
        Route::patch('antrian/{id}/update-status', [AntrianController::class, 'updateStatus'])->name('antrian.update-status');
        Route::post('antrian/call-next', [AntrianController::class, 'callNext'])->name('antrian.call-next');
        Route::get('antrian/{id}/print-ticket', [AntrianController::class, 'printTicket'])->name('antrian.print-ticket');
        Route::get('antrian-status/current', [AntrianController::class, 'currentStatus'])->name('antrian.current-status');
        
        // Laporan routes
        Route::get('laporan', [PendaftaranLaporanController::class, 'index'])->name('laporan.index');
        Route::get('laporan/export', [PendaftaranLaporanController::class, 'export'])->name('laporan.export');
    });
});

// Dokter Routes
Route::middleware(['auth', 'verified', 'active.user', 'role:dokter'])->prefix('dokter')->name('dokter.')->group(function () {
    // Antrian routes for doctor
    Route::get('antrian', [DokterAntrianController::class, 'index'])->name('antrian.index');
    Route::get('antrian/{id}', [DokterAntrianController::class, 'show'])->name('antrian.show');
    Route::post('antrian/{id}/start-examination', [DokterAntrianController::class, 'startExamination'])->name('antrian.start-examination');
    Route::post('antrian/{id}/complete-examination', [DokterAntrianController::class, 'completeExamination'])->name('antrian.complete-examination');
    Route::post('antrian/call-next', [DokterAntrianController::class, 'callNext'])->name('antrian.call-next');
    Route::get('antrian-status/current', [DokterAntrianController::class, 'currentStatus'])->name('antrian.current-status');
    
    // Pemeriksaan routes for doctor
    Route::get('pemeriksaan', [DokterPemeriksaanController::class, 'index'])->name('pemeriksaan.index');
    Route::get('pemeriksaan/{id}', [DokterPemeriksaanController::class, 'show'])->name('pemeriksaan.show');
    Route::get('pemeriksaan-create', [DokterPemeriksaanController::class, 'create'])->name('pemeriksaan.create');
    Route::post('pemeriksaan', [DokterPemeriksaanController::class, 'store'])->name('pemeriksaan.store');
    Route::get('pemeriksaan/{id}/edit', [DokterPemeriksaanController::class, 'edit'])->name('pemeriksaan.edit');
    Route::put('pemeriksaan/{id}', [DokterPemeriksaanController::class, 'update'])->name('pemeriksaan.update');
    
    // Rekam Medis routes for doctor
    Route::get('rekam-medis', [DokterRekamMedisController::class, 'index'])->name('rekam-medis.index');
    Route::get('rekam-medis/{id}', [DokterRekamMedisController::class, 'show'])->name('rekam-medis.show');
    Route::get('rekam-medis/{id}/edit', [DokterRekamMedisController::class, 'edit'])->name('rekam-medis.edit');
    Route::put('rekam-medis/{id}', [DokterRekamMedisController::class, 'update'])->name('rekam-medis.update');
    Route::delete('rekam-medis/{id}', [DokterRekamMedisController::class, 'destroy'])->name('rekam-medis.destroy');
    Route::get('rekam-medis/{id}/cetak', [DokterRekamMedisController::class, 'cetak'])->name('rekam-medis.cetak');
    
    // Resep routes for doctor
    Route::get('resep', [DokterResepController::class, 'index'])->name('resep.index');
    Route::get('resep/create', [DokterResepController::class, 'create'])->name('resep.create');
    Route::get('resep/search-pasien', [DokterResepController::class, 'searchPasien'])->name('resep.search-pasien');
    Route::post('resep', [DokterResepController::class, 'store'])->name('resep.store');
    Route::get('resep/{id}', [DokterResepController::class, 'show'])->name('resep.show');
    Route::get('resep/{id}/edit', [DokterResepController::class, 'edit'])->name('resep.edit');
    Route::put('resep/{id}', [DokterResepController::class, 'update'])->name('resep.update');
    Route::delete('resep/{id}', [DokterResepController::class, 'destroy'])->name('resep.destroy');
    Route::get('resep/{id}/cetak', [DokterResepController::class, 'cetak'])->name('resep.cetak');
    
    // Obat routes for doctor (read-only)
    Route::get('obat', [DokterObatController::class, 'index'])->name('obat.index');
    Route::get('obat/create', [DokterObatController::class, 'create'])->name('obat.create');
    Route::post('obat', [DokterObatController::class, 'store'])->name('obat.store');
    Route::get('obat/{obat}', [DokterObatController::class, 'show'])->name('obat.show');
    Route::get('obat/{obat}/edit', [DokterObatController::class, 'edit'])->name('obat.edit');
    Route::put('obat/{obat}', [DokterObatController::class, 'update'])->name('obat.update');
    Route::delete('obat/{obat}', [DokterObatController::class, 'destroy'])->name('obat.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Include debug routes only in non-production environments
if (!app()->environment('production')) {
    require __DIR__.'/debug.php';
}
