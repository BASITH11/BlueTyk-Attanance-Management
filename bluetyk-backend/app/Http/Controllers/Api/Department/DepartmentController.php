<?php

namespace App\Http\Controllers\Api\Department;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Exception;

class DepartmentController extends Controller
{
        public static function routes()
    {
        Route::controller(self::class)
            ->prefix('department')
            ->middleware(['auth:sanctum', 'check.user', 'check.subscription'])
            ->group(function () {
                Route::post('/add-department', 'store')->name('department.store');
                Route::get('/get-department', 'index')->name('department.index');
                Route::delete('/delete-department', 'destroy')->name('department.destroy');
                Route::put('/update-department', 'update')->name('department.update');
                Route::get('/get-departmentById', 'show')->name('department.getById');
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
                'department_name' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'errors' => 'Validation error',
                ], 422);
            }

            Department::create([
                'department_name' => $request->department_name,
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Department Created successfully',
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
     * function to get the department
     * @param Request any
     */

    public function index()
    {
        try {

            $departments = Department::all();

            return response()->json([
                'status' => true,
                'data' => $departments,
                'message' => 'Department retieved successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * function to update the department 
     */
    public function update(Request $request)
    {
          DB::beginTransaction();
        try {

            $validator = Validator::make($request->all(), [
                'id' => 'required|exists:departments,id',
                'department_name' => 'required|string|max:255|unique:departments,department_name,' . $request->id,
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => $validator->errors()->first(),
                    'error' => 'Validation error',
                ], 422);
            }

          
            $department = Department::findOrFail($request->id);

            $department->department_name = $request->department_name;
            $department->save();
            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'department updated successfully',
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
                    'message' => 'department ID is required',
                ], 400);
            }
            $department = Department::findOrFail($id);
            $department->delete();
            return response()->json([
                'status' => true,
                'message' => 'department deleted successfully',
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
     * function to get the department by id
     * @param Request any
     */
    public function show(Request $request)
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'status' => false,
                    'message' => 'department ID is required',
                ], 400);
            }
            $department = Department::findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => $department,
                'message' => 'department fetched successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
