<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;


class CheckUserType
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::User();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => "Unautherized.Please Log in"
            ], 401);
        }
        #fetching the user type
        $typeName = optional($user->userType)->user_post;

        #checks the UserType
        if ($typeName === "admin") {
            return $next($request);
        }
        if ($typeName === "user" && in_array($request->method(), ['POST', 'DELETE', 'PUT'])) {
            return response()->json([
                'status' => false,
                'message' => 'Access denied: You are not allowed to perform this action.',
            ],403);
        }

        return $next($request);
    }
}
