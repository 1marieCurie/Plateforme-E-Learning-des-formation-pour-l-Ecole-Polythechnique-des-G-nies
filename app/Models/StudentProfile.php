<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class StudentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialite',
        'photo',
        'last_login_at',
    ];

    /**
     * Un profil appartient à un utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    //si tu veux accéder directement aux cours d’un étudiant via son profil, tu peux le faire avec une relation à travers user
    //optionnel

    public function courses()
    {
        return $this->user->courses(); // Accède aux cours via l'utilisateur lié au profil
    }

}
