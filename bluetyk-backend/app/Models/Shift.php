<?php

namespace App\Models;



use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class Shift extends Model
{
    use SoftDeletes;
    protected $table = "shifts";

    protected $fillable = [
        'shift_name',
        'shift_start',
        'shift_ends',
        'is_overnight',
    ];

    protected $casts = [
        'is_overnight' => 'boolean',
    ];

    public function members()
    {
        return $this->hasMany(Members::class, 'id', 'shift_id');
    }
}
