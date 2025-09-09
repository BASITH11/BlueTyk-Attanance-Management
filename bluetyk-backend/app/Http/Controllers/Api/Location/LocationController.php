<?php

namespace App\Http\Controllers\Api\Location;

use App\Http\Controllers\Controller;
use App\Models\Locations;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class LocationController extends Controller
{

    public static function routes()
    {
        Route::controller(self::class)
            ->prefix('location')
            ->middleware(['auth:sanctum', 'check.user', 'check.subscription'])
            ->group(function () {
                Route::post('/add-location', 'store')->name('location.store');
                Route::get('/get-location', 'index')->name('location.index');
                Route::delete('/delete-location', 'destroy')->name('location.destroy');
                Route::put('/update-location', 'update')->name('location.update');
                Route::get('/get-locationById', 'show')->name('location.getById');
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
                'location_name' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => 'Validation error',
                ], 422);
            }

            Locations::create([
                'location_name' => $request->location_name,
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'location Created successfully',
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

            $perPage = $request->get('per_page',5);
            $locations = Locations::paginate($perPage);

            return response()->json([
                'status' => true,
                'data' => $locations,
                'message' => 'location retieved successfully',
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
                'id' => 'required|exists:locations,id',
                'location_name' => 'required|string|max:255|unique:locations,location_name,' . $request->id,
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'error' => 'Validation error',
                ], 422);
            }

          
            $location = Locations::findOrFail($request->id);

            $location->location_name = $request->location_name;
            $location->save();
            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'location updated successfully',
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
                    'message' => 'Location ID is required',
                ], 400);
            }
            $location = Locations::findOrFail($id);
            $location->delete();
            return response()->json([
                'status' => true,
                'message' => 'location deleted successfully',
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
                    'message' => 'Location ID is required',
                ], 400);
            }
            $location = Locations::findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => $location,
                'message' => 'location fetched successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
