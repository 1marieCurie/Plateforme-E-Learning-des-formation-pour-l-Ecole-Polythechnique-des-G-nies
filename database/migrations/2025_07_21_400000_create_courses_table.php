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
        // Supprimer l'ancienne table courses si elle existe
        Schema::dropIfExists('courses');
        
        // Créer la nouvelle table courses
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title')->index(); // Titre du cours
            $table->text('description')->nullable(); // Description détaillée
            $table->string('image')->nullable(); // Image/miniature du cours
            
            // Relations
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade'); // Domaine
            $table->foreignId('formation_id')->constrained('formations')->onDelete('cascade'); // Formation parente
            
            // Organisation
            $table->integer('order_index')->default(1); // Ordre dans la formation (1, 2, 3...)
            $table->integer('duration_minutes')->default(0); // Durée estimée en minutes
            $table->enum('difficulty_level', ['debutant', 'intermediaire', 'avance'])->default('debutant');
            
            // Contenu pédagogique
            $table->json('prerequisites')->nullable(); // Prérequis ["HTML", "CSS"]
            $table->json('learning_objectives')->nullable(); // Objectifs ["Maîtriser React", "Créer des composants"]
            
            // Gestion
            $table->boolean('is_active')->default(true); // Cours actif/inactif
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['formation_id', 'order_index']);
            $table->index(['category_id', 'is_active']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
