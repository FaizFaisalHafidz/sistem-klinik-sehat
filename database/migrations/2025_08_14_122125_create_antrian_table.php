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
        Schema::create('antrian', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal_antrian');
            $table->integer('nomor_antrian');
            $table->foreignId('pasien_id')->constrained('pasien')->onDelete('cascade');
            $table->foreignId('dokter_id')->nullable()->constrained('pegawai')->onDelete('set null');
            $table->timestamp('waktu_pendaftaran')->useCurrent();
            $table->time('estimasi_waktu')->nullable();
            $table->enum('status_antrian', ['menunggu', 'sedang_diperiksa', 'selesai', 'dibatalkan'])->default('menunggu');
            $table->timestamp('waktu_dipanggil')->nullable();
            $table->timestamp('waktu_selesai')->nullable();
            $table->foreignId('dibuat_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Indexes
            $table->index(['tanggal_antrian', 'status_antrian']);
            $table->unique(['tanggal_antrian', 'nomor_antrian']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('antrian');
    }
};
