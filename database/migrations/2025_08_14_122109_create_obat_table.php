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
        Schema::create('obat', function (Blueprint $table) {
            $table->id();
            $table->string('kode_obat', 20)->unique();
            $table->string('nama_obat', 100);
            $table->string('nama_generik', 100)->nullable();
            $table->string('pabrik', 100)->nullable();
            $table->string('kategori', 50)->nullable();
            $table->string('satuan', 20); // tablet, botol, sachet, kapsul
            $table->decimal('harga', 12, 2);
            $table->integer('stok_tersedia')->default(0);
            $table->integer('stok_minimum')->default(10);
            $table->date('tanggal_kadaluarsa')->nullable();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index('kode_obat');
            $table->index('nama_obat');
            $table->index('stok_tersedia');
            $table->index('kategori');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('obat');
    }
};
