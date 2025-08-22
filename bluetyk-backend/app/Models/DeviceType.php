<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DeviceType extends Model
{
    use SoftDeletes;

    protected $table = 'device_types';

    protected $fillable = [
         'type',
    ];

    public function deviceTypeToDevice(){
        return $this->HasMany(Device::class,'id','device_type_id');
    }
    
}
