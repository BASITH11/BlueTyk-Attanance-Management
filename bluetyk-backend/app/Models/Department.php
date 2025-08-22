<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use SoftDeletes;

    protected $table = 'departments';
    protected $fillable = [
        'department_name',
    ];


    public function member()
    {
        return $this->hasMany(Members::class, 'id', 'department_id');
    }

    public static function getDepartmentByName($departmentName)
    {

        $department = self::where('department_name', $departmentName)->first();
        if (!$department) {
            throw new \Exception("Department '{$departmentName}' not found in database");
        }

        return $department->id;
    }
}
