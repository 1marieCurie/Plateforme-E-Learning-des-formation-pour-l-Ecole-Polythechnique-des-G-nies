<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class AdminProfile extends Model
{
    use HasFactory;

    protected $fillable = [
         'id', 
        'user_id',
        'specialite',
        'photo',
        'last_login_at',
        'created_at',
        'updated_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
