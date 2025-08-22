<?php

namespace App\Http\Middleware;

use App\Models\Settings;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class CheckSubscription
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

        $settings = Settings::pluck('value', 'description')->toArray();

        if (!isset($settings['start_date']) || !isset($settings['end_date'])) {
           return  response()->json([
                'status' => false,
                'message' => 'Subscription dates not set',
            ], 423);
        }

        $today     = Carbon::today();
        $startDate = Carbon::parse($settings['start_date']);
        $endDate   = Carbon::parse($settings['end_date']);


        if ($today->lt($startDate)) {
            return response()->json([
                'status' => false,
                'message' => 'Subscription has not started yet.',
            ], 423);
        }

        // Expired
        if ($today->gt($endDate)) {
            return response()->json([
                'status' => false,
                'message' => 'Subscription has expired.',
            ], 423);
        }






        return $next($request);
    }
}
