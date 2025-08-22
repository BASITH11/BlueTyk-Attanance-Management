<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class Members extends Model
{
  use SoftDeletes;
  protected $table = 'members';
  /**
   * The attributes that are mass assignable.
   *
   * @var list<string>
   */
  protected $primaryKey = 'id';
  public $timestamps = true;
  protected $fillable = [
    'name',
    'phone_no',
    'card_no',
    'image',
    'address',
    'date_of_birth',
    'designation',
    'status',
    'source',
    'department_id',
  ];



  public function memberToAttendance()
  {
    return $this->hasMany(Attendances::class, 'device_user_id', 'pin');
  }


  public function memberToDevice()
  {
    return $this->hasMany(MemberToDevice::class , 'member_id');
  }

  public function department(){
    return $this->belongsTo(Department::class,'department_id','id');
  }

  /**
   * Add a single pending member to their assigned device.
   */
  public static function addingMemberToDevice()
  {
    $memberToDevice = MemberToDevice::with(['member', 'device'])
      ->whereNull('device_user_id')
      ->whereHas('device', function ($q) {
        $q->whereNotNull('device_serial_no');
      })
      ->first();


    if (!$memberToDevice) {
      return; // No pending members found
    }

    $member = $memberToDevice->member;
    $device = $memberToDevice->device;

    if (!$member || !$device) {
      return; // Missing related member or device
    }


    if ($device && $device->device_serial_no) {
      $fullname = $member->name;
      $card = $member->card_no;
      $pin = DeviceUserLogs::getNextAvailablePin($device->device_serial_no); // Implement this
      $id = time(); // Unique command ID

      $kv = [
        "PIN=$pin",
        "Name=$fullname",
        "Pri=0",
        "Card=$card",
      ];

      $cmds = "C:$id:DATA UPDATE USERINFO " . implode("\t", $kv);

      CommandQueues::create([
        'device_serial_no' => $device->device_serial_no,
        'command' => $cmds,
        'sent' => false,
      ]);

      // Update member with assigned pin
      $memberToDevice->device_user_id = $pin;
      $memberToDevice->save();

      CommandQueues::sendGetAllUsersCommand($device->device_serial_no);
    }
  }
}
