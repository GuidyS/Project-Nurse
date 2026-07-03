<?php
require_once __DIR__ . '/../../../config/config.php';

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

/**
 * Schema ของแต่ละประเภท map ตรงกับฐานข้อมูลจริง
 * - table      : ชื่อตาราง
 * - order_by   : คอลัมน์เรียงลำดับ
 * - select     : คอลัมน์ที่ต้อง SELECT จาก DB
 * - fields[key]: ['label' => หัวตาราง, 'resolve' => fn($row) => ค่า]
 */
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
            'select' => ['student_id', 'title', 'first_name_th', 'last_name_th', 'nickname', 'gender', 'year_level', 'gpa', 'status', 'email', 'phone', 'admission_year', 'hometown_province'],
            'fields' => [
                'student_id'        => ['label' => 'รหัสนักศึกษา',  'resolve' => fn($r) => $r['student_id']],
                'full_name_th'      => ['label' => 'ชื่อ-นามสกุล',  'resolve' => $fullNameTh],
                'nickname'          => ['label' => 'ชื่อเล่น',       'resolve' => fn($r) => $r['nickname']],
                'gender'            => ['label' => 'เพศ',           'resolve' => fn($r) => $r['gender']],
                'year_level'        => ['label' => 'ชั้นปี',         'resolve' => fn($r) => $r['year_level']],
                'gpa'               => ['label' => 'GPA',           'resolve' => fn($r) => $r['gpa']],
                'status'            => ['label' => 'สถานะ',         'resolve' => fn($r) => $r['status']],
                'email'             => ['label' => 'อีเมล',         'resolve' => fn($r) => $r['email']],
                'phone'             => ['label' => 'เบอร์โทร',      'resolve' => fn($r) => $r['phone']],
                'admission_year'    => ['label' => 'ปีที่เข้าศึกษา', 'resolve' => fn($r) => $r['admission_year']],
                'hometown_province' => ['label' => 'ภูมิลำเนา',     'resolve' => fn($r) => $r['hometown_province']],
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
        'courses' => [
            'table' => 'subject',
            'order_by' => 'subject_code ASC',
            'select' => ['subject_code', 'subject_name_th', 'subject_name_en', 'credit', 'credit_desc', 'subject_type', 'department', 'year_level', 'semester'],
            'fields' => [
                'subject_code'    => ['label' => 'รหัสวิชา',           'resolve' => fn($r) => $r['subject_code']],
                'subject_name_th' => ['label' => 'ชื่อวิชา (ไทย)',     'resolve' => fn($r) => $r['subject_name_th']],
                'subject_name_en' => ['label' => 'ชื่อวิชา (อังกฤษ)',  'resolve' => fn($r) => $r['subject_name_en']],
                'credit'          => ['label' => 'หน่วยกิต',          'resolve' => fn($r) => $r['credit']],
                'credit_desc'     => ['label' => 'หน่วยกิต (รายละเอียด)', 'resolve' => fn($r) => $r['credit_desc']],
                'subject_type'    => ['label' => 'ประเภทวิชา',        'resolve' => fn($r) => $r['subject_type']],
                'department'      => ['label' => 'ภาควิชา',           'resolve' => fn($r) => $r['department']],
                'year_level'      => ['label' => 'ชั้นปี',            'resolve' => fn($r) => $r['year_level']],
                'semester'        => ['label' => 'ภาคเรียน',         'resolve' => fn($r) => $r['semester']],
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

try {
    $schemas = getExportSchema();

    if (!isset($schemas[$category])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ไม่รองรับประเภทข้อมูลนี้"]);
        exit;
    }

    $schema = $schemas[$category];

    // ถ้า frontend ส่ง key ฟิลด์มา ใช้เฉพาะ key ที่มีจริงใน schema (เรียงตามที่ส่งมา)
    // ถ้าไม่ส่งมา ใช้ทุกฟิลด์ตามลำดับใน schema
    $availableKeys = array_keys($schema['fields']);
    $selectedKeys = array_values(array_filter($requestedFields, fn($k) => isset($schema['fields'][$k])));
    if (empty($selectedKeys)) {
        $selectedKeys = $availableKeys;
    }

    // หัวตาราง
    $headers = array_map(fn($k) => $schema['fields'][$k]['label'], $selectedKeys);

    // ดึงข้อมูลจาก DB
    $db = new Connect();
    $columns = implode(', ', array_map(fn($c) => "`$c`", $schema['select']));
    $sql = "SELECT $columns FROM `{$schema['table']}` ORDER BY {$schema['order_by']}";
    $stmt = $db->query($sql);

    $exportData = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $line = [];
        foreach ($selectedKeys as $key) {
            $value = $schema['fields'][$key]['resolve']($row);
            $line[] = ($value === null) ? '' : $value;
        }
        $exportData[] = $line;
    }

    $fileSuffix = $academicYear !== '' ? '_' . $academicYear : '';

    // 🌟 กรณีส่งออกเป็น Excel (.xlsx)
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
    // 🌟 กรณีส่งออกเป็น CSV
    else {
        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="export_' . $category . $fileSuffix . '.csv"');

        $output = fopen('php://output', 'w');
        fputs($output, "\xEF\xBB\xBF"); // แก้ภาษาไทยเพี้ยน
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
