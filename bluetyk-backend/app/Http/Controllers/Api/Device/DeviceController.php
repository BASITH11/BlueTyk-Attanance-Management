<?php

namespace App\Http\Controllers\Api\Device;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Device;
use App\Models\DeviceType;
use App\Models\Locations;
use App\Models\CommandQueues;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

class DeviceController extends Controller
{

    public static function routes()
    {
        Route::controller(self::class)
            ->prefix('device')
            ->middleware(['auth:sanctum', 'check.user', 'check.subscription'])
            ->group(function () {
                Route::post('/add-device', 'store')->name('device.store');
                Route::get('/get-device', 'index')->name('device.index');
                Route::delete('/delete-device', 'destroy')->name('device.destroy');
                Route::get('/get-deviceById', 'show')->name('device.show');
                Route::put('/update-device', 'update')->name('device.update');
                Route::get('/device-attributes', 'getDeviceAttributes')->name('device.getAttributes');
                Route::post('/device-sync', 'syncFromDevice')->name('device.sync');
            });
    }

    /**
     * Function for creating a device
     * @param Request
     */
    public function store(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'device_name' => 'required|string|max:255',
                'device_serial_no' => 'required|string|max:255',
                'location_id' => 'required|integer',
                'device_type_id' => 'required|integer',

            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => 'Validation error',
                ], 422);
            }
            DB::beginTransaction();
            // Create device
            $device = Device::create([
                'device_name' => $request->device_name,
                'device_serial_no' => $request->device_serial_no,
                'location_id' => $request->location_id,
                'device_type_id' => $request->device_type_id,
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Device created successfully',
                'data' => [
                    'device' => $device,
                ]
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
                'error' => 'Error creating device',
            ], 500);
        }
    }

    /**
     * Function to get all devices
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 100);
            $devices = Device::with(['deviceToDeviceType', 'deviceToLocation'])->paginate($perPage);
            return response()->json([
                'status' => true,
                'message' => "device retrieved successfully",
                'data' => $devices,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching devices',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Function to delete a device
     * @param Request
     */
    public function destroy(Request $request)
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Device ID is required',
                ], 400);
            }
            $device = Device::findOrFail($id);
            $device->delete();
            return response()->json([
                'status' => true,
                'message' => 'Device deleted successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error deleting device',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Function to get a device by ID
     * @param Request
     */
    public function show(Request $request)
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Device ID is required',
                ], 400);
            }
            $device = Device::with('deviceToLocation', 'deviceToDeviceType')->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Device retrieved successfully',
                'data' =>  ['device' => $device,]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error retrieving device',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * function to update the device
     */
    public function update(Request $request)
    {

        try {
            $validator = Validator::make($request->all(), [
                'id' => 'required|exists:device,id',
                'device_name' => 'required|string|max:255|unique:device,device_name,' . $request->id,
                'device_serial_no' => 'required|string|max:255|unique:device,device_serial_no,' . $request->id,
                'location_id' => 'required|integer',
                'device_type_id' => 'required|integer',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'error' => 'Validation error',
                ], 422);
            }

            DB::beginTransaction();
            $device = Device::findOrFail($request->id);

            $device->device_name = $request->device_name;
            $device->device_serial_no = $request->device_serial_no;
            $device->location_id = $request->location_id;
            $device->device_type_id = $request->device_type_id;

            $device->save();
            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'device updated successfully',
                'data' => ['device' => $device],
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'error Updating device',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * function to get all the device_types
     */
    public function getDeviceAttributes()
    {
        try {

            $deviceType = DeviceType::all();
            $locations = Locations::all();


            return response()->json([
                'status' => true,
                'data' => [
                    'device_types' => $deviceType,
                    'locations' => $locations,
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'error getting deviceAttributes',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * function to sync the device user to app
     */
    public function syncFromDevice(Request $request)
    {

        try {

            $validator = Validator::make($request->all(), [
                'id' => 'required|exists:device,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'error' => 'Validation error',
                ], 422);
            }

            $device = Device::where('id', $request->id)->first();

            if (!$device->device_serial_no) {
                return response()->json([
                    'status' => false,
                    'message' => 'No Serial number for device',
                ], 422);
            }

            CommandQueues::sendGetAllUsersCommand($device->device_serial_no);

            return response()->json([
                'status' => true,
                'message' => "Sync request has sent",
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'error in Sync',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
