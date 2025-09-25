<?php

namespace App\Exports;

use App\Models\SmsLog;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class SmsLogExport implements WithMultipleSheets
{
    protected ?string $date;
    protected array $filters;

    public function __construct(?string $date = null, array $filters = [])
    {
        $this->date = $date;
        $this->filters = $filters;
    }

    public function sheets(): array
    {
        $sheets = [];

      

        // Step 1: Fetch filtered SMS logs
        $query = SmsLog::with('memberToDevice.member.department', 'memberToDevice.device')
            ->when($this->date, fn($q) => $q->whereDate('timestamp', $this->date));

        // Apply dynamic filters
        foreach ($this->filters as $key => $value) {
            if ($value) {
                if ($key === 'name') {
                    $query->whereHas('memberToDevice.member', fn($q) => $q->where('name', 'like', "%$value%"));
                }
                if ($key === 'card_no') {
                    $query->whereHas('memberToDevice.member', fn($q) => $q->where('card_no', 'like', "%$value%"));
                }
                if ($key === 'phone_no') {
                    $query->whereHas('memberToDevice.member', fn($q) => $q->where('phone_no', 'like', "%$value%"));
                }
                if ($key === 'department') {
                    $query->whereHas('memberToDevice.member.department', fn($q) => $q->where('department_id', $value));
                }
                if ($key === 'device') {
                    $query->whereHas('memberToDevice.device', fn($q) => $q->where('id', $value));
                }
                if ($key === 'status') {
                    $query->where('status', $value);
                }
            }
        }

        $smsLogs = $query->get();


        // Step 2: Transform data for Excel
        $formatted = $smsLogs->map(function ($log) {
            return [
                'Name'        => $log->memberToDevice->member->name ?? '',
                'Department'  => $log->memberToDevice->member->department->department_name ?? '',
                'Device'      => $log->memberToDevice->device->device_name ?? '',
                'Device SN'   => $log->memberToDevice->device_serial_no ?? '',
                'Card No'     => $log->memberToDevice->member->card_no ?? '',
                'Phone No'    => $log->phone_no,
                'Status'      => $log->status,
                'Template'    => $log->template_name,
                'Message'     => $log->sms_log,
                'Batch Id'    => $log->batch_id,
                'Message Id'  => $log->message_id,
                'Timestamp'   => $log->timestamp,
            ];
        });

        // Step 3: Optional — group by department (or any other field)
        $groupedByDept = $formatted->groupBy('Department');


        foreach ($groupedByDept as $department => $records) {
            $sheets[] = new \App\Exports\ExcelExport(
                collect($records),
                ['Name', 'Department', 'Device', 'Device SN', 'Card No', 'Phone No', 'Status', 'Template', 'Message', 'Batch Id', 'Message Id', 'Timestamp'], // headers
                $department, // sheet tab name
                $this->date, // date
                'SMS Logs Report' // main sheet title
            );
        }

        return $sheets;
    }
}   
