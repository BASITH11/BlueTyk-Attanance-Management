<?php

namespace Database\Seeders;

use App\Models\Locations;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Locations::create([
         'location_name'=>'location 1',
        ]);

         Locations::create([
         'location_name'=>'location 2',
        ]);

         Locations::create([
         'location_name'=>'location 3',
        ]);
    }
}
