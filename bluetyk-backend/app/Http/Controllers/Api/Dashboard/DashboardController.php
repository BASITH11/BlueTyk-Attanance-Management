<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\AttendanceFormatter;
use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\Members;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Attendances;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use AttendanceFormatter;
    public static function routes()
    {
        Route::controller(self::class)
            ->prefix('dashboard')
            ->middleware(['auth:sanctum', 'check.user', 'check.subscription'])
            ->group(function () {
                Route::get('dashboard-details', 'dashboardDetails')->name('dashboard.details');
            });
    }

    /**
     * function to get the details 
     */
    public function dashboardDetails()
    {
        try {
            $totalUsers = User::count();
            $totalMembers = Members::whereHas('memberToDevice', function ($query) {
                $query->where('status', 'success');
            })
                ->count();
            $totalDevices = Device::where('status', 'online')->count();
            $inactiveUsers = User::onlyTrashed()->count();
            $inactiveMembers = Members::whereHas('memberToDevice', function ($query) {
                $query->where('status', 'pending');
            })
                ->count();
            $inactiveDevices = Device::where('status', 'offline')->count();

            $today = Carbon::today();

            $attendances = Attendances::with([
                'memberToDevice.member',
                'memberToDevice.device.deviceToLocation'
            ])
                ->whereDate('timestamp', $today)
                ->get();


            $attendances = $attendances->filter(function ($attendance) {
                $relation = $attendance->memberToDevice->first();
                if (!$relation || !$relation->member) {

                    return false;
                }
                return true;
            });



            // Group by member + device + date
            $grouped = $attendances->groupBy(function ($attendance) {
                $relation = $attendance->memberToDevice->first();

                $memberId = optional($relation->member)->id; // safe access

                return $memberId . '-' .
                    $attendance->device_serial_no . '-' .
                    Carbon::parse($attendance->timestamp)->format('Y-m-d');
            });

            // Map to count per group
            $totalCount = $grouped->count();


            #gets the latest entries
            $formattedEntries = $this->getLatestUniqueAttendances($today, 10);


            return response()->json([
                'status' => true,
                'message' => 'Welcome to dashboard',
                'data' => [
                    'total_users' => $totalUsers,
                    'total_members' => $totalMembers,
                    'total_device' => $totalDevices,
                    'todays_punches' => $totalCount,
                    'recent_entries' => $formattedEntries,
                    'inactive_users' => $inactiveUsers,
                    'inactive_devices' => $inactiveDevices,
                    'inactive_members' => $inactiveMembers,
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Something went wrong',
                'error' => $e->getMessage(),
            ], 500);
        }
    }





    /**
     * latest entries of member logged 
     */
    private function getLatestUniqueAttendances($date, $limit = 10)
    {
        // Step 1: Get all punches today ordered by latest timestamp
        $latestUnique = DB::table('attendances')
            ->select('device_serial_no', 'pin', 'timestamp')
            ->whereDate('timestamp', $date)
            ->orderByDesc('timestamp')
            ->get();

        // Step 2: Filter to get exactly $limit unique device+pin combinations
        $latestArray = [];
        foreach ($latestUnique as $entry) {
            $key = $entry->device_serial_no . '_' . $entry->pin;

            if (!isset($latestArray[$key])) {
                $latestArray[$key] = [
                    'device_serial_no' => $entry->device_serial_no,
                    'pin' => $entry->pin,
                    'timestamp' => $entry->timestamp,
                ];
            }

            if (count($latestArray) == $limit) {
                break;
            }
        }

        // Step 3: Extract device+pin pairs for querying full attendance records
        $devicePinPairs = [];
        foreach ($latestArray as $entry) {
            $devicePinPairs[] = [
                'device_serial_no' => $entry['device_serial_no'],
                'pin' => $entry['pin'],
            ];
        }

        // Step 4: Fetch all punches for these latest unique users
        $latestEntries = Attendances::with([
            'memberToDevice.member',
            'memberToDevice.device.deviceToLocation'
        ])
            ->whereDate('timestamp', $date)
            ->where(function ($query) use ($devicePinPairs) {
                foreach ($devicePinPairs as $pair) {
                    $query->orWhere(function ($q) use ($pair) {
                        $q->where('device_serial_no', $pair['device_serial_no'])
                            ->where('pin', $pair['pin']);
                    });
                }
            })
            ->orderByDesc('timestamp')
            ->get();

        return $this->groupAndFormatAttendance($latestEntries);
    }
}
