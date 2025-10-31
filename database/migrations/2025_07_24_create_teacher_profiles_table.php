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
        Schema::create('teacher_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Relation 1:1 avec users
            $table->string('specialite')->nullable(); // Spécialité du formateur
            $table->text('bio')->nullable(); // Biographie/présentation
            $table->integer('experience_years')->default(0); // Années d'expérience
            $table->string('photo')->nullable(); // Photo de profil
            $table->string('linkedin_url')->nullable(); // Profil LinkedIn
            $table->string('website_url')->nullable(); // Site web personnel
            $table->json('certifications')->nullable(); // Certifications du formateur
            $table->json('skills')->nullable(); // Compétences techniques
            $table->boolean('is_verified')->default(false); // Formateur vérifié par admin
            $table->decimal('average_rating', 3, 2)->default(0.00); // Note moyenne (0.00 à 5.00)
            $table->integer('total_students')->default(0); // Nombre total d'étudiants formés
            $table->integer('total_formations')->default(0); // Nombre de formations créées
            $table->integer('total_courses')->default(0); // Nombre de cours créés
            $table->timestamp('last_login_at')->nullable(); // Dernière connexion
            $table->timestamps();

            // Index pour les requêtes fréquentes
            $table->index('average_rating');
            $table->index('is_verified');
            $table->index(['specialite', 'is_verified']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_profiles');
    }
};
