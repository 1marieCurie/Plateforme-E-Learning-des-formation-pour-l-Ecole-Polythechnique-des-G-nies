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
        Schema::create('teacher_feedbacks', function (Blueprint $table) {
            $table->id();
            
            // Relations principales
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade'); // Formateur qui donne le feedback
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade'); // Étudiant qui reçoit
            $table->foreignId('formation_id')->constrained('formations')->onDelete('cascade'); // Contexte formation
            
            // Évaluation globale
            $table->decimal('rating', 2, 1); // Note globale 1-5
            
            // Contenu du feedback
            $table->string('title')->nullable(); // Titre du feedback
            $table->text('message'); // Message principal
            
            // Aspects évalués (optionnels)
            $table->tinyInteger('participation_rating')->nullable(); // Participation (1-5)
            $table->tinyInteger('progress_rating')->nullable(); // Progression (1-5)
            $table->tinyInteger('commitment_rating')->nullable(); // Engagement (1-5)
            $table->tinyInteger('technical_skills_rating')->nullable(); // Compétences techniques (1-5)
            
            // Recommandations et conseils
            $table->text('recommendations')->nullable(); // Conseils pour la suite
            $table->text('strengths')->nullable(); // Points forts identifiés
            $table->text('areas_for_improvement')->nullable(); // Points à améliorer
            
            // Métadonnées
            $table->boolean('is_private')->default(true); // Feedback privé par défaut
            $table->enum('feedback_type', ['progress', 'encouragement', 'warning', 'recommendation', 'milestone'])->default('progress');
            $table->enum('status', ['draft', 'sent', 'read'])->default('sent'); // Statut du feedback
            $table->timestamp('read_at')->nullable(); // Date de lecture par l'étudiant
            
            $table->timestamps();
            
            // Contraintes et index
            $table->index(['student_id', 'formation_id']); // Feedbacks d'un étudiant dans une formation
            $table->index(['teacher_id', 'created_at']); // Feedbacks donnés par un formateur
            $table->index(['formation_id', 'rating']); // Statistiques par formation
            $table->index(['feedback_type', 'status']); // Filtres par type et statut
            $table->index('created_at'); // Tri chronologique
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_feedbacks');
    }
};
