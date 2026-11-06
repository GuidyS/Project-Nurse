<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/../../../config/admin_access.php';
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
$format = $data['format'] ?? 'xlsx';
$requestedFields = $data['fields'] ?? [];

function getExportSchema(): array
{
    $makeFields = static function (array $labels): array {
        $fields = [];
        foreach ($labels as $key => $label) {
            $fields[$key] = [
                'label' => $label,
                'resolve' => static fn(array $row) => $row[$key] ?? null,
            ];
        }
        return $fields;
    };

    $studentLabels = [
        'student_id' => 'รหัสนักศึกษา',
        'year_level' => 'ชั้นปี',
        'status' => 'สถานะการศึกษา',
        'admission_year' => 'ปีที่เข้าศึกษา',
        'graduation_date' => 'วันที่สำเร็จการศึกษา',
        'dropout_date' => 'วันที่ออกจากการศึกษา',
        'dropout_reason' => 'เหตุผลที่ออกจากการศึกษา',
        'created_at' => 'วันที่สร้างข้อมูล',
        'updated_at' => 'วันที่แก้ไขข้อมูลล่าสุด',
        'last_eval_date' => 'วันที่ประเมินล่าสุด',
        'title' => 'คำนำหน้า',
        'first_name_th' => 'ชื่อภาษาไทย',
        'last_name_th' => 'นามสกุลภาษาไทย',
        'gender' => 'เพศ',
        'birth_date' => 'วันเดือนปีเกิด',
        'height' => 'ส่วนสูง',
        'weight' => 'น้ำหนัก',
        'bmi' => 'ดัชนีมวลกาย (BMI)',
        'email' => 'อีเมล',
        'phone' => 'เบอร์โทรศัพท์มือถือ',
        'home_phone' => 'เบอร์โทรศัพท์บ้าน',
        'home_address' => 'ที่อยู่ตามทะเบียนบ้าน',
        'father_first_name' => 'ชื่อบิดา',
        'father_last_name' => 'นามสกุลบิดา',
        'father_age' => 'อายุบิดา',
        'father_phone' => 'เบอร์โทรศัพท์บิดา',
        'father_address' => 'ที่อยู่ปัจจุบันของบิดา',
        'mother_first_name' => 'ชื่อมารดา',
        'mother_last_name' => 'นามสกุลมารดา',
        'mother_age' => 'อายุมารดา',
        'mother_phone' => 'เบอร์โทรศัพท์มารดา',
        'mother_address' => 'ที่อยู่ปัจจุบันของมารดา',
        'advisor_status' => 'สถานะการให้คำปรึกษา',
        'advisor_status_details' => 'รายละเอียดสถานะการให้คำปรึกษา',
        'advisor_is_employed' => 'สถานะการมีงานทำ',
        'license_first_attempt_passed' => 'ผ่านใบประกอบวิชาชีพครั้งแรก',
        'license_first_attempt_passed_at' => 'วันที่บันทึกการผ่านครั้งแรก',
        'license_first_attempt_evidence_path' => 'ที่อยู่ไฟล์หลักฐานการผ่านครั้งแรก',
        'license_first_attempt_evidence_name' => 'ชื่อไฟล์หลักฐานการผ่านครั้งแรก',
        'license_within_one_year_passed' => 'ผ่านใบประกอบวิชาชีพภายในหนึ่งปี',
        'license_within_one_year_passed_at' => 'วันที่บันทึกการผ่านภายในหนึ่งปี',
        'license_within_one_year_evidence_path' => 'ที่อยู่ไฟล์หลักฐานการผ่านภายในหนึ่งปี',
        'license_within_one_year_evidence_name' => 'ชื่อไฟล์หลักฐานการผ่านภายในหนึ่งปี',
    ];

    $facultyLabels = [
        'faculty_id' => 'รหัสอาจารย์',
        'status' => 'สถานะการทำงาน',
        'start_work_date' => 'วันที่เริ่มปฏิบัติงาน',
        'contract_date' => 'วันที่สัญญาจ้าง',
        'academic_position_date' => 'วันที่รับตำแหน่งทางวิชาการ',
        'pts_date' => 'วันที่รับตำแหน่ง พตส',
        'created_at' => 'วันที่สร้างข้อมูล',
        'title' => 'คำนำหน้า',
        'first_name_th' => 'ชื่อภาษาไทย',
        'last_name_th' => 'นามสกุลภาษาไทย',
        'gender' => 'เพศ',
        'birth_date' => 'วันเดือนปีเกิด',
        'email' => 'อีเมล',
        'phone' => 'เบอร์โทรศัพท์',
        'current_address' => 'ที่อยู่ปัจจุบัน',
        'nursing_council_no' => 'เลขใบประกอบวิชาชีพ',
        'license_expiry' => 'วันหมดอายุใบอนุญาต',
        'nursing_council_file' => 'ไฟล์บัตรสภาการพยาบาล',
        'license_file' => 'ไฟล์ใบอนุญาตประกอบวิชาชีพ',
        'teaching_cert_file' => 'ไฟล์ใบประกอบวิชาชีพครู',
        'license_image' => 'รูปใบประกอบวิชาชีพ',
    ];

    $courseLabels = [
        'subject_code' => 'รหัสวิชา',
        'subject_name_th' => 'ชื่อวิชา (ไทย)',
        'subject_name_en' => 'ชื่อวิชา (อังกฤษ)',
        'credit' => 'จำนวนหน่วยกิต',
        'credit_desc' => 'รายละเอียดหน่วยกิต',
        'subject_type' => 'ประเภทวิชา',
        'semester' => 'ภาคเรียน',
        'academic_year' => 'ปีการศึกษา',
    ];

    $projectLabels = [
        'project_id' => 'รหัสโครงการ',
        'project_name_th' => 'ชื่อโครงการ',
        'project_type' => 'ประเภทโครงการ',
        'responsible_faculty_id' => 'ผู้ดำเนินโครงการ',
        'academic_year' => 'ปีการศึกษา',
        'status' => 'สถานะโครงการ',
        'start_date' => 'วันที่เริ่มต้น',
        'end_date' => 'วันที่สิ้นสุด',
        'strategy' => 'ยุทธศาสตร์',
        'member_faculty_ids' => 'ผู้เข้าร่วมโครงการ',
        'plo_codes' => 'รหัส PLO',
        'clo_codes' => 'รหัส CLO',
        'created_at' => 'วันที่สร้างข้อมูล',
        'updated_at' => 'วันที่แก้ไขข้อมูลล่าสุด',
    ];

    $projectFields = $makeFields($projectLabels);
    $projectTypeLabels = [
        'academic_service' => 'บริการวิชาการ',
        'culture' => 'ทำนุบำรุงศิลปวัฒนธรรม',
        'teaching' => 'การเรียนการสอน',
        'research' => 'วิจัย',
        'quality_assurance' => 'การประกันคุณภาพ',
        'other' => 'อื่นๆ/ยังไม่จำแนก',
    ];
    $projectStatusLabels = [
        'pending' => 'รอดำเนินการ',
        'active' => 'กำลังดำเนินการ',
        'completed' => 'เสร็จสิ้น',
        'cancelled' => 'ยกเลิก',
    ];
    $projectFields['project_type']['resolve'] = static function (array $row) use ($projectTypeLabels) {
        $value = (string)($row['project_type'] ?? '');
        return $projectTypeLabels[$value] ?? $value;
    };
    $projectFields['status']['resolve'] = static function (array $row) use ($projectStatusLabels) {
        $value = (string)($row['status'] ?? '');
        return $projectStatusLabels[$value] ?? $value;
    };
    $projectFields['responsible_faculty_id']['resolve'] = static fn(array $row) => $row['responsible_faculty_display'] ?? $row['responsible_faculty_id'] ?? null;

    return [
        'students' => [
            'table' => 'student',
            'order_by' => 'student_id ASC',
            'select' => array_keys($studentLabels),
            'fields' => $makeFields($studentLabels),
        ],
        'teachers' => [
            'table' => 'faculty',
            'order_by' => 'faculty_id ASC',
            'select' => array_keys($facultyLabels),
            'fields' => $makeFields($facultyLabels),
        ],
        'courses' => [
            'fields' => $makeFields($courseLabels),
        ],
        'projects' => [
            'table' => 'project',
            'order_by' => 'project_id ASC',
            'select' => array_keys($projectLabels),
            'fields' => $projectFields,
        ],
    ];
}

/**
 * Export project relations as stable, comma-separated codes instead of the
 * retired project-level JSON compatibility field.
 * @return array{0:string,1:array}
 */
function exportProjectsQuery(): array
{
    return [
        "SELECT p.project_id,
                p.project_name_th,
                p.project_type,
                p.responsible_faculty_id,
                CASE
                    WHEN p.responsible_faculty_id IS NULL THEN ''
                    WHEN NULLIF(TRIM(CONCAT_WS(' ', NULLIF(rf.title, ''), NULLIF(rf.first_name_th, ''), NULLIF(rf.last_name_th, ''))), '') IS NULL
                        THEN CAST(p.responsible_faculty_id AS CHAR)
                    ELSE CONCAT(
                        CAST(p.responsible_faculty_id AS CHAR),
                        ' - ',
                        TRIM(CONCAT_WS(' ', NULLIF(rf.title, ''), NULLIF(rf.first_name_th, ''), NULLIF(rf.last_name_th, '')))
                    )
                END AS responsible_faculty_display,
                p.academic_year,
                p.status,
                p.start_date,
                p.end_date,
                p.strategy,
                COALESCE((
                    SELECT GROUP_CONCAT(
                        DISTINCT CASE
                            WHEN NULLIF(TRIM(CONCAT_WS(' ', NULLIF(mf.title, ''), NULLIF(mf.first_name_th, ''), NULLIF(mf.last_name_th, ''))), '') IS NULL
                                THEN CAST(pfm.faculty_id AS CHAR)
                            ELSE CONCAT(
                                CAST(pfm.faculty_id AS CHAR),
                                ' - ',
                                TRIM(CONCAT_WS(' ', NULLIF(mf.title, ''), NULLIF(mf.first_name_th, ''), NULLIF(mf.last_name_th, '')))
                            )
                        END
                        ORDER BY pfm.faculty_id SEPARATOR ', '
                    )
                    FROM project_faculty_members pfm
                    LEFT JOIN faculty mf ON mf.faculty_id = pfm.faculty_id
                    WHERE pfm.project_id = p.project_id
                      AND (p.responsible_faculty_id IS NULL OR pfm.faculty_id <> p.responsible_faculty_id)
                ), '') AS member_faculty_ids,
                COALESCE((
                    SELECT GROUP_CONCAT(DISTINCT pol.outcome_code
                                        ORDER BY pol.outcome_code SEPARATOR ',')
                    FROM project_outcome_links pol
                    WHERE pol.project_id = p.project_id AND pol.outcome_type = 'plo'
                ), '') AS plo_codes,
                COALESCE((
                    SELECT GROUP_CONCAT(DISTINCT pol.outcome_code
                                        ORDER BY pol.outcome_code SEPARATOR ',')
                    FROM project_outcome_links pol
                    WHERE pol.project_id = p.project_id AND pol.outcome_type = 'clo'
                ), '') AS clo_codes,
                p.created_at,
                p.updated_at
         FROM project p
         LEFT JOIN faculty rf ON rf.faculty_id = p.responsible_faculty_id
         ORDER BY p.project_id ASC",
        [],
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
            "SELECT subject_code, subject_name_th, subject_name_en, credit, credit_desc,
                    subject_type, semester, academic_year
             FROM subject ORDER BY subject_code ASC",
            [],
            null,
        ];
    }

    curriculumCyclesEnsureSchema($db); // มีคอลัมน์ subject_name_en / subject_type แน่นอน
    $cycleHasTerm = activeCurriculumColumnExists($db, 'curriculum_cycle_subject', 'semester');
    $subjectHasYear = activeCurriculumColumnExists($db, 'subject', 'academic_year');
    $semesterSelect = $cycleHasTerm ? 'COALESCE(cs.semester, s.semester)' : 's.semester';
    $subjectYear = $subjectHasYear ? 's.academic_year' : 'NULL';
    $yearSelect = $cycleHasTerm ? "COALESCE(cs.academic_year, {$subjectYear})" : $subjectYear;
    return [
        "SELECT cs.subject_code,
                cs.subject_name AS subject_name_th,
                COALESCE(cs.subject_name_en, s.subject_name_en) AS subject_name_en,
                cs.credit,
                cs.credit_desc,
                COALESCE(cs.subject_type, s.subject_type) AS subject_type,
                {$semesterSelect} AS semester,
                {$yearSelect} AS academic_year
         FROM curriculum_cycle_subject cs
         LEFT JOIN subject s ON s.subject_code = cs.subject_code
         WHERE cs.cycle_id = :cycle_id
         ORDER BY cs.subject_code ASC, cs.id ASC",
        [':cycle_id' => $cycle['id']],
        $cycle,
    ];
}

try {
    $schemas = getExportSchema();
    $db = new Connect();
    $adminUserId = adminRequireAccess($db);

    if ($format !== 'xlsx') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "รองรับเฉพาะไฟล์ Excel (.xlsx) เท่านั้น"], JSON_UNESCAPED_UNICODE);
        exit;
    }

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

    $curriculum = null;

    if ($category === 'courses') {
        [$sql, $params, $curriculum] = exportCoursesQuery($db);
    } elseif ($category === 'projects') {
        $db->exec('SET SESSION group_concat_max_len = 1048576');
        [$sql, $params] = exportProjectsQuery();
    } else {
        $columns = implode(', ', array_map(fn($c) => "`$c`", $schema['select']));
        $params = [];
        $sql = "SELECT $columns FROM `{$schema['table']}` ORDER BY {$schema['order_by']}";
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
    $curriculumNote = $curriculum ? ", curriculum={$curriculum['start_year']}-{$curriculum['end_year']}" : '';
    logAudit($db, $adminUserId, 'export', 'export', "ส่งออกข้อมูล {$category} รูปแบบ {$format} จำนวน {$recordCount} รายการ ({$fieldCount} fields, all records{$curriculumNote})");

    $fileSuffix = $curriculum
        ? "_{$curriculum['start_year']}-{$curriculum['end_year']}"
        : '';

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

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
