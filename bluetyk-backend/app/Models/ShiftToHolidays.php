<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShiftToHolidays extends Model
{
    use SoftDeletes;

    protected $table = 'shift_to_holidays';
    protected $fillable = [
        'shift_id',
        'holiday_id',
    ];
    public $timestamps = true;

/**
 * relation towards shifts table
 */
    public function shift()
    {
        return $this->belongsTo(Shift::class, 'shift_id','id');
    }
/**
 * relation towards holidays table
 */
    public function holiday()
    {
        return $this->belongsTo(Holidays::class,  'holiday_id','id');
    }
}
