<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User;

class PlayerProgress extends Model
{
    protected $fillable = ['user_id', 'criteria_id', 'status', 'assessed_by', 'approved_by', 'session_id', 'assessed_at', 'approved_at'];

    protected $casts = [
        'status' => 'string',
        'assessed_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function criteria(): BelongsTo
    {
        return $this->belongsTo(Criteria::class);
    }

    public function assessedby(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assessed_by');
    }
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
    public function session(): BelongsTo
    {
        return $this->belongsTo(Session::class);
    }
}
