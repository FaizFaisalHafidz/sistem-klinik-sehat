<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pendaftaran', function (Blueprint $table) {
            $table->id();
            $table->string('kode_pendaftaran', 20)->unique();
            $table->foreignId('pasien_id')->constrained('pasien')->onDelete('cascade');
            $table->foreignId('dokter_id')->nullable()->constrained('pegawai')->onDelete('set null');
            $table->foreignId('antrian_id')->nullable()->constrained('antrian')->onDelete('set null');
            $table->date('tanggal_pendaftaran');
            $table->text('keluhan_utama')->nullable();
            $table->enum('status_pendaftaran', ['terdaftar', 'sedang_diperiksa', 'selesai', 'dibatalkan'])->default('terdaftar');
            $table->decimal('biaya_pendaftaran', 10, 2)->default(0);
            $table->foreignId('dibuat_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Indexes
            $table->index('kode_pendaftaran');
            $table->index('tanggal_pendaftaran');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pendaftaran');
    }
};
