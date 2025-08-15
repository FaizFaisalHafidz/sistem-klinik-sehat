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
        Schema::create('pasien', function (Blueprint $table) {
            $table->id();
            $table->string('kode_pasien', 20)->unique();
            $table->string('nik', 16)->unique()->nullable();
            $table->string('nama_lengkap', 100);
            $table->date('tanggal_lahir')->nullable();
            $table->enum('jenis_kelamin', ['laki-laki', 'perempuan']);
            $table->text('alamat')->nullable();
            $table->string('telepon', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('kontak_darurat', 100)->nullable();
            $table->string('telepon_darurat', 20)->nullable();
            $table->enum('golongan_darah', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->text('alergi')->nullable();
            $table->string('pekerjaan', 100)->nullable();
            $table->enum('status_perkawinan', ['belum_menikah', 'menikah', 'cerai', 'janda_duda'])->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('kode_pasien');
            $table->index('nik');
            $table->index('nama_lengkap');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pasien');
    }
};
