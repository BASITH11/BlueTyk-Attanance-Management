<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('members_to_device', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->foreignId('device_id')->constrained('device')->onDelete('cascade');
            $table->integer('device_user_id')->nullable();
            $table->string('device_serial_no')->nullable();
            $table->enum('status', ['pending', 'success', 'deleted'])->default('pending');
            $table->timestamp('assigned_at')->useCurrent();
            $table->integer('card')->default(0);
            $table->integer('finger_print')->default(0);
            $table->integer('face_id')->default(0);
            $table->timestamps();
            $table->softDeletes(); // Add soft delete column
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members_to_device');
    }
};
