<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeacherProfile extends Model
{
    protected $fillable = [
        'user_id',
        'specialite',
        'bio',
        'experience_years',
        'photo',
        'linkedin_url',
        'website_url',
        'certifications',
        'skills',
        'is_verified',
        'average_rating',
        'total_students',
        'total_formations',
        'total_courses',
        'last_login_at'
    ];

    protected $casts = [
        'certifications' => 'array',
        'skills' => 'array',
        'is_verified' => 'boolean',
        'average_rating' => 'decimal:2',
        'last_login_at' => 'datetime',
    ];

    /**
     * Profil formateur appartient à un utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Formations créées par ce formateur
     */
    public function formations(): HasMany
    {
        return $this->hasMany(Formation::class, 'teacher_id', 'user_id');
    }


    /**
     * Nombre réel de cours créés par ce formateur (format attendu par le frontend)
     */
    public function getTotalCoursesAttribute()
    {
        // Retourne un entier, compatible avec le frontend
        return (int) \App\Models\Course::whereHas('formation', function ($q) {
            $q->where('teacher_id', $this->user_id);
        })->count();
    }

    /**
     * Nombre réel d'étudiants inscrits dans les formations du formateur
     */
    public function getTotalStudentsAttribute()
    {
        return \App\Models\FormationEnrollment::whereHas('formation', function($q) {
            $q->where('teacher_id', $this->user_id);
        })->distinct()->count('user_id');
    }

    /**
     * Obtenir la photo complète avec URL
     */
    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo ? asset('storage/' . $this->photo) : null;
    }

    /**
     * Obtenir le nombre d'étudiants actifs
     */
    public function getActiveStudentsCountAttribute(): int
    {
        return $this->formations()
                    ->withCount(['students' => function($query) {
                        $query->whereNull('completed_at');
                    }])
                    ->get()
                    ->sum('students_count');
    }

    /**
     * Obtenir le taux de réussite
     */
    public function getSuccessRateAttribute(): float
    {
        $totalEnrollments = $this->formations()
                                ->withCount('students')
                                ->get()
                                ->sum('students_count');

        if ($totalEnrollments === 0) {
            return 0.0;
        }

        $completedEnrollments = $this->formations()
                                    ->withCount(['students' => function($query) {
                                        $query->whereNotNull('completed_at');
                                    }])
                                    ->get()
                                    ->sum('students_count');

        return round(($completedEnrollments / $totalEnrollments) * 100, 2);
    }

    /**
     * Mettre à jour les statistiques du formateur
     */
    public function updateStats(): void
    {
        // Calculer le nombre total d'étudiants inscrits
        $totalStudents = \App\Models\FormationEnrollment::whereHas('formation', function($q) {
            $q->where('teacher_id', $this->user_id);
        })->distinct()->count('user_id');

        $this->update([
            'total_formations' => $this->formations()->count(),
            // 'total_courses' retiré, calculé dynamiquement
            'total_students' => $totalStudents,
        ]);
    }

    /**
     * Calculer la note moyenne des formations
     */
    public function calculateAverageRating(): void
    {
        $averageRating = $this->formations()
                             ->where('average_rating', '>', 0)
                             ->avg('average_rating');

        $this->update([
            'average_rating' => $averageRating ? round($averageRating, 2) : 0.00
        ]);
    }

    /**
     * Scopes pour les requêtes
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeBySpeciality($query, $specialite)
    {
        return $query->where('specialite', 'like', "%{$specialite}%");
    }

    public function scopeTopRated($query, $minRating = 4.0)
    {
        return $query->where('average_rating', '>=', $minRating);
    }

    public function scopeWithExperience($query, $minYears = 1)
    {
        return $query->where('experience_years', '>=', $minYears);
    }

    public function scopeActive($query)
    {
        return $query->whereHas('user', function($q) {
            $q->where('role', 'formateur');
        });
    }
}
