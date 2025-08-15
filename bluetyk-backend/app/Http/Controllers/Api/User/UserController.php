<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserType;
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
            ->middleware(['auth:sanctum', 'check.user', 'check.subscription'])
            ->group(function () {
                Route::post('/add-user', 'store')->name('user.store');
                Route::get('/get-users', 'index')->name('user.index');
                Route::delete('/delete-user', 'destroy')->name('user.destroy');
                Route::get('/get-userById', 'show')->name('user.show');
                Route::get('/get-usertype', 'getUserTypes')->name('user.usertypes');
                Route::put('/user-update','update')->name('user.update');
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
                'user_type_id' => 'required|integer|exists:user_types,id',
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
                'user_type_id' => $request->user_type_id,
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
    public function index()
    {
        try {
            $users = User::with('userType')->get();
            return response()->json([
                'status' => true,
                'message' => 'Users retrieved successfully',
                'data' => $users,

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
    public function destroy(Request $request)
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
    public function show(Request $request)
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'status' => false,
                    'message' => 'User ID is required',
                ], 400);
            }
            $user = User::with('userType')->findOrFail($id);
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

    /**
     * function to get the user
     */
    public function getUserTypes()
    {
        try {

            $user = UserType::all();
            return response()->json([
                'status' => true,
                'data' => ['user' => $user,],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * function for updating 
     */

    /**
     * function for updating a user
     */
    public function update(Request $request)
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

            // Validate input
            $validator = Validator::make($request->all(), [
                'name'         => 'required|string|max:255',
                'email'        => 'required|email|unique:users,email,' . $id,
                'user_type_id' => 'required|integer|exists:user_types,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            // Update user fields
            $user->name         = $request->name;
            $user->email        = $request->email;
            $user->user_type_id = $request->user_type_id;
            $user->save();

            return response()->json([
                'status'  => true,
                'message' => 'User updated successfully',
                'data'    => ['user' => $user->load('userType')],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
