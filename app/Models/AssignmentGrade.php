<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignmentGrade extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_submission_id',
        'graded_by',
        'grade',
        'points_earned',
        'total_points',
        'feedback',
        'graded_at'
    ];

    protected $casts = [
        'graded_at' => 'datetime',
        'grade' => 'decimal:2',
        'points_earned' => 'integer',
        'total_points' => 'integer'
    ];

    /**
     * La note appartient à une soumission
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(AssignmentSubmission::class, 'assignment_submission_id');
    }

    /**
     * La note est donnée par un formateur
     */
    public function gradedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    /**
     * Alias pour teacher
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    /**
     * Obtenir le pourcentage de réussite
     */
    public function getPercentageAttribute(): float
    {
        if ($this->total_points === 0) {
            return 0;
        }
        
        return round(($this->points_earned / $this->total_points) * 100, 2);
    }

    /**
     * Obtenir la mention selon la note
     */
    public function getMentionAttribute(): string
    {
        $percentage = $this->percentage;
        
        if ($percentage >= 90) return 'Excellent';
        if ($percentage >= 80) return 'Très bien';
        if ($percentage >= 70) return 'Bien';
        if ($percentage >= 60) return 'Assez bien';
        if ($percentage >= 50) return 'Passable';
        
        return 'Insuffisant';
    }

    /**
     * Vérifier si la note est réussie (>= 50%)
     */
    public function isPassed(): bool
    {
        return $this->percentage >= 50;
    }

    /**
     * Scopes pour les requêtes courantes
     */
    public function scopeByGrader($query, int $graderId)
    {
        return $query->where('graded_by', $graderId);
    }

    public function scopePassed($query)
    {
        return $query->whereRaw('(points_earned / total_points) * 100 >= 50');
    }

    public function scopeFailed($query)
    {
        return $query->whereRaw('(points_earned / total_points) * 100 < 50');
    }

    public function scopeExcellent($query)
    {
        return $query->whereRaw('(points_earned / total_points) * 100 >= 90');
    }

    public function scopeGradedBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('graded_at', [$startDate, $endDate]);
    }
}
