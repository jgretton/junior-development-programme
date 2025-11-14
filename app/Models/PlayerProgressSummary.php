<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerProgressSummary extends Model
{
    protected $table = 'player_progress_summary';

    protected $fillable = [
        'user_id',
        'current_rank_id',
        'overall_percentage',
        'overall_completed',
        'overall_total',
        'rank_progress',
        'category_progress',
    ];

    protected $casts = [
        'overall_percentage' => 'float',
        'overall_completed' => 'integer',
        'overall_total' => 'integer',
        'rank_progress' => 'array',
        'category_progress' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function currentRank(): BelongsTo
    {
        return $this->belongsTo(Rank::class, 'current_rank_id');
    }
}
