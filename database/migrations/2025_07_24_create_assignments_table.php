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
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Titre du devoir
            $table->text('description')->nullable(); // Description/consignes du devoir
            $table->enum('type', ['tp', 'td', 'controle', 'qcm']); // Type de devoir
            // Relations
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade'); // Cours concerné
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade'); // Formateur qui crée le devoir
            // Configuration du devoir
            $table->integer('max_points')->default(20); // Points maximum (note sur 20)
            $table->integer('duration_minutes')->nullable(); // Durée en minutes pour les contrôles/QCM
            $table->json('instructions')->nullable(); // Instructions spécifiques JSON
            $table->boolean('allow_late_submission')->default(false); // Autoriser les retards
            // Fichier joint (optionnel)
            $table->string('file')->nullable(); // Fichier associé au devoir
            // Dates importantes
            $table->timestamp('due_date')->nullable(); // Date limite de soumission
            $table->timestamp('available_from')->nullable(); // Date de disponibilité
            $table->timestamp('available_until')->nullable(); // Date de fin de disponibilité
            // Gestion
            $table->boolean('is_active')->nullable()->default(true); // Devoir actif/inactif
            $table->timestamps();
            // Index pour optimiser les requêtes
            $table->index(['course_id', 'teacher_id']);
            $table->index(['course_id', 'type']);
            $table->index(['teacher_id', 'is_active']);
            $table->index('due_date');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
