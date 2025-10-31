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
        Schema::create('course_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->integer('completed_chapters')->default(0);
            $table->integer('total_chapters')->default(0);
            $table->string('last_chapter')->nullable();
            $table->timestamp('last_accessed')->nullable();
            $table->integer('time_spent_minutes')->default(0);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Index pour optimiser les requêtes
            $table->unique(['user_id', 'course_id']);
            $table->index(['user_id', 'progress_percentage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_progress');
    }
};
