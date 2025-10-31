<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AssignmentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'user_id',
        'file_path',
        'original_filename',
        'submission_text',
        'submitted_at',
        'is_late'
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'is_late' => 'boolean'
    ];

    /**
     * La soumission appartient à un devoir
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * La soumission appartient à un utilisateur (étudiant)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Alias pour student (pour plus de clarté)
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * La soumission peut avoir une note
     */
    public function grade(): HasOne
    {
        return $this->hasOne(AssignmentGrade::class);
    }

    /**
     * Obtenir l'URL complète du fichier
     */
    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }
        
        return asset('storage/' . $this->file_path);
    }

    /**
     * Vérifier si la soumission a été faite en retard
     */
    public function isLateSubmission(): bool
    {
        if (!$this->assignment->due_date || !$this->submitted_at) {
            return false;
        }

        return $this->submitted_at > $this->assignment->due_date;
    }

    /**
     * Obtenir le type de soumission (fichier ou texte)
     */
    public function getSubmissionTypeAttribute(): string
    {
        if ($this->file_path) {
            return 'file';
        } elseif ($this->submission_text) {
            return 'text';
        }
        return 'empty';
    }

    /**
     * Vérifier si la soumission est complète
     */
    public function isComplete(): bool
    {
        return $this->file_path || $this->submission_text;
    }

    /**
     * Scopes pour les requêtes courantes
     */
    public function scopeByAssignment($query, int $assignmentId)
    {
        return $query->where('assignment_id', $assignmentId);
    }

    public function scopeByStudent($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeLateSubmissions($query)
    {
        return $query->where('is_late', true);
    }

    public function scopeOnTimeSubmissions($query)
    {
        return $query->where('is_late', false);
    }

    public function scopeWithFiles($query)
    {
        return $query->whereNotNull('file_path');
    }

    public function scopeWithText($query)
    {
        return $query->whereNotNull('submission_text');
    }

    public function scopeSubmittedBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('submitted_at', [$startDate, $endDate]);
    }
}
