<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont mass assignables.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'titre',          // Titre du chapitre
        'description',    // Description du chapitre
        'course_id',      // Référence au cours
        'file_path',      // Chemin vers le fichier principal
        'video_url',      // URL de la vidéo associée
        'order_index',    // Ordre d'affichage
        'duration_minutes', // Durée estimée en minutes
        'is_active',      // Statut actif/inactif
    ];

    /**
     * Les attributs qui doivent être castés.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'order_index' => 'integer',
        'duration_minutes' => 'integer',
    ];

    /**
     * La table associée à ce modèle.
     *
     * @var string
     */
    protected $table = 'chapters';

    /**
     * Relation avec le modèle Course.
     * Chaque chapitre appartient à un cours.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Relation many-to-many avec le modèle User via la table pivot 'chapter_user'.
     * Cette relation permet de suivre l'état de la progression de l'utilisateur dans chaque chapitre.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'chapter_user')  // Table pivot 'chapter_user'
                    ->withPivot('completed', 'progress')  // Colonnes supplémentaires dans la table pivot
                    ->withTimestamps();  // Pour suivre les timestamps de la relation
    }

    /**
     * Relation avec la progression des chapitres
     */
    public function progress()
    {
        return $this->hasMany(ChapterProgress::class);
    }

    /**
     * Relation avec les devoirs du chapitre
     */
    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * Relation avec les ressources du chapitre
     */
    public function resources()
    {
        return $this->hasMany(ChapterResource::class)->ordered();
    }

    /**
     * Obtenir les ressources actives et disponibles
     */
    public function activeResources()
    {
        return $this->hasMany(ChapterResource::class)
                    ->available()
                    ->ordered();
    }

    /**
     * Obtenir les ressources obligatoires
     */
    public function requiredResources()
    {
        return $this->hasMany(ChapterResource::class)
                    ->required()
                    ->available()
                    ->ordered();
    }

    /**
     * Obtenir les ressources téléchargeables
     */
    public function downloadableResources()
    {
        return $this->hasMany(ChapterResource::class)
                    ->downloadable()
                    ->available()
                    ->ordered();
    }

    /**
     * Scope pour récupérer les chapitres actifs
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope pour ordonner les chapitres
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order_index')->orderBy('id');
    }

    /**
     * Scope pour les chapitres d'un cours spécifique
     */
    public function scopeForCourse($query, $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    /**
     * Obtenir l'URL du fichier s'il existe
     */
    public function getFileUrlAttribute()
    {
        if (!$this->file_path) {
            return null;
        }
        
        return asset('storage/' . $this->file_path);
    }

    /**
     * Vérifier si le chapitre a un fichier
     */
    public function getHasFileAttribute()
    {
        return !empty($this->file_path);
    }

    /**
     * Vérifier si le chapitre a une vidéo
     */
    public function getHasVideoAttribute()
    {
        return !empty($this->video_url);
    }

    /**
     * Obtenir la durée formatée
     */
    public function getFormattedDurationAttribute()
    {
        if (!$this->duration_minutes) {
            return null;
        }

        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;

        if ($hours > 0) {
            return $hours . 'h ' . $minutes . 'min';
        }

        return $minutes . ' min';
    }

    /**
     * Boot method pour définir l'ordre automatiquement
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($chapter) {
            if (!$chapter->order_index) {
                $maxOrder = static::where('course_id', $chapter->course_id)->max('order_index');
                $chapter->order_index = ($maxOrder ?? 0) + 1;
            }
        });
    }
}