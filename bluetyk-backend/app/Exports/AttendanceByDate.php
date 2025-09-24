<?php

namespace App\Exports;

use App\AttendanceFormatter;
use App\Models\Attendances;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class AttendanceByDate implements WithMultipleSheets
{
    use AttendanceFormatter;

    protected string $date;

    public function __construct(?string $date = null)
    {
        $this->date = $date ?? Carbon::today()->toDateString();
    }

    public function sheets(): array
    {
        $sheets = [];

        // Fetch all attendances for the date
        $attendances = Attendances::with([
            'memberToDevice.member.department',
            'memberToDevice.device.deviceToLocation'
        ])
            ->whereDate('timestamp', $this->date)
            ->get();

        // Format attendances first
        $formatted = $this->groupAndFormatAttendance($attendances)
            ->map(function ($item) {
                $inLogged = !empty($item['in_time']);
                // consider out_time logged only if it’s not null AND not “Still Working” or “not outed”
                $outLogged = !empty($item['out_time']) && !in_array($item['out_time'], ['Still Working', 'not outed', 'not logged']);

                return [
                    'Department'      => $item['department_name'] ?? 'Unknown',
                    'Name'            => $item['member_name'],
                    'Date'            => $item['date'] ?? '-',
                    'In Time'         => $inLogged ? $item['in_time'] : 'not logged',
                    'Out Time'        => $outLogged ? $item['out_time'] : ' not outed',
                    'Worked Duration' => $inLogged && $outLogged ? $item['worked_duration'] : ' not outed',
                    'In Status'       => $inLogged ? '✔' : '✘',
                    'Out Status'      => $outLogged ? '✔' : '✘',
                ];
            });

    
        // Group by department after formatting
        $groupedByDept = $formatted->groupBy('Department');

        foreach ($groupedByDept as $department => $records) {
            $sheets[] = new \App\Exports\ExcelExport(
                collect($records),
                ['Name', 'Date', 'In Time', 'Out Time', 'Worked Duration', 'In Status', 'Out Status'], // headers
                $department, // tab name
                $this->date, // date
                'Attendance Details' // main sheet title
            );
        }

        return $sheets;
    }
}
