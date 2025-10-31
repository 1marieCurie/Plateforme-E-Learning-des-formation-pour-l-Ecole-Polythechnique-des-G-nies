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
        // Supprimer la table course_student car elle est remplacée par formation_enrollments
        // qui suit mieux l'architecture Formation -> Cours
        if (Schema::hasTable('course_student')) {
            Schema::dropIfExists('course_student');
            echo "✅ Table course_student supprimée (remplacée par formation_enrollments)\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recréer la table si besoin (pour rollback)
        Schema::create('course_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->integer('rating')->nullable();
            $table->integer('progress')->default(0);
            $table->string('current_chapter')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'course_id']);
        });
    }
};
