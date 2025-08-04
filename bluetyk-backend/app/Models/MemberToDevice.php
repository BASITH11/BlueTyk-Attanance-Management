<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class MemberToDevice extends Model
{
    use SoftDeletes;
    protected $table ="members_to_device";
    protected $primaryKey ='id';

    public $timestamps = true;

    protected $fillable = [
        'member_id',
        'device_id',
        'assigned_at',
    ];

public function device()
{
    return $this->belongsTo(Device::class,'device_id');
}

public function member()
{
    return $this->belongsTo(Members::class,'member_id');
}

}

