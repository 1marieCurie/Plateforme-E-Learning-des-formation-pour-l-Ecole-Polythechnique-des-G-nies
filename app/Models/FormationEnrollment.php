<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormationEnrollment extends Model
{
    protected $fillable = [
        'user_id',
        'formation_id',
        'enrolled_at',
        'progress_percentage',
        'completed_at',
        'amount_paid',
        'payment_status'
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
        'progress_percentage' => 'float',
        'amount_paid' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }

    /**
     * Marquer comme terminé
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'progress_percentage' => 100.00,
            'completed_at' => now()
        ]);
    }

    /**
     * Scopes
     */
    public function scopeCompleted($query)
    {
        return $query->whereNotNull('completed_at');
    }

    public function scopeInProgress($query)
    {
        return $query->whereNull('completed_at')
                    ->where('progress_percentage', '>', 0);
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }
}
