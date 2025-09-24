<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model
{
    protected $table = 'sms_logs';

    protected $fillable = [
        'member_id',
        'name',
        'department',
        'sms_log',
        'template_name',
        'timestamp',
        'phone_no',
        'batch_id',
        'message_id',
        'status',
    ];

    public $timestamps = true;


    public function member()
    {
        return $this->belongsTo(Members::class, 'member_id', 'id');
    }

    public function memberToDevice()
    {
        return $this->belongsTo(MemberToDevice::class, 'member_id', 'member_id');
    }
}
