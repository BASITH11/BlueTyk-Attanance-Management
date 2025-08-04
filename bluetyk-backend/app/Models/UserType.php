<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserType extends Model
{
    protected $table = 'user_types';
    protected $primaryKey = 'id';
    public $timestamps = true;
    
    protected $fillable = [ 
        'user_post'
    ];

    public function user(){
       return $this->hasMany(User::class,'user_type_id');
    }
}
