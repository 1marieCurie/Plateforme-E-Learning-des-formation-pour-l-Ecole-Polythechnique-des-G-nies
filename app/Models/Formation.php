<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Formation extends Model
{
    protected $fillable = [
        'title',
        'description',
        'image',
        'teacher_id',
        'category_id',
        'price',
        'duration_hours',
        'difficulty_level',
        'is_active',
        'total_enrolled',
        'average_rating'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Formation appartient à un formateur
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Formation appartient à une catégorie
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Formation contient plusieurs cours (relation directe)
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class)->orderBy('order_index');
    }

    /**
     * Étudiants inscrits à cette formation
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'formation_enrollments')
                    ->withPivot([
                        'enrolled_at',
                        'progress_percentage',
                        'completed_at',
                        'certificate_issued',
                        'amount_paid',
                        'payment_status'
                    ])
                    ->withTimestamps();
    }

    /**
     * Inscriptions à cette formation
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(FormationEnrollment::class);
    }

    /**
     * Feedbacks des formateurs dans cette formation
     */
    public function teacherFeedbacks(): HasMany
    {
        return $this->hasMany(TeacherFeedback::class);
    }

    /**
     * Cours actifs de la formation
     */
    public function activeCourses(): HasMany
    {
        return $this->courses()->where('is_active', true);
    }

    /**
     * Vérifier si un utilisateur est inscrit
     */
    public function isEnrolledBy(User $user): bool
    {
        return $this->students()->where('user_id', $user->id)->exists();
    }

    /**
     * Obtenir la progression d'un étudiant
     */
    public function getStudentProgress(User $user): ?float
    {
        $enrollment = $this->students()->where('user_id', $user->id)->first();
        return $enrollment ? $enrollment->pivot->progress_percentage : null;
    }

    /**
     * Calculer la durée totale de la formation
     */
    public function getTotalDurationAttribute(): int
    {
        return $this->courses->sum('duration_minutes');
    }

    /**
     * Obtenir le nombre de cours dans la formation
     */
    public function getCourseCountAttribute(): int
    {
        return $this->courses()->count();
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    /**
     * Relation avec les certificats de formation
     */
    public function certificates()
    {
        return $this->hasMany(FormationCertificate::class);
    }

    /**
     * Vérifier si un utilisateur a un certificat pour cette formation
     */
    public function hasCertificateForUser(User $user): bool
    {
        return $this->certificates()
            ->where('user_id', $user->id)
            ->where('is_valid', true)
            ->exists();
    }

    /**
     * Obtenir le certificat d'un utilisateur pour cette formation
     */
    public function getCertificateForUser(User $user): ?FormationCertificate
    {
        return $this->certificates()
            ->where('user_id', $user->id)
            ->where('is_valid', true)
            ->first();
    }

    /**
     * Vérifier si un utilisateur a terminé tous les cours de la formation
     */
    public function isCompletedByUser(User $user): bool
    {
        $totalCourses = $this->courses()->active()->count();
        $completedCourses = $this->courses()
            ->active()
            ->whereHas('certificates', function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->where('is_valid', true);
            })
            ->count();

        return $totalCourses > 0 && $completedCourses === $totalCourses;
    }
}
