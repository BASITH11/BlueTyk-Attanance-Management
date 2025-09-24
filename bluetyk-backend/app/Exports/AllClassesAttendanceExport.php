<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use App\Models\TempFormattedAttendanceTable;

class AllClassesAttendanceExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        $sheets = [];

        $classes = TempFormattedAttendanceTable::distinct()->pluck('department_name');
        $date    = TempFormattedAttendanceTable::max('date');
        $sheetTitlePrefix = 'Logged Attendance Details';

        foreach ($classes as $className) {
            $rawData = TempFormattedAttendanceTable::where('department_name', $className)
                ->get(['member_name', 'in_time', 'out_time', 'worked_duration'])
                ->map(function ($row) {
                    return [
                        'Name'            => $row->member_name,
                        'Date'            => $row->date,
                        'In Time'         => $row->in_time ?? 'Not Logged',
                        'Out Time'        => $row->out_time ?? 'Not outed',
                        'Worked Duration' => $row->worked_duration ?? 'Not outed',
                        'In Status' => $row->in_time ? '✔' : '✘',
                        'Out Status' => $row->out_time ? '✔' : '✘',
                    ];
                });

            $sheets[] = new ExcelExport(
                $rawData,
                ['Name', 'In Time', 'Out Time', 'Worked Duration', 'In Status', 'Out Status'], // custom headers
                $className,
                $date,
                $sheetTitlePrefix
            );
        }

        return $sheets;
    }
}
