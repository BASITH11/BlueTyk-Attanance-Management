<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommandQueues extends Model
{
    protected $table = 'command_queues';

    protected $primaryKey = 'id';

    public $timestamps = 'true';

    protected $fillable = [
        'device_serial_no',
        'command',
        'priority',
        'sent',
    ];


    /**
     * function to get all the user
     */
    public static function sendGetAllUsersCommand($deviceSerialNo)
    {
        $cmdId = time(); // or use uniqid() if you want more uniqueness
        $command = "C:$cmdId:DATA QUERY USERINFO Stamp=0";

        return self::create([
            'device_serial_no' => $deviceSerialNo,
            'command' => $command,
            'priority' => 1,
            'sent' => false,
        ]);
    }
}
