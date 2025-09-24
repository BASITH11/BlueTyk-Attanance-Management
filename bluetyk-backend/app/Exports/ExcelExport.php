<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\BeforeSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExcelExport implements FromCollection, WithTitle, WithHeadings, WithStyles, WithCustomStartCell, WithEvents
{
    protected Collection $data;
    protected array $headers;
    protected string $title;      // Sheet tab title
    protected string $date;
    protected string $sheetTitlePrefix; // configurable prefix for visible title

    public function __construct(Collection $data, array $headers, string $title, ?string $date = null, string $sheetTitlePrefix)
    {
        $this->data             = $data;
        $this->headers          = $headers;
        $this->title            = $this->sanitizeSheetName($title);
        $this->date             = $date;
        $this->sheetTitlePrefix = $sheetTitlePrefix;
    }

    public function collection()
    {
        return $this->data->values()->map(function ($row, $index) {
            return array_merge(
                ['Sl No' => $index + 1],
                $row
            );
        });
    }

    public function headings(): array
    {
        return array_merge(['Sl No'], $this->headers);
    }

    public function startCell(): string
    {
        return 'A3'; // row 1 = sheet title, row 2 = date, row 3 = headers
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A3:' . $sheet->getHighestColumn() . '3')->getFont()->setBold(true);
    }

    public function registerEvents(): array
    {
        return [
            BeforeSheet::class => function (BeforeSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Row 1 → Main Title
                $sheetTitle = $this->sheetTitlePrefix . ' - ' . $this->title;
                $sheet->setCellValue('A1', $sheetTitle);
                $sheet->mergeCells('A1:' . $sheet->getHighestColumn() . '1');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
                $sheet->getStyle('A1')->getAlignment()
                    ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                // Row 2 → Date
                $sheet->setCellValue('A2', 'Date: ' . ($this->date ?? now()->toDateString()));
                $sheet->mergeCells('A2:' . $sheet->getHighestColumn() . '2');
                $sheet->getStyle('A2')->getFont()->setBold(true);
                $sheet->getStyle('A2')->getAlignment()
                    ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            },
        ];
    }

    public function title(): string
    {
        return $this->title; // Tab name
    }


    /**
     * Sanitize sheet name for Excel
     */
    private function sanitizeSheetName(string $name): string
    {
        $name = trim($name);
        if (empty($name)) {
            $name = 'Sheet';
        }
        // Replace invalid characters
        return preg_replace('/[\\\\\/\*\[\]\:\?]/', '_', $name);
    }
}
