<?php

namespace App\Models;

use Awobaz\Compoships\Compoships;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class MemberToDevice extends Model
{
    use SoftDeletes,Compoships;
    protected $table = "members_to_device";
    protected $primaryKey = 'id';

    public $timestamps = true;

    protected $fillable = [
        'member_id',
        'device_id',
        'assigned_at',
        'device_user_id',
        'device_serial_no',
        'card',
        'finger_print',
        'face_id',
        'status',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class, 'device_id', 'id');
    }

    public function member()
    {
        return $this->belongsTo(Members::class, 'member_id', 'id');
    }

    public function smsLogs()
    {
        return $this->hasMany(SmsLog::class, 'member_id', 'member_id');
    }
  
}
