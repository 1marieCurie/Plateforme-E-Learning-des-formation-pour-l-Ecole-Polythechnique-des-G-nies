<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'category',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    /**
     * Catégories de permissions
     */
    const CATEGORY_USERS = 'users';
    const CATEGORY_COURSES = 'courses';
    const CATEGORY_FORMATIONS = 'formations';
    const CATEGORY_CONTENT = 'content';
    const CATEGORY_REPORTS = 'reports';
    const CATEGORY_SYSTEM = 'system';
    const CATEGORY_CERTIFICATES = 'certificates';

    /**
     * Permissions prédéfinies du système
     */
    const PERMISSIONS = [
        // Gestion des utilisateurs
        'create_users' => ['display_name' => 'Créer des utilisateurs', 'category' => self::CATEGORY_USERS],
        'edit_users' => ['display_name' => 'Modifier des utilisateurs', 'category' => self::CATEGORY_USERS],
        'delete_users' => ['display_name' => 'Supprimer des utilisateurs', 'category' => self::CATEGORY_USERS],
        'view_all_users' => ['display_name' => 'Voir tous les utilisateurs', 'category' => self::CATEGORY_USERS],
        'manage_user_roles' => ['display_name' => 'Gérer les rôles utilisateurs', 'category' => self::CATEGORY_USERS],
        'manage_permissions' => ['display_name' => 'Gérer les permissions', 'category' => self::CATEGORY_USERS],

        // Gestion des cours
        'create_courses' => ['display_name' => 'Créer des cours', 'category' => self::CATEGORY_COURSES],
        'edit_all_courses' => ['display_name' => 'Modifier tous les cours', 'category' => self::CATEGORY_COURSES],
        'delete_courses' => ['display_name' => 'Supprimer des cours', 'category' => self::CATEGORY_COURSES],
        'view_all_courses' => ['display_name' => 'Voir tous les cours', 'category' => self::CATEGORY_COURSES],
        'manage_course_enrollment' => ['display_name' => 'Gérer les inscriptions aux cours', 'category' => self::CATEGORY_COURSES],

        // Gestion des formations
        'create_formations' => ['display_name' => 'Créer des formations', 'category' => self::CATEGORY_FORMATIONS],
        'edit_all_formations' => ['display_name' => 'Modifier toutes les formations', 'category' => self::CATEGORY_FORMATIONS],
        'delete_formations' => ['display_name' => 'Supprimer des formations', 'category' => self::CATEGORY_FORMATIONS],
        'view_all_formations' => ['display_name' => 'Voir toutes les formations', 'category' => self::CATEGORY_FORMATIONS],
        'manage_formation_enrollment' => ['display_name' => 'Gérer les inscriptions aux formations', 'category' => self::CATEGORY_FORMATIONS],

        // Gestion du contenu
        'manage_chapters' => ['display_name' => 'Gérer les chapitres', 'category' => self::CATEGORY_CONTENT],
        'manage_resources' => ['display_name' => 'Gérer les ressources', 'category' => self::CATEGORY_CONTENT],
        'manage_assignments' => ['display_name' => 'Gérer les devoirs', 'category' => self::CATEGORY_CONTENT],
        'grade_assignments' => ['display_name' => 'Noter les devoirs', 'category' => self::CATEGORY_CONTENT],

        // Gestion des certificats
        'issue_certificates' => ['display_name' => 'Émettre des certificats', 'category' => self::CATEGORY_CERTIFICATES],
        'revoke_certificates' => ['display_name' => 'Révoquer des certificats', 'category' => self::CATEGORY_CERTIFICATES],
        'manage_certificate_templates' => ['display_name' => 'Gérer les modèles de certificats', 'category' => self::CATEGORY_CERTIFICATES],

        // Rapports et statistiques
        'view_reports' => ['display_name' => 'Voir les rapports', 'category' => self::CATEGORY_REPORTS],
        'view_analytics' => ['display_name' => 'Voir les statistiques', 'category' => self::CATEGORY_REPORTS],
        'export_data' => ['display_name' => 'Exporter des données', 'category' => self::CATEGORY_REPORTS],

        // Administration système
        'system_settings' => ['display_name' => 'Paramètres système', 'category' => self::CATEGORY_SYSTEM],
        'backup_restore' => ['display_name' => 'Sauvegarde et restauration', 'category' => self::CATEGORY_SYSTEM],
        'view_logs' => ['display_name' => 'Voir les logs système', 'category' => self::CATEGORY_SYSTEM],
        'maintenance_mode' => ['display_name' => 'Mode maintenance', 'category' => self::CATEGORY_SYSTEM],
    ];

    /**
     * Les utilisateurs qui ont cette permission
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_permissions')
                    ->withPivot(['granted_at', 'granted_by', 'expires_at', 'is_active'])
                    ->withTimestamps();
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Créer toutes les permissions par défaut
     */
    public static function createDefaultPermissions(): void
    {
        foreach (self::PERMISSIONS as $name => $details) {
            self::firstOrCreate(
                ['name' => $name],
                [
                    'display_name' => $details['display_name'],
                    'category' => $details['category'],
                    'description' => $details['description'] ?? null,
                    'is_active' => true
                ]
            );
        }
    }
}
