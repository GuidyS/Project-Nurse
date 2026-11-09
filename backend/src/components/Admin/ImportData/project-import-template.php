<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/../../../config/admin_access.php';
require_once __DIR__ . '/../../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\NamedRange;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

const PROJECT_TEMPLATE_MAX_ROW = 500;

function projectTemplatePrepareSheet(
    Worksheet $sheet,
    string $title,
    array $headers,
    array $widths,
    array $textColumns,
    array $requiredColumns
): void {
    $sheet->setTitle($title);
    $sheet->fromArray($headers, null, 'A1');
    $lastColumn = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($headers));
    $sheet->setAutoFilter("A1:{$lastColumn}1");
    $sheet->freezePane('A2');

    foreach ($widths as $index => $width) {
        $column = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
        $sheet->getColumnDimension($column)->setWidth($width);
    }
    foreach ($textColumns as $column) {
        $sheet->getStyle("{$column}2:{$column}" . PROJECT_TEMPLATE_MAX_ROW)
            ->getNumberFormat()
            ->setFormatCode('@');
    }

    $sheet->getStyle("A1:{$lastColumn}1")->getFont()->setBold(true);
    $sheet->getStyle("A1:{$lastColumn}1")->getAlignment()
        ->setHorizontal(Alignment::HORIZONTAL_CENTER)
        ->setVertical(Alignment::VERTICAL_CENTER);
    $sheet->getStyle("A1:{$lastColumn}1")->getFill()
        ->setFillType(Fill::FILL_SOLID)
        ->getStartColor()->setARGB('FFD9EAF7');

    foreach ($requiredColumns as $column) {
        $sheet->getStyle("{$column}1:{$column}" . PROJECT_TEMPLATE_MAX_ROW)->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFFFFF00');
    }
}

function projectTemplateAddListValidation(
    Worksheet $sheet,
    string $range,
    string $namedRange,
    string $prompt,
    bool $strict = true
): void {
    $validation = new DataValidation();
    $validation->setType(DataValidation::TYPE_LIST)
        ->setErrorStyle(DataValidation::STYLE_STOP)
        ->setAllowBlank(true)
        ->setShowDropDown(true)
        ->setShowInputMessage(true)
        ->setShowErrorMessage($strict)
        ->setErrorTitle('ข้อมูลไม่อยู่ในรายการ')
        ->setError('กรุณาเลือกค่าจากรายการที่กำหนด')
        ->setPromptTitle('เลือกข้อมูล')
        ->setPrompt($prompt)
        ->setFormula1("={$namedRange}");
    $sheet->setDataValidation($range, $validation);
}

function projectTemplateFacultyDisplay(array $faculty): string
{
    $name = trim(implode(' ', array_filter([
        trim((string)($faculty['title'] ?? '')),
        trim((string)($faculty['first_name_th'] ?? '')),
        trim((string)($faculty['last_name_th'] ?? '')),
    ], static fn(string $part): bool => $part !== '')));
    $id = (string)$faculty['faculty_id'];
    return $name === '' ? $id : "{$id} - {$name}";
}

try {
    $db = new Connect();
    $adminUserId = adminRequireAccess($db);
    $facultyStmt = $db->query(
        "SELECT faculty_id, title, first_name_th, last_name_th
         FROM faculty
         WHERE status = 'Active' OR status IS NULL
         ORDER BY first_name_th ASC, last_name_th ASC, faculty_id ASC"
    );
    $facultyOptions = array_map('projectTemplateFacultyDisplay', $facultyStmt->fetchAll(PDO::FETCH_ASSOC));

    $projectHeaders = [
        'รหัสโครงการ', 'ชื่อโครงการ', 'รหัสผู้ดำเนินโครงการ', 'ปีการศึกษา',
        'ประเภทโครงการ', 'ยุทธศาสตร์', 'สถานะ', 'วันที่เริ่มต้น', 'วันที่สิ้นสุด',
        'รหัสผู้เข้าร่วมโครงการ', 'รหัส PLO', 'รหัส CLO', 'แผนงาน',
        'วัตถุประสงค์', 'KPI', 'ลำดับรายงาน', 'งบรวมทั้งหมด',
    ];

    $spreadsheet = new Spreadsheet();
    $projects = $spreadsheet->getActiveSheet();
    projectTemplatePrepareSheet(
        $projects,
        'โครงการ',
        $projectHeaders,
        [18,42,34,14,26,46,20,16,16,38,24,24,32,38,30,14,20],
        ['A','C','J','K','L'],
        ['A', 'B', 'C', 'D']
    );
    $projects->getStyle('H2:I' . PROJECT_TEMPLATE_MAX_ROW)->getNumberFormat()->setFormatCode('dd/mm/yyyy');
    $projects->getComment('Q1')->getText()->createTextRun("งบรวมทั้งหมดของโครงการ หน่วยบาท รองรับทศนิยมไม่เกิน 2 ตำแหน่ง");
    $projects->getStyle('Q2:Q' . PROJECT_TEMPLATE_MAX_ROW)->getNumberFormat()->setFormatCode('#,##0.00');

    $projects->fromArray(['บุคลากร', 'ประเภทโครงการ', 'สถานะโครงการ'], null, 'R1');
    foreach ($facultyOptions as $index => $option) {
        $projects->setCellValueExplicit('R' . ($index + 2), $option, DataType::TYPE_STRING);
    }
    $projectTypes = ['บริการวิชาการ', 'ทำนุบำรุงศิลปวัฒนธรรม', 'การเรียนการสอน', 'วิจัย', 'การประกันคุณภาพ', 'อื่นๆ/ยังไม่จำแนก'];
    foreach ($projectTypes as $index => $option) {
        $projects->setCellValueExplicit('S' . ($index + 2), $option, DataType::TYPE_STRING);
    }
    $projectStatuses = ['กำลังดำเนินการ', 'เสร็จสิ้น'];
    foreach ($projectStatuses as $index => $option) {
        $projects->setCellValueExplicit('T' . ($index + 2), $option, DataType::TYPE_STRING);
    }

    $facultyLastRow = max(2, count($facultyOptions) + 1);
    $spreadsheet->addNamedRange(new NamedRange('ProjectFacultyOptions', $projects, '$R$2:$R$' . $facultyLastRow));
    $spreadsheet->addNamedRange(new NamedRange('ProjectTypeOptions', $projects, '$S$2:$S$7'));
    $spreadsheet->addNamedRange(new NamedRange('ProjectStatusOptions', $projects, '$T$2:$T$3'));
    foreach (['R','S','T'] as $column) $projects->getColumnDimension($column)->setVisible(false);

    projectTemplateAddListValidation($projects, 'C2:C' . PROJECT_TEMPLATE_MAX_ROW, 'ProjectFacultyOptions', 'เลือกผู้ดำเนินโครงการจากรายชื่อ');
    projectTemplateAddListValidation($projects, 'E2:E' . PROJECT_TEMPLATE_MAX_ROW, 'ProjectTypeOptions', 'เลือกประเภทโครงการ');
    projectTemplateAddListValidation($projects, 'G2:G' . PROJECT_TEMPLATE_MAX_ROW, 'ProjectStatusOptions', 'เลือกสถานะโครงการ');
    projectTemplateAddListValidation(
        $projects,
        'J2:J' . PROJECT_TEMPLATE_MAX_ROW,
        'ProjectFacultyOptions',
        'เลือกหนึ่งคน หรือพิมพ์หลายรายการคั่นด้วยจุลภาค อัฒภาค หรือขึ้นบรรทัดใหม่',
        false
    );

    $activities = $spreadsheet->createSheet();
    projectTemplatePrepareSheet(
        $activities,
        'กิจกรรมย่อย',
        ['รหัสโครงการ', 'ชื่อกิจกรรม', 'ลิงก์ Google Drive', 'ลำดับกิจกรรม'],
        [18, 42, 58, 16],
        ['A', 'B', 'C'],
        ['A', 'B', 'C']
    );
    $activities->getComment('A1')->getText()->createTextRun('กรอกรหัสโครงการที่มีอยู่ในชีตโครงการหรือมีอยู่ในระบบแล้ว');
    $activities->getComment('C1')->getText()->createTextRun('รองรับเฉพาะ https://drive.google.com หรือ https://docs.google.com');
    $activities->getStyle('D2:D' . PROJECT_TEMPLATE_MAX_ROW)->getNumberFormat()->setFormatCode('0');

    $spreadsheet->setActiveSheetIndex(0);
    logAudit(
        $db,
        $adminUserId,
        'export',
        'project_import_template',
        'ดาวน์โหลดแพทเทิร์นนำเข้าข้อมูลโครงการพร้อมตัวเลือกบุคลากร ' . count($facultyOptions) . ' รายการ'
    );

    $fileName = 'แพทเทิร์นนำเข้าข้อมูลโครงการ.xlsx';
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="project_import_template.xlsx"; filename*=UTF-8\'\'' . rawurlencode($fileName));
    header('Cache-Control: max-age=0');
    (new Xlsx($spreadsheet))->save('php://output');
    $spreadsheet->disconnectWorksheets();
    exit;
} catch (Throwable $e) {
    error_log('project import template failed: ' . $e->getMessage());
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
    }
    echo json_encode([
        'status' => 'error',
        'message' => 'ไม่สามารถสร้างแพทเทิร์นนำเข้าข้อมูลโครงการได้',
    ], JSON_UNESCAPED_UNICODE);
}
