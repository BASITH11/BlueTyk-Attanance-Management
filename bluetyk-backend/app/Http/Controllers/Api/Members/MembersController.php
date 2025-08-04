<?php

namespace App\Http\Controllers\Api\Members;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Members;
use App\Models\Device;
use App\Models\MemberToDevice;
use App\Models\CommandQueues;
use App\Models\DeviceUserLogs;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MembersController extends Controller
{
    /**
     * static function for routes
     */
    public static function routes()
    {
        Route::controller(self::class)
            ->prefix('members')
            ->middleware(['auth:sanctum', 'check.user'])
            ->group(function () {
                Route::post('/add-member', 'store')->name('members.store');
                Route::get('/get-members', 'index')->name('members.index');
                Route::delete('/delete-member', 'destroy')->name('members.destroy');
                Route::get('/get-memberById', 'show')->name('members.show');
                Route::get('/get-member-image', 'getMemberImage')->name('members.getMemberImage');
                Route::put('/update-member', 'update')->name('members.update');
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
                'phone_no' => [
                    'required',
                    'string',
                    'min:10',
                    'max:12',
                    Rule::unique('members')->whereNull('deleted_at'),
                ],

                'card_no' => [
                    'required',
                    'string',
                    Rule::unique('members')->whereNull('deleted_at'),
                ],
                'image'         => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
                'address'       => 'nullable|string|max:500',
                'date_of_birth' => 'nullable|date|before:today',
                'designation'   => 'nullable|string|max:255',
                'deviceId'     => 'nullable|integer|exists:device,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => $validator->errors()->first(),
                    'errors'  => $validator->errors(),
                ], 422);
            }
    
            //sending command to get the all user from the device 
            if($request->filled('deviceId')){

                $device = Device::find($request->deviceId); 
                if($device->device_serial_no){
                    CommandQueues::sendGetAllUsersCommand($device->device_serial_no);
                }
                
            }
           
    

            $imagePath = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = 'member_' . $request->card_no . '.' . $file->getClientOriginalExtension();
                $file->storeAs('members', $filename);
                $imagePath = $filename;
            }

            $date_of_birth = \DateTime::createFromFormat('m/d/Y', $request->date_of_birth);
            DB::beginTransaction();
            // Create member
            $member = Members::create([
                'name'          => $request->name,
                'phone_no'      => $request->phone_no,
                'card_no'       => $request->card_no,
                'image'         => $imagePath,
                'address'       => $request->address,
                'date_of_birth' => $date_of_birth,
                'designation'   => $request->designation,
                'status'        => 'pending',
                'device_user_id' => null,
                'source' =>'app',   
            ]);

            // After $member is created
            if ($request->filled('deviceId')) {
                MemberToDevice::create([
                    'member_id'   => $member->id,
                    'device_id'   => $request->deviceId,
                    'assigned_at' => now(),
                ]);

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
            $members = Members::all();
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
            $member = Members::With(['memberToDevice.device'])->findOrFail($request->id);

            $deviceSerialNo = $member->memberToDevice->device->device_serial_no ?? null;
            $pin = $member->device_user_id;


            if ($deviceSerialNo && $pin) {

                $deleteCommand = "C:" . time() . ":DATA DELETE USERINFO PIN=" . $pin;

                CommandQueues::create([
                    'command'          => $deleteCommand,
                    'device_serial_no' => $deviceSerialNo,
                    'sent'             => false,
                ]);
            }

             CommandQueues::sendGetAllUsersCommand($deviceSerialNo);

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
            $member = Members::With(['memberToDevice.device'])->findOrFail($request->id);
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
                'name'          => 'required|string|max:255',
                'phone_no'      => 'required|string|min:10|max:12|unique:members,phone_no,' . $request->id,
                'card_no'       => 'required|string|unique:members,card_no,' . $request->id,
                'image'         => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
                'address'       => 'nullable|string|max:500',
                'date_of_birth' => 'nullable|date|before:today',
                'designation'   => 'nullable|string|max:255',
                'deviceId'     => 'nullable|exists:device,id',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => $validator->errors()->first(),
                    'errors'  => 'validation error',
                ], 422);
            }

            $member = Members::findOrFail($request->id);

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = 'member_' . $member->card_no . '.' . $file->getClientOriginalExtension();
                $file->storeAs('members', $filename);
                $member->image = $filename;
            }

            // Update member
            $member->name = $request->name;
            $member->phone_no = $request->phone_no;
            $member->card_no = $request->card_no;
            $member->address = $request->address;
            $member->date_of_birth = $request->date_of_birth;
            $member->designation = $request->designation;

            $member->save();

            if ($request->filled('deviceId')) {
                MemberToDevice::updateOrCreate(
                    ['member_id' => $member->id], // search condition
                    ['device_id' => $request->deviceId] // values to insert/update
                );
            }


            return response()->json([
                'status'  => true,
                'message' => 'Member updated successfully',
                'data'    => [
                    'member' => $member,
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
                'error'   => 'Error updating member',
            ], 500);
        }
    }
}
