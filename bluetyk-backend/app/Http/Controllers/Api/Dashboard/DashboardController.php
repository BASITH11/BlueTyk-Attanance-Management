<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\Members;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Attendances;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public static function routes()
    {
        Route::controller(self::class)
            ->prefix('dashboard')
            ->middleware(['auth:sanctum', 'check.user','check.subscription'])
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
            $totalDevices = Device::count();
            $inactiveUsers = User::onlyTrashed()->count();
            $inactiveMembers = Members::onlyTrashed()->count();
            $inactiveDevices = Device::onlyTrashed()->count();

            // Fetch recent punches with joins
            $recentPunches = DB::table('attendances')
                ->leftJoin('members_to_device', function ($join) {
                    $join->on('attendances.pin', '=', 'members_to_device.device_user_id')
                        ->on('attendances.device_serial_no', '=', 'members_to_device.device_serial_no');
                })
                ->leftJoin('members', 'members.id', '=', 'members_to_device.member_id')
                ->leftJoin('device', 'device.id', '=', 'members_to_device.device_id')
                ->leftJoin('locations', 'locations.id', '=', 'device.location_id')
                ->select(
                    'attendances.id',
                    'attendances.device_serial_no',
                    'attendances.pin',
                    'attendances.timestamp',
                    'attendances.status',
                    'attendances.verified',
                    'members.name as member_name',
                    'device.device_name',
                    'locations.location_name'
                )
                ->orderBy('attendances.timestamp', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($attendance) {
                    return [
                        'id' => $attendance->id,
                        'device_name' => $attendance->device_name,
                        'member_name' => $attendance->member_name,
                        'device_serial_no' => $attendance->device_serial_no,
                        'location_name' => $attendance->location_name,
                        'pin' => $attendance->pin,
                        'timestamp' => Carbon::parse($attendance->timestamp)->format('d-m-y (h:i:s A)'),
                        'time_ago' => Carbon::parse($attendance->timestamp)->diffForHumans(),
                        'status' => $attendance->status,
                        'verified' => $attendance->verified,
                    ];
                });

            $todaysPunches = Attendances::whereDate('timestamp', Carbon::today())->count();

            return response()->json([
                'status' => true,
                'message' => 'Welcome to dashboard',
                'data' => [
                    'total_users' => $totalUsers,
                    'total_members' => $totalMembers,
                    'total_device' => $totalDevices,
                    'recent_punches' => $recentPunches,
                    'todays_punches' => $todaysPunches,
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
