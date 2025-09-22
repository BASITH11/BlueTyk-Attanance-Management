<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Device;

class CheckDevice
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $sn = $request->query('SN');

        if (!$sn) {
            return response('Device serial number (SN) not provided.', 400);
        }

        $device = Device::where('device_serial_no', $sn)->first();

        if (!$device) {
            return response("Unauthorized device. SN: $sn", 403);
        }

        $device->update([
            'last_seen_at' => now(),
            'status' => 'online',
        ]);

        return $next($request);
    }
}
