<?php

namespace Database\Seeders;

use App\Models\Device;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeviceTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Device::create([
            'device_name'=>'asusus',
            'device_serial_no'=>'NFZ8234500924',
            'last_seen_at'=>null,
            'status'=>'offline',
            'location_id'=>1,
            'device_type_id'=>2
        ]);

        Device::create([
            'device_name'=>'lenovo',
            'device_serial_no'=>'NFZ8234500925',
            'last_seen_at'=>null,
            'status'=>'offline',
            'location_id'=>2,
            'device_type_id'=>3
        ]);
    }
}
