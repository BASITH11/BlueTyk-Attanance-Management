<?php

namespace App\Http\Controllers\Api\Attandance;

use App\AttendanceFormatter;
use App\Http\Controllers\Controller;
use App\Models\Attendances;
use App\Models\AttendanceWithMember;
use App\Models\Device;
use App\Models\Members;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Exception;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttandaceController extends Controller
{

  use AttendanceFormatter;
  public static function routes()
  {
    Route::controller(self::class)
      ->prefix('attendance')
      ->middleware(['auth:sanctum', 'check.user', 'check.subscription'])
      ->group(function () {
        Route::get('get-attendance', 'index')->name('get.attendance');
        Route::get('get-attendance-by-id', 'getAttendanceById')->name('get.attenandancebyid');
        Route::get('get-todays-attendance', 'getTodaysAllAttendance')->name('get.todays.allAttendance');
        Route::get('get-not-logged-today', 'getMembersNotLoggedToday')->name('attenance.notLoggedToday');
      });
  }


  /**
   * function to get all the attandance
   */
  public function index(Request $request)
  {
    try {
      $query = Attendances::with([
        'memberToDevice.member.department',
        'memberToDevice.device.deviceToLocation'
      ]);

      if ($request->filled('name')) {
        $query->whereHas('memberToDevice.member', function ($q) use ($request) {
          $q->where('name', 'like', '%' . $request->name . '%');
        });
      }

      // Filter by Device ID
      if ($request->filled('device')) {
        $query->whereHas('memberToDevice.device', function ($q) use ($request) {
          $q->where('id', $request->device);
        });
      }

      if ($request->filled('department')) {
        $query->whereHas('memberToDevice.member.department', function ($q) use ($request) {
          $q->where('id', $request->department);
        });
      }

      // Filter by Location ID
      if ($request->filled('location')) {
        $query->whereHas('memberToDevice.device.deviceToLocation', function ($q) use ($request) {
          $q->where('id', $request->location);
        });
      }

      #Filter by Date Range (timestamp in attendances)
      if ($request->filled('from_date') && $request->filled('to_date')) {
        $query->whereBetween('timestamp', [
          $request->from_date . ' 00:00:00',
          $request->to_date . ' 23:59:59'
        ]);
      }

      $attendances = $query->orderByDesc('timestamp')->get();

      $data = $this->groupAndFormatAttendance($attendances);

      return response()->json([
        'status' => true,
        'message' => "Retrieved attendances successfully",
        'data' => $data,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'status' => false,
        'message' => $e->getMessage()
      ], 500);
    }
  }




  /**
   * function for getting the individual attendance 
   */
  public function getAttendanceById(Request $request)
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

      $query = Attendances::with([
        'memberToDevice.member.department',
        'memberToDevice.device.deviceToLocation'
      ])
        ->whereHas('memberToDevice.member', function ($q) use ($request) {
          $q->where('id', $request->id);
        });

      $attendances = $query->orderByDesc('timestamp')->get();

      $data = $this->groupAndFormatAttendance($attendances);

      return response()->json([
        'status' => true,
        'message' => "Retrieved attendances successfully",
        'data' => $data,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'status' => false,
        'message' => $e->getMessage(),
      ], 500);
    }
  }



  /**
   * function to get the logs by days
   */

  public function getTodaysAllAttendance(Request $request)
  {

    try {


      $query = Attendances::with([
        'memberToDevice.member.department',
        'memberToDevice.device.deviceToLocation'
      ]);

      if ($request->filled('name')) {
        $query->whereHas('memberToDevice.member', function ($q) use ($request) {
          $q->where('name', 'like', '%' . $request->name . '%');
        });
      }

      // Filter by Device ID
      if ($request->filled('device')) {
        $query->whereHas('memberToDevice.device', function ($q) use ($request) {
          $q->where('id', $request->device);
        });
      }

      // Filter by Location ID
      if ($request->filled('location')) {
        $query->whereHas('memberToDevice.device.deviceToLocation', function ($q) use ($request) {
          $q->where('id', $request->location);
        });
      }
      # if both from date and to date means then 
      if ($request->filled('from_date') && $request->filled('to_date')) {
        $query->whereBetween('timestamp', [
          Carbon::parse($request->from_date)->startOfDay(),
          Carbon::parse($request->to_date)->endOfDay(),
        ]);
      }
      #if only the from date means
      elseif ($request->filled('from_date')) {
        $query->whereDate('timestamp', carbon::parse($request->from_date));
      } else {
        $query->whereDate('timestamp', carbon::today());
      }

      $attendances = $query
        ->orderByDesc('timestamp')
        ->get();

      $data = $this->groupAndFormatAttendance($attendances);


      return response()->json([
        'status' => true,
        'data' => $data,
        'message' => 'attendance loaded successfully',
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
   * public function to get the Not loges users of today
   */
  public function getMembersNotLoggedToday(Request $request)
  {
    try {

      $date = $request->filled('date') ? Carbon::parse($request->date) : Carbon::today();


      $attendancesOnDate = Attendances::with('memberToDevice')
        ->whereDate('timestamp', $date)
        ->get();


      $loggedMemberIds = $attendancesOnDate
        ->pluck('memberToDevice.*.member.id')
        ->flatten()
        ->unique()
        ->filter();


      $query = Members::whereNotIn('id', $loggedMemberIds)
        ->with('memberToDevice.device.deviceToLocation');


      if ($request->filled('name')) {
        $query->where('name', 'like', '%' . $request->name . '%');
      }


      if ($request->filled('device')) {
        $query->whereHas('memberToDevice.device', function ($q) use ($request) {
          $q->where('id', $request->device);
        });
      }

      if ($request->filled('department')) {
        $query->whereHas('memberToDevice.member.department', function ($q) use ($request) {
          $q->where('id', $request->department);
        });
      }

      if ($request->filled('location')) {
        $query->whereHas('memberToDevice.device.deviceToLocation', function ($q) use ($request) {
          $q->where('id', $request->location);
        });
      }

      $membersNotLogged = $query->get();


      $formatted = [];
      foreach ($membersNotLogged as $member) {
        foreach ($member->memberToDevice as $memberDevice) {
          $name = trim($member->name);
          $formatted[] = [
            'name' => $name !== '' ? $name : 'Unknown',
            'device_name' => $memberDevice->device->device_name ?? null,
            'location_name' => $memberDevice->device->deviceToLocation->location_name ?? null,
            'department_name' => $member->department->department_name ?? null,
          ];
        }
      }

      return response()->json([
        'status' => true,
        'data' => $formatted,
        'message' => 'Members not logged on ' . $date->toDateString() . ' loaded successfully',
      ]);
    } catch (Exception $e) {
      return response()->json([
        'status' => false,
        'message' => 'Something went wrong',
        'error' => $e->getMessage(),
      ], 500);
    }
  }
}
