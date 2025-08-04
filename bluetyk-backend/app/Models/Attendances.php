<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendances extends Model
{
    protected $table = 'attendances';

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    protected $fillable = [
        'device_serial_no',
        'pin',
        'timestamp',
        'status',
        'verified',
    ];

    
}
