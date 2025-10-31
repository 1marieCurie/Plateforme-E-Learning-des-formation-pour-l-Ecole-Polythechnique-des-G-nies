<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChapterResource extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'title',
        'description',
        'file_path',
        'original_filename',
        'file_type',
        'file_size',
        'mime_type',
        'duration_seconds',
        'metadata',
        'is_downloadable',
        'is_required',
        'is_active',
        'order_index',
        'download_count',
        'view_count',
        'access_level',
        'available_from',
        'available_until'
    ];

    protected $casts = [
        'file_size' => 'integer',
        'duration_seconds' => 'integer',
        'metadata' => 'array',
        'is_downloadable' => 'boolean',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'order_index' => 'integer',
        'download_count' => 'integer',
        'view_count' => 'integer',
        'available_from' => 'datetime',
        'available_until' => 'datetime'
    ];

    /**
     * Types de fichiers possibles
     */
    const TYPE_PDF = 'pdf';
    const TYPE_VIDEO = 'video';
    const TYPE_IMAGE = 'image';
    const TYPE_DOCUMENT = 'document';
    const TYPE_LINK = 'link';
    const TYPE_AUDIO = 'audio';
    const TYPE_ARCHIVE = 'archive';

    /**
     * Niveaux d'accès possibles
     */
    const ACCESS_FREE = 'free';
    const ACCESS_ENROLLED = 'enrolled';
    const ACCESS_PREMIUM = 'premium';

    /**
     * La ressource appartient à un chapitre
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    /**
     * Obtenir l'URL complète du fichier
     */
    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }
        
        // Si c'est un lien externe, le retourner tel quel
        if ($this->file_type === self::TYPE_LINK) {
            return $this->file_path;
        }
        
        // Sinon, construire l'URL du fichier stocké
        return asset('storage/' . $this->file_path);
    }

    /**
     * Obtenir la taille du fichier formatée
     */
    public function getFormattedFileSizeAttribute(): string
    {
        if (!$this->file_size) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $unitIndex = 0;

        while ($size >= 1024 && $unitIndex < count($units) - 1) {
            $size /= 1024;
            $unitIndex++;
        }

        return round($size, 2) . ' ' . $units[$unitIndex];
    }

    /**
     * Obtenir la durée formatée (pour vidéos/audios)
     */
    public function getFormattedDurationAttribute(): ?string
    {
        if (!$this->duration_seconds) {
            return null;
        }

        $hours = floor($this->duration_seconds / 3600);
        $minutes = floor(($this->duration_seconds % 3600) / 60);
        $seconds = $this->duration_seconds % 60;

        if ($hours > 0) {
            return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
        } else {
            return sprintf('%02d:%02d', $minutes, $seconds);
        }
    }

    /**
     * Vérifier si la ressource est disponible
     */
    public function isAvailable(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();
        
        if ($this->available_from && $now < $this->available_from) {
            return false;
        }
        
        if ($this->available_until && $now > $this->available_until) {
            return false;
        }
        
        return true;
    }

    /**
     * Vérifier si l'utilisateur a accès à cette ressource
     */
    public function isAccessibleBy(User $user): bool
    {
        if (!$this->isAvailable()) {
            return false;
        }

        // Vérifier le niveau d'accès
        switch ($this->access_level) {
            case self::ACCESS_FREE:
                return true;
                
            case self::ACCESS_ENROLLED:
                // Vérifier si l'utilisateur a accès au cours du chapitre
                return $this->chapter->course->isAccessibleBy($user);
                
            case self::ACCESS_PREMIUM:
                // Logique pour accès premium (à implémenter selon vos besoins)
                return $user->role === 'admin' || $user->hasActivePremiumSubscription();
                
            default:
                return false;
        }
    }

    /**
     * Incrémenter le compteur de téléchargements
     */
    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }

    /**
     * Incrémenter le compteur de vues
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    /**
     * Vérifier si c'est un fichier média
     */
    public function isMediaFile(): bool
    {
        return in_array($this->file_type, [self::TYPE_VIDEO, self::TYPE_AUDIO, self::TYPE_IMAGE]);
    }

    /**
     * Obtenir l'icône associée au type de fichier
     */
    public function getFileIconAttribute(): string
    {
        return match($this->file_type) {
            self::TYPE_PDF => 'file-pdf',
            self::TYPE_VIDEO => 'play-circle',
            self::TYPE_AUDIO => 'volume-up',
            self::TYPE_IMAGE => 'image',
            self::TYPE_LINK => 'external-link',
            self::TYPE_ARCHIVE => 'archive',
            default => 'file'
        };
    }

    /**
     * Scopes pour les requêtes courantes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        $now = now();
        return $query->where('is_active', true)
                    ->where(function($q) use ($now) {
                        $q->whereNull('available_from')
                          ->orWhere('available_from', '<=', $now);
                    })
                    ->where(function($q) use ($now) {
                        $q->whereNull('available_until')
                          ->orWhere('available_until', '>=', $now);
                    });
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('file_type', $type);
    }

    public function scopeDownloadable($query)
    {
        return $query->where('is_downloadable', true);
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeByAccessLevel($query, string $level)
    {
        return $query->where('access_level', $level);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order_index');
    }

    public function scopeForChapter($query, int $chapterId)
    {
        return $query->where('chapter_id', $chapterId);
    }
}
