<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TempFormattedAttendanceTable extends Model
{
    protected $table =  'temp_formatted_attendance_table';
    protected $fillable = [
        'member_id',
        'member_name',
        'department_name',
        'device_name',
        'location_name',
        'device_serial_no',
        'date',
        'in_time',
        'out_time',
        'worked_duration',
        'total_break_duration',
        'breaks',
        'shift',
        'login_status',
        'logout_status',
        'overtime',
        'attendance_status',
    ];

    protected $casts = [
        'breaks' => 'array',
    ];
}
