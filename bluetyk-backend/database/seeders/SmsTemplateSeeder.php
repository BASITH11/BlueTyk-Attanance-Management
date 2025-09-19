<?php

namespace Database\Seeders;

use App\Models\SmsTemplates;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SmsTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $smsTemplates = [
            [
                'template_name' => 'Absent Today',
                'sms_template' => 'Dear Parent, Your child {@NAME} of class {@DEPARTMENT} is absent today ({@DATE}). PMSAPTS HIGH SCHOOL'
            ],
            [
                'template_name' => 'Present Today',
                'sms_template' => 'Dear Parent, Your child {@NAME} of class {@DEPARTMENT} is present today ({@DATE}). PMSAPTS HIGH SCHOOL'
            ]
        ];

        SmsTemplates::insert($smsTemplates);
    }
}
