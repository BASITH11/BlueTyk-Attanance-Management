<?php

namespace App\Jobs;

use App\SmsTrait;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;


class SendSmsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, SmsTrait;


    protected $member_id;
    protected $name;
    protected $mobile;
    protected $department;
    protected $date;
    protected $templateKey;

    /**
     * Create a new job instance.
     */
    public function __construct($member_id, $name, $mobile, $department, $date, $templateKey)
    {
        $this->member_id   = $member_id;
        $this->name        = $name;
        $this->mobile      = $mobile;
        $this->department  = $department;
        $this->date        = $date;
        $this->templateKey = $templateKey;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {


         // Log before starting
        Log::info("SendSmsJob started", [
            'member_id'   => $this->member_id,
            'name'        => $this->name,
            'mobile'      => $this->mobile,
            'department'  => $this->department,
            'date'        => $this->date,
            'templateKey' => $this->templateKey,
        ]);

        
        // Initialize SMS settings
        $this->initializeSmsTrait();

        // Send SMS
        $this->sendSms(
            $this->member_id,
            $this->name,
            $this->mobile,
            $this->department,
            $this->date,
            $this->templateKey
        );
    }
}
