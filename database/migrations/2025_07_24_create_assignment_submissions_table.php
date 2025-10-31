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
        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            
            // Relations
            $table->foreignId('assignment_id')->constrained('assignments')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Étudiant qui soumet
            
            // Fichier soumis
            $table->string('file_path', 500)->nullable(); // Chemin du fichier uploadé
            $table->string('original_filename', 255)->nullable(); // Nom original du fichier
            
            // Texte de soumission (pour les devoirs texte/QCM)
            $table->text('submission_text')->nullable();
            
            // Métadonnées de soumission
            $table->timestamp('submitted_at')->nullable(); // Date de soumission
            $table->boolean('is_late')->default(false); // Soumission en retard
            
            $table->timestamps();
            
            // Contrainte unique : un étudiant ne peut soumettre qu'une fois par devoir
            $table->unique(['user_id', 'assignment_id'], 'unique_user_assignment');
            
            // Index pour optimiser les requêtes
            $table->index(['assignment_id', 'submitted_at']);
            $table->index(['user_id', 'is_late']);
            $table->index('submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_submissions');
    }
};
