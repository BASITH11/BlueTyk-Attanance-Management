<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceUserLogs extends Model
{

    protected $table = 'device_user_logs';

    protected $fillable = [
        'pin',
        'name',
        'device_serial_no',
        'card_no',
    ];



    /**
     * function for truncating the userLogs table
     */
    public static function clearDeviceUserLogs()
    {
        return self::truncate();
    }



    /**
     * function for updating the member status 
     */
    public static function updateSuccessStatus()
    {
        $PendingMembers = Members::With(['memberToDevice.device'])->where('status', 'pending')->get();

        foreach ($PendingMembers as $member) {
            $deviceSerialNo = $member->memberToDevice->device->device_serial_no ?? null;
            $deviceUserId = $member->device_user_id ?? 0;

            if ($deviceSerialNo && $deviceUserId) {
                $exists = self::where('pin', $deviceUserId)
                    ->where('device_serial_no', $deviceSerialNo)
                    ->exists();

                if ($exists) {
                    $member->update(['status' => 'success']);
                }
            }
        }
    }



    /**
     * function to update the status of deleted member
     */

    public static function updateDeletedStatus()
    {
        $deletedMembers = Members::onlyTrashed()->with(['memberToDevice.device'])->get();

        foreach ($deletedMembers as $member) {
            $deviceSerialNo = $member->memberToDevice->device->device_serial_no ?? null;
            $deviceUserId = $member->device_user_id ?? 0;

            if ($deviceSerialNo && $deviceUserId) {
                $exists = self::where('pin', $deviceUserId)
                    ->where('device_serial_no', $deviceSerialNo)
                    ->exists();

                if (!$exists) {
                    $member->update(['status' => 'deleted']);

                    if (!$member->trashed()) {
                        $member->delete(); // soft delete
                    }
                }
            }
        }
    }


    /**
     * function to find the pin to add the users 
     */
    public static function getNextAvailablePin($deviceSerialNo)
    {
        $pins = self::where('device_serial_no', $deviceSerialNo)
            ->orderBy('pin')
            ->pluck('pin')
            ->toArray();

        if (empty($pins)) {
            return 1;
        }

        $expectedPin = 1;
        foreach ($pins as $pin) {
            if ((int)$pin !== $expectedPin) {
                return $expectedPin;
            }
            $expectedPin++;
        }

        return $expectedPin;
    }
}
