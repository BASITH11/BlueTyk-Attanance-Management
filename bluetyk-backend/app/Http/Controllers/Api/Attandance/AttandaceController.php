<?php

namespace App\Http\Controllers\Api\Attandance;

use App\AttendanceFormatter;
use App\Http\Controllers\Controller;
use App\Models\Attendances;
use App\Models\AttendanceWithMember;
use App\Models\Device;
use App\Models\Members;
use App\Models\TempFormattedAttendanceTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Exception;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Exports\AllClassesAttendanceExport;
use App\Exports\AttendanceByDate;
use App\Models\SmsLog;
use Maatwebsite\Excel\Facades\Excel;

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
        Route::get('download-attendance', 'exportAttendance')->name('attendance.download');
        Route::get('download-attendance-by-date', 'downloadAttendanceByDate')->name('downloadAttendanceByDate.download');
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

      $perPage = $request->get('per_page', 100);
      if ($validator->fails()) {
        return response()->json([
          'status'  => false,
          'message' => $validator->errors()->first(),
          'errors'  => 'Validation error',
        ], 422);
      }

      $query = Attendances::with([
        'memberToDevice.member.department',
        'memberToDevice.member.shift',
        'memberToDevice.device.deviceToLocation'
      ])
        ->whereHas('memberToDevice.member', function ($q) use ($request) {
          $q->where('id', $request->id);
        });

      $attendances = $query->orderByDesc('timestamp')->get();


      $data = $this->groupAndFormatAttendance($attendances);
      TempFormattedAttendanceTable::truncate();
      collect($data)->chunk(10)->each(function ($chunk) {
        $insertData = [];
        foreach ($chunk as $item) {
          $insertData[] = [
            'member_id'            => $item['member_id'],
            'member_name'          => $item['member_name'],
            'department_name'      => $item['department_name'],
            'device_name'          => $item['device_name'],
            'location_name'        => $item['location_name'],
            'device_serial_no'     => $item['device_serial_no'],
            'date'                 => Carbon::parse($item['date'])->format('Y-m-d'),
            'in_time'              => Carbon::parse($item['in_time'])->format('H:i:s'),
            'out_time' => $item['out_time']
              && !in_array($item['out_time'], ['Still Working', 'Not Outed'])
              ? Carbon::parse($item['out_time'])->format('H:i:s')
              : null,
            'worked_duration'      => $item['worked_duration'],
            'total_break_duration' => $item['total_break_duration'],
            'breaks'               => json_encode($item['breaks']),
            'shift'                => $item['shift'],
            'login_status'         => $item['login_status'],
            'logout_status'        => $item['logout_status'],
            'overtime'             => $item['overtime'],
            'attendance_status'    => $item['attendance_status'],
          ];
        }
        TempFormattedAttendanceTable::insert($insertData);
      });

      $data = TempFormattedAttendanceTable::orderByDesc('id')->paginate($perPage);

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
      $perPage = $request->get('per_page', 100);
      $page    = $request->get('page', 1);

      $filters = collect($request->only([
        'name',
        'device',
        'location',
        'department',
        'from_date',
        'to_date'
      ]));

      if ($filters->filter()->isNotEmpty()) {
        $page = 1;
      }

      // Decide whether to refresh temp table
      $shouldRefreshTempTable = $filters->filter()->isNotEmpty()  || $page == 1;

      if ($shouldRefreshTempTable) {
        // Fetch raw Attendances
        $query = Attendances::with([
          'memberToDevice.member.department',
          'memberToDevice.member.shift',
          'memberToDevice.device.deviceToLocation'
        ]);

        if ($request->filled('name')) {
          $query->whereHas('memberToDevice.member', function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->name . '%');
          });
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

        if ($request->filled('from_date') && $request->filled('to_date')) {
          $query->whereBetween('timestamp', [
            Carbon::parse($request->from_date)->startOfDay(),
            Carbon::parse($request->to_date)->endOfDay(),
          ]);
        } elseif ($request->filled('from_date')) {
          $query->whereDate('timestamp', Carbon::parse($request->from_date));
        } else {
          $query->whereDate('timestamp', Carbon::today());
        }

        $attendances = $query->orderByDesc('timestamp')->get();


        $data = $this->groupAndFormatAttendance($attendances);

        // // Refresh Temp Table
        TempFormattedAttendanceTable::truncate();
        collect($data)->chunk(10)->each(function ($chunk) {
          $insertData = [];
          foreach ($chunk as $item) {
            $insertData[] = [
              'member_id'            => $item['member_id'],
              'member_name'          => $item['member_name'],
              'department_name'      => $item['department_name'],
              'device_name'          => $item['device_name'],
              'location_name'        => $item['location_name'],
              'device_serial_no'     => $item['device_serial_no'],
              'date'                 => Carbon::parse($item['date'])->format('Y-m-d'),
              'in_time'              => Carbon::parse($item['in_time'])->format('H:i:s'),
              'out_time' => $item['out_time']
                && !in_array($item['out_time'], ['Still Working', 'Not Outed'])
                ? Carbon::parse($item['out_time'])->format('H:i:s')
                : null,
              'worked_duration'      => $item['worked_duration'],
              'total_break_duration' => $item['total_break_duration'],
              'breaks'               => json_encode($item['breaks']),
              'shift'                => $item['shift'],
              'login_status'         => $item['login_status'],
              'logout_status'        => $item['logout_status'],
              'overtime'             => $item['overtime'],
              'attendance_status'    => $item['attendance_status'],

            ];
          }
          TempFormattedAttendanceTable::insert($insertData);
        });
      }

      #Always paginate from temp table
      $data = TempFormattedAttendanceTable::orderByDesc('id')->paginate($perPage, ['*'], 'page', $page);

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
   * Get the members who have NOT logged today
   */
  public function getMembersNotLoggedToday(Request $request)
  {
    try {
      $perPage = $request->get('per_page', 100);
      $date = $request->filled('date') ? Carbon::parse($request->date) : Carbon::today();

      # Get attendances of that date
      $attendancesOnDate = Attendances::with('memberToDevice.member.shift')
        ->whereDate('timestamp', $date)
        ->get();

      # Extract logged member IDs
      $loggedMemberIds = $attendancesOnDate
        ->pluck('memberToDevice.*.member.id')
        ->flatten()
        ->unique()
        ->filter();

      # Query members who are NOT in the logged list
      $query = Members::whereNotIn('id', $loggedMemberIds)
        ->with(['memberToDevice.device.deviceToLocation', 'department']);

      # Filters
      if ($request->filled('name')) {
        $query->where('name', 'like', '%' . $request->name . '%');
      }

      if ($request->filled('device')) {
        $query->whereHas('memberToDevice.device', function ($q) use ($request) {
          $q->where('id', $request->device);
        });
      }

      if ($request->filled('department')) {
        $query->whereHas('department', function ($q) use ($request) {
          $q->where('id', $request->department);
        });
      }

      if ($request->filled('location')) {
        $query->whereHas('memberToDevice.device.deviceToLocation', function ($q) use ($request) {
          $q->where('id', $request->location);
        });
      }

      # Paginate
      $membersNotLogged = $query->paginate($perPage);

      $smsSentMemberIds = SmsLog::whereDate('timestamp', $date)
        ->where('status','success')
        ->pluck('member_id')
        ->unique();


      $isToday = $date->isToday();
      # Transform collection inside pagination
      $membersNotLogged->getCollection()->transform(function ($member) use ($smsSentMemberIds, $isToday) {
        $formatted = [];

        foreach ($member->memberToDevice as $memberDevice) {
          $device = $memberDevice->device;

          $name = trim($member->name);

          # Check if device is online (last_seen within 3 minutes)
          $deviceOnline = $device && $device->last_seen_at
            && Carbon::parse($device->last_seen_at)->gte(Carbon::now()->subMinutes(3));

          # Compose remark
          if (!$deviceOnline) {
            $remark = ['Device offline'];
          } else {
            $remark = ['Student not logged'];
          }

          $formatted[] = [
            'member_id'       => $member->id ?? null,
            'phone_no'        => $member->phone_no ?? null,
            'name'            => $name !== '' ? $name : 'Unknown',
            'device_name'     => $device->device_name ?? null,
            'location_name'   => $device->deviceToLocation->location_name ?? null,
            'department_name' => $member->department->department_name ?? null,
            'remark'          => $remark, // combine remarks
            'device_status'   => $deviceOnline ? 'Online' : 'Offline',
            'sms_sent'        => $smsSentMemberIds->contains($member->id),
            'can_send_sms'    => config('app.sms_enabled') && $isToday && $deviceOnline && !$smsSentMemberIds->contains($member->id),
          ];
        }

        return $formatted;
      });

      # Flatten because each member may expand to multiple devices
      $membersNotLogged->setCollection(
        $membersNotLogged->getCollection()->flatten(1)
      );

      return response()->json([
        'status'  => true,
        'data'    => $membersNotLogged,
        'message' => 'Members not logged on ' . $date->toDateString() . ' loaded successfully',
      ]);
    } catch (Exception $e) {
      return response()->json([
        'status'  => false,
        'message' => 'Something went wrong',
        'error'   => $e->getMessage(),
      ], 500);
    }
  }



  /**
   * download the excel file 
   */

  public function exportAttendance(Request $request)
  {

    $fileName = 'Attendance_' . date('Y-m-d') . '.xlsx';
    return Excel::download(new AllClassesAttendanceExport, $fileName);
  }

  /**
   * download the excel of attendance by date
   */

  public function downloadAttendanceByDate(Request $request)
  {
    $date = $request->get('date', Carbon::today()->toDateString());
    $fileName = "Attendance_By_Department_{$date}.xlsx";
    return Excel::download(
      new AttendanceByDate($date),
      $fileName
    );
  }
}
