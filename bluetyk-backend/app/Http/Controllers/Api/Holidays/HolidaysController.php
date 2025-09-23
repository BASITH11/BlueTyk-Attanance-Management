<?php

namespace App\Http\Controllers\Api\Holidays;


use App\Http\Controllers\Controller;
use App\Models\Holidays;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

class HolidaysController extends Controller
{


    public static function routes()
    {
        Route::controller(self::class)
            ->prefix('holiday')
            ->middleware(['auth:sanctum', 'check.user', 'check.subscription'])
            ->group(function () {
                Route::post('/add-holiday', 'store')->name('holiday.store');
                Route::get('/get-holiday', 'index')->name('holiday.index');
                Route::delete('/delete-holiday', 'destroy')->name('holiday.destroy');
                Route::get('/get-holidayById', 'show')->name('holiday.show');
                Route::put('/update-holiday', 'update')->name('holiday.update');
            });
    }


    /**
     * function to add holidays
     * @param Request
     */
    public function store(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'type' => 'required|in:date,day',
                'holiday_date' => 'nullable|date',
                'is_recurring' => 'required|boolean',
                'day_of_week' => 'nullable|integer|min:0|max:6',
                'week_of_month' => 'nullable|integer|min:1|max:5',

            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => 'Validation error',
                ], 422);
            }


            $holiday = Holidays::create([
                'name' => $request->name,
                'type' => $request->type,
                'holiday_date' => $request->holiday_date,
                'is_recurring' => $request->is_recurring,
                'day_of_week' => $request->day_of_week,
                'week_of_month' => $request->week_of_month,
            ]);


            return response()->json([
                'status' => true,
                'message' => 'Holiday created successfully',
                'data' => [
                    'holiday' => $holiday,
                ]
            ], 200);
        } catch (Exception $e) {

            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
                'error' => 'Error creating holiday',
            ], 500);
        }
    }


    /**
     * Function to get all holiday
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 100);
            $holidays = Holidays::paginate($perPage);
            return response()->json([
                'status' => true,
                'message' => "holidays retrieved successfully",
                'data' => $holidays,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching Holidays',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * Function to delete a holiday
     * @param Request
     */
    public function destroy(Request $request)
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'status' => false,
                    'message' => 'holiday ID is required',
                ], 400);
            }
            $holiday = Holidays::findOrFail($id);
            $holiday->delete();
            return response()->json([
                'status' => true,
                'message' => 'Holiday deleted successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error deleting holiday',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * Function to get a holiday by ID
     * @param Request
     */
    public function show(Request $request)
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Holiday ID is required',
                ], 400);
            }
            $holiday = Holidays::findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Holiday retrieved successfully',
                'data' =>  ['holiday' => $holiday,]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error retrieving holiday',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * function to update the holiday
     */
    public function update(Request $request)
    {

        try {
            $validator = Validator::make($request->all(), [
                'id' => 'required|exists:holidays,id',
                'name' => 'required|string|max:255',
                'type' => 'required|in:date,day',
                'holiday_date' => 'nullable|date',
                'is_recurring' => 'required|boolean',
                'day_of_week' => 'nullable|integer|min:0|max:6',
                'week_of_month' => 'nullable|integer|min:1|max:5',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'error' => 'Validation error',
                ], 422);
            }

            DB::beginTransaction();
            $holiday = Holidays::findOrFail($request->id);

            $holiday->name = $request->name;
            $holiday->type = $request->type;
            $holiday->holiday_date = $request->holiday_date;
            $holiday->is_recurring = $request->is_recurring;
            $holiday->day_of_week = $request->day_of_week;
            $holiday->week_of_month = $request->week_of_month;
            $holiday->save();
            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'holiday updated successfully',
                'data' => ['holiday' => $holiday],
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'error Updating holiday',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
