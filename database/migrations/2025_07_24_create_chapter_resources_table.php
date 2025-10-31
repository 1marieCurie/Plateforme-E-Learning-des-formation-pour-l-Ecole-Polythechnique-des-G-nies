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
        Schema::create('chapter_resources', function (Blueprint $table) {
            $table->id();
            
            // Relation avec le chapitre
            $table->foreignId('chapter_id')->constrained('chapters')->onDelete('cascade');
            
            // Informations de base
            $table->string('title'); // Titre de la ressource
            $table->text('description')->nullable(); // Description détaillée
            
            // Fichier/Lien
            $table->string('file_path', 500)->nullable(); // Chemin du fichier ou URL
            $table->string('original_filename')->nullable(); // Nom original du fichier
            $table->enum('file_type', ['pdf', 'video', 'image', 'document', 'link', 'audio', 'archive']); // Type de ressource
            $table->bigInteger('file_size')->nullable(); // Taille en bytes (plus précis que KB)
            $table->string('mime_type')->nullable(); // Type MIME du fichier
            
            // Métadonnées spécifiques
            $table->integer('duration_seconds')->nullable(); // Durée pour vidéos/audios
            $table->json('metadata')->nullable(); // Métadonnées spécifiques (résolution vidéo, etc.)
            
            // Gestion des accès
            $table->boolean('is_downloadable')->default(true); // Téléchargeable
            $table->boolean('is_required')->default(false); // Ressource obligatoire
            $table->boolean('is_active')->default(true); // Ressource active
            
            // Organisation
            $table->integer('order_index')->default(0); // Ordre d'affichage
            
            // Statistiques
            $table->integer('download_count')->default(0); // Nombre de téléchargements
            $table->integer('view_count')->default(0); // Nombre de vues
            
            // Restrictions d'accès (optionnel)
            $table->enum('access_level', ['free', 'enrolled', 'premium'])->default('enrolled'); // Niveau d'accès requis
            $table->timestamp('available_from')->nullable(); // Date de disponibilité
            $table->timestamp('available_until')->nullable(); // Date d'expiration
            
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['chapter_id', 'order_index']); // Ressources d'un chapitre par ordre
            $table->index(['chapter_id', 'is_active']); // Ressources actives d'un chapitre
            $table->index(['file_type', 'is_active']); // Filtrage par type
            $table->index('order_index'); // Tri par ordre
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapter_resources');
    }
};
