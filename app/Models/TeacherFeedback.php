<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherFeedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'student_id',
        'formation_id',
        'rating',
        'title',
        'message',
        'participation_rating',
        'progress_rating',
        'commitment_rating',
        'technical_skills_rating',
        'recommendations',
        'strengths',
        'areas_for_improvement',
        'is_private',
        'feedback_type',
        'status',
        'read_at'
    ];

    protected $casts = [
        'rating' => 'decimal:1',
        'participation_rating' => 'integer',
        'progress_rating' => 'integer',
        'commitment_rating' => 'integer',
        'technical_skills_rating' => 'integer',
        'is_private' => 'boolean',
        'read_at' => 'datetime'
    ];

    /**
     * Types de feedback possibles
     */
    const TYPE_PROGRESS = 'progress';
    const TYPE_ENCOURAGEMENT = 'encouragement';
    const TYPE_WARNING = 'warning';
    const TYPE_RECOMMENDATION = 'recommendation';
    const TYPE_MILESTONE = 'milestone';

    /**
     * Statuts possibles
     */
    const STATUS_DRAFT = 'draft';
    const STATUS_SENT = 'sent';
    const STATUS_READ = 'read';

    /**
     * Le feedback est donné par un formateur
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Le feedback est destiné à un étudiant
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Le feedback concerne une formation
     */
    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    /**
     * Obtenir la moyenne des évaluations détaillées
     */
    public function getDetailedRatingAverageAttribute(): float
    {
        $ratings = [
            $this->participation_rating,
            $this->progress_rating,
            $this->commitment_rating,
            $this->technical_skills_rating
        ];

        $validRatings = array_filter($ratings, fn($rating) => $rating !== null);
        
        if (empty($validRatings)) {
            return 0;
        }

        return round(array_sum($validRatings) / count($validRatings), 1);
    }

    /**
     * Obtenir l'appréciation textuelle selon la note
     */
    public function getAppreciationAttribute(): string
    {
        if ($this->rating >= 4.5) return 'Excellent';
        if ($this->rating >= 4.0) return 'Très bien';
        if ($this->rating >= 3.5) return 'Bien';
        if ($this->rating >= 3.0) return 'Satisfaisant';
        if ($this->rating >= 2.0) return 'À améliorer';
        return 'Insuffisant';
    }

    /**
     * Vérifier si le feedback est positif
     */
    public function isPositive(): bool
    {
        return $this->rating >= 3.5;
    }

    /**
     * Vérifier si le feedback a été lu
     */
    public function isRead(): bool
    {
        return $this->status === self::STATUS_READ || $this->read_at !== null;
    }

    /**
     * Marquer le feedback comme lu
     */
    public function markAsRead(): void
    {
        $this->update([
            'status' => self::STATUS_READ,
            'read_at' => now()
        ]);
    }

    /**
     * Vérifier si c'est un feedback d'alerte
     */
    public function isWarning(): bool
    {
        return $this->feedback_type === self::TYPE_WARNING || $this->rating < 2.5;
    }

    /**
     * Obtenir la couleur associée au type de feedback
     */
    public function getTypeColorAttribute(): string
    {
        return match($this->feedback_type) {
            self::TYPE_ENCOURAGEMENT => 'green',
            self::TYPE_WARNING => 'red',
            self::TYPE_RECOMMENDATION => 'blue',
            self::TYPE_MILESTONE => 'purple',
            default => 'gray'
        };
    }

    /**
     * Scopes pour les requêtes courantes
     */
    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeByTeacher($query, int $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    public function scopeForFormation($query, int $formationId)
    {
        return $query->where('formation_id', $formationId);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('feedback_type', $type);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSent($query)
    {
        return $query->where('status', self::STATUS_SENT);
    }

    public function scopeRead($query)
    {
        return $query->where('status', self::STATUS_READ);
    }

    public function scopeUnread($query)
    {
        return $query->where('status', '!=', self::STATUS_READ);
    }

    public function scopePositive($query)
    {
        return $query->where('rating', '>=', 3.5);
    }

    public function scopeWarnings($query)
    {
        return $query->where(function($q) {
            $q->where('feedback_type', self::TYPE_WARNING)
              ->orWhere('rating', '<', 2.5);
        });
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope pour obtenir les statistiques d'un étudiant
     */
    public function scopeStudentStats($query, int $studentId, int $formationId = null)
    {
        $query = $query->where('student_id', $studentId);
        
        if ($formationId) {
            $query->where('formation_id', $formationId);
        }

        return $query->selectRaw('
            COUNT(*) as total_feedbacks,
            AVG(rating) as average_rating,
            AVG(participation_rating) as avg_participation,
            AVG(progress_rating) as avg_progress,
            AVG(commitment_rating) as avg_commitment,
            AVG(technical_skills_rating) as avg_technical_skills,
            COUNT(CASE WHEN rating >= 3.5 THEN 1 END) as positive_count,
            COUNT(CASE WHEN feedback_type = "warning" THEN 1 END) as warning_count
        ');
    }
}
