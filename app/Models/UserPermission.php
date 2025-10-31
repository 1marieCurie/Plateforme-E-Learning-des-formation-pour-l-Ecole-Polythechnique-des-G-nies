<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'permission_name',
        'permission_description',
        'permission_data',
        'is_active',
        'granted_by',
        'granted_at',
        'expires_at'
    ];

    protected $casts = [
        'permission_data' => 'array',
        'is_active' => 'boolean',
        'granted_at' => 'datetime',
        'expires_at' => 'datetime'
    ];

    /**
     * Permissions disponibles dans le système
     */
    const PERMISSIONS = [
        // Gestion des utilisateurs
        'manage_users' => 'Gérer les utilisateurs (créer, modifier, supprimer)',
        'promote_users' => 'Promouvoir des utilisateurs (formateur → admin)',
        'view_users' => 'Voir la liste des utilisateurs',
        
        // Gestion des formations
        'manage_formations' => 'Gérer toutes les formations',
        'create_formations' => 'Créer de nouvelles formations',
        'manage_own_formations' => 'Gérer ses propres formations',
        
        // Gestion des cours
        'manage_courses' => 'Gérer tous les cours',
        'approve_courses' => 'Approuver les cours créés par les formateurs',
        'manage_own_courses' => 'Gérer ses propres cours',
        
        // Gestion des certificats
        'issue_certificates' => 'Émettre des certificats',
        'revoke_certificates' => 'Révoquer des certificats',
        'view_all_certificates' => 'Voir tous les certificats',
        
        // Administration
        'view_analytics' => 'Voir les statistiques et analyses',
        'manage_categories' => 'Gérer les catégories de formation',
        'manage_permissions' => 'Gérer les permissions des autres utilisateurs',
        'system_settings' => 'Modifier les paramètres système',
        
        // Modération
        'moderate_content' => 'Modérer le contenu de la plateforme',
        'manage_feedback' => 'Gérer les avis et commentaires',
        'handle_reports' => 'Traiter les signalements',
    ];

    /**
     * Relations
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    /**
     * Vérifier si la permission est active et non expirée
     */
    public function isActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->expires_at && now() > $this->expires_at) {
            return false;
        }

        return true;
    }

    /**
     * Obtenir la description de la permission
     */
    public function getPermissionDescriptionAttribute(): string
    {
        return $this->attributes['permission_description'] ?? 
               self::PERMISSIONS[$this->permission_name] ?? 
               'Permission personnalisée';
    }

    /**
     * Accorder une permission à un utilisateur
     */
    public static function grantPermission(
        User $user, 
        string $permission, 
        User $grantedBy, 
        ?string $description = null,
        ?array $data = null,
        ?\DateTime $expiresAt = null
    ): self {
        return self::updateOrCreate(
            [
                'user_id' => $user->id,
                'permission_name' => $permission
            ],
            [
                'permission_description' => $description,
                'permission_data' => $data,
                'is_active' => true,
                'granted_by' => $grantedBy->id,
                'granted_at' => now(),
                'expires_at' => $expiresAt
            ]
        );
    }

    /**
     * Révoquer une permission
     */
    public static function revokePermission(User $user, string $permission): bool
    {
        return self::where('user_id', $user->id)
                  ->where('permission_name', $permission)
                  ->delete() > 0;
    }

    /**
     * Scopes pour les requêtes courantes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where(function($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeWithPermission($query, string $permission)
    {
        return $query->where('permission_name', $permission);
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    public function scopeGrantedBy($query, int $grantedById)
    {
        return $query->where('granted_by', $grantedById);
    }
}
