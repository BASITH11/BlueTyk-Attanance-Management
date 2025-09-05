<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rules\Exists;

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
        $PendingMembers = MemberToDevice::With(['member', 'device'])->where('status', 'pending')->get();


        foreach ($PendingMembers as $member) {
            $deviceSerialNo = $member->device_serial_no ?? null;
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
     * function to mark the members as success
     */
    public static function updateAllSuccess()
    {
        // Get all members with status 'pending' and eager load their memberToDevice relation
        $members = Members::with('memberToDevice')->where('status', 'pending')->get();

        foreach ($members as $member) {

            $allSuccess = $member->memberToDevice->every(function ($device) {
                return $device->status === 'success';
            });

            if ($allSuccess && $member->memberToDevice->isNotEmpty()) {

                $member->update(['status' => 'success']);
            } else {
                $member->update(['status' => 'pending']);
            }
        }
    }



    /**
     * function to update the status of deleted member
     */

    public static function updateDeletedStatus()
    {
        #Get all soft-deleted members with their device mappings
        $deletedMembers = Members::onlyTrashed()->with('memberToDevice')->get();

        foreach ($deletedMembers as $member) {
            $anyDeviceExists = false;

            foreach ($member->memberToDevice as $deviceMapping) {
                $deviceSerialNo = $deviceMapping->device_serial_no;
                $deviceUserId = $deviceMapping->device_user_id;

                if ($deviceSerialNo && $deviceUserId) {
                    $exists = self::where('pin', $deviceUserId)
                        ->where('device_serial_no', $deviceSerialNo)
                        ->exists();

                    if ($exists) {
                        $anyDeviceExists = true;

                        #If device mapping was marked deleted before, revert it to active
                        if ($deviceMapping->status === 'deleted') {
                            $deviceMapping->update(['status' => 'success']);
                        }
                    } else {
                        #Mark device mapping as deleted if missing in logs
                        if ($deviceMapping->status !== 'deleted') {
                            $deviceMapping->update(['status' => 'deleted']);
                        }
                    }
                }
            }

            #Update member status based on device presence
            if ($anyDeviceExists) {
                if ($member->status === 'deleted') {
                    $member->update(['status' => 'success']);
                }
            } else {
                if ($member->status !== 'deleted') {
                    $member->update(['status' => 'deleted']);
                }
            }
        }
    }

    /**
     * function to update the pending status based on the status 
     */
    public static function updatePendingFromDeviceToApp($deviceSerialNo)
    {
        $deviceMappings = MemberToDevice::with('member', 'device')->where('status', 'success')->where('device_serial_no', $deviceSerialNo)->get();

        foreach ($deviceMappings as $deviceMapping) {

            $exists = self::where('device_serial_no', $deviceMapping->device->device_serial_no)
                ->where('pin', $deviceMapping->device_user_id)->exists();

            if (!$exists) {
                #update member_to_device
                $deviceMapping->update([
                    'status' => 'pending',
                    'device_user_id' => null,
                ]);

                #update members
                if ($deviceMapping->member) {
                    $deviceMapping->member->update([
                        'status' => 'pending',
                    ]);
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

    /**
     * function for getting the users to app from device 
     */

    public static function addUserDeviceToApp()
    {
        $deviceUsers = self::all();

        foreach ($deviceUsers as $user) {
            $deviceSerialNo = $user->device_serial_no;
            $pin            = $user->pin;
            $name           = $user->name;
            $cardNo         = $user->card_no;

            if (empty($pin) || empty($deviceSerialNo)) {
                continue; // Skip invalid entries
            }

            $device = Device::where('device_serial_no', $deviceSerialNo)->first();
            if (!$device) {
                continue; // Skip if device not found
            }

            $exists = MemberToDevice::where('device_user_id', $pin)
                ->where('device_serial_no', $deviceSerialNo)
                ->exists();

            $departmentId = Department::first()->id ?? null;

            if (!$exists) {
                $member = Members::create([
                    'name'            => $name ?? 'unknown',
                    'phono_no'        => null,
                    'card_no'         => $cardNo ?? null,
                    'image'           => null,
                    'address'         => null,
                    'date_of_birth'   => null,
                    'designation'     => null,
                    'status'          => 'success',
                    'source'          => 'device',
                    'department_id'   => $departmentId,
                ]);

                MemberToDevice::create([
                    'member_id'   => $member->id,
                    'device_id'   => $device->id,
                    'device_user_id'  => $pin,
                    'device_serial_no' => $deviceSerialNo,
                    'assigned_at' => now(),
                    'status' => 'success',
                ]);
            }
        }
    }
}
