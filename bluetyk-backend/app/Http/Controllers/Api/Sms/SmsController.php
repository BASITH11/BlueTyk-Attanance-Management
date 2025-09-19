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
                    SendSmsJob::dispatch(
                        $item['member_id'],
                        $item['member_name'],
                        $item['phone_no'] ?? null,
                        $item['department_name'] ?? null,
                        now(),
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
}
