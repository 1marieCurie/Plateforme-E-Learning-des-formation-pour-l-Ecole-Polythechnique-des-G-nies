<?php

namespace Database\Migrations;

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
        Schema::create('chapter_progresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('chapter_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->boolean('is_read')->default(false); // Si l'utilisateur a lu le chapitre
            $table->integer('reading_time_seconds')->default(0); // Temps de lecture en secondes
            $table->integer('download_count')->default(0); // Compteur de téléchargements
            $table->timestamp('first_read_at')->nullable(); // Première lecture
            $table->timestamp('last_read_at')->nullable(); // Dernière lecture
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapter_progresses');
    }
};
