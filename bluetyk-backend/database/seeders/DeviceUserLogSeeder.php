<?php

namespace Database\Seeders;

use App\Models\DeviceUserLogs;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeviceUserLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DeviceUserLogs::create([
            'device_serial_no' => 'NFZ8234500925',
            'pin' => 4,
            'card_no' => 12345,
            'name' => 'sam',
        ]);
    }
}
