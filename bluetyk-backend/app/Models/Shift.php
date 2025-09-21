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
        'shift_end',
        'is_overnight',
    ];

    protected $casts = [
        'is_overnight' => 'boolean',
    ];

    /**
     * relation towards the members table
     */
    public function members()
    {
        return $this->hasMany(Members::class, 'id', 'shift_id');
    }

    /**
     * get shift by name 
     */
    public static function getShiftByName($shiftName)
    {

        $shift = self::where('shift_name', $shiftName)->first();

        if (!$shift) {
            throw new \Exception("Shift '{$shiftName}' not found in database");
        }
        return $shift->id;
    }
}
