<?php

namespace App\Http\Controllers\Api\Sms;

use App\AttendanceFormatter;
use App\Http\Controllers\Controller;
use App\Jobs\SendSmsJob;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use App\Models\Attendances;
use App\Models\SmsLog;
use Carbon\Carbon;
use App\Exports\SmsLogExport;
use Maatwebsite\Excel\Facades\Excel;

class SmsController extends Controller
{

    use AttendanceFormatter;



    /**
     * static function for routes
     */
    public static function routes()
    {
        Route::controller(self::class)
            ->prefix('sms')
            ->middleware(['auth:sanctum', 'check.user', 'check.subscription'])
            ->group(function () {
                Route::post('/sent-sms', 'sentSmsNotLoggedToday')->name('sms.sentSms');
                Route::post('/sent-sms-logged', 'sendSmsLoggedToday')->name('sms.sentSmsLogged');
                Route::get('/get-sms-logs', 'getSmsLogs')->name('sms.getSmsLogs');
            });
    }


    /**
     * controller for sms of non logged 
     */

    public function sentSmsNotLoggedToday(Request $request)
    {
        try {
            // Check if it's bulk or single
            $members = $request->input('members');
            $isBulk = is_array($members);

            if ($isBulk) {
                // Bulk validation
                $validator = Validator::make($request->all(), [
                    'members' => 'required|array|min:1',
                    'members.*.member_id'  => 'required|integer',
                    'members.*.name'       => 'required|string',
                    'members.*.department' => 'required|string',
                    'members.*.mobile'     => 'nullable|string|min:10|max:12',
                ]);
            } else {
                // Single member validation
                $validator = Validator::make($request->all(), [
                    'member_id'  => 'required|integer',
                    'name'       => 'required|string',
                    'department' => 'required|string',
                    'mobile'     => 'nullable|string|min:10|max:12',
                ]);
            }

            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => $validator->errors()->first(),
                    'errors'  => $validator->errors(),
                ], 422);
            }

            $templateKey = 'Absent Today';

            if ($isBulk) {
                // Dispatch SMS for each member
                foreach ($validator->validated()['members'] as $data) {
                    SendSmsJob::dispatch(
                        $data['member_id'],
                        $data['name'],
                        $data['mobile'] ?? null,
                        $data['department'] ?? null,
                        now(),
                        $templateKey
                    );
                }
                $message = count($members) . " SMS queued successfully";
            } else {
                $data = $validator->validated();
                SendSmsJob::dispatch(
                    $data['member_id'],
                    $data['name'],
                    $data['mobile'] ?? null,
                    $data['department'] ?? null,
                    now(),
                    $templateKey
                );
                $message = "SMS queued successfully";
            }

            return response()->json([
                'status'  => true,
                'message' => $message,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }




    /**
     * function for sending logged members sms 
     */
    public function sendSmsLoggedToday(Request $request)
    {

        try {

            #sms sent already on the day
            $alreadySent = SmsLog::whereDate('timestamp', carbon::today())
                ->where('status', 'success')
                ->pluck('member_id')
                ->toArray();


            #members to sent sms
            $attendances = Attendances::with([
                'memberToDevice.member.department',
                'memberToDevice.member.shift',
                'memberToDevice.device.deviceToLocation'
            ])
                ->whereDate('timestamp', Carbon::today())
                ->whereHas('memberToDevice.member', function ($q) use ($alreadySent) {
                    $q->whereNotIn('id', $alreadySent);
                })
                ->get();

            $data = $this->groupAndFormatAttendance($attendances);
            $templateKey = 'Present Today';


            collect($data)->chunk(200)->each(function ($chunk) use ($templateKey) {
                foreach ($chunk as $item) {

                    $attendanceDateTime = null;
                    if (!empty($item['in_time'])) {
                        # Build datetime with Carbon
                        $attendanceDateTime = Carbon::today()
                            ->setTimeFromTimeString($item['in_time'])
                            ->format('d/m/y h:i A');
                        // Example: 19/09/25 08:45 AM
                    }

                    SendSmsJob::dispatch(
                        $item['member_id'],
                        $item['member_name'],
                        $item['phone_no'] ?? null,
                        $item['department_name'] ?? null,
                        $attendanceDateTime,
                        $templateKey
                    );
                }
            });

            return response()->json([
                'status' => true,
                'message' => 'SMS sending job executed successfully',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }


    /**
     * function to get the smslogs
     */
    public function getSmsLogs(Request $request)
    {
        try {


            $date = $request->input('date') ?? now()->toDateString();
            $perPage = $request->get('per_page', 100);

            #total students punched by date 
            $attendances = Attendances::with([
                'memberToDevice.member',
                'memberToDevice.device.deviceToLocation'
            ])
                ->whereDate('timestamp', $date)
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
            $totalPunches = $grouped->count();


            #total sms send count
            $TotalCount = SmsLog::whereDate('timestamp', $date)->distinct('member_id')->count();
            #members with successful sms
            $successMemberIds = SmsLog::whereDate('timestamp', $date)
                ->where('status', 'success')
                ->distinct()
                ->pluck('member_id');
            $successCount = $successMemberIds->count();
            #members with failed sms
            $failedCount = SmsLog::whereDate('timestamp', $date)
                ->where('status', 'failure')
                ->whereNotIn('member_id', $successMemberIds)
                ->distinct('member_id')
                ->count();


            $query = SmsLog::with('memberToDevice.member.department', 'memberToDevice.device')
                ->whereDate('timestamp', $date)
                ->orderBy('id', 'desc');

            // Apply filters dynamically
            if ($request->filled('name')) {
                $query->whereHas('memberToDevice.member', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->name . '%');
                });
            }

            if ($request->filled('card_no')) {
                $query->whereHas('memberToDevice.member', function ($q) use ($request) {
                    $q->where('card_no', 'like', '%' . $request->card_no . '%');
                });
            }

            if ($request->filled('phone_no')) {
                $query->whereHas('memberToDevice.member', function ($q) use ($request) {
                    $q->where('phone_no', 'like', '%' . $request->phone_no . '%');
                });
            }

            if ($request->filled('department')) {
                $query->whereHas('memberToDevice.member.department', function ($q) use ($request) {
                    $q->where('department_id', $request->department);
                });
            }

            if ($request->filled('device')) {
                $query->whereHas('memberToDevice.device', function ($q) use ($request) {
                    $q->where('id', $request->device);
                });
            }

            if ($request->filled('status')) {
                if ($request->status === 'failure') {
                    // first get member_ids that have success
                    $successMemberIds = SmsLog::whereDate('timestamp', $date)
                        ->where('status', 'success')
                        ->pluck('member_id');

                    // now filter only failures not in success
                    $query->where('status', 'failure')
                        ->whereNotIn('member_id', $successMemberIds);
                } else {
                    // normal case (success, pending, etc.)
                    $query->where('status', $request->status);
                }
            }


            if ($request->get('export') === 'excel') {
                $filters = $request->only(['name', 'card_no', 'phone_no', 'department', 'device', 'status']);
                return Excel::download(new SmsLogExport($date, $filters), 'sms_logs_' . ($date ?? now()->toDateString()) . '.xlsx');
            }

            $smsLogs = $query->paginate($perPage);
            #adding serial number to the logs

            $smsLogs->getCollection()->transform(function ($item, $index) use ($smsLogs) {
                $item->sl_no = ($smsLogs->currentPage() - 1) * $smsLogs->perPage() + ($index + 1);
                return $item;
            });

            return response()->json([
                'status'  => true,
                'data'    => [
                    'sms_logs' => $smsLogs,
                    'total_count' => $TotalCount,
                    'success_count' => $successCount,
                    'failed_count' => $failedCount,
                    'total_punches' => $totalPunches,
                ],
                'message' => 'sms logs retrieved successfully',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
