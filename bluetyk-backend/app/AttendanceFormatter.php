<?php

namespace App;

use App\Models\Settings;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

trait AttendanceFormatter
{
    public function groupAndFormatAttendance($attendances)
    {
        // Filter out invalid attendances
        $attendances = $attendances->filter(function ($attendance) {
            $relation = $attendance->memberToDevice->first();
            return $relation && $relation->member;
        });

        # Group by member + device + shift window
        $grouped = $attendances->groupBy(function ($attendance) {
            $relation = $attendance->memberToDevice->first();
            $member   = $relation?->member;
            $shift    = $member?->shift;

            if (!$member || !$shift) {
                return null;
            }

            $timestamp = Carbon::parse($attendance->timestamp);

            // Build shift start & end for this day
            $shiftStart = Carbon::parse($timestamp->format('Y-m-d') . ' ' . $shift->shift_start);
            $shiftEnd   = Carbon::parse($timestamp->format('Y-m-d') . ' ' . $shift->shift_end);

            // Handle overnight shifts
            if ($shift->is_overnight) {
                $shiftEnd->addDay();
            }

            // One-hour grace period before shift start
            $oneHourBefore = $shiftStart->copy()->subHour();

            // Case 1: Punch before shift start
            if ($timestamp->between($oneHourBefore, $shiftStart)) {
                $timestamp = $shiftStart->copy(); // treat as IN
            } elseif ($timestamp->lt($oneHourBefore)) {
                // Belongs to previous shift
                $shiftStart->subDay();
                $shiftEnd->subDay();
            }

            // Case 2: Punch after shift end → extend shift window
            if ($timestamp->gt($shiftEnd)) {
                $shiftEnd = $timestamp->copy();
            }

            // Group key = member_id + device + shift_id + shift_date
            return $member->id . '-' .
                $attendance->device_serial_no . '-' .
                $shift->id . '-' .
                $shiftStart->format('Y-m-d');
        });

        # Map each group into formatted output
        return $grouped->map(function ($logs) {
            $relation = $logs->first()->memberToDevice->first();
            $member   = $relation?->member;
            $shift    = $member?->shift;

            $sorted   = $logs->sortBy(fn($log) => Carbon::parse($log->timestamp))->values();



            $skipShortPunches = Settings::where('description', 'skip_short_punches')->value('value') === 'true';
            $thresholdSeconds = (int) Settings::where('description', 'skiping_time')->value('value') ?? 60;
            // Remove punches within 60 seconds of previous one
            $filtered = collect();
            $prev = null;

            foreach ($sorted as $log) {
                $current = Carbon::parse($log->timestamp, config('app.timezone'));

                if ($prev && $skipShortPunches) {
                    $diff = $current->diffInSeconds($prev, true);

                    if ($diff < $thresholdSeconds) continue;
                }

                $filtered->push($log);
                $prev = $current;
            }



            if ($filtered->isEmpty()) {
                return null;
            }

            $inTime   = Carbon::parse($filtered->first()->timestamp);
            $outTime  = $filtered->count() % 2 === 0
                ? Carbon::parse($filtered->last()->timestamp)
                : null;

            # --- Fix: If only one punch and it's after shift_end → treat as OUT ---
            if ($filtered->count() === 1) {
                $shiftStart = Carbon::parse($inTime->format('Y-m-d') . ' ' . $shift->shift_start);
                $shiftEnd   = Carbon::parse($inTime->format('Y-m-d') . ' ' . $shift->shift_end);

                if ($shift->is_overnight) {
                    $shiftEnd->addDay();
                }

                if ($inTime->gt($shiftEnd)) {
                    // Move it from IN to OUT
                    $outTime = $inTime;
                    $inTime  = null;
                }
            }

            $workedSeconds = 0;
            $totalBreakSeconds = 0;
            $breaks = [];

            // Iterate punches
            for ($i = 0; $i < $filtered->count(); $i++) {
                $current = Carbon::parse($filtered[$i]->timestamp);
                $next    = isset($filtered[$i + 1]) ? Carbon::parse($filtered[$i + 1]->timestamp) : null;

                # Even index = IN
                if ($i % 2 === 0 && $next) {
                    $workedSeconds += $current->diffInSeconds($next);
                }

                # Odd index = OUT → break until next IN
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

            # Worked duration
            $workedDuration = ($outTime && $workedSeconds > 0)
                ? sprintf('%d hours %d minutes', floor($workedSeconds / 3600), ($workedSeconds % 3600) / 60)
                : null;

            $totalBreakDuration = $totalBreakSeconds > 0
                ? sprintf('%d hours %d minutes', floor($totalBreakSeconds / 3600), ($totalBreakSeconds % 3600) / 60)
                : "0 hours 0 minutes";

            # Shift start & end for overtime calculation
            $shiftStart = Carbon::parse($inTime->format('Y-m-d') . ' ' . $shift->shift_start);
            $shiftEnd   = Carbon::parse($inTime->format('Y-m-d') . ' ' . $shift->shift_end);

            if ($shift->is_overnight) {
                $shiftEnd->addDay();
            }

            #calculation of overtime
            # Shift duration in seconds
            $shiftDurationSeconds = $shiftStart->diffInSeconds($shiftEnd);

            # Worked duration in seconds (already calculated as $workedSeconds)
            if ($workedSeconds > $shiftDurationSeconds) {
                $overtimeSeconds = $workedSeconds - $shiftDurationSeconds;
            } else {
                $overtimeSeconds = 0;
            }

            $overtime = $overtimeSeconds > 0
                ? sprintf('%d hours %d minutes', floor($overtimeSeconds / 3600), ($overtimeSeconds % 3600) / 60)
                : "0 hours 0 minutes";

            # Login/logout status
            if ($inTime->lt($shiftStart)) {
                $loginStatus = "Early";
            } elseif ($inTime->eq($shiftStart) || $inTime->lte($shiftStart->copy()->addMinutes(5))) {
                $loginStatus = "On Time";
            } else {
                $loginStatus = "Late";
            }

            #logout staus 
            if (!$outTime) {
                $logoutStatus = "Not Outed";
            } elseif ($outTime->lt($shiftEnd)) {
                $logoutStatus = "Early Logout";
            } elseif ($outTime->eq($shiftEnd) || $outTime->lte($shiftEnd->copy()->addMinutes(5))) {
                $logoutStatus = "On Time";
            } else {
                $logoutStatus = "Late Logout";
            }


            $entityName = Settings::where('description', 'entity_name')->value('value');
            if ($entityName === 'students') {
                // Student logic
                if ($inTime) {
                    $attendanceStatus = 'Present';
                } else {
                    $attendanceStatus = 'Absent';
                }
            } else {
                // Default staff logic
                if ($inTime && $outTime) {
                    $attendanceStatus = 'Present';
                } else {
                    $attendanceStatus = 'Absent';
                }
            }
            return [
                'id' => $logs->first()->id,
                'member_id' => $member->id ?? 0,
                'shift' => $shift?->shift_name,
                'member_name' => $member->name ?? 'Unknown',
                'phone_no' => $member->phone_no ?? null, 
                'department_name' => optional($member->department)->department_name,
                'device_name' => optional($relation->device)->device_name,
                'location_name' => optional($relation->device->deviceToLocation)->location_name,
                'device_serial_no' => $logs->first()->device_serial_no,
                'date' => $inTime?->format('d-m-Y') ?? $outTime?->format('d-m-Y') ?? null,
                'in_time' => $inTime ? $inTime->format('h:i:s A') : 'Not In',
                'out_time' => $outTime
                    ? $outTime->format('h:i:s A')
                    : (($inTime?->isToday() ?? false) ? 'Still Working' : 'Not Outed'),
                'worked_duration' => $workedDuration,
                'breaks' => $breaks,
                'total_break_duration' => $totalBreakDuration,
                'login_status' => $loginStatus,
                'logout_status' => $logoutStatus,
                'overtime' => $overtime,
                'attendance_status' => $attendanceStatus,
            ];
        })->filter()->values();
    }
}
