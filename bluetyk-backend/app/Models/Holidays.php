<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Holidays extends Model
{
    use SoftDeletes;
    protected $table = 'holidays';

    protected $fillable = [
        'name',
        'type',
        'holiday_date',
        'is_recurring',
        'day_of_week',
        'week_of_month',
    ];

    public $timestamps = true;
}
