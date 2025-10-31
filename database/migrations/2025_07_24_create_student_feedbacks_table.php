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
        Schema::create('student_feedbacks', function (Blueprint $table) {
            $table->id();
            
            // Relations principales (toujours obligatoires)
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade'); // Étudiant qui donne le feedback
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade'); // Formateur évalué
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade'); // Cours concerné
            
            // Évaluation globale
            $table->decimal('rating', 2, 1); // Note de 1 à 5 (obligatoire)
            
            // Évaluation qualitative
            $table->string('title')->nullable(); // Titre du feedback
            $table->text('message'); // Message principal (obligatoire)
            
            // Évaluations détaillées (optionnelles)
            $table->tinyInteger('content_quality_rating')->nullable(); // Qualité du contenu (1-5)
            $table->tinyInteger('teaching_method_rating')->nullable(); // Méthode d'enseignement (1-5)
            $table->tinyInteger('difficulty_level_rating')->nullable(); // Niveau de difficulté approprié (1-5)
            $table->tinyInteger('support_rating')->nullable(); // Support/aide du formateur (1-5)
            
            // Suggestions d'amélioration
            $table->text('suggestions')->nullable();
            
            // Métadonnées
            $table->boolean('is_anonymous')->default(false); // Feedback anonyme
            $table->boolean('is_public')->default(false); // Visible par d'autres étudiants
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved'); // Pas de modération par défaut
            $table->text('admin_response')->nullable(); // Réponse admin si nécessaire
            
            $table->timestamps();
            
            // Contrainte unique : un étudiant ne peut donner qu'un feedback par cours
            $table->unique(['student_id', 'course_id'], 'unique_student_course_feedback');
            
            // Index optimisés pour les requêtes fréquentes
            $table->index(['course_id', 'rating']); // Moyennes par cours
            $table->index(['teacher_id', 'rating']); // Moyennes par formateur
            $table->index(['student_id', 'created_at']); // Historique étudiant
            $table->index(['status', 'is_public']); // Feedbacks publics approuvés
            $table->index('created_at'); // Tri chronologique
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_feedbacks');
    }
};
