<?php

namespace App\Http\Controllers\Api\Attandance;

use App\Http\Controllers\Controller;
use App\Models\Attendances;
use App\Models\AttendanceWithMember;
use App\Models\Members;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Exception;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttandaceController extends Controller
{
  public static function routes()
  {
    Route::controller(self::class)
      ->prefix('attendance')
      ->middleware(['auth:sanctum', 'check.user', 'check.subscription'])
      ->group(function () {
        Route::get('get-attendance', 'index')->name('get.attendance');
        Route::get('get-attendance-by-id', 'getAttendaceById')->name('get.attenandancebyid');
      });
  }


  /**
   * function to get all the attandance
   */
  public function index(Request $request)
  {
    try {
      $query = DB::table('attendances')
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
        );

      // Filter by member name (optional)
      if ($request->name) {
        $query->where('members.name', 'like', '%' . $request->name . '%');
      }

      // Filter by device id
      if ($request->device) {
        $query->where('device.id', $request->device);
      }

      // Filter by location id
      if ($request->location) {
        $query->where('locations.id', $request->location);
      }

      // Filter by date range
      if ($request->from_date && $request->to_date) {
        $query->whereBetween('attendances.timestamp', [
          $request->from_date . ' 00:00:00',
          $request->to_date . ' 23:59:59'
        ]);
      }

      // Order by timestamp descending
      $attendances = $query->orderBy('attendances.timestamp', 'desc')->get();

      // Format timestamp
      $data = $attendances->map(function ($attendance) {
        return [
          'device_name' => $attendance->device_name,
          'member_name' => $attendance->member_name,
          'device_serial_no' => $attendance->device_serial_no,
          'location_name' => $attendance->location_name,
          'timestamp' => Carbon::parse($attendance->timestamp)->format('d-m-y (h:i:s A)'),
          'status' => $attendance->status,
          'verified' => $attendance->verified,
        ];
      });

      return response()->json([
        'status' => true,
        'message' => "Retrieved attendances successfully",
        'data' => $data
      ], 200);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'message' => $e->getMessage(),
      ], 500);
    }
  }


/**
 * function for getting the individual attendance 
 */
  public function getAttendaceById(Request $request)
  {
    try {
      $validator = Validator::make($request->all(), [
        'id' => 'required|exists:members,id',
      ]);

      if ($validator->fails()) {
        return response()->json([
          'status'  => false,
          'message' => $validator->errors()->first(),
          'errors'  => 'Validation error',
        ], 422);
      }

      $member = Members::with('memberToDevice.device.deviceToLocation')
        ->where('id', $request->id)
        ->first();

      if (!$member->memberToDevice || $member->memberToDevice->isEmpty()) {
        return response()->json([
          'status' => false,
          'message' => 'No devices assigned to this member.',
        ], 404);
      }

      $attendances = collect();

      foreach ($member->memberToDevice as $memberDevice) {
        $deviceAttendances = Attendances::where('device_serial_no', $memberDevice->device->device_serial_no)
          ->where('pin', $memberDevice->device_user_id)
          ->get()
          ->map(function ($item) use ($memberDevice) {
            $dateTime = Carbon::parse($item->timestamp);
            return [
              'id' => $item->id,
              'device_name' => $memberDevice->device->device_name,
              'location' => $memberDevice->device->deviceToLocation->location_name ?? null,
              'device_serial_no' => $item->device_serial_no,
              'pin' => $item->pin,
              'date' => $dateTime->format('d-m-y'),
              'time' => $dateTime->format('h:i:s A'),
              'status' => $item->status,
              'verified' => $item->verified,
              'created_at' => $item->created_at,
              'updated_at' => $item->updated_at,
            ];
          });

        $attendances = $attendances->merge($deviceAttendances);
      }

      // Optional: sort by timestamp descending
      $attendances = $attendances->sortByDesc('created_at')->values();

      return response()->json([
        'status' => true,
        'data' => $attendances,
        'message' => 'Attendance Loaded successfully',
      ], 200);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'message' => $e->getMessage(),
      ], 500);
    }
  }
}
