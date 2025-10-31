<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChapterProgress extends Model
{
    /**
     * Le nom de la table associée au modèle.
     */
    protected $table = 'chapter_progresses';

    // Définir les attributs que l'on peut remplir
    protected $fillable = [
        'user_id',
        'chapter_id',
        'course_id',
        'is_read',
        'reading_time_seconds',
        'download_count',
        'first_read_at',
        'last_read_at',
    ];

    // Relation avec l'utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relation avec le chapitre
    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }

    // Relation avec le cours
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
