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
        // Ajouter des contraintes UNIQUE sur formation_enrollments
        if (Schema::hasTable('formation_enrollments')) {
            Schema::table('formation_enrollments', function (Blueprint $table) {
                // Éviter qu'un utilisateur s'inscrive plusieurs fois à la même formation
                try {
                    $table->unique(['user_id', 'formation_id'], 'unique_user_formation');
                    echo "✅ Contrainte unique ajoutée sur formation_enrollments\n";
                } catch (Exception $e) {
                    echo "⚠️  Constraint déjà existante sur formation_enrollments\n";
                }
                
                // Index pour performance
                $table->index('user_id', 'idx_formation_enrollments_user');
                $table->index('formation_id', 'idx_formation_enrollments_formation');
            });
        }

        // Ajouter des contraintes UNIQUE sur user_permissions
        if (Schema::hasTable('user_permissions')) {
            Schema::table('user_permissions', function (Blueprint $table) {
                // La contrainte unique existe déjà dans la migration originale
                echo "✅ Contrainte unique déjà existante sur user_permissions\n";
                
                // Index pour performance (s'ils n'existent pas déjà)
                try {
                    $table->index('user_id', 'idx_user_permissions_user_extra');
                    echo "✅ Index supplémentaire ajouté sur user_permissions\n";
                } catch (Exception $e) {
                    echo "⚠️  Index déjà existant sur user_permissions\n";
                }
            });
        }

        // Ajouter des contraintes UNIQUE sur course_certificates
        if (Schema::hasTable('course_certificates')) {
            Schema::table('course_certificates', function (Blueprint $table) {
                // Un utilisateur ne peut avoir qu'un certificat par cours
                try {
                    $table->unique(['user_id', 'course_id'], 'unique_user_course_certificate');
                    echo "✅ Contrainte unique ajoutée sur course_certificates\n";
                } catch (Exception $e) {
                    echo "⚠️  Constraint déjà existante sur course_certificates\n";
                }
                
                // Numéro de certificat unique
                try {
                    $table->unique('certificate_number', 'unique_course_certificate_number');
                    echo "✅ Contrainte unique sur certificate_number (course_certificates)\n";
                } catch (Exception $e) {
                    echo "⚠️  Constraint déjà existante sur certificate_number (course_certificates)\n";
                }
            });
        }

        // Ajouter des contraintes UNIQUE sur formation_certificates
        if (Schema::hasTable('formation_certificates')) {
            Schema::table('formation_certificates', function (Blueprint $table) {
                // Un utilisateur ne peut avoir qu'un certificat par formation
                try {
                    $table->unique(['user_id', 'formation_id'], 'unique_user_formation_certificate');
                    echo "✅ Contrainte unique ajoutée sur formation_certificates\n";
                } catch (Exception $e) {
                    echo "⚠️  Constraint déjà existante sur formation_certificates\n";
                }
                
                // Numéro de certificat unique
                try {
                    $table->unique('certificate_number', 'unique_formation_certificate_number');
                    echo "✅ Contrainte unique sur certificate_number (formation_certificates)\n";
                } catch (Exception $e) {
                    echo "⚠️  Constraint déjà existante sur certificate_number (formation_certificates)\n";
                }
            });
        }

        echo "\n🎉 CONTRAINTES ET INDEX AJOUTÉS AVEC SUCCÈS !\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer les contraintes ajoutées
        if (Schema::hasTable('formation_enrollments')) {
            Schema::table('formation_enrollments', function (Blueprint $table) {
                $table->dropUnique('unique_user_formation');
                $table->dropIndex('idx_formation_enrollments_user');
                $table->dropIndex('idx_formation_enrollments_formation');
            });
        }

        if (Schema::hasTable('user_permissions')) {
            Schema::table('user_permissions', function (Blueprint $table) {
                $table->dropUnique('unique_user_permission');
                $table->dropIndex('idx_user_permissions_user');
                $table->dropIndex('idx_user_permissions_active');
            });
        }

        if (Schema::hasTable('course_certificates')) {
            Schema::table('course_certificates', function (Blueprint $table) {
                $table->dropUnique('unique_user_course_certificate');
                $table->dropUnique('unique_course_certificate_number');
            });
        }

        if (Schema::hasTable('formation_certificates')) {
            Schema::table('formation_certificates', function (Blueprint $table) {
                $table->dropUnique('unique_user_formation_certificate');
                $table->dropUnique('unique_formation_certificate_number');
            });
        }
    }
};
