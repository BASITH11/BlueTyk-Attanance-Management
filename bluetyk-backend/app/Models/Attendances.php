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

    // public function device()
    // {
    //     return $this->belongsTo(Device::class, 'device_serial_no', 'device_serial_no');
    // }

    public function memberToDevice()
    {
        return $this->belongsTo(MemberToDevice::class, 'pin', 'device_user_id');
    }
}
