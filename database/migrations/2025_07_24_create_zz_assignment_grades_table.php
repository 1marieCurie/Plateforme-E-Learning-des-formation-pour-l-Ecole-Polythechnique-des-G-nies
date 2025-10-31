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
        Schema::create('assignment_grades', function (Blueprint $table) {
            $table->id();
            
            // Relations
            $table->foreignId('assignment_submission_id')->constrained('assignment_submissions')->onDelete('cascade');
            $table->foreignId('graded_by')->constrained('users')->onDelete('cascade'); // Formateur qui note
            
            // Évaluation
            $table->decimal('grade', 5, 2); // Note obtenue (ex: 15.75)
            $table->integer('points_earned'); // Points obtenus
            $table->integer('total_points'); // Points totaux possibles
            $table->text('feedback')->nullable(); // Commentaires du professeur
            
            // Métadonnées
            $table->timestamp('graded_at'); // Date de correction
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['assignment_submission_id']);
            $table->index(['graded_by', 'graded_at']);
            $table->index('graded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_grades');
    }
};
