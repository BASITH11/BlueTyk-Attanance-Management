<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Device extends Model
{
 use SoftDeletes;

    protected $table = 'device';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'device_name',
        'device_serial_no',
        'last_seen_at',
        'status',
    ];

   
}
    