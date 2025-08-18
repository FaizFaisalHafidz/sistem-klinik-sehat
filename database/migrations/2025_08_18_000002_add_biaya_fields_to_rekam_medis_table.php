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
        Schema::table('rekam_medis', function (Blueprint $table) {
            $table->decimal('biaya_konsultasi', 10, 2)->default(0)->after('status_rekam_medis')
                  ->comment('Biaya pemeriksaan/konsultasi dokter');
            $table->decimal('biaya_obat', 10, 2)->default(0)->after('biaya_konsultasi')
                  ->comment('Total biaya semua obat dalam resep');
            $table->decimal('total_biaya', 10, 2)->default(0)->after('biaya_obat')
                  ->comment('Total biaya keseluruhan (konsultasi + obat)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rekam_medis', function (Blueprint $table) {
            $table->dropColumn(['biaya_konsultasi', 'biaya_obat', 'total_biaya']);
        });
    }
};
