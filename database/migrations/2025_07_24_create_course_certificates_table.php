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
        Schema::create('course_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Étudiant qui reçoit le certificat
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade'); // Cours terminé
            $table->string('certificate_number')->unique(); // Numéro unique du certificat (ex: CERT-COURSE-2024-001234)
            $table->string('title'); // Titre du certificat (ex: "Certificat de réussite - JavaScript Fondamentaux")
            $table->text('description')->nullable(); // Description du certificat
            $table->decimal('final_grade', 5, 2)->nullable(); // Note finale obtenue (sur 100)
            $table->integer('total_hours_completed')->default(0); // Heures totales complétées
            $table->json('completed_chapters')->nullable(); // Liste des chapitres complétés avec détails
            $table->json('assignment_scores')->nullable(); // Scores des devoirs/exercices
            $table->timestamp('course_started_at')->nullable(); // Date de début du cours
            $table->timestamp('course_completed_at'); // Date de fin/réussite du cours
            $table->timestamp('certificate_issued_at'); // Date d'émission du certificat
            $table->timestamp('certificate_expires_at')->nullable(); // Date d'expiration (si applicable)
            $table->foreignId('issued_by')->constrained('users')->onDelete('cascade'); // Formateur/Admin qui a émis le certificat
            $table->string('certificate_template')->default('default'); // Template utilisé pour générer le PDF
            $table->string('certificate_file_path')->nullable(); // Chemin vers le fichier PDF généré
            $table->json('metadata')->nullable(); // Métadonnées supplémentaires (scores détaillés, commentaires, etc.)
            $table->boolean('is_valid')->default(true); // Validité du certificat
            $table->string('verification_code')->unique(); // Code de vérification publique
            $table->integer('download_count')->default(0); // Nombre de téléchargements
            $table->timestamp('last_downloaded_at')->nullable(); // Dernière date de téléchargement
            $table->timestamps();

            // Index pour optimiser les recherches
            $table->index(['user_id', 'course_id']);
            $table->index('certificate_number');
            $table->index('verification_code');
            $table->index('certificate_issued_at');
            $table->index(['is_valid', 'certificate_expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_certificates');
    }
};
