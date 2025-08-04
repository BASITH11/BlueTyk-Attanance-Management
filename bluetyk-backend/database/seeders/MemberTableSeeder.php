<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Members;


class MemberTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Members::create([
            'name' => 'John Doe',
            'phone_no' => 1234567890,
            'card_no' => 1001,
            'image' => null,
            'address' => '123 Main St, Anytown, USA',
            'date_of_birth' => '1990-01-01',
            'designation' => 'Member',
        ]);
        Members::create([
            'name' => 'Jane Smith',
            'phone_no' => 9876543210,
            'card_no' => 1002,
            'image' => null,
            'address' => '456 Elm St, Othertown, USA',
            'date_of_birth' => '1992-02-02',
            'designation' => 'Member',
        ]);

    }
}
