<?php

namespace App;

use App\Models\Settings;
use App\Models\SmsLog;
use App\Models\SmsTemplates;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;


trait SmsTrait
{
    /**
     * sms variables
     */
    protected $apiKey;
    protected $sender;
    protected $header;
    protected $templates = [];

    /**
     * initial loading sms provider data
     */
    public function initializeSmsTrait()
    {
        $settings = Settings::whereIn('description', ['sms_api_key', 'sms_provider', 'sms_header'])
            ->pluck('value', 'description')
            ->toArray();

        $this->apiKey = $settings['sms_api_key'] ?? null;
        $this->sender = $settings['sms_provider'] ?? null;
        $this->header = $settings['sms_header'] ?? null;

        $this->templates = SmsTemplates::pluck('sms_template', 'template_name')->toArray();
    }


    /**
     * sanitize the data
     */
    protected function sanitizeSmsText($text)
    {
        // Replace non-breaking spaces with normal space
        $text = str_replace("\u{00A0}", " ", $text);

        // Remove other non-ASCII or control characters
        $text = preg_replace('/[^\x20-\x7E]/', '', $text);

        return $text;
    }



    /**
     * function to send the sms 
     */
    public function sendSms($member_id, $name, $mobile, $department, $date, $templateKey)
    {
        try {
            if (!$mobile) {
                throw new Exception("Mobile number is missing for member {$member_id}");
            }

            // Get SMS template
            $template = $this->templates[$templateKey] ?? null;
            if (!$template) {
                throw new Exception("Template '{$templateKey}' not found");
            }

            // Replace placeholders
            $message = str_replace(
                ['{@NAME}', '{@DEPARTMENT}', '{@DATE}'],
                [
                    $this->sanitizeSmsText($name),
                    $this->sanitizeSmsText($department),
                    $date,
                ],
                $template
            );


            // Call SMS API
            $response = Http::asForm()->post('https://api.textlocal.in/send/', [
                'apiKey'  => $this->apiKey,
                'sender'  => $this->header,
                'numbers' => $mobile,
                'message' => $message,
            ]);

            $responseData = $response->json();
            Log::info("SMS API response", $responseData);

            // Save SMS log
            SmsLog::create([
                'member_id'     => $member_id,
                'name'          => $name,
                'department'    => $department ?? '',
                'sms_log'       => $message,
                'template_name' => $templateKey,
                'timestamp'     => now(),
                'phone_no'      => $mobile,
                'batch_id'      => $responseData['batch_id'] ?? null,
                'message_id'    => $responseData['messages'][0]['id'] ?? null,
                'status'        => $responseData['status'] ?? 'failed',
            ]);

            return $responseData; // full provider response
        } catch (Exception $e) {
            // Log failed attempt

            // Log error
            Log::error("SMS sending failed", [
                'member_id' => $member_id,
                'mobile'    => $mobile,
                'error'     => $e->getMessage(),
            ]);

            SmsLog::create([
                'member_id'     => $member_id,
                'name'          => $name,
                'department'    => $department ?? '',
                'sms_log'       => "Failed: " . $e->getMessage(),
                'template_name' => $templateKey,
                'timestamp'     => now(),
                'phone_no'      => $mobile,
                'batch_id'      => 0,
                'message_id'    => 0,
                'status'        => 'error',
            ]);

            throw $e;
        }
    }
}
