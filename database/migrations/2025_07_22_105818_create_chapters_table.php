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
        Schema::create('chapters', function (Blueprint $table) {
        $table->id();
        $table->string('titre');
        $table->text('description')->nullable(); // ou 'description', selon ton besoin
        $table->foreignId('course_id')->constrained()->onDelete('cascade'); // si un chapitre appartient à un cours
        $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapters');
    }
};
