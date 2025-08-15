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
        Schema::create('pegawai', function (Blueprint $table) {
            $table->id();
            $table->string('kode_pegawai', 20)->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('nama_lengkap', 100);
            $table->string('jabatan', 50);
            $table->string('departemen', 50)->nullable();
            $table->string('nomor_izin', 50)->nullable(); // untuk dokter (SIP, STR)
            $table->string('spesialisasi', 100)->nullable(); // untuk dokter
            $table->string('telepon', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('alamat')->nullable();
            $table->date('tanggal_masuk')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index('kode_pegawai');
            $table->index('jabatan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pegawai');
    }
};
