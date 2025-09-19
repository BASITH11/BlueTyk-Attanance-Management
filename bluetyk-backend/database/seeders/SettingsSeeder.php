<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Settings;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'description' => 'company_name',
                'value'       => 'Bluetyk',
            ],
            [
                'description' => 'email',
                'value'       => 'info@bluetyk.com',
            ],
            [
                'description' => 'phone',
                'value'       => '+91 1234567890',
            ],
            [
                'description' => 'logo',
                'value'       => 'logo.png',
            ],
            [
                'description' => 'start_date',
                'value'       => now()->toDateString(),
            ],
            [
                'description' => 'end_date',
                'value'       => now()->addMonth()->toDateString(),
            ],
            [
                'description' => 'entity_name',
                'value'       => null,
            ],
              [
                'description' => 'skip_short_punches',
                'value'       => 'true',
            ],
             [
                'description' => 'skiping_time',
                'value'       => '60',
            ],
             [
                'description' => 'enable_sms',
                'value'       => 'true',
            ],
             [
                'description' => 'sms_provider',
                'value'       => null,
            ],
             [
                'description' => 'sms_api_key',
                'value'       => null,
            ],
             [
                'description' => 'sms_header',
                'value'       => null,
            ],
        

        ];

        Settings::insert($settings);
    }
}
