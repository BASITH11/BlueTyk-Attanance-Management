<?php

namespace App\Http\Controllers\Api\Device;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Device;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Route;

class DeviceController extends Controller
{

    public static function routes()
    {
        Route::controller(self::class)
            ->prefix('device')
            ->middleware(['auth:sanctum','check.user'])
            ->group(function () {
                Route::post('/add-device', 'store')->name('device.store');
                Route::get('/get-device', 'index')->name('device.index');
                Route::delete('/delete-device', 'destroy')->name('device.destroy');
                Route::get('/get-deviceById', 'show')->name('device.show');
                Route::put('/update-device','update')->name('device.update');
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
                                                              // 0 for inactive, 1 for active
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => 'Validation error',
                ], 422);
            }

            // Create device
            $device = Device::create([
                'device_name' => $request->device_name,
                'device_serial_no' => $request->device_serial_no,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Device created successfully',
                'data' => [
                    'device' => $device,
                ]
            ], 200);
        } catch (Exception $e) {
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
    public function index()
    {
        try {

            $devices = Device::all();
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
            $device = Device::findOrFail($id);
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
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'error' => 'Validation error',
                ], 422);
            }

            $device = Device::findOrFail($request->id);

            $device->device_name = $request->device_name;
            $device->device_serial_no = $request->device_serial_no;

            $device->save();

            return response()->json([
                'status' => true,
                'message' => 'device updated successfully',
                'data' => ['device' => $device],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'error Updating device',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
