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
            $totalMembers = Members::count();
            $totalDevices = Device::where('status','online')->count();
            $inactiveUsers = User::onlyTrashed()->count();
            $inactiveMembers = Members::onlyTrashed()->count();
            $inactiveDevices = Device::where('status','offline')->count();

            $today = Carbon::today();

            $attendances = Attendances::with([
                'memberToDevice.member',
                'memberToDevice.device.deviceToLocation'
            ])
                ->whereDate('timestamp', $today)
                ->get();

            // Filter out records without memberToDevice
            $attendances = $attendances->filter(fn($attendance) => $attendance->memberToDevice->isNotEmpty());

            // Group by member + device + date
            $grouped = $attendances->groupBy(function ($attendance) {
                $relation = $attendance->memberToDevice->first();
                return $relation->member->id . '-' .
                    $attendance->device_serial_no . '-' .
                    Carbon::parse($attendance->timestamp)->format('Y-m-d');
            });

            // Map to count per group
            $totalCount = $grouped->count();


            

            // Latest 10 entries
            $latestEntries = Attendances::with([
                'memberToDevice.member',
                'memberToDevice.device.deviceToLocation'
            ])
                ->whereDate('timestamp', $today)
                ->orderByDesc('timestamp')
                ->get();

            // Optionally, you can reuse your trait for grouping & formatting
            $formattedEntries = $this->groupAndFormatAttendance($latestEntries);

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
}
