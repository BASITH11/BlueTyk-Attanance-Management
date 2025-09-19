<?php

namespace Database\Seeders;

use App\Models\Shift;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shifts = [
            [
                'shift_name' => "morning shift",
                'shift_start' => "09:00:00",
                'shift_end' => "15:00:00",
                'is_overnight' => 0,
            ],
        ];
        Shift::insert($shifts);
    }
}
