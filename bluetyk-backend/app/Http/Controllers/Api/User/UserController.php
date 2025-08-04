<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Route;

class UserController extends Controller
{
    /**
     * static function for routes
     */
    public static function routes()
    {
        Route::controller(self::class)
               ->prefix('user')
            //    ->middleware('auth:sanctum')
               ->group(function () {
            Route::post('/add-user','store')->name('user.store');
            Route::get('/get-users', 'index')->name('user.index');
            Route::post('/delete-user', 'destroy')->name('user.destroy');
            Route::get('/get-userById', 'show')->name('user.show');

        });
    }


    /**
     * function for creating an user
     * @param Request
     */

    public function store(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            // Create user
            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Optionally hide password hash
            unset($user->password);

            return response()->json([
                'message' => 'User created successfully',
                'user'    => $user,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Server Error',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * function for getting all users
     */
    public function index(){
        try {
            $users = User::all();
            return response()->json([
                'status' => true,
                'message' => 'Users retrieved successfully',
                'data' => ['users'   => $users
            ],
                
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
                
            ], 500);
        }
    }

   /**
    * function for deleting a user
    */
    public function destroy(Request $request )
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'status' => false,
                    'message' => 'User ID is required',
                ], 400);
            }
            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'status' => true,
                'message' => 'User deleted successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
     
    /**
     * function for getting an user by id
     * @param int Request
     */
    public function show(Request $request){
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'status' => false,
                    'message' => 'User ID is required',
                ], 400);
            }
            $user = User::findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'User retrieved successfully',
                'data' => ['user' => $user],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    
}
