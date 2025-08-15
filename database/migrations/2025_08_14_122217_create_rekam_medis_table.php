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
        Schema::create('rekam_medis', function (Blueprint $table) {
            $table->id();
            $table->string('kode_rekam_medis', 20)->unique();
            $table->foreignId('pendaftaran_id')->constrained('pendaftaran')->onDelete('cascade');
            $table->foreignId('pasien_id')->constrained('pasien')->onDelete('cascade');
            $table->foreignId('dokter_id')->constrained('pegawai')->onDelete('cascade');
            $table->timestamp('tanggal_pemeriksaan')->useCurrent();
            $table->json('tanda_vital')->nullable(); // {"tekanan_darah": "120/80", "suhu": "36.5", "berat_badan": "70", "tinggi_badan": "170"}
            $table->text('anamnesis')->nullable(); // riwayat penyakit dan keluhan
            $table->text('pemeriksaan_fisik')->nullable();
            $table->text('diagnosa');
            $table->text('rencana_pengobatan')->nullable();
            $table->text('catatan_dokter')->nullable();
            $table->date('tanggal_kontrol')->nullable();
            $table->enum('status_rekam_medis', ['draft', 'selesai'])->default('draft');
            $table->timestamps();
            
            // Indexes
            $table->index('kode_rekam_medis');
            $table->index('pasien_id');
            $table->index('dokter_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekam_medis');
    }
};
