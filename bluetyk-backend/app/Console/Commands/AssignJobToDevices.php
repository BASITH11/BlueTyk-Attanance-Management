<?php

namespace App\Console\Commands;

use App\Models\AttendanceLogTimeTracker;
use App\Models\Device;
use Illuminate\Console\Command;
use Illuminate\Foundation\Exceptions\Renderer\Exception;
use Illuminate\Support\Facades\Log;

class AssignJobToDevices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:assign-job-to-devices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            AttendanceLogTimeTracker::AttendaceCommand();
            Device::UpdateOfflineDevices();
            Log::info("Assigned job successfully");
        } catch (Exception $e) {
            Log::error(" failed to Assign the job ");
        }
    }
}
