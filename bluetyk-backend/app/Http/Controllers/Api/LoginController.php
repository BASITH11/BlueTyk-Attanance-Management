<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Route;



class LoginController extends Controller
{

    /**
     * static function for routes
     */
    public static function routes()
    {
        Route::controller(self::class)
            ->group(function () {
                Route::post('login', 'login')->name('post.login');
                Route::middleware('auth:sanctum')->post('logout', 'logout')->name('logout');
            });
    }




    /**
     * function for login
     * @param Request
     */
    public function login(Request $request)
    {

        try {


            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ]);

            #attempt to find the user
            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['invalid credentials'],
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'login successfull',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
                'status'=>true,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'status' =>false,
            ]);
        }
    }



    public function logout(Request $request)
    {
        try {
            // Revoke current access token
            $request->user()->currentAccessToken()->delete();

            return response()->json(['status'=>true,'message' => 'Logged out successfully']);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
