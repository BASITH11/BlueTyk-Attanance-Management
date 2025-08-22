<?php

namespace App\Models;

use Awobaz\Compoships\Compoships;
use Illuminate\Database\Eloquent\Model;

class Attendances extends Model
{

    use Compoships;

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


    public function memberToDevice()
    {
        return $this->hasmany(MemberToDevice::class,['device_user_id','device_serial_no'],['pin', 'device_serial_no']);
    }


}
