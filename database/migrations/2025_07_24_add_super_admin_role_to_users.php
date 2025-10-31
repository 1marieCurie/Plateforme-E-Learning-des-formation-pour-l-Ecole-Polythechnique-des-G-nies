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
        Schema::table('users', function (Blueprint $table) {
            // Modifier l'enum role pour inclure super_admin
            $table->enum('role', ['etudiant', 'formateur', 'admin', 'super_admin'])->default('etudiant')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['etudiant', 'formateur', 'admin'])->default('etudiant')->change();
        });
    }
};
