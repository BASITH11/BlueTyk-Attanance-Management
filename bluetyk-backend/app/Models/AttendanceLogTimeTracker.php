<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Device;
use Carbon\Carbon;

class AttendanceLogTimeTracker extends Model
{
    protected $table = 'attendance_log_time_trackers';

    protected $fillable = [
        'device_serial_no',
        'last_synced_at',
    ];


    /**
     * function to create the attanacegetting commands 
     */
    public static function AttendaceCommand()
    {
        $devices = Device::whereNotNull('device_serial_no')->get();

        $now = Carbon::now();

        foreach ($devices as $device) {
            $deviceSerialNo = $device->device_serial_no;

            $tracker = self::where('device_serial_no', $deviceSerialNo)->first();
            #if no entry then create an initial entry
            if (!$tracker) {
                $start = $now->copy()->startOfDay();

                self::create([
                    'device_serial_no' => $deviceSerialNo,
                    'last_synced_at' => $start
                ]);
                #else if there is an entry pic that 
            } else {
                $start = Carbon::parse($tracker->last_synced_at);
            }

            $end = $start->copy()->addMinutes(5);

            if ($end->greaterThan($now)) {
                continue;
            }

            $commandId = time();
            $cmd = "C:$commandId:DATA QUERY ATTLOG StartTime={$start->format('Y-m-d\TH:i:s')} EndTime={$end->format('Y-m-d\TH:i:s')}";

            CommandQueues::create([
                'device_serial_no' => $deviceSerialNo,
                'command' => $cmd,
                'priority' => 0,
                'sent' => false,
            ]);
            #after creation then update the last_synced_at with the $end 
            self::where('device_serial_no', $deviceSerialNo)
                ->update([
                    'last_synced_at' => $end,
                    'updated_at' => now(),
                ]);
        }
    }
}
