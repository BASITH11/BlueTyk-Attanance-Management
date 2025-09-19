<?php

namespace App\Imports;

use App\Models\Department;
use App\Models\Device;
use App\Models\Shift;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;


class ExcelDataImport implements ToCollection, WithHeadingRow
{

    protected $map = [
        'slno'          => 'id',
        'name'          => 'name',
        'phone_no'      => 'phone_no',
        'card_no'       => 'card_no',
        'address'       => 'address',
        'date_of_birth' => 'date_of_birth',
        'designation'   => 'designation',
        'department'    => 'department_id',
        'shift'         => 'shift_id',
        // device handled separately
    ];

    public $data = [];

    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {

        
        foreach ($rows as $index => $row) {
            $arranged = [];

            foreach ($this->map as $excelKey => $dbKey) {
                $arranged[$dbKey] = $row[$excelKey] ?? null;
            }

            if (!empty($row['date_of_birth'])) {
                if (is_numeric($row['date_of_birth'])) {
                    #Convert Excel serial date → Y-m-d
                    $arranged['date_of_birth'] = ExcelDate::excelToDateTimeObject($row['date_of_birth'])->format('Y-m-d');
                } else {
                    #If already string, try normalize
                    $arranged['date_of_birth'] = date('Y-m-d', strtotime($row['date_of_birth']));
                }
            } else {
                $arranged['date_of_birth'] = null;
            }

            #Department validation
            if (empty($row['department'])) {
                $lineNumber = $index + 2;
                throw new \Exception("Department is required at Excel row {$lineNumber}");
            }

            $arranged['department_id'] = Department::getDepartmentByName($row['department']);


            if (empty($row['shift'])) {
                $lineNumber = $index + 2; // Excel row number
                throw new \Exception("Shift is required at Excel row {$lineNumber}");
            }

            $arranged['shift_id'] = Shift::getShiftByName($row['shift']);

            #Device assignments
            if (!empty($row['device'])) {
                $arranged['device_assignments'] = [
                    [
                        'device_id'    => Device::getDeviceByName($row['device']),
                        'card'         => !empty($row['card_flag']),
                        'finger_print' => !empty($row['finger_print_flag']),
                        'face_id'      => !empty($row['face_id_flag']),
                    ]
                ];
            } else {
                $arranged['device_assignments'] = [];
            }

            $this->data[] = $arranged;

            // For debugging purposes
        }
    }

    public function headingRow(): int
    {
        return 1;
    }
}
