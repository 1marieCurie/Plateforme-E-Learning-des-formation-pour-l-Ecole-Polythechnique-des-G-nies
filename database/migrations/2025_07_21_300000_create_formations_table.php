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
        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            $table->string('title')->index(); // Titre de la formation
            $table->text('description')->nullable();
            $table->string('image')->nullable(); // Image de la formation
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade'); // Formateur créateur
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade'); // Catégorie principale
            $table->decimal('price', 10, 2)->default(0.00); // Prix de la formation
            $table->integer('duration_hours')->default(0); // Durée estimée
            $table->enum('difficulty_level', ['debutant', 'intermediaire', 'avance'])->default('debutant');
            $table->boolean('is_active')->default(true);
            $table->integer('total_enrolled')->default(0); // Nombre d'inscrits
            $table->decimal('average_rating', 3, 2)->default(0.00); // Note moyenne
            $table->timestamps();
        });
        
        // SUPPRESSION DE LA TABLE PIVOT - Les cours appartiennent directement aux formations
        // formation_courses n'est plus nécessaire
        
        // Table pour les inscriptions aux formations (POINT D'ENTRÉE UNIQUE)
        Schema::create('formation_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('formation_id')->constrained('formations')->onDelete('cascade');
            $table->timestamp('enrolled_at')->nullable();
            $table->decimal('progress_percentage', 5, 2)->default(0.00);
            $table->timestamp('completed_at')->nullable();
            $table->boolean('certificate_issued')->default(false);
            $table->decimal('amount_paid', 10, 2)->default(0.00); // Montant payé
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->timestamps();
            
            $table->unique(['user_id', 'formation_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formation_enrollments');
        Schema::dropIfExists('formations');
    }
};
