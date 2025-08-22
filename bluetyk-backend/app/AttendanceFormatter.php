<?php

namespace App;

use Carbon\Carbon;

trait AttendanceFormatter
{
    public function groupAndFormatAttendance($attendances)
    {
        $attendances = $attendances->filter(fn($attendance) => $attendance->memberToDevice->isNotEmpty());

        # Group by member + device + date
        $grouped = $attendances->groupBy(function ($attendance) {
            $relation = $attendance->memberToDevice->first();
            return $relation->member->id . '-' .
                $attendance->device_serial_no . '-' .
                Carbon::parse($attendance->timestamp)->format('Y-m-d');
        });

        # Map to formatted array
        return $grouped->map(function ($logs) {
            $relation = $logs->first()->memberToDevice->first();
            $sorted   = $logs->sortBy(fn($log) => Carbon::parse($log->timestamp))->values();

            #Remove punches within 1 minute of the previous one
            $filtered = collect();
            $prev = null;
            foreach ($sorted as $log) {
                $current = Carbon::parse($log->timestamp);
                // if ($prev && $prev->diffInSeconds($current) <= 60) {
                //     continue; // skip if within 1 minute
                // }
                $filtered->push($log);
                $prev = $current;
            }

            if ($filtered->isEmpty()) {
                return null;
            }

            $inTime   = $filtered->first()->timestamp;
            $workedSeconds = 0;
            $totalBreakSeconds = 0;
            $breaks = [];

            #Iterate through punches
            for ($i = 0; $i < $filtered->count(); $i++) {
                $current = Carbon::parse($filtered[$i]->timestamp);
                $next    = isset($filtered[$i + 1]) ? Carbon::parse($filtered[$i + 1]->timestamp) : null;

                #Even index = IN
                if ($i % 2 === 0) {
                    if ($next) {
                        #Add work session duration
                        $workedSeconds += $current->diffInSeconds($next);
                    }
                }

                #Odd index = OUT → check for break
                if ($i % 2 === 1 && $next) {
                    $breakSeconds = $current->diffInSeconds($next);
                    $totalBreakSeconds += $breakSeconds;

                    $breaks[] = [
                        'break_start' => $current->format('h:i:s A'),
                        'break_end'   => $next->format('h:i:s A'),
                        'duration'    => sprintf(
                            '%d hours %d minutes',
                            floor($breakSeconds / 3600),
                            ($breakSeconds % 3600) / 60
                        ),
                    ];
                }
            }

            #OUT time logic
            $outTime = $filtered->count() % 2 === 0
                ? $filtered->last()->timestamp // last is OUT
                : null; // last is IN

            $workedDuration = ($outTime && $workedSeconds > 0)
                ? sprintf('%d hours %d minutes', floor($workedSeconds / 3600), ($workedSeconds % 3600) / 60)
                : null;

            $totalBreakDuration = $totalBreakSeconds > 0
                ? sprintf('%d hours %d minutes', floor($totalBreakSeconds / 3600), ($totalBreakSeconds % 3600) / 60)
                : "0 hours 0 minutes";

            return [
                'id' => $logs->first()->id,
                'member_name' => trim(optional($relation?->member)->name) ?: 'Unknown',
                'department_name'=> optional($relation?->member?->department)->department_name,
                'device_name' => optional($relation->device)->device_name,
                'location_name' => optional($relation->device->deviceToLocation)->location_name,
                'device_serial_no' => $logs->first()->device_serial_no,
                'date' => Carbon::parse($inTime)->format('d-m-Y'),
                'in_time' => Carbon::parse($inTime)->format('h:i:s A'),
                'out_time' => $outTime
                    ? Carbon::parse($outTime)->format('h:i:s A')
                    : (Carbon::parse($inTime)->isToday() ? 'Still Working' : 'Not Outed'),
                'worked_duration' => $workedDuration,
                'breaks' => $breaks,
                'total_break_duration' => $totalBreakDuration,
            ];
        })->filter()->values();
    }
}
