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
        Schema::create('formation_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Étudiant qui reçoit le certificat
            $table->foreignId('formation_id')->constrained('formations')->onDelete('cascade'); // Formation terminée
            $table->string('certificate_number')->unique(); // Numéro unique du certificat (ex: CERT-FORM-2024-001234)
            $table->string('title'); // Titre du certificat (ex: "Certificat de Formation - Développement Web Complet")
            $table->text('description')->nullable(); // Description détaillée du certificat
            $table->decimal('overall_grade', 5, 2)->nullable(); // Note globale de la formation (sur 100)
            $table->integer('total_hours_completed')->default(0); // Heures totales de formation complétées
            $table->integer('total_courses_completed')->default(0); // Nombre de cours terminés dans la formation
            $table->json('course_certificates')->nullable(); // IDs des certificats de cours obtenus
            $table->json('skills_acquired')->nullable(); // Compétences acquises durant la formation
            $table->json('competency_scores')->nullable(); // Scores par compétence/domaine
            $table->timestamp('formation_started_at')->nullable(); // Date de début de la formation
            $table->timestamp('formation_completed_at'); // Date de fin/réussite de la formation
            $table->timestamp('certificate_issued_at'); // Date d'émission du certificat
            $table->timestamp('certificate_expires_at')->nullable(); // Date d'expiration (si applicable)
            $table->foreignId('issued_by')->constrained('users')->onDelete('cascade'); // Admin/Formateur principal qui a émis le certificat
            $table->string('certificate_template')->default('formation_default'); // Template utilisé pour générer le PDF
            $table->string('certificate_file_path')->nullable(); // Chemin vers le fichier PDF généré
            $table->json('metadata')->nullable(); // Métadonnées supplémentaires (détails parcours, mentions, etc.)
            $table->enum('certificate_level', ['completion', 'excellence', 'distinction'])->default('completion'); // Niveau du certificat
            $table->boolean('is_valid')->default(true); // Validité du certificat
            $table->string('verification_code')->unique(); // Code de vérification publique
            $table->string('digital_signature')->nullable(); // Signature numérique pour authentification
            $table->integer('download_count')->default(0); // Nombre de téléchargements
            $table->timestamp('last_downloaded_at')->nullable(); // Dernière date de téléchargement
            $table->json('verification_log')->nullable(); // Log des vérifications du certificat
            $table->timestamps();

            // Index pour optimiser les recherches
            $table->index(['user_id', 'formation_id']);
            $table->index('certificate_number');
            $table->index('verification_code');
            $table->index('certificate_issued_at');
            $table->index(['is_valid', 'certificate_expires_at']);
            $table->index('certificate_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formation_certificates');
    }
};
