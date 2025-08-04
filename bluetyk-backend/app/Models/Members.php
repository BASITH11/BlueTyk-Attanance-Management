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
    'device_user_id',
    'source',

  ];

  public function memberToDevice()
  {
    return $this->hasOne(MemberToDevice::class, 'member_id')->with('device');
  }


  /**
   * adding member to device
   */
  /**
   * Add a single pending member to their assigned device.
   */
  public static function addingMemberToDevice()
  {
    $member = Members::with(['memberToDevice.device'])
      ->where('status', 'pending')
      ->whereNull('device_user_id')
      ->whereHas('memberToDevice.device', function ($q) {
        $q->whereNotNull('device_serial_no');
      })
      ->first();


    if (!$member) {
      return; // No pending members found
    }

    $memberToDevice = $member->memberToDevice;

    if (!$memberToDevice || !$memberToDevice->device) {
      return; // No device assigned, skip
    }

    $device = $memberToDevice->device;

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
      $member->device_user_id = $pin;
      $member->save();

      CommandQueues::sendGetAllUsersCommand($device->device_serial_no);
    }
  }
}
