<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoryProgress extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'total_courses',
        'completed_courses',
        'progress_percentage',
        'last_updated_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
