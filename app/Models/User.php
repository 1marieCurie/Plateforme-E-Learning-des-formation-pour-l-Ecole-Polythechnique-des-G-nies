<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;


class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Évaluations reçues par l'étudiant
     */
    public function evaluations()
    {
        return $this->hasMany(Evaluation::class, 'student_id');
    }

    /**
     * Évaluations données par l'utilisateur (professeur)
     */
    public function givenEvaluations()
    {
        return $this->hasMany(Evaluation::class, 'evaluated_by');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'email',
        'password',
        'tel',        
        'indicatif', 
        'ville',     
        'villeOrigine',
        'naissance',   
        'role',
        'is_super_admin',        
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
        ];
    }
    //implémentation des methodes de l'interface JWTSubject

     public function getJWTIdentifier()
    {
        return $this->getKey(); // généralement l'ID
    }

    public function getJWTCustomClaims()
    {
        return []; // tu peux ajouter des claims ici si besoin
    }

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }
     public function adminProfile()
{
    return $this->hasOne(AdminProfile::class);
}

    public function teacherProfile()
    {
        return $this->hasOne(TeacherProfile::class);
    }

    // ANCIENNE RELATION - À SUPPRIMER PROGRESSIVEMENT
    // Relation many-to-many avec les cours
    /**
     * Retourne tous les cours accessibles via les formations auxquelles l'utilisateur est inscrit
     */
    public function courses()
    {
        return Course::whereIn('formation_id', function($query) {
            $query->select('formation_id')
                ->from('formation_enrollments')
                ->where('user_id', $this->id);
        });
    }

    // NOUVELLES RELATIONS - ARCHITECTURE SIMPLIFIÉE

    /**
     * Formations auxquelles l'utilisateur est inscrit
     */
    public function formations()
    {
        return $this->belongsToMany(Formation::class, 'formation_enrollments')
                    ->withPivot([
                        'enrolled_at',
                        'progress_percentage',
                        'completed_at',
                        'certificate_issued',
                        'amount_paid'
                    ])
                    ->withTimestamps();
    }

    /**
     * Inscriptions aux formations
     */
    public function formationEnrollments()
    {
        return $this->hasMany(FormationEnrollment::class);
    }

    /**
     * Formations créées (pour les formateurs)
     */
    public function createdFormations()
    {
        return $this->hasMany(Formation::class, 'teacher_id');
    }

    /**
     * Devoirs soumis par l'utilisateur (étudiant)
     */
    public function assignments()
    {
        return $this->hasMany(Assignment::class, 'student_id');
    }

    /**
     * Devoirs créés par l'utilisateur (formateur)
     */
    public function createdAssignments()
    {
        return $this->hasMany(Assignment::class, 'teacher_id');
    }

    /**
     * Soumissions de devoirs de l'utilisateur (étudiant)
     */
    public function assignmentSubmissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    /**
     * Notes données par l'utilisateur (formateur)
     */
    public function givenGrades()
    {
        return $this->hasMany(AssignmentGrade::class, 'graded_by');
    }

    /**
     * Feedbacks donnés par l'utilisateur (étudiant)
     */
    public function givenFeedbacks()
    {
        return $this->hasMany(StudentFeedback::class, 'student_id');
    }

    /**
     * Feedbacks reçus par l'utilisateur (formateur)
     */
    public function receivedFeedbacks()
    {
        return $this->hasMany(StudentFeedback::class, 'teacher_id');
    }

    /**
     * Feedbacks donnés par l'utilisateur en tant que formateur
     */
    public function givenTeacherFeedbacks()
    {
        return $this->hasMany(TeacherFeedback::class, 'teacher_id');
    }

    /**
     * Feedbacks reçus par l'utilisateur en tant qu'étudiant
     */
    public function receivedTeacherFeedbacks()
    {
        return $this->hasMany(TeacherFeedback::class, 'student_id');
    }

    /**
     * Cours accessibles via les formations
     */
    public function accessibleCourses()
    {
        return $this->formations()
                    ->with('courses')
                    ->get()
                    ->pluck('courses')
                    ->flatten()
                    ->unique('id');
    }

    // Dans User.php relation inverse des CourseEnrollement et CourseProgress
    public function categoryProgresses()
    {
        return $this->hasMany(CategoryProgress::class);
    }

    /**
     * Vérifier si l'utilisateur a accès à une formation
     */
    public function hasAccessToFormation(Formation $formation): bool
    {
        return $this->formations()->where('formation_id', $formation->id)->exists();
    }

    /**
     * Vérifier si l'utilisateur est formateur
     */
    public function isTeacher(): bool
    {
        return $this->role === 'formateur';
    }

    /**
     * Vérifier si l'utilisateur est étudiant
     */
    public function isStudent(): bool
    {
        return $this->role === 'etudiant';
    }

    /**
     * Vérifier si l'utilisateur a un abonnement premium actif
     * (Pour l'instant, retourne false - à implémenter selon vos besoins)
     */
    public function hasActivePremiumSubscription(): bool
    {
        // TODO: Implémenter la logique d'abonnement premium
        // Cela pourrait impliquer une table subscriptions, 
        // vérifier les dates d'expiration, le statut de paiement, etc.
        return false;
    }

    /**
     * Relations avec les certificats
     */
    public function courseCertificates()
    {
        return $this->hasMany(CourseCertificate::class);
    }

    public function formationCertificates()
    {
        return $this->hasMany(FormationCertificate::class);
    }

    public function issuedCourseCertificates()
    {
        return $this->hasMany(CourseCertificate::class, 'issued_by');
    }

    public function issuedFormationCertificates()
    {
        return $this->hasMany(FormationCertificate::class, 'issued_by');
    }

    /**
     * Relations avec les permissions
     */
    public function permissions()
    {
        return $this->hasMany(UserPermission::class);
    }

    public function activePermissions()
    {
        return $this->hasMany(UserPermission::class)->active();
    }

    public function grantedPermissions()
    {
        return $this->hasMany(UserPermission::class, 'granted_by');
    }

    /**
     * Vérifier si l'utilisateur est Super Admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Vérifier si l'utilisateur a une permission spécifique
     */
    public function hasPermission(string $permission): bool
    {
        // Super Admin a toutes les permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->activePermissions()
                   ->where('permission_name', $permission)
                   ->exists();
    }

    /**
     * Vérifier si l'utilisateur a au moins une des permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->activePermissions()
                   ->whereIn('permission_name', $permissions)
                   ->exists();
    }

    /**
     * Obtenir toutes les permissions actives de l'utilisateur
     */
    public function getAllPermissions(): array
    {
        if ($this->isSuperAdmin()) {
            return array_keys(UserPermission::PERMISSIONS);
        }

        return $this->activePermissions()
                   ->pluck('permission_name')
                   ->toArray();
    }

    /**
     * Promouvoir un formateur en admin (seul le Super Admin peut le faire)
     */
    public function promoteToAdmin(User $targetUser, User $grantedBy): bool
    {
        if (!$grantedBy->isSuperAdmin()) {
            return false;
        }

        if ($targetUser->role !== 'formateur') {
            return false;
        }

        $targetUser->update(['role' => 'admin']);
        
        // Accorder des permissions de base à l'admin
        $basicAdminPermissions = [
            'view_users',
            'manage_own_formations', 
            'manage_own_courses',
            'view_analytics'
        ];

        foreach ($basicAdminPermissions as $permission) {
            UserPermission::grantPermission(
                $targetUser, 
                $permission, 
                $grantedBy,
                'Permission accordée lors de la promotion en admin'
            );
        }

        return true;
    }

    /**
     * Accorder une permission (seul Super Admin ou admin avec manage_permissions)
     */
    public function grantPermissionTo(User $targetUser, string $permission, User $grantedBy): bool
    {
        if (!$grantedBy->isSuperAdmin() && !$grantedBy->hasPermission('manage_permissions')) {
            return false;
        }

        UserPermission::grantPermission($targetUser, $permission, $grantedBy);
        return true;
    }

    /**
     * Révoquer une permission
     */
    public function revokePermissionFrom(User $targetUser, string $permission, User $revokedBy): bool
    {
        if (!$revokedBy->isSuperAdmin() && !$revokedBy->hasPermission('manage_permissions')) {
            return false;
        }

        return UserPermission::revokePermission($targetUser, $permission);
    }
}
