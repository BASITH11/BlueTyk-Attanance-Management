<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       DB::statement("
            CREATE OR REPLACE VIEW attendance_with_member AS
            SELECT 
                a.id AS attendance_id,
                a.pin,
                a.device_serial_no,
                a.timestamp,
                a.status,
                a.verified,
                m.id AS member_id,
                m.name AS member_name,
                m.phone_no,
                m.card_no,
                d.id AS device_id,
                d.device_name,
                l.location_name
            FROM attendances a
            LEFT JOIN members_to_device mtd
                ON a.pin = mtd.device_user_id
                AND a.device_serial_no = mtd.device_serial_no
            LEFT JOIN members m
                ON m.id = mtd.member_id
            LEFT JOIN device d
                ON d.device_serial_no = a.device_serial_no
            LEFT JOIN locations l
                ON l.id = d.location_id
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_view');
    }
};
