<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description', 
        'image',
        'category_id',
        'formation_id',
        'order_index',
        'duration_minutes',
        'difficulty_level',
        'is_active',
        'view_count',
        'prerequisites',
        'learning_objectives'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'prerequisites' => 'array',
        'learning_objectives' => 'array',
        'view_count' => 'integer',
    ];

    /**
     * Cours appartient à une catégorie (domaine)
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Cours appartient à UNE SEULE formation
     */
    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    /**
     * Cours contient plusieurs chapitres
     */
    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class)->orderBy('id');  // Tri par ID au lieu de order_index
    }

    /**
     * Cours a plusieurs devoirs
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * Cours a plusieurs feedbacks d'étudiants
     */
    public function feedbacks(): HasMany
    {
        return $this->hasMany(StudentFeedback::class);
    }

    /**
     * Étudiants ayant accès au cours (via la formation)
     */
    public function students()
    {
        return $this->formation
                    ->students();
    }

    /**
     * Évaluations des étudiants pour ce cours
     */
    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }

    /**
     * Vérifier si un utilisateur a accès au cours
     */
    public function isAccessibleBy(User $user): bool
    {
        return $this->formation
                    ->students()
                    ->where('user_id', $user->id)
                    ->wherePivot('payment_status', 'paid')
                    ->exists();
    }

    /**
     * Obtenir la durée totale en heures
     */
    public function getDurationHoursAttribute(): float
    {
        return round($this->duration_minutes / 60, 1);
    }

    /**
     * Obtenir le nombre de chapitres
     */
    public function getChapterCountAttribute(): int
    {
        return $this->chapters()->count();
    }

    /**
     * Vérifier si c'est le premier cours de la formation
     */
    public function isFirstInFormation(): bool
    {
        return $this->order_index === 1;
    }

    /**
     * Obtenir le cours suivant dans la formation
     */
    public function nextCourse(): ?Course
    {
        return $this->formation
                    ->courses()
                    ->where('order_index', '>', $this->order_index)
                    ->orderBy('order_index')
                    ->first();
    }

    /**
     * Obtenir le cours précédent dans la formation
     */
    public function previousCourse(): ?Course
    {
        return $this->formation
                    ->courses()
                    ->where('order_index', '<', $this->order_index)
                    ->orderBy('order_index', 'desc')
                    ->first();
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByFormation($query, $formationId)
    {
        return $query->where('formation_id', $formationId);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order_index');
    }

    /**
     * Relation avec les certificats de cours
     */
    public function certificates()
    {
        return $this->hasMany(CourseCertificate::class);
    }

    /**
     * Vérifier si un utilisateur a un certificat pour ce cours
     */
    public function hasCertificateForUser(User $user): bool
    {
        return $this->certificates()
            ->where('user_id', $user->id)
            ->where('is_valid', true)
            ->exists();
    }

    /**
     * Obtenir le certificat d'un utilisateur pour ce cours
     */
    public function getCertificateForUser(User $user): ?CourseCertificate
    {
        return $this->certificates()
            ->where('user_id', $user->id)
            ->where('is_valid', true)
            ->first();
    }
}
