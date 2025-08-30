<?php

namespace App\Http\Controllers\Api\Members;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Members;
use App\Models\Device;
use App\Models\CommandQueues;
use App\Models\DeviceUserLogs;
use App\Models\EntryType;
use App\Models\MemberToDevice;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Imports\ExcelDataImport;
use Maatwebsite\Excel\Facades\Excel;
use App\Jobs\ImportMemberJob;

class MembersController extends Controller
{
    /**
     * static function for routes
     */
    public static function routes()
    {
        Route::controller(self::class)
            ->prefix('members')
            ->middleware(['auth:sanctum', 'check.user', 'check.subscription'])
            ->group(function () {
                Route::post('/add-member', 'store')->name('members.store');
                Route::get('/get-members', 'index')->name('members.index');
                Route::delete('/delete-member', 'destroy')->name('members.destroy');
                Route::get('/get-memberById', 'show')->name('members.show');
                Route::get('/get-member-image', 'getMemberImage')->name('members.getMemberImage');
                Route::put('/update-member', 'update')->name('members.update');
                Route::delete('/delte-from-device', 'destroyFromDevice')->name('member.deleteFromdevice');
                Route::get('/get-unlinked-devices', 'getUnlinkedDevices')->name('member.unlinkedDevice');
                Route::post('/assign-device', 'assignDevices')->name('member.assignDevice');
                Route::post('/upload-members', 'upload')->name('member.upload');
            });
    }



    /**
     * function for creating a member
     * @param Request
     */
    public function store(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'name'          => 'required|string|max:255',
                'phone_no'      => 'nullable|string|min:10|max:12',
                'card_no'       => 'nullable|string',
                'image'         => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
                'address'       => 'nullable|string|max:500',
                'date_of_birth' => 'nullable|date|before:today',
                'designation'   => 'nullable|string|max:255',
                'department_id' => 'required|integer|exists:departments,id',

                // New device assignments validation
                'device_assignments'                       => 'nullable|array',
                'device_assignments.*.device_id'           => 'required|integer|exists:device,id',
                'device_assignments.*.card'                => 'required|boolean',
                'device_assignments.*.finger_print'        => 'required|boolean',
                'device_assignments.*.face_id'             => 'required|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => $validator->errors()->first(),
                    'errors'  => $validator->errors(),
                ], 422);
            }

            // Send command to get all users from selected devices
            if ($request->filled('device_assignments') && is_array($request->device_assignments)) {
                foreach ($request->device_assignments as $assignment) {
                    $device = Device::find($assignment['device_id']);
                    if ($device && $device->device_serial_no) {
                        CommandQueues::sendGetAllUsersCommand($device->device_serial_no);
                    }
                }
            }

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = 'member_' . time() . '.' . $file->getClientOriginalExtension();
                $file->storeAs('members', $filename);
                $imagePath = $filename;
            }

            DB::beginTransaction();

            // Create member
            $member = Members::create([
                'name'          => $request->name,
                'phone_no'      => $request->phone_no,
                'card_no'       => $request->card_no,
                'image'         => $imagePath,
                'address'       => $request->address,
                'date_of_birth' => $request->date_of_birth,
                'designation'   => $request->designation,
                'department_id' => $request->department_id,
                'status'        => 'pending',
                'source'        => 'app',
            ]);

            // Assign devices with individual auth types
            if ($request->filled('device_assignments') && is_array($request->device_assignments)) {
                foreach ($request->device_assignments as $assignment) {
                    $device = Device::find($assignment['device_id']);
                    if ($device) {
                        MemberToDevice::create([
                            'member_id'        => $member->id,
                            'device_user_id'   => null,
                            'device_id'        => $device->id,
                            'device_serial_no' => $device->device_serial_no,
                            'assigned_at'      => now(),
                            'card'             => $assignment['card'],
                            'finger_print'     => $assignment['finger_print'],
                            'face_id'          => $assignment['face_id'],
                            'status'           => 'pending',
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Member created successfully',
                'data'    => $member,
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Error creating member',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }






    /**
     * function for getting all members
     */
    public function index()
    {
        try {
            $members = Members::with(['memberToDevice.device', 'department'])->get();
            return response()->json([
                'status'  => true,
                'message' => 'Members retrieved successfully',
                'data'    => $members,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error retrieving members',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }








    /**
     * function for deleting a member
     * @param Request
     */
    public function destroy(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id' => 'required|exists:members,id',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => $validator->errors()->first(),
                    'errors'  => 'validation error',
                ], 422);
            }

            DB::beginTransaction();

            $member = Members::with(['memberToDevice.device'])->findOrFail($request->id);

            // Loop through all linked devices for this member
            foreach ($member->memberToDevice as $mtd) {
                $deviceSerialNo = $mtd->device->device_serial_no ?? null;
                $pin            = $mtd->device_user_id;

                if ($deviceSerialNo && $pin) {
                    $deleteCommand = "C:" . time() . ":DATA DELETE USERINFO PIN=" . $pin;

                    CommandQueues::create([
                        'command'          => $deleteCommand,
                        'device_serial_no' => $deviceSerialNo,
                        'sent'             => false,
                    ]);

                    // Send "Get All Users" for that device
                    CommandQueues::sendGetAllUsersCommand($deviceSerialNo);
                }
            }

            // Delete the member
            $member->delete();

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Member deleted successfully',
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Error deleting member',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * Delete member from a single device
     */
    public function destroyFromDevice(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'member_id'   => 'required|exists:members,id',
                'device_ids'  => 'required|array|min:1',
                'device_ids.*' => 'exists:device,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => $validator->errors()->first(),
                    'errors'  => 'validation error',
                ], 422);
            }

            DB::beginTransaction();

            foreach ($request->device_ids as $deviceId) {
                // Find mapping between this member and device
                $mapping = MemberToDevice::with('device')
                    ->where('member_id', $request->member_id)
                    ->where('device_id', $deviceId)
                    ->first();

                if (!$mapping) {
                    continue;
                }

                $deviceSerialNo = $mapping->device->device_serial_no ?? null;
                $pin            = $mapping->device_user_id;

                if ($deviceSerialNo && $pin) {
                    $deleteCommand = "C:" . time() . ":DATA DELETE USERINFO PIN=" . $pin;

                    CommandQueues::create([
                        'command'          => $deleteCommand,
                        'device_serial_no' => $deviceSerialNo,
                        'sent'             => false,
                    ]);

                    // Refresh users for that device
                    CommandQueues::sendGetAllUsersCommand($deviceSerialNo);
                }

                // Delete only the mapping
                $mapping->delete();
            }

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Member removed from selected devices successfully',
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Error removing member from devices',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }








    /**
     * function for getting a member by id
     * @param Request
     */
    public function show(Request $request)
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
            $member = Members::With(['memberToDevice.device', 'department'])->findOrFail($request->id);
            return response()->json([
                'status'  => true,
                'message' => 'Member retrieved successfully',
                'data'    => [
                    'member' => $member,

                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' =>  $e->getMessage(),
                'error'   => 'error retriving member',
            ], 500);
        }
    }










    /**
     * function for getting a member image
     */
    public function getMemberImage(Request $request)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $relativePath = $request->input('image');

            // Sanitize path
            $relativePath = ltrim($relativePath, '/');

            $imagePath = storage_path('app/private/members/' . $relativePath);

            if (!file_exists($imagePath)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Image not found',
                ], 404);
            }


            return response()->file($imagePath);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error retrieving member image',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }




    /**
     * function for updating a member
     */
    public function update(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id'            => 'required|exists:members,id',
                'name'          => 'nullable|string|max:255',
                'phone_no'      => 'nullable|string|min:10|max:12',
                'card_no'       => 'nullable|string',
                'image'         => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
                'address'       => 'nullable|string|max:500',
                'date_of_birth' => 'nullable|date|before:today',
                'designation'   => 'nullable|string|max:255',
                'department_id' => 'required|string|exists:departments,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => $validator->errors()->first(),
                    'errors'  => 'validation error',
                ], 422);
            }

            DB::beginTransaction();

            // Load member with devices and pivot data
            $member = Members::with('memberToDevice.device')->findOrFail($request->id);

            // Handle image
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = 'member_' . time() . '.' . $file->getClientOriginalExtension();
                $file->storeAs('members', $filename);
                $member->image = $filename;
            }

            // Update fields
            $member->name = $request->name;
            $member->phone_no = $request->phone_no;
            $member->card_no = $request->card_no;
            $member->address = $request->address;
            $member->date_of_birth = $request->date_of_birth;
            $member->designation = $request->designation;
            $member->department_id = $request->department_id;
            $member->save();

            // Loop through all devices linked to this member
            foreach ($member->memberToDevice as $mtd) {
                $deviceUserId = $mtd->device_user_id; // from pivot
                $deviceSerialNo = $mtd->device->device_serial_no ?? null;

                if ($deviceSerialNo) {
                    $kv = [
                        "PIN=$deviceUserId",
                        "Name={$member->name}",
                        "Pri=0",
                        "Card={$member->card_no}",
                    ];

                    $cmds = "C:" . time() . ":DATA UPDATE USERINFO " . implode("\t", $kv);

                    CommandQueues::create([
                        'device_serial_no' => $deviceSerialNo,
                        'command' => $cmds,
                        'sent' => false,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Member updated successfully',
                'data'    => [
                    'member' => $member,
                ]
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
                'error'   => 'Error updating member',
            ], 500);
        }
    }


    /**
     * function to get the unlinked device of an user
     */
    public function getUnlinkedDevices(Request $request)
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

            $linkedDeviceIds = MemberToDevice::where('member_id', $request->id)
                ->pluck('device_id')
                ->toArray();

            $unlinkedDevices = Device::whereNotIn('id', $linkedDeviceIds)->get();

            return response()->json([
                'status' => true,
                'data' => $unlinkedDevices,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
                'error'   => 'Error updating member',
            ], 500);
        }
    }



    /**
     * function to add member to unlinked devices
     */

    public function assignDevices(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'member_id' => 'required|integer|exists:members,id',
                'device_assignments' => 'required|array',
                'device_assignments.*.device_id' => 'required|integer|exists:device,id',
                'device_assignments.*.card' => 'required|boolean',
                'device_assignments.*.finger_print' => 'required|boolean',
                'device_assignments.*.face_id' => 'required|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors(),
                ], 422);
            }

            $member = Members::findOrFail($request->member_id);

            DB::beginTransaction();

            foreach ($request->device_assignments as $assignment) {
                $device = Device::find($assignment['device_id']);
                if ($device) {
                    MemberToDevice::updateOrCreate(
                        [
                            'member_id' => $member->id,
                            'device_id' => $device->id,
                        ],
                        [
                            'device_user_id'   => null,
                            'device_serial_no' => $device->device_serial_no,
                            'assigned_at'      => now(),
                            'card'             => $assignment['card'],
                            'finger_print'     => $assignment['finger_print'],
                            'face_id'          => $assignment['face_id'],
                            'status'           => 'pending',
                        ]
                    );

                    // Optionally send command to device to sync users
                    if ($device->device_serial_no) {
                        CommandQueues::sendGetAllUsersCommand($device->device_serial_no);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Devices assigned successfully',
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Error assigning devices',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * function to add bulk members
     */

    public function upload(Request $request)
    {
        try {

            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:xlsx,xls,csv|max:5120',
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }

            $import = new ExcelDataImport();
            Excel::import($import, $request->file('file'));

            $data = $import->data;

    
            foreach ($data as $row) {
                ImportMemberJob::dispatch($row);
            }


            return response()->json([
                'status' => true,
                'message' => 'uploaded successfully',
                'data'=>$data,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
