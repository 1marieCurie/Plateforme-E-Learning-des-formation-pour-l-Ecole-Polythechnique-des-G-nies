<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Assignment extends Model
{
    use HasFactory;

    
    protected $fillable = [
        'title',
        'description',
        'type',
        'course_id',
        'teacher_id',
        'max_points',
        'duration_minutes',
        'instructions',
        'allow_late_submission',
        'due_date',
        'available_from',
        'available_until',
        'is_active',
        // Nouveaux champs pour les fichiers
        'file_path',
        'file_name',
        'file_type',
        'file_size'
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'available_from' => 'datetime',
        'available_until' => 'datetime',
        'instructions' => 'array',
        'is_active' => 'boolean',
        'allow_late_submission' => 'boolean',
        'max_points' => 'integer',
        'duration_minutes' => 'integer'
    ];

    /**
     * Types de devoirs possibles
     */
    const TYPE_TP = 'tp';
    const TYPE_TD = 'td';
    const TYPE_CONTROLE = 'controle';
    const TYPE_QCM = 'qcm';

    /**
     * Statuts possibles
     */
    const STATUS_PENDING = 'pending';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_GRADED = 'graded';
    const STATUS_LATE = 'late';
    const STATUS_OPEN = 'open';

    /**
     * Devoir appartient à un cours
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Devoir soumis par un étudiant
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Devoir a plusieurs soumissions
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    /**
     * Vérifier si le devoir est disponible
     */
    public function isAvailable(): bool
    {
        $now = now();
        
        if ($this->available_from && $now < $this->available_from) {
            return false;
        }
        
        if ($this->available_until && $now > $this->available_until) {
            return false;
        }
        
        return $this->is_active;
    }

    /**
     * Vérifier si la date limite est passée
     */
    public function isPastDue(): bool
    {
        if (!$this->due_date) {
            return false;
        }

        return now() > $this->due_date;
    }

         // Ajoutez cette méthode pour la compatibilité avec l'ancien code
    public function isLate()
    {
        return $this->isPastDue();
    }


    public function getFileUrlAttribute()
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }

    public function getFormattedFileSizeAttribute()
    {
        if (!$this->file_size) return null;
        $bytes = $this->file_size;
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }

    // Méthode pour vérifier si un devoir est ouvert aux soumissions
    public function isOpenForSubmission()
    {
        return $this->isAvailable() && !$this->isPastDue();
    }

    /**
     * Obtenir le nombre de soumissions
     */
    public function getSubmissionCountAttribute(): int
    {
        return $this->submissions()->count();
    }

    /**
     * Obtenir le nombre de soumissions notées
     */
    public function getGradedSubmissionCountAttribute(): int
    {
        return $this->submissions()
                    ->whereHas('grade')
                    ->count();
    }

    /**
     * Vérifier si un étudiant a déjà soumis
     */
    public function hasSubmissionFrom(User $user): bool
    {
        return $this->submissions()
                    ->where('user_id', $user->id)
                    ->exists();
    }

    /**
     * Obtenir la soumission d'un étudiant
     */
    public function getSubmissionFrom(User $user): ?AssignmentSubmission
    {
        return $this->submissions()
                    ->where('user_id', $user->id)
                    ->first();
    }

    /**
     * Scopes pour les requêtes courantes
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    public function scopeByStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', self::STATUS_SUBMITTED);
    }

    public function scopeGraded($query)
    {
        return $query->where('status', self::STATUS_GRADED);
    }

    public function scopeLate($query)
    {
        return $query->where('status', self::STATUS_LATE);
    }

    public function scopeDueSoon($query, int $days = 7)
    {
        return $query->where('due_date', '>=', now())
                    ->where('due_date', '<=', now()->addDays($days))
                    ->where('status', self::STATUS_PENDING);
    }
}
