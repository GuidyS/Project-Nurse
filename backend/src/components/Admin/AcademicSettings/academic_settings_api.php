<?php
/**
 * ตั้งค่าปีการศึกษา (เฉพาะผู้ดูแลระบบ)
 *  - get-academic-settings   : อ่านค่าปัจจุบัน + ตัวอย่างผลที่จะเกิด
 *  - save-academic-settings  : บันทึกวันตัดรอบเลื่อนชั้นปี / การลบข้อมูลนักศึกษาอัตโนมัติ
 *  - run-student-purge       : สั่งลบข้อมูลนักศึกษาที่เกินกำหนดทันที
 */
if (session_status() === PHP_SESSION_NONE) session_start();

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/academic_helper.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/student_purge_helpers.php';

header('Content-Type: application/json; charset=UTF-8');

function academicSettingsRespond(int $code, array $payload): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    $db = new Connect();
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (!isset($_SESSION['user_id'])) {
        academicSettingsRespond(401, ['status' => 'error', 'message' => 'Unauthorized']);
    }
    $roleStmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ? LIMIT 1");
    $roleStmt->execute([$_SESSION['user_id']]);
    if ((int)$roleStmt->fetchColumn() !== 1) {
        academicSettingsRespond(403, ['status' => 'error', 'message' => 'เฉพาะผู้ดูแลระบบเท่านั้น']);
    }

    $page = $_GET['page'] ?? '';
    $input = json_decode(file_get_contents('php://input'), true);
    $input = is_array($input) ? $input : [];

    if ($page === 'get-academic-settings') {
        $cutoff = academicPromotionCutoff($db);
        $info = calculateRealtimeAcademicInfo('', null, $db);
        $lastRun = $db->prepare("SELECT last_run_at, last_result FROM system_job_runs WHERE job_name = ?");
        $lastRun->execute([STUDENT_PURGE_JOB]);
        $lastRunRow = $lastRun->fetch(PDO::FETCH_ASSOC) ?: null;

        academicSettingsRespond(200, [
            'status' => 'success',
            'data' => [
                'cutoff_month' => $cutoff['month'],
                'cutoff_day' => $cutoff['day'],
                'current_academic_year' => $info['academic_year'],
                'next_promotion_date' => academicNextPromotionDate($db),
                'purge_enabled' => academicPurgeEnabled($db),
                'purge_years' => academicPurgeYears($db),
                'purge_preview' => studentPurgePreview($db),
                'purge_last_run' => $lastRunRow,
            ],
        ]);
    }

    if ($page === 'save-academic-settings') {
        $month = (int)($input['cutoff_month'] ?? 0);
        $day = (int)($input['cutoff_day'] ?? 0);
        if ($month < 1 || $month > 12 || $day < 1 || $day > 31) {
            academicSettingsRespond(400, ['status' => 'error', 'message' => 'วันตัดรอบไม่ถูกต้อง']);
        }
        if (!checkdate($month, $day, 2024)) { // 2024 เป็นปีอธิกสุรทิน ใช้ตรวจ 29 ก.พ. ได้
            academicSettingsRespond(400, ['status' => 'error', 'message' => 'ไม่มีวันที่นี้ในปฏิทิน']);
        }

        $purgeYears = (int)($input['purge_years'] ?? academicPurgeYears($db));
        if ($purgeYears < 1 || $purgeYears > 50) {
            academicSettingsRespond(400, ['status' => 'error', 'message' => 'จำนวนปีที่เก็บข้อมูลต้องอยู่ระหว่าง 1 - 50 ปี']);
        }
        $purgeEnabled = !empty($input['purge_enabled']) ? '1' : '0';

        academicSetSetting($db, 'academic_promotion_cutoff', sprintf('%d-%d', $month, $day));
        academicSetSetting($db, 'student_purge_years', (string)$purgeYears);
        academicSetSetting($db, 'student_purge_enabled', $purgeEnabled);

        logAudit(
            $db,
            $_SESSION['user_id'],
            'update',
            'settings',
            sprintf(
                'ตั้งค่าปีการศึกษา: เลื่อนชั้นปีวันที่ %d/%d | ลบข้อมูลนักศึกษาอัตโนมัติ %s (เก็บ %d ปี)',
                $day,
                $month,
                $purgeEnabled === '1' ? 'เปิด' : 'ปิด',
                $purgeYears
            )
        );

        $info = calculateRealtimeAcademicInfo('', null, $db);
        academicSettingsRespond(200, [
            'status' => 'success',
            'message' => sprintf('บันทึกแล้ว ระบบจะเลื่อนชั้นปีทุกวันที่ %d/%d', $day, $month),
            'data' => [
                'current_academic_year' => $info['academic_year'],
                'next_promotion_date' => academicNextPromotionDate($db),
                'purge_preview' => studentPurgePreview($db),
            ],
        ]);
    }

    if ($page === 'run-student-purge') {
        if (($input['confirm'] ?? '') !== 'DELETE') {
            academicSettingsRespond(400, ['status' => 'error', 'message' => 'ต้องยืนยันก่อนลบข้อมูล']);
        }
        $summary = studentPurgeRun($db, $_SESSION['user_id']);
        academicSettingsRespond($summary['status'] === 'ok' ? 200 : 500, [
            'status' => $summary['status'] === 'ok' ? 'success' : 'error',
            'message' => $summary['status'] === 'ok'
                ? sprintf('ลบข้อมูลนักศึกษาแล้ว %d คน', $summary['deleted'])
                : ($summary['message'] ?? 'ลบข้อมูลไม่สำเร็จ'),
            'data' => $summary,
        ]);
    }

    academicSettingsRespond(404, ['status' => 'error', 'message' => 'ไม่พบ API ที่เรียก']);
} catch (Throwable $e) {
    academicSettingsRespond(500, ['status' => 'error', 'message' => $e->getMessage()]);
}
