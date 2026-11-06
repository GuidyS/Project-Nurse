<?php
/**
 * ตัวช่วยของหน้า "ประเมินสมรรถนะหลักแต่ละชั้นปี (YLO)"
 *
 * หน้านี้คือที่เดียวที่กำหนด Sub PLO ของหลักสูตร โดยเก็บลง curriculum_sub_plo
 * ชั้นปีของรายการ = YLO ของรายการนั้น
 */

require_once __DIR__ . '/../../../config/curriculum_outcomes.php';
require_once __DIR__ . '/../../../config/active_curriculum.php';

/**
 * โครงสร้าง PLO/Sub PLO ที่หน้านี้ใช้
 *
 * ทั้งระบบยึด "หลักสูตรที่ใช้งานในระบบ" (curriculum_cycle) ที่ตั้งค่าจากหน้าจัดการหลักสูตร
 * ส่วน PLO/Sub PLO เก็บรวมไว้ชุดเดียวใช้ร่วมกันทุกรอบหลักสูตร จึงคืน framework ที่เปิดใช้งานอยู่
 *
 * @return array{framework_id:?int, curriculum:?array}
 */
function competencyResolveCurriculum(PDO $db): array
{
    $row = $db->query("SELECT id FROM curriculum_framework WHERE is_active = 1 ORDER BY id LIMIT 1")
              ->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        $row = $db->query("SELECT id FROM curriculum_framework ORDER BY id DESC LIMIT 1")
                  ->fetch(PDO::FETCH_ASSOC);
    }

    return [
        'framework_id' => $row ? (int)$row['id'] : null,
        'curriculum' => activeCurriculumCycle($db),
    ];
}

/** ตรวจว่าเป็นผู้ดูแลระบบ ถ้าไม่ใช่จะตอบ 403 แล้วจบการทำงาน */
function competencyRequireAdmin(PDO $db, $userId): void
{
    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || (int)($user['role_id'] ?? 0) !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden: คุณไม่มีสิทธิ์จัดการส่วนนี้"], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/** ข้อมูล PLO หนึ่งข้อ (คืน null ถ้าไม่พบ) */
function competencyFetchPlo(PDO $db, int $ploId): ?array
{
    $stmt = $db->prepare("SELECT id, framework_id, plo_code, name FROM curriculum_plo WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $ploId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

/**
 * จัดรหัส Sub PLO ของ PLO นั้นในชั้นปีนั้นให้เรียง 1..N ใหม่หลังเพิ่ม/ลบ
 * (ตัวนับแยกตามชั้นปี — PLO1 ของ YLO1 และ YLO2 ต่างก็เริ่มที่ 1.1)
 */
function competencyResequenceSubCodes(PDO $db, int $frameworkId, int $ploId, int $yearLevel): void
{
    outcomesRenumberSubPlos($db, $frameworkId, $ploId, $yearLevel);
}
