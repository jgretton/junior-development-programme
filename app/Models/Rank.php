<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rank extends Model
{
    //
    protected $table = 'rank';
    protected $fillable = ['name', 'level'];
}
