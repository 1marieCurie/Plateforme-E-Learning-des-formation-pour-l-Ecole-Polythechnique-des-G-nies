<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CourseCertificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'certificate_number',
        'title',
        'description',
        'final_grade',
        'total_hours_completed',
        'completed_chapters',
        'assignment_scores',
        'course_started_at',
        'course_completed_at',
        'certificate_issued_at',
        'certificate_expires_at',
        'issued_by',
        'certificate_template',
        'certificate_file_path',
        'metadata',
        'is_valid',
        'verification_code',
        'download_count',
        'last_downloaded_at'
    ];

    protected $casts = [
        'final_grade' => 'decimal:2',
        'total_hours_completed' => 'integer',
        'completed_chapters' => 'array',
        'assignment_scores' => 'array',
        'course_started_at' => 'datetime',
        'course_completed_at' => 'datetime',
        'certificate_issued_at' => 'datetime',
        'certificate_expires_at' => 'datetime',
        'metadata' => 'array',
        'is_valid' => 'boolean',
        'download_count' => 'integer',
        'last_downloaded_at' => 'datetime'
    ];

    /**
     * Relations
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
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
            $number = 'CERT-COURSE-' . date('Y') . '-' . strtoupper(Str::random(6));
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
     * Calculer la durée de formation
     */
    public function getFormationDurationAttribute(): ?int
    {
        if (!$this->course_started_at || !$this->course_completed_at) {
            return null;
        }

        return Carbon::parse($this->course_started_at)->diffInDays(Carbon::parse($this->course_completed_at));
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
        // Pour les certificats de cours, on peut simplement ajouter aux métadonnées
        $metadata = $this->metadata ?? [];
        $verificationLog = $metadata['verification_log'] ?? [];
        $verificationLog[] = array_merge($data, ['verified_at' => now()]);
        $metadata['verification_log'] = $verificationLog;
        $this->update(['metadata' => $metadata]);
    }

    /**
     * Créer un certificat pour un cours terminé
     */
    public static function createForCompletedCourse(
        User $user,
        Course $course,
        array $completionData = []
    ): self {
        $certificate = self::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'certificate_number' => self::generateCertificateNumber(),
            'verification_code' => self::generateVerificationCode(),
            'title' => "Certificat de réussite - {$course->title}",
            'description' => "Ce certificat atteste que {$user->nom} a terminé avec succès le cours \"{$course->title}\".",
            'final_grade' => $completionData['final_grade'] ?? null,
            'total_hours_completed' => $completionData['total_hours'] ?? 0,
            'completed_chapters' => $completionData['chapters'] ?? [],
            'assignment_scores' => $completionData['assignments'] ?? [],
            'course_started_at' => $completionData['started_at'] ?? null,
            'course_completed_at' => now(),
            'certificate_issued_at' => now(),
            'certificate_expires_at' => $completionData['expires_at'] ?? null,
            'issued_by' => $course->user_id, // Formateur créateur du cours
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

    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    public function scopeIssuedInYear($query, int $year)
    {
        return $query->whereYear('certificate_issued_at', $year);
    }

    public function scopeWithGradeAbove($query, float $grade)
    {
        return $query->where('final_grade', '>=', $grade);
    }
}
