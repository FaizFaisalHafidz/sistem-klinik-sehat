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
        Schema::create('resep', function (Blueprint $table) {
            $table->id();
            $table->string('kode_resep', 20)->unique();
            $table->foreignId('pasien_id')->constrained('pasien')->onDelete('cascade');
            $table->foreignId('dokter_id')->constrained('pegawai')->onDelete('cascade');
            $table->timestamp('tanggal_resep')->useCurrent();
            $table->text('catatan_resep')->nullable();
            $table->enum('status_resep', ['belum_diambil', 'sudah_diambil', 'dibatalkan'])->default('belum_diambil');
            $table->timestamps();
            
            // Indexes
            $table->index('kode_resep');
            $table->index('pasien_id');
            $table->index('status_resep');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resep');
    }
};
