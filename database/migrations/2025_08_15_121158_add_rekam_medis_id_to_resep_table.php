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
        Schema::table('resep', function (Blueprint $table) {
            $table->foreignId('rekam_medis_id')->nullable()->after('dokter_id')->constrained('rekam_medis')->onDelete('cascade');
            $table->index('rekam_medis_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resep', function (Blueprint $table) {
            $table->dropForeign(['rekam_medis_id']);
            $table->dropIndex(['rekam_medis_id']);
            $table->dropColumn('rekam_medis_id');
        });
    }
};
