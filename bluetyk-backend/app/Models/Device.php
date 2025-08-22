<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

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
        'location_id',
        'device_type_id',
    ];

    public function deviceToDeviceType()
    {
        return $this->belongsTo(DeviceType::class, 'device_type_id', 'id');
    }


    public function deviceToLocation()
    {
        return $this->belongsTo(Locations::class, 'location_id', 'id');
    }

    public function members()
    {
        return $this->hasMany(Members::class, 'device_id', 'id',);
    }

    public function memberToDevice()
    {
        return $this->hasMany(MemberToDevice::class, 'id', 'device_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendances::class, 'device_serial_no', 'device_serial_no');
    }


    public static function UpdateOfflineDevices()
    {
        $threshold = Carbon::now()->subMinutes(5);
        $update = self::where('last_seen_at', '<', $threshold)
            ->where('status', 'online')
            ->update(['status' => 'offline']);
    }


    public static function getDeviceByName($deviceName)
    {

        $device = self::where('device_name', $deviceName)->first();
        return $device ? $device->id : null;
    }
}
