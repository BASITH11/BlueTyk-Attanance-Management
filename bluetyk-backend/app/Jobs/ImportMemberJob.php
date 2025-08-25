<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use App\Models\Device;
use App\Models\Members;
use App\Models\MemberToDevice;



class ImportMemberJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    protected $row;

    /**
     * Create a new job instance.
     */
    public function __construct(array $row)
    {
        $this->row = $row;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        DB::beginTransaction();
        try {
            // Create member
            $member = Members::create([
                'name'          => $this->row['name'],
                'phone_no'      => $this->row['phone_no'],
                'card_no'       => $this->row['card_no'],
                'image'         => null,
                'address'       => $this->row['address'],
                'date_of_birth' => $this->row['date_of_birth'],
                'designation'   => $this->row['designation'],
                'department_id' => $this->row['department_id'],
                'status'        => 'pending',
                'source'        => 'app',
            ]);

            // Assign devices
            if (!empty($this->row['device_assignments'])) {
                foreach ($this->row['device_assignments'] as $assignment) {
                    $device = Device::find($assignment['device_id']);
                    if ($device) {
                        MemberToDevice::create([
                            'member_id'        => $member->id,
                            'device_user_id'   => null,
                            'device_id'        => $device->id,
                            'device_serial_no' => $device->device_serial_no,
                            'assigned_at'      => now(),
                            'card'             => $assignment['card'],
                            'finger_print'     => $assignment['finger_print'],
                            'face_id'          => $assignment['face_id'],
                            'status'           => 'pending',
                        ]);
                    }
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
