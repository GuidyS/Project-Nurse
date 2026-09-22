<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/../Approvals/approval-schema.php';
require_once __DIR__ . '/../../../config/active_curriculum.php';
require_once __DIR__ . '/../CurriculumCycles/curriculum_cycles_helpers.php';

// นำเข้าเครื่องมือสร้าง Excel
require_once __DIR__ . '/../../../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['category'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    exit;
}

$category = $data['category'];
$format = $data['format'] ?? 'csv';
$requestedFields = $data['fields'] ?? [];
$academicYear = $data['academicYear'] ?? '';

function getExportSchema(): array
{
    $fullNameTh = function ($row) {
        $parts = array_filter([
            $row['title'] ?? '',
            $row['first_name_th'] ?? '',
            $row['last_name_th'] ?? ''
        ], fn($v) => $v !== null && trim((string)$v) !== '');
        return trim(implode(' ', $parts));
    };

    return [
        'students' => [
            'table' => 'student',
            'order_by' => 'student_id ASC',
            'select' => ['student_id', 'title', 'first_name_th', 'last_name_th', 'gender', 'year_level', 'gpa', 'status', 'email', 'phone', 'admission_year'],
            'fields' => [
                'student_id'        => ['label' => 'รหัสนักศึกษา',  'resolve' => fn($r) => $r['student_id']],
                'full_name_th'      => ['label' => 'ชื่อ-นามสกุล',  'resolve' => $fullNameTh],
                'gender'            => ['label' => 'เพศ',           'resolve' => fn($r) => $r['gender']],
                'year_level'        => ['label' => 'ชั้นปี',         'resolve' => fn($r) => $r['year_level']],
                'gpa'               => ['label' => 'GPA',           'resolve' => fn($r) => $r['gpa']],
                'status'            => ['label' => 'สถานะ',         'resolve' => fn($r) => $r['status']],
                'email'             => ['label' => 'อีเมล',         'resolve' => fn($r) => $r['email']],
                'phone'             => ['label' => 'เบอร์โทร',      'resolve' => fn($r) => $r['phone']],
                'admission_year'    => ['label' => 'ปีที่เข้าศึกษา', 'resolve' => fn($r) => $r['admission_year']],
            ],
        ],
        'teachers' => [
            'table' => 'faculty',
            'order_by' => 'faculty_id ASC',
            'select' => ['faculty_id', 'title', 'first_name_th', 'last_name_th', 'gender', 'email', 'phone', 'current_address', 'nursing_council_no', 'license_expiry', 'status'],
            'fields' => [
                'faculty_id'         => ['label' => 'รหัสอาจารย์',          'resolve' => fn($r) => $r['faculty_id']],
                'full_name_th'       => ['label' => 'ชื่อ-นามสกุล',         'resolve' => $fullNameTh],
                'gender'             => ['label' => 'เพศ',                  'resolve' => fn($r) => $r['gender']],
                'email'              => ['label' => 'อีเมล',                'resolve' => fn($r) => $r['email']],
                'phone'              => ['label' => 'เบอร์โทร',             'resolve' => fn($r) => $r['phone']],
                'current_address'    => ['label' => 'ที่อยู่ปัจจุบัน',       'resolve' => fn($r) => $r['current_address']],
                'nursing_council_no' => ['label' => 'เลขใบประกอบวิชาชีพ',  'resolve' => fn($r) => $r['nursing_council_no']],
                'license_expiry'     => ['label' => 'วันหมดอายุใบอนุญาต',   'resolve' => fn($r) => $r['license_expiry']],
                'status'             => ['label' => 'สถานะ',               'resolve' => fn($r) => $r['status']],
            ],
        ],
        // รายวิชาของหลักสูตรที่ใช้งานในระบบ (หน้า "จัดการหลักสูตรรอบ 5 ปี") — ใช้ SQL เฉพาะ ดู exportCoursesQuery()
        'courses' => [
            'fields' => [
                'subject_code'    => ['label' => 'รหัสวิชา',           'resolve' => fn($r) => $r['subject_code']],
                'subject_name_th' => ['label' => 'ชื่อวิชา (ไทย)',     'resolve' => fn($r) => $r['subject_name_th']],
                'subject_name_en' => ['label' => 'ชื่อวิชา (อังกฤษ)',  'resolve' => fn($r) => $r['subject_name_en']],
                // แสดงแบบเดียวกับหน้าจัดการหลักสูตร เช่น 3(2-2-5) ถ้าไม่มีรายละเอียดใช้ตัวเลข
                'credit'          => ['label' => 'หน่วยกิต',          'resolve' => fn($r) => ($r['credit_desc'] ?? '') !== '' ? $r['credit_desc'] : $r['credit']],
                'subject_type'    => ['label' => 'ประเภทวิชา',        'resolve' => fn($r) => $r['subject_type']],
            ],
        ],
        'projects' => [
            'table' => 'project',
            'order_by' => 'project_id ASC',
            'select' => ['project_id', 'project_name_th', 'project_name_en', 'description', 'responsible_faculty_id', 'academic_year'],
            'fields' => [
                'project_id'             => ['label' => 'รหัสโครงการ',         'resolve' => fn($r) => $r['project_id']],
                'project_name_th'        => ['label' => 'ชื่อโครงการ (ไทย)',    'resolve' => fn($r) => $r['project_name_th']],
                'project_name_en'        => ['label' => 'ชื่อโครงการ (อังกฤษ)', 'resolve' => fn($r) => $r['project_name_en']],
                'description'            => ['label' => 'รายละเอียด',          'resolve' => fn($r) => $r['description']],
                'responsible_faculty_id' => ['label' => 'อาจารย์ผู้รับผิดชอบ',  'resolve' => fn($r) => $r['responsible_faculty_id']],
                'academic_year'          => ['label' => 'ปีการศึกษา',          'resolve' => fn($r) => $r['academic_year']],
            ],
        ],
    ];
}

/**
 * รายวิชาของหลักสูตรที่ใช้งานในระบบ (ไม่มีตัวกรองปี/ภาคเรียน)
 * ยังไม่มีหลักสูตรในระบบเลย → ใช้ตาราง subject แบบเดิม
 * @return array{0:string,1:array,2:?array} [SQL, params, หลักสูตร]
 */
function exportCoursesQuery(PDO $db): array
{
    $cycle = activeCurriculumCycle($db);
    if ($cycle === null) {
        return [
            "SELECT subject_code, subject_name_th, subject_name_en, credit, credit_desc, subject_type
             FROM subject ORDER BY subject_code ASC",
            [],
            null,
        ];
    }

    curriculumCyclesEnsureSchema($db); // มีคอลัมน์ subject_name_en / subject_type แน่นอน
    return [
        "SELECT subject_code, subject_name AS subject_name_th, subject_name_en, credit, credit_desc, subject_type
         FROM curriculum_cycle_subject WHERE cycle_id = :cycle_id ORDER BY subject_code ASC, id ASC",
        [':cycle_id' => $cycle['id']],
        $cycle,
    ];
}

try {
    $schemas = getExportSchema();
    $db = new Connect();
    $adminUserId = approvalRequireAdmin($db);

    if (!isset($schemas[$category])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ไม่รองรับประเภทข้อมูลนี้"]);
        exit;
    }

    $schema = $schemas[$category];

    $availableKeys = array_keys($schema['fields']);
    $selectedKeys = array_values(array_filter($requestedFields, fn($k) => isset($schema['fields'][$k])));
    if (empty($selectedKeys)) {
        $selectedKeys = $availableKeys;
    }

    $headers = array_map(fn($k) => $schema['fields'][$k]['label'], $selectedKeys);

    // ข้อมูลอาจารย์ / รายวิชา ส่งออกทั้งหมด ไม่มีตัวกรองปีการศึกษา/ภาคเรียน
    if ($category === 'teachers' || $category === 'courses') {
        $academicYear = '';
        $data['semester'] = '';
    }
    $semester = $data['semester'] ?? 'ทั้งหมด';
    $curriculum = null;

    if ($category === 'courses') {
        [$sql, $params, $curriculum] = exportCoursesQuery($db);
    } else {
        $columns = implode(', ', array_map(fn($c) => "`$c`", $schema['select']));
        $whereClause = "";
        $params = [];

        if ($academicYear !== '' && $academicYear !== 'ทั้งหมด') {
            if ($category === 'students') {
                $whereClause .= ($whereClause ? " AND " : " WHERE ") . "admission_year = :year";
                $params[':year'] = $academicYear;
            } elseif ($category === 'projects') {
                $whereClause .= ($whereClause ? " AND " : " WHERE ") . "academic_year = :year";
                $params[':year'] = $academicYear;
            }
        }

        $sql = "SELECT $columns FROM `{$schema['table']}`{$whereClause} ORDER BY {$schema['order_by']}";
    }
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    $exportData = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $line = [];
        foreach ($selectedKeys as $key) {
            $value = $schema['fields'][$key]['resolve']($row);
            $line[] = ($value === null) ? '' : $value;
        }
        $exportData[] = $line;
    }

    $recordCount = count($exportData);
    $fieldCount = count($selectedKeys);
    $yearFilter = $academicYear !== '' ? $academicYear : 'all';
    $semesterFilter = $semester !== '' ? $semester : 'all';
    $curriculumNote = $curriculum ? ", curriculum={$curriculum['start_year']}-{$curriculum['end_year']}" : '';
    logAudit($db, $adminUserId, 'update', 'exports', "ส่งออกข้อมูล {$category} รูปแบบ {$format} จำนวน {$recordCount} รายการ ({$fieldCount} fields, year={$yearFilter}, semester={$semesterFilter}{$curriculumNote})");

    $fileSuffix = $curriculum
        ? "_{$curriculum['start_year']}-{$curriculum['end_year']}"
        : ($academicYear !== '' ? '_' . $academicYear : '');

    // ส่งออก Excel (.xlsx)
    if ($format === 'xlsx') {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $colIndex = 1;
        foreach ($headers as $header) {
            $sheet->setCellValue([$colIndex, 1], $header);
            $colIndex++;
        }

        $rowIndex = 2;
        foreach ($exportData as $rowData) {
            $colIndex = 1;
            foreach ($rowData as $value) {
                $sheet->setCellValueExplicit(
                    [$colIndex, $rowIndex],
                    (string)$value,
                    \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING
                );
                $colIndex++;
            }
            $rowIndex++;
        }

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="export_' . $category . $fileSuffix . '.xlsx"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }
    // ส่งออก CSV
    else {
        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="export_' . $category . $fileSuffix . '.csv"');

        $output = fopen('php://output', 'w');
        fputs($output, "\xEF\xBB\xBF");
        fputcsv($output, $headers);

        foreach ($exportData as $rowData) {
            fputcsv($output, $rowData);
        }
        fclose($output);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
