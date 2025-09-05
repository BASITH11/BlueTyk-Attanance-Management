<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLogTimeTracker;
use App\Models\CommandQueues;
use App\Models\Device;
use App\Models\Members;
use App\Models\MemberToDevice;
use App\Models\DeviceUserLogs;
use App\Models\Attendances;
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

        $command = CommandQueues::where('device_serial_no', $sn)
            ->where('sent', false)
            ->orderBy('id')
            ->first();


        if (!$command) {
            return response("OK", 200)->header('Content-Type', 'text/plain');
        }

        $response = $command->command;

        #mark the run commands as true
        $command->update(['sent' => true]);
        Log::info("Sent Commands", ['response' => $response]);

        return response($response, 200)->header('Content-Type', 'text/plain');
    }



    /**
     * Handle GET /iclock/cdata.aspx — important for initial handshake
     */
    public function handleCdataGet(Request $request)
    {

        return response("OK", 200)->header('Content-Type', 'text/plain');
    }

    /**
     * handle the post method /iclock/cdata.aspx / /iclock/devicecmd.aspx
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

            #Handle USER lines
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

            #Handle attendance log lines
            elseif (preg_match('/^\d+\t\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/', $line)) {
                $columns = explode("\t", $line);

                if (count($columns) >= 2) {
                    $pin = (int) $columns[0];
                    $timestamp = $columns[1];

                    // Insert only if not already existing
                    $exists = Attendances::where('device_serial_no', $sn)
                        ->where('pin', $pin)
                        ->where('timestamp', $timestamp)
                        ->exists();

                    if (!$exists) {
                        try {
                            Attendances::create([
                                'device_serial_no' => $sn,
                                'pin' => $pin,
                                'timestamp' => $timestamp,
                                'status' => $columns[2] ?? null,
                                'verified' => $columns[3] ?? null,
                            ]);
                        } catch (\Exception $e) {
                            Log::error('Failed to insert attendance log', [
                                'line' => $line,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                }
            }
        }

        #Delete device users that are no longer present
        if (!empty($receivedPins)) {
            DeviceUserLogs::where('device_serial_no', $sn)
                ->whereNotIn('pin', $receivedPins)
                ->delete();
        }

        #Trigger background processes
        Members::addingMemberToDevice($sn);
        DeviceUserLogs::updateSuccessStatus();
        DeviceUserLogs::updateDeletedStatus();
        DeviceUserLogs::addUserDeviceToApp();
        DeviceUserLogs::updateAllSuccess();
        DeviceUserLogs::updatePendingFromDeviceToApp($sn);


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
