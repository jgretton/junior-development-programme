<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Session extends Model
{
    /** @use HasFactory<\Database\Factories\SessionFactory> */
    use HasFactory;

    protected $table = 'training_sessions';
    protected $fillable = ['name', 'focus_areas', 'date', 'created_by'];

    protected $casts = ['date' => 'date'];

    public function created_by(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function criteria(): BelongsToMany
    {
        return $this->belongsToMany(Criteria::class, 'criteria_session');
    }

    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'session_attendance', 'session_id', 'player_id');
    }
}
