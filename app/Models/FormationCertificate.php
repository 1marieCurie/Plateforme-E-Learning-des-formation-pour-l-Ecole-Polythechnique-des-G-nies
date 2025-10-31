<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Carbon\Carbon;

class FormationCertificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'formation_id',
        'certificate_number',
        'title',
        'description',
        'overall_grade',
        'total_hours_completed',
        'total_courses_completed',
        'course_certificates',
        'skills_acquired',
        'competency_scores',
        'formation_started_at',
        'formation_completed_at',
        'certificate_issued_at',
        'certificate_expires_at',
        'issued_by',
        'certificate_template',
        'certificate_file_path',
        'metadata',
        'certificate_level',
        'is_valid',
        'verification_code',
        'digital_signature',
        'download_count',
        'last_downloaded_at',
        'verification_log'
    ];

    protected $casts = [
        'overall_grade' => 'decimal:2',
        'total_hours_completed' => 'integer',
        'total_courses_completed' => 'integer',
        'course_certificates' => 'array',
        'skills_acquired' => 'array',
        'competency_scores' => 'array',
        'formation_started_at' => 'datetime',
        'formation_completed_at' => 'datetime',
        'certificate_issued_at' => 'datetime',
        'certificate_expires_at' => 'datetime',
        'metadata' => 'array',
        'is_valid' => 'boolean',
        'download_count' => 'integer',
        'last_downloaded_at' => 'datetime',
        'verification_log' => 'array'
    ];

    /**
     * Niveaux de certificat possibles
     */
    const LEVEL_COMPLETION = 'completion';
    const LEVEL_EXCELLENCE = 'excellence';
    const LEVEL_DISTINCTION = 'distinction';

    /**
     * Relations
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * Générer un numéro de certificat unique
     */
    public static function generateCertificateNumber(): string
    {
        do {
            $number = 'CERT-FORM-' . date('Y') . '-' . strtoupper(Str::random(6));
        } while (self::where('certificate_number', $number)->exists());

        return $number;
    }

    /**
     * Générer un code de vérification unique
     */
    public static function generateVerificationCode(): string
    {
        do {
            $code = strtoupper(Str::random(12));
        } while (self::where('verification_code', $code)->exists());

        return $code;
    }

    /**
     * Déterminer le niveau du certificat basé sur la note
     */
    public static function determineCertificateLevel(float $grade): string
    {
        if ($grade >= 90) {
            return self::LEVEL_DISTINCTION;
        } elseif ($grade >= 80) {
            return self::LEVEL_EXCELLENCE;
        } else {
            return self::LEVEL_COMPLETION;
        }
    }

    /**
     * Vérifier si le certificat est expiré
     */
    public function isExpired(): bool
    {
        if (!$this->certificate_expires_at) {
            return false;
        }

        return now() > $this->certificate_expires_at;
    }

    /**
     * Vérifier si le certificat est valide
     */
    public function isValidCertificate(): bool
    {
        return $this->is_valid && !$this->isExpired();
    }

    /**
     * Obtenir l'URL de téléchargement du certificat
     */
    public function getDownloadUrlAttribute(): ?string
    {
        if (!$this->certificate_file_path) {
            return null;
        }

        return asset('storage/' . $this->certificate_file_path);
    }

    /**
     * Obtenir l'URL de vérification publique
     */
    public function getVerificationUrlAttribute(): string
    {
        return route('certificates.verify', ['code' => $this->verification_code]);
    }

    /**
     * Calculer la durée totale de formation
     */
    public function getFormationDurationAttribute(): ?int
    {
        if (!$this->formation_started_at || !$this->formation_completed_at) {
            return null;
        }

        return Carbon::parse($this->formation_started_at)->diffInDays(Carbon::parse($this->formation_completed_at));
    }

    /**
     * Obtenir le statut du certificat
     */
    public function getStatusAttribute(): string
    {
        if (!$this->is_valid) {
            return 'invalide';
        }

        if ($this->isExpired()) {
            return 'expiré';
        }

        return 'valide';
    }

    /**
     * Obtenir le libellé du niveau de certificat
     */
    public function getLevelLabelAttribute(): string
    {
        return match($this->certificate_level) {
            self::LEVEL_DISTINCTION => 'Avec Distinction',
            self::LEVEL_EXCELLENCE => 'Avec Excellence',
            self::LEVEL_COMPLETION => 'Certificat de Réussite',
            default => 'Certificat de Réussite'
        };
    }

    /**
     * Incrémenter le compteur de téléchargements
     */
    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
        $this->update(['last_downloaded_at' => now()]);
    }

    /**
     * Ajouter une entrée au log de vérification
     */
    public function addVerificationLog(array $data): void
    {
        $log = $this->verification_log ?? [];
        $log[] = array_merge($data, ['verified_at' => now()]);
        $this->update(['verification_log' => $log]);
    }

    /**
     * Créer un certificat pour une formation terminée
     */
    public static function createForCompletedFormation(
        User $user,
        Formation $formation,
        array $completionData = []
    ): self {
        $overallGrade = $completionData['overall_grade'] ?? 0;
        
        $certificate = self::create([
            'user_id' => $user->id,
            'formation_id' => $formation->id,
            'certificate_number' => self::generateCertificateNumber(),
            'verification_code' => self::generateVerificationCode(),
            'title' => "Certificat de Formation - {$formation->title}",
            'description' => "Ce certificat atteste que {$user->nom} a terminé avec succès la formation complète \"{$formation->title}\" et a acquis toutes les compétences requises.",
            'overall_grade' => $overallGrade,
            'total_hours_completed' => $completionData['total_hours'] ?? 0,
            'total_courses_completed' => $completionData['courses_count'] ?? 0,
            'course_certificates' => $completionData['course_certificates'] ?? [],
            'skills_acquired' => $completionData['skills'] ?? [],
            'competency_scores' => $completionData['competencies'] ?? [],
            'formation_started_at' => $completionData['started_at'] ?? null,
            'formation_completed_at' => now(),
            'certificate_issued_at' => now(),
            'certificate_expires_at' => $completionData['expires_at'] ?? null,
            'issued_by' => $formation->teacher_id,
            'certificate_level' => self::determineCertificateLevel($overallGrade),
            'metadata' => $completionData['metadata'] ?? []
        ]);

        return $certificate;
    }

    /**
     * Scopes pour les requêtes communes
     */
    public function scopeValid($query)
    {
        return $query->where('is_valid', true)
                    ->where(function($q) {
                        $q->whereNull('certificate_expires_at')
                          ->orWhere('certificate_expires_at', '>', now());
                    });
    }

    public function scopeExpired($query)
    {
        return $query->where('certificate_expires_at', '<=', now());
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForFormation($query, int $formationId)
    {
        return $query->where('formation_id', $formationId);
    }

    public function scopeIssuedInYear($query, int $year)
    {
        return $query->whereYear('certificate_issued_at', $year);
    }

    public function scopeWithLevel($query, string $level)
    {
        return $query->where('certificate_level', $level);
    }

    public function scopeWithGradeAbove($query, float $grade)
    {
        return $query->where('overall_grade', '>=', $grade);
    }

    public function scopeDistinction($query)
    {
        return $query->where('certificate_level', self::LEVEL_DISTINCTION);
    }

    public function scopeExcellence($query)
    {
        return $query->where('certificate_level', self::LEVEL_EXCELLENCE);
    }
}
