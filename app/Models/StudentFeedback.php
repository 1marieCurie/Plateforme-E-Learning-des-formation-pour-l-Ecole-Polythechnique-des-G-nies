<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentFeedback extends Model
{
    use HasFactory;

    // Le nom par défaut inféré serait "student_feedback" car "feedback" est invariable en anglais.
    // Notre table réelle est "student_feedbacks" (avec un 's'), on le force donc explicitement.
    protected $table = 'student_feedbacks';

    protected $fillable = [
        'student_id',
        'teacher_id',
        'course_id',
        'rating',
        'title',
        'message',
        'content_quality_rating',
        'teaching_method_rating',
        'difficulty_level_rating',
        'support_rating',
        'suggestions',
        'is_anonymous',
        'is_public',
        'status',
        'admin_response'
    ];

    protected $casts = [
        'rating' => 'decimal:1',
        'content_quality_rating' => 'integer',
        'teaching_method_rating' => 'integer',
        'difficulty_level_rating' => 'integer',
        'support_rating' => 'integer',
        'is_anonymous' => 'boolean',
        'is_public' => 'boolean'
    ];

    /**
     * Le feedback appartient à un étudiant
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Le feedback concerne un formateur
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Le feedback concerne un cours
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Obtenir la moyenne des évaluations détaillées
     */
    public function getDetailedRatingAverageAttribute(): float
    {
        $ratings = [
            $this->content_quality_rating,
            $this->teaching_method_rating,
            $this->difficulty_level_rating,
            $this->support_rating
        ];

        $validRatings = array_filter($ratings, fn($rating) => $rating !== null);
        
        if (empty($validRatings)) {
            return 0;
        }

        return round(array_sum($validRatings) / count($validRatings), 1);
    }

    /**
     * Vérifier si le feedback est positif (>= 4/5)
     */
    public function isPositive(): bool
    {
        return $this->rating >= 4.0;
    }

    /**
     * Obtenir l'appréciation textuelle selon la note
     */
    public function getAppreciationAttribute(): string
    {
        if ($this->rating >= 4.5) return 'Excellent';
        if ($this->rating >= 4.0) return 'Très bien';
        if ($this->rating >= 3.0) return 'Bien';
        if ($this->rating >= 2.0) return 'Moyen';
        return 'À améliorer';
    }

    /**
     * Scopes pour les requêtes courantes
     */
    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    public function scopeForTeacher($query, int $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    public function scopeByStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true)->where('status', 'approved');
    }

    public function scopePositive($query)
    {
        return $query->where('rating', '>=', 4.0);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope pour obtenir les statistiques d'un cours
     */
    public function scopeCourseStats($query, int $courseId)
    {
        return $query->where('course_id', $courseId)
                    ->where('status', 'approved')
                    ->selectRaw('
                        COUNT(*) as total_feedbacks,
                        AVG(rating) as average_rating,
                        AVG(content_quality_rating) as avg_content_quality,
                        AVG(teaching_method_rating) as avg_teaching_method,
                        AVG(difficulty_level_rating) as avg_difficulty_level,
                        AVG(support_rating) as avg_support,
                        COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_count
                    ');
    }

    /**
     * Scope pour obtenir les statistiques d'un formateur
     */
    public function scopeTeacherStats($query, int $teacherId)
    {
        return $query->where('teacher_id', $teacherId)
                    ->where('status', 'approved')
                    ->selectRaw('
                        COUNT(*) as total_feedbacks,
                        AVG(rating) as average_rating,
                        COUNT(DISTINCT course_id) as courses_evaluated,
                        COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_count
                    ');
    }
}
