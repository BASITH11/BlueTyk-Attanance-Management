<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Locations extends Model
{
    use SoftDeletes;

    protected $table = 'locations';

    protected $fillable = [
        'location_name',
    ];


    public function LocationsToDevice()
    {
        return $this->hasMany(Device::class, 'id', 'location_id');
    }
}
