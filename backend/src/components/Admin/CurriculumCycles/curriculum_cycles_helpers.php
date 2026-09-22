<?php
/**
 * ตัวช่วยของหน้า "จัดการหลักสูตร" (หลักสูตรรอบละ 5 ปี เช่น 2566 - 2571)
 * ตารางแยกออกจาก subject เดิม เพื่อไม่ให้กระทบหน้า CLO / รายวิชา ที่ใช้ตาราง subject อยู่
 */

const CURRICULUM_YEAR_MIN = 2500;
const CURRICULUM_YEAR_MAX = 2700;
const CURRICULUM_CREDIT_MAX = 30;
const CURRICULUM_IMPORT_MAX_ROWS = 1000;

function curriculumCyclesRespond(int $code, array $payload): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit();
}

function curriculumCyclesRequireAdmin(PDO $db): int
{
    if (!isset($_SESSION['user_id'])) {
        curriculumCyclesRespond(401, ["status" => "error", "message" => "Unauthorized"]);
    }

    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ? LIMIT 1");
    $stmt->execute([$_SESSION['user_id']]);
    if ((int)$stmt->fetchColumn() !== 1) {
        curriculumCyclesRespond(403, ["status" => "error", "message" => "เฉพาะผู้ดูแลระบบเท่านั้นที่จัดการหลักสูตรได้"]);
    }

    return (int)$_SESSION['user_id'];
}

// สร้างตารางอัตโนมัติเมื่อเรียก API ครั้งแรก (import ดัมพ์เก่าก็ไม่พัง)
function curriculumCyclesEnsureSchema(PDO $db): void
{
    $db->exec("
        CREATE TABLE IF NOT EXISTS curriculum_cycle (
            id INT NOT NULL AUTO_INCREMENT,
            start_year INT NOT NULL,
            end_year INT NOT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_curriculum_cycle_years (start_year, end_year)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS curriculum_cycle_subject (
            id INT NOT NULL AUTO_INCREMENT,
            cycle_id INT NOT NULL,
            subject_code VARCHAR(50) NOT NULL,
            subject_name VARCHAR(255) NOT NULL,
            credit INT NOT NULL DEFAULT 0,
            credit_desc VARCHAR(50) DEFAULT NULL,
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_curriculum_cycle_subject_code (cycle_id, subject_code),
            CONSTRAINT fk_curriculum_cycle_subject_cycle
                FOREIGN KEY (cycle_id) REFERENCES curriculum_cycle (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    ");

    // หลักสูตรที่ใช้งานในระบบ (ครั้งละ 1 หลักสูตร) — หน้ารายวิชาอื่นๆ แสดงเฉพาะวิชาของหลักสูตรนี้
    if (!activeCurriculumColumnExists($db, 'curriculum_cycle', 'is_active')) {
        $db->exec("ALTER TABLE curriculum_cycle ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 0 AFTER end_year");
    }

    // ชื่อวิชาภาษาอังกฤษ + ประเภทวิชา (ให้ฟิลด์ตรงกับหน้าส่งออกข้อมูลรายวิชา)
    if (!activeCurriculumColumnExists($db, 'curriculum_cycle_subject', 'subject_name_en')) {
        $db->exec("ALTER TABLE curriculum_cycle_subject ADD COLUMN subject_name_en VARCHAR(255) DEFAULT NULL AFTER subject_name");
    }
    if (!activeCurriculumColumnExists($db, 'curriculum_cycle_subject', 'subject_type')) {
        $db->exec("ALTER TABLE curriculum_cycle_subject ADD COLUMN subject_type VARCHAR(100) DEFAULT NULL AFTER credit_desc");
    }
}

function curriculumCyclesReadJson(): array
{
    $input = json_decode(file_get_contents('php://input'), true);
    return is_array($input) ? $input : [];
}

function curriculumCyclesNormalizeYear($value, string $label): int
{
    $text = trim((string)$value);
    if ($text === '' || !preg_match('/^\d{4}$/', $text)) {
        throw new InvalidArgumentException("{$label}ต้องเป็นปี พ.ศ. 4 หลัก");
    }
    $year = (int)$text;
    if ($year < CURRICULUM_YEAR_MIN || $year > CURRICULUM_YEAR_MAX) {
        throw new InvalidArgumentException("{$label}ต้องอยู่ระหว่าง " . CURRICULUM_YEAR_MIN . " - " . CURRICULUM_YEAR_MAX);
    }
    return $year;
}

/**
 * รับหน่วยกิตได้ทั้ง "3" และ "3(2-2-5)"
 * คืนค่า [จำนวนหน่วยกิต, รูปแบบเต็มถ้ามีวงเล็บ]
 */
function curriculumCyclesParseCredit($value): array
{
    $text = trim((string)$value);
    if ($text === '') {
        throw new InvalidArgumentException("กรุณาระบุจำนวนหน่วยกิต");
    }
    if (!preg_match('/^(\d{1,2})(?:\.0+)?\s*(\(\s*[\d\s\-–]+\s*\))?$/u', $text, $m)) {
        throw new InvalidArgumentException("จำนวนหน่วยกิตต้องเป็นตัวเลข เช่น 3 หรือ 3(2-2-5)");
    }
    $credit = (int)$m[1];
    if ($credit > CURRICULUM_CREDIT_MAX) {
        throw new InvalidArgumentException("จำนวนหน่วยกิตต้องไม่เกิน " . CURRICULUM_CREDIT_MAX);
    }
    $desc = !empty($m[2]) ? $credit . preg_replace('/\s+/', '', $m[2]) : null;
    return [$credit, $desc];
}

function curriculumCyclesNormalizeSubject(array $row): array
{
    $code = trim((string)($row['subject_code'] ?? ''));
    $name = trim((string)($row['subject_name'] ?? ''));

    if ($code === '') {
        throw new InvalidArgumentException("กรุณาระบุรหัสวิชา");
    }
    if (mb_strlen($code) > 50) {
        throw new InvalidArgumentException("รหัสวิชายาวเกิน 50 ตัวอักษร");
    }
    if ($name === '') {
        throw new InvalidArgumentException("กรุณาระบุชื่อวิชา");
    }
    if (mb_strlen($name) > 255) {
        throw new InvalidArgumentException("ชื่อวิชายาวเกิน 255 ตัวอักษร");
    }

    [$credit, $creditDesc] = curriculumCyclesParseCredit($row['credit'] ?? '');

    // ไม่บังคับกรอก — ค่าว่างเก็บเป็น NULL
    $nameEn = trim((string)($row['subject_name_en'] ?? ''));
    if (mb_strlen($nameEn) > 255) {
        throw new InvalidArgumentException("ชื่อวิชาภาษาอังกฤษยาวเกิน 255 ตัวอักษร");
    }
    $type = trim((string)($row['subject_type'] ?? ''));
    if (mb_strlen($type) > 100) {
        throw new InvalidArgumentException("ประเภทวิชายาวเกิน 100 ตัวอักษร");
    }

    return [
        'subject_code' => $code,
        'subject_name' => $name,
        'subject_name_en' => $nameEn !== '' ? $nameEn : null,
        'credit' => $credit,
        'credit_desc' => $creditDesc,
        'subject_type' => $type !== '' ? $type : null,
    ];
}

function curriculumCyclesFindCycle(PDO $db, int $cycleId): ?array
{
    $stmt = $db->prepare("SELECT id, start_year, end_year FROM curriculum_cycle WHERE id = ? LIMIT 1");
    $stmt->execute([$cycleId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function curriculumCyclesRequireCycle(PDO $db, $cycleId): array
{
    $cycle = curriculumCyclesFindCycle($db, (int)$cycleId);
    if ($cycle === null) {
        curriculumCyclesRespond(404, ["status" => "error", "message" => "ไม่พบหลักสูตรที่เลือก"]);
    }
    return $cycle;
}
