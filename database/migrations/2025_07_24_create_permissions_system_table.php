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
        // Table des permissions disponibles dans le système
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Ex: 'create_users', 'manage_courses', 'view_reports'
            $table->string('display_name'); // Nom affiché : "Créer des utilisateurs"
            $table->string('description')->nullable(); // Description détaillée
            $table->string('category')->default('general'); // Catégorie : 'users', 'courses', 'reports', 'system'
            $table->boolean('is_active')->default(true); // Permission active/inactive
            $table->timestamps();

            $table->index(['category', 'is_active']);
        });

        // Table pivot pour assigner les permissions aux utilisateurs
        Schema::create('user_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('permission_id')->constrained('permissions')->onDelete('cascade');
            $table->timestamp('granted_at')->default(now()); // Quand la permission a été accordée
            $table->foreignId('granted_by')->nullable()->constrained('users')->onDelete('set null'); // Qui a accordé la permission
            $table->timestamp('expires_at')->nullable(); // Expiration optionnelle
            $table->boolean('is_active')->default(true); // Permission active pour cet utilisateur
            $table->timestamps();

            // Un utilisateur ne peut avoir qu'une seule fois la même permission
            $table->unique(['user_id', 'permission_id']);
            $table->index(['user_id', 'is_active']);
            $table->index(['expires_at', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_permissions');
        Schema::dropIfExists('permissions');
    }
};
