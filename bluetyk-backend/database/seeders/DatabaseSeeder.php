<?php

namespace Database\Seeders;


// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserTableSeeder::class,
            // MemberTableSeeder::class,
            UserTypesSeeder::class,
            // LocationSeeder::class,
            DeviceTypeSeeder::class,
            // DeviceTableSeeder::class,   
            // AttandanceSeeder::class,
            // DeviceUserLogSeeder::class,
            SettingsSeeder::class,
        ]);
    }
}
