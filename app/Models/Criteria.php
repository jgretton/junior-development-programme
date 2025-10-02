<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Criteria extends Model
{
    /** @use HasFactory<\Database\Factories\CriteriaFactory> */
    use HasFactory;

    protected $fillable = ['name', 'rank_id', 'category_id'];

    public function rank(): BelongsTo
    {
        return $this->belongsTo(Rank::class);
    }
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
