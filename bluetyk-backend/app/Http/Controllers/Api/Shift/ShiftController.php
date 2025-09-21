<?php

namespace App\Http\Controllers\Api\Shift;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Exception;

class ShiftController extends Controller
{


    public static function routes()
    {
        Route::controller(self::class)
            ->prefix('shift')
            ->middleware(['auth:sanctum', 'check.user', 'check.subscription'])
            ->group(function () {
                Route::post('/add-shift', 'store')->name('shift.store');
                Route::get('/get-shift', 'index')->name('shift.index');
                Route::delete('/delete-shift', 'destroy')->name('shift.destroy');
                Route::put('/update-shift', 'update')->name('shift.update');
                Route::get('/get-shiftById', 'show')->name('shift.getById');
            });
    }


    /**
     * function to store
     * @param Request any
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {

            $validator = Validator::make($request->all(), [
                'shift_name' => 'required|string|max:255',
                'shift_start' => 'required|date_format:H:i',
                'shift_end' => 'required|date_format:H:i',
                'is_overnight' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => 'Validation error',
                ], 422);
            }

            Shift::create([
                'shift_name' => $request->shift_name,
                'shift_start' => $request->shift_start,
                'shift_end' => $request->shift_end,
                'is_overnight' => $request->is_overnight ?? false,
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'shift Created successfully',
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * function to get the location
     * @param Request any
     */

    public function index(Request $request)
    {
        try {

            $perPage = $request->get('per_page', 100);
            $shifts = Shift::paginate($perPage);

            return response()->json([
                'status' => true,
                'data' => $shifts,
                'message' => 'shifts retieved successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }




    /**
     * function to update the location 
     */
    public function update(Request $request)
    {
        DB::beginTransaction();
        try {

            $validator = Validator::make($request->all(), [
                'id' => 'required|exists:shifts,id',
                'shift_name' => 'required|string|max:255|unique:shifts,shift_name,' . $request->id,
                'shift_start' => 'required|date_format:H:i',
                'shift_end' => 'required|date_format:H:i',
                'is_overnight' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'error' => 'Validation error',
                ], 422);
            }
            

            $shift = Shift::findOrFail($request->id);

            $shift->shift_name = $request->shift_name;
            $shift->shift_start = $request->shift_start;
            $shift->shift_end = $request->shift_end;
            $shift->is_overnight = $request->is_overnight ?? false;


            $shift->save();
            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'shift updated successfully',
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * function to delete
     * @param $request any
     */

    public function destroy(Request $request)
    {
        try {

            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Shift ID is required',
                ], 400);
            }
            $shift = Shift::findOrFail($id);
            $shift->delete();
            return response()->json([
                'status' => true,
                'message' => 'shift deleted successfully',
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }




    /**
     * function to get the location by id
     * @param Request any
     */
    public function show(Request $request)
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'status' => false,
                    'message' => 'shift ID is required',
                ], 400);
            }
            $shift = Shift::findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => $shift,
                'message' => 'shift fetched successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
