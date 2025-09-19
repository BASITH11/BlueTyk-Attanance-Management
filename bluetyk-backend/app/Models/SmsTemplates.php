<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SmsTemplates extends Model
{
    use SoftDeletes;
    protected $table = 'sms_templates';

    protected $fillable = [
        'template_name',
        'sms_template'
    ];

    public $timestamps = true;
}
