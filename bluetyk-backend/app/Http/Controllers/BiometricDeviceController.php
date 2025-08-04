<?php

namespace App\Http\Controllers;

use App\Models\CommandQueues;
use App\Models\Device;
use App\Models\Members;
use App\Models\MemberToDevice;
use App\Models\DeviceUserLogs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

class BiometricDeviceController extends Controller
{
    public static function routes()
    {
        Route::controller(self::class)
            ->middleware('check.device')
            ->group(function () {
                Route::get('/iclock/getrequest.aspx', 'handleGet');
                Route::post('/iclock/devicecmd.aspx', 'handlePost');
                Route::get('/iclock/cdata.aspx', 'handleCdataGet');
                Route::post('/iclock/cdata.aspx', 'handlePost');
            });
    }



    /**
     * Handle GET request from device (command dispatch)
     */
    public function handleGet(Request $request)
    {
        $sn = $request->query('SN');

        $commands = CommandQueues::where('device_serial_no', $sn)
            ->where('sent', false)
            ->orderBy('id')
            ->get();

        // // Always add "get all users" command dynamically
        // $getAllCommand = "C:" . time() . ":DATA QUERY USERINFO Stamp=0";
        // $commands->prepend((object)[
        //     'id' => null, // fake ID for this dynamic command
        //     'command' => $getAllCommand,
        // ]);


        if ($commands->isEmpty()) {
            return response("OK", 200)->header('Content-Type', 'text/plain');
        }

        $response = $commands->pluck('command')->implode("\n");

        #mark the run commands as true
        CommandQueues::whereIn('id', $commands->pluck('id'))->update(['sent' => true]);
        Log::info("Sent Commands", ['response' => $response]);



        return response($response, 200)->header('Content-Type', 'text/plain');
    }

    /**
     * Handle GET /iclock/cdata.aspx — important for initial handshake
     */
    public function handleCdataGet(Request $request)
    {
        Log::info('[GET] /iclock/cdata.aspx', [
            'Timestamp' => now()->toDateTimeString(),
            'SN' => $request->query('SN'),
            'IP' => $request->ip(),
            'Query Params' => $request->query(),
        ]);

        return response('OK', 200)->header('Content-Type', 'text/plain');
    }

    /**
     * Handle POST for both /cdata.aspx and /devicecmd.aspx
     */
    public function handlePost(Request $request)
    {
        $sn = $request->query('SN');
        $body = $request->getContent();

        Log::info("device post from $sn", ['body' => $body]);

        $lines = explode("\n", trim($body));
        $receivedPins = [];

        foreach ($lines as $line) {
            $line = trim($line);

            if (stripos($line, 'USER') === 0) {
                $parsed = self::parseUserLine($line);

                if ($parsed) {
                    $receivedPins[] = $parsed['PIN'];

                    try {
                        DeviceUserLogs::updateOrCreate(
                            [
                                'device_serial_no' => $sn,
                                'pin' => $parsed['PIN'],
                            ],
                            [
                                'name'    => $parsed['Name'],
                                'card_no' => $parsed['Card'],
                            ]
                        );
                    } catch (\Exception $e) {
                        Log::error('Insert failed', [
                            'error' => $e->getMessage(),
                            'userData' => $parsed,
                        ]);
                    }
                }
            }
        }

        if (!empty($receivedPins)) {
            DeviceUserLogs::where('device_serial_no', $sn)
                ->whereNotIn('pin', $receivedPins)
                ->delete();
        }

        Members::addingMemberToDevice();
        DeviceUserLogs::updateSuccessStatus();
        DeviceUserLogs::updateDeletedStatus();

        return response('OK', 200)->header('Content-Type', 'text/plain');
    }




    /**
     * Static method to parse a USER line from device
     */
    public static function parseUserLine($line)
    {
        // Remove the leading "USER" if present
        $line = preg_replace('/^USER\s*/i', '', $line);

        // Normalize whitespace (tabs or multiple spaces) to single space
        $line = preg_replace('/[\t ]+/', ' ', $line);

        // Extract all key=value pairs
        preg_match_all('/(\w+)=([^\s]*)/', $line, $matches);

        $userData = array_combine($matches[1], $matches[2]);

        // Skip if PIN is not numeric or missing
        if (empty($userData['PIN']) || !ctype_digit($userData['PIN'])) {
            return null;
        }

        return [
            'PIN'  => (int) $userData['PIN'],
            'Name' => $userData['Name'] ?? null,
            'Card' => $userData['Card'] ?? null,
        ];
    }
}
