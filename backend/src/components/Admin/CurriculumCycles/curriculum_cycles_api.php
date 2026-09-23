<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/active_curriculum.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/curriculum_cycles_helpers.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $db = new Connect();
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    curriculumCyclesRequireAdmin($db);
    curriculumCyclesEnsureSchema($db);

    $action = $_GET['page'] ?? '';

    switch ($action) {

        // รายการหลักสูตรทั้งหมด + รายวิชาของหลักสูตรที่เลือก (ถ้าส่ง cycle_id มา)
        case 'get-curriculum-cycles':
            $cycles = $db->query("
                SELECT c.id, c.start_year, c.end_year, c.is_active,
                       COUNT(s.id) AS subject_count,
                       COALESCE(SUM(s.credit), 0) AS total_credits
                FROM curriculum_cycle c
                LEFT JOIN curriculum_cycle_subject s ON s.cycle_id = c.id
                GROUP BY c.id, c.start_year, c.end_year, c.is_active
                ORDER BY c.start_year DESC, c.end_year DESC
            ")->fetchAll(PDO::FETCH_ASSOC);

            foreach ($cycles as &$c) {
                foreach (['id', 'start_year', 'end_year', 'is_active', 'subject_count', 'total_credits'] as $key) {
                    $c[$key] = (int)$c[$key];
                }
            }
            unset($c);

            $subjects = [];
            if (isset($_GET['cycle_id']) && $_GET['cycle_id'] !== '') {
                $cycle = curriculumCyclesRequireCycle($db, $_GET['cycle_id']);
                $stmt = $db->prepare("
                    SELECT id, subject_code, subject_name, credit, credit_desc
                    FROM curriculum_cycle_subject
                    WHERE cycle_id = ?
                    ORDER BY subject_code ASC, id ASC
                ");
                $stmt->execute([$cycle['id']]);
                foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                    $row['id'] = (int)$row['id'];
                    $row['credit'] = (int)$row['credit'];
                    $subjects[] = $row;
                }
            }

            curriculumCyclesRespond(200, [
                "status" => "success",
                "data" => [
                    "cycles" => $cycles,
                    "subjects" => $subjects,
                    // หลักสูตรที่หน้ารายวิชาอื่นๆ ใช้อยู่ (is_explicit = false คือยังไม่ได้กดเลือก ระบบเลือกตามปีปัจจุบันให้)
                    "active_cycle" => activeCurriculumCycle($db),
                ],
            ]);
            break;

        // สร้าง / แก้ไขปีของหลักสูตร
        case 'save-curriculum-cycle':
            $input = curriculumCyclesReadJson();
            $startYear = curriculumCyclesNormalizeYear($input['start_year'] ?? '', 'ปีเริ่มต้น');
            $endYear = curriculumCyclesNormalizeYear($input['end_year'] ?? '', 'ปีสิ้นสุด');
            if ($endYear <= $startYear) {
                throw new InvalidArgumentException("ปีสิ้นสุดต้องมากกว่าปีเริ่มต้น");
            }

            $id = isset($input['id']) && $input['id'] !== null && $input['id'] !== '' ? (int)$input['id'] : null;

            $dup = $db->prepare("SELECT id FROM curriculum_cycle WHERE start_year = ? AND end_year = ? AND id <> ? LIMIT 1");
            $dup->execute([$startYear, $endYear, $id ?? 0]);
            if ($dup->fetchColumn() !== false) {
                curriculumCyclesRespond(409, ["status" => "error", "message" => "มีหลักสูตรปี {$startYear} - {$endYear} อยู่แล้ว"]);
            }

            if ($id === null) {
                $stmt = $db->prepare("INSERT INTO curriculum_cycle (start_year, end_year) VALUES (?, ?)");
                $stmt->execute([$startYear, $endYear]);
                $id = (int)$db->lastInsertId();
                $message = "สร้างหลักสูตรปี {$startYear} - {$endYear} แล้ว";
                logAudit($db, $_SESSION['user_id'] ?? null, 'create', 'curriculum_cycles', "เพิ่มหลักสูตร พ.ศ. {$startYear} - {$endYear} (ID: {$id})");
            } else {
                curriculumCyclesRequireCycle($db, $id);
                $stmt = $db->prepare("UPDATE curriculum_cycle SET start_year = ?, end_year = ? WHERE id = ?");
                $stmt->execute([$startYear, $endYear, $id]);
                $message = "แก้ไขปีหลักสูตรเป็น {$startYear} - {$endYear} แล้ว";
                logAudit($db, $_SESSION['user_id'] ?? null, 'update', 'curriculum_cycles', "แก้ไขหลักสูตรเป็น พ.ศ. {$startYear} - {$endYear} (ID: {$id})");
            }

            curriculumCyclesRespond(200, ["status" => "success", "message" => $message, "data" => ["id" => $id]]);
            break;

        // ลบหลักสูตร (รายวิชาในหลักสูตรถูกลบตามด้วย ON DELETE CASCADE)
        case 'delete-curriculum-cycle':
            $input = curriculumCyclesReadJson();
            $cycle = curriculumCyclesRequireCycle($db, $input['id'] ?? 0);
            $stmt = $db->prepare("DELETE FROM curriculum_cycle WHERE id = ?");
            $stmt->execute([$cycle['id']]);
            logAudit($db, $_SESSION['user_id'] ?? null, 'delete', 'curriculum_cycles', "ลบหลักสูตร พ.ศ. {$cycle['start_year']} - {$cycle['end_year']} (ID: {$cycle['id']})");
            curriculumCyclesRespond(200, [
                "status" => "success",
                "message" => "ลบหลักสูตรปี {$cycle['start_year']} - {$cycle['end_year']} แล้ว",
            ]);
            break;

        // เพิ่ม / แก้ไขรายวิชาทีละวิชา (จาก pop-up)
        case 'save-curriculum-subject':
            $input = curriculumCyclesReadJson();
            $cycle = curriculumCyclesRequireCycle($db, $input['cycle_id'] ?? 0);
            $subject = curriculumCyclesNormalizeSubject($input);
            $id = isset($input['id']) && $input['id'] !== null && $input['id'] !== '' ? (int)$input['id'] : null;

            $dup = $db->prepare("SELECT id FROM curriculum_cycle_subject WHERE cycle_id = ? AND subject_code = ? AND id <> ? LIMIT 1");
            $dup->execute([$cycle['id'], $subject['subject_code'], $id ?? 0]);
            if ($dup->fetchColumn() !== false) {
                curriculumCyclesRespond(409, [
                    "status" => "error",
                    "message" => "รหัสวิชา {$subject['subject_code']} มีอยู่แล้วในหลักสูตรนี้",
                ]);
            }

            if ($id === null) {
                $next = $db->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM curriculum_cycle_subject WHERE cycle_id = ?");
                $next->execute([$cycle['id']]);
                $stmt = $db->prepare("
                    INSERT INTO curriculum_cycle_subject (cycle_id, subject_code, subject_name, credit, credit_desc, sort_order)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $cycle['id'], $subject['subject_code'], $subject['subject_name'],
                    $subject['credit'], $subject['credit_desc'], (int)$next->fetchColumn(),
                ]);
                $subjectId = (int)$db->lastInsertId();
                $message = "เพิ่มวิชา {$subject['subject_code']} แล้ว";
                logAudit($db, $_SESSION['user_id'] ?? null, 'create', 'curriculum_subjects', "เพิ่มรายวิชา {$subject['subject_code']} ในหลักสูตร พ.ศ. {$cycle['start_year']} - {$cycle['end_year']} (ID: {$subjectId})");
            } else {
                $stmt = $db->prepare("
                    UPDATE curriculum_cycle_subject
                    SET subject_code = ?, subject_name = ?, credit = ?, credit_desc = ?
                    WHERE id = ? AND cycle_id = ?
                ");
                $stmt->execute([
                    $subject['subject_code'], $subject['subject_name'], $subject['credit'],
                    $subject['credit_desc'], $id, $cycle['id'],
                ]);
                if ($stmt->rowCount() === 0) {
                    $exists = $db->prepare("SELECT 1 FROM curriculum_cycle_subject WHERE id = ? AND cycle_id = ?");
                    $exists->execute([$id, $cycle['id']]);
                    if ($exists->fetchColumn() === false) {
                        curriculumCyclesRespond(404, ["status" => "error", "message" => "ไม่พบรายวิชาที่ต้องการแก้ไข"]);
                    }
                }
                $message = "แก้ไขวิชา {$subject['subject_code']} แล้ว";
                logAudit($db, $_SESSION['user_id'] ?? null, 'update', 'curriculum_subjects', "แก้ไขรายวิชา {$subject['subject_code']} ในหลักสูตร พ.ศ. {$cycle['start_year']} - {$cycle['end_year']} (ID: {$id})");
            }

            curriculumCyclesRespond(200, ["status" => "success", "message" => $message]);
            break;

        case 'delete-curriculum-subject':
            $input = curriculumCyclesReadJson();
            $stmt = $db->prepare("SELECT subject_code FROM curriculum_cycle_subject WHERE id = ? LIMIT 1");
            $stmt->execute([(int)($input['id'] ?? 0)]);
            $code = $stmt->fetchColumn();
            if ($code === false) {
                curriculumCyclesRespond(404, ["status" => "error", "message" => "ไม่พบรายวิชาที่ต้องการลบ"]);
            }
            $db->prepare("DELETE FROM curriculum_cycle_subject WHERE id = ?")->execute([(int)$input['id']]);
            logAudit($db, $_SESSION['user_id'] ?? null, 'delete', 'curriculum_subjects', "ลบรายวิชา {$code} (ID: " . (int)$input['id'] . ")");
            curriculumCyclesRespond(200, ["status" => "success", "message" => "ลบวิชา {$code} แล้ว"]);
            break;

        // ลบหลายวิชาพร้อมกัน (เลือกทั้งหมด / เลือกบางวิชา) — ลบเฉพาะวิชาในหลักสูตรที่ระบุ
        case 'delete-curriculum-subjects':
            $input = curriculumCyclesReadJson();
            $cycle = curriculumCyclesRequireCycle($db, $input['cycle_id'] ?? 0);
            $ids = is_array($input['ids'] ?? null) ? $input['ids'] : [];
            $ids = array_values(array_unique(array_filter(array_map('intval', $ids), static fn($id) => $id > 0)));

            if (empty($ids)) {
                throw new InvalidArgumentException("กรุณาเลือกรายวิชาที่ต้องการลบ");
            }
            if (count($ids) > CURRICULUM_IMPORT_MAX_ROWS) {
                throw new InvalidArgumentException("ลบได้ครั้งละไม่เกิน " . CURRICULUM_IMPORT_MAX_ROWS . " วิชา");
            }

            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $db->prepare("DELETE FROM curriculum_cycle_subject WHERE cycle_id = ? AND id IN ($placeholders)");
            $stmt->execute(array_merge([$cycle['id']], $ids));
            $deleted = $stmt->rowCount();

            if ($deleted === 0) {
                curriculumCyclesRespond(404, ["status" => "error", "message" => "ไม่พบรายวิชาที่เลือก (อาจถูกลบไปแล้ว)"]);
            }

            logAudit($db, $_SESSION['user_id'] ?? null, 'delete', 'curriculum_subjects', "ลบรายวิชาหลายรายการ {$deleted} วิชา ในหลักสูตร พ.ศ. {$cycle['start_year']} - {$cycle['end_year']}");
            curriculumCyclesRespond(200, [
                "status" => "success",
                "message" => "ลบรายวิชาแล้ว {$deleted} วิชา",
                "data" => ["deleted" => $deleted],
            ]);
            break;

        // นำเข้ารายวิชาจาก Excel (หน้าเว็บอ่านไฟล์แล้วส่งเป็น JSON มา)
        // mode = merge   → เพิ่มวิชาใหม่ + อัปเดตวิชาที่รหัสซ้ำ วิชาอื่นคงไว้
        // mode = replace → ลบรายวิชาเดิมของหลักสูตรนี้ทั้งหมด แล้วใส่ตามไฟล์
        case 'import-curriculum-subjects':
            $input = curriculumCyclesReadJson();
            $cycle = curriculumCyclesRequireCycle($db, $input['cycle_id'] ?? 0);
            $mode = ($input['mode'] ?? 'merge') === 'replace' ? 'replace' : 'merge';
            $rows = $input['subjects'] ?? null;

            if (!is_array($rows) || count($rows) === 0) {
                throw new InvalidArgumentException("ไม่พบรายวิชาในไฟล์");
            }
            if (count($rows) > CURRICULUM_IMPORT_MAX_ROWS) {
                throw new InvalidArgumentException("นำเข้าได้ครั้งละไม่เกิน " . CURRICULUM_IMPORT_MAX_ROWS . " วิชา");
            }

            // ตรวจทุกแถวก่อน ถ้ามีแถวผิดแม้แถวเดียวจะไม่บันทึกอะไรเลย
            $clean = [];
            $errors = [];
            $seen = [];
            foreach (array_values($rows) as $index => $row) {
                $rowNo = isset($row['row']) ? (int)$row['row'] : $index + 1;
                try {
                    $subject = curriculumCyclesNormalizeSubject(is_array($row) ? $row : []);
                    $key = mb_strtolower($subject['subject_code']);
                    if (isset($seen[$key])) {
                        throw new InvalidArgumentException("รหัสวิชาซ้ำกับแถวที่ {$seen[$key]}");
                    }
                    $seen[$key] = $rowNo;
                    $clean[] = $subject;
                } catch (InvalidArgumentException $e) {
                    $errors[] = ["row" => $rowNo, "message" => $e->getMessage()];
                }
            }

            if (!empty($errors)) {
                curriculumCyclesRespond(422, [
                    "status" => "error",
                    "message" => "พบข้อมูลไม่ถูกต้อง " . count($errors) . " แถว ยังไม่ได้บันทึกข้อมูล",
                    "errors" => $errors,
                ]);
            }

            $db->beginTransaction();
            try {
                if ($mode === 'replace') {
                    $db->prepare("DELETE FROM curriculum_cycle_subject WHERE cycle_id = ?")->execute([$cycle['id']]);
                    $startOrder = 1;
                } else {
                    $next = $db->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM curriculum_cycle_subject WHERE cycle_id = ?");
                    $next->execute([$cycle['id']]);
                    $startOrder = (int)$next->fetchColumn();
                }

                // วิชาที่รหัสซ้ำจะอัปเดตชื่อ/หน่วยกิต แต่คงลำดับเดิมไว้
                $stmt = $db->prepare("
                    INSERT INTO curriculum_cycle_subject (cycle_id, subject_code, subject_name, credit, credit_desc, sort_order)
                    VALUES (:cycle_id, :code, :name, :credit, :credit_desc, :sort_order)
                    ON DUPLICATE KEY UPDATE
                        subject_name = VALUES(subject_name),
                        credit = VALUES(credit),
                        credit_desc = VALUES(credit_desc)
                ");

                $inserted = 0;
                $updated = 0;
                foreach ($clean as $i => $subject) {
                    $stmt->execute([
                        ':cycle_id' => $cycle['id'],
                        ':code' => $subject['subject_code'],
                        ':name' => $subject['subject_name'],
                        ':credit' => $subject['credit'],
                        ':credit_desc' => $subject['credit_desc'],
                        ':sort_order' => $startOrder + $i,
                    ]);
                    // MySQL: 1 = เพิ่มใหม่, 2 = อัปเดต, 0 = ข้อมูลเหมือนเดิม
                    $affected = $stmt->rowCount();
                    if ($affected === 1) {
                        $inserted++;
                    } elseif ($affected === 2) {
                        $updated++;
                    }
                }

                $db->commit();
            } catch (Throwable $e) {
                $db->rollBack();
                throw $e;
            }

            $unchanged = count($clean) - $inserted - $updated;
            $message = $mode === 'replace'
                ? "แทนที่รายวิชาทั้งหมดด้วย " . count($clean) . " วิชาจากไฟล์แล้ว"
                : "นำเข้าสำเร็จ: เพิ่มใหม่ {$inserted} วิชา, อัปเดต {$updated} วิชา" . ($unchanged > 0 ? ", ไม่เปลี่ยนแปลง {$unchanged} วิชา" : "");

            logAudit($db, $_SESSION['user_id'] ?? null, 'update', 'curriculum_subjects', "นำเข้ารายวิชาหลักสูตร พ.ศ. {$cycle['start_year']} - {$cycle['end_year']} โหมด {$mode}: เพิ่ม {$inserted}, แก้ไข {$updated}, ไม่เปลี่ยนแปลง {$unchanged}");
            curriculumCyclesRespond(200, [
                "status" => "success",
                "message" => $message,
                "data" => ["inserted" => $inserted, "updated" => $updated, "unchanged" => $unchanged, "mode" => $mode],
            ]);
            break;

        // ตั้งหลักสูตรที่ใช้งานทั้งระบบ — หน้ารายวิชาอื่นๆ (CLO, จัดอาจารย์ผู้สอน, เชื่อมโยง LO ฯลฯ) จะแสดงเฉพาะวิชาของหลักสูตรนี้
        case 'activate-curriculum-cycle':
            $input = curriculumCyclesReadJson();
            $cycle = curriculumCyclesRequireCycle($db, $input['id'] ?? 0);
            // คำสั่งเดียว เปิดหลักสูตรที่เลือกและปิดหลักสูตรอื่นพร้อมกัน
            $db->prepare("UPDATE curriculum_cycle SET is_active = IF(id = ?, 1, 0)")->execute([$cycle['id']]);
            logAudit($db, $_SESSION['user_id'] ?? null, 'update', 'curriculum_cycles', "ตั้งหลักสูตร พ.ศ. {$cycle['start_year']} - {$cycle['end_year']} เป็นหลักสูตรที่ใช้งานในระบบ (ID: {$cycle['id']})");
            curriculumCyclesRespond(200, [
                "status" => "success",
                "message" => "ตั้งหลักสูตร พ.ศ. {$cycle['start_year']} – {$cycle['end_year']} เป็นหลักสูตรที่ใช้งานในระบบแล้ว",
            ]);
            break;

        default:
            curriculumCyclesRespond(404, ["status" => "error", "message" => "ไม่พบ API ที่เรียก"]);
    }

} catch (InvalidArgumentException $e) {
    curriculumCyclesRespond(400, ["status" => "error", "message" => $e->getMessage()]);
} catch (Throwable $e) {
    curriculumCyclesRespond(500, ["status" => "error", "message" => $e->getMessage()]);
}
