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
        Schema::table('chapters', function (Blueprint $table) {
            // Ajouter les colonnes manquantes si elles n'existent pas déjà
            if (!Schema::hasColumn('chapters', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('file_path');
            }
            
            if (!Schema::hasColumn('chapters', 'video_url')) {
                $table->string('video_url')->nullable()->after('file_path');
            }
            
            if (!Schema::hasColumn('chapters', 'order_index')) {
                $table->integer('order_index')->default(0)->after('course_id');
            }
            
            if (!Schema::hasColumn('chapters', 'duration_minutes')) {
                $table->integer('duration_minutes')->nullable()->after('description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            $table->dropColumn([
                'is_active',
                'video_url', 
                'order_index',
                'duration_minutes'
            ]);
        });
    }
};