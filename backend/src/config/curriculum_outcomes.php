<?php
/**
 * โครงสร้างกลางของผลลัพธ์การเรียนรู้ (PLO / Sub PLO / YLO / คะแนน CLO)
 *
 * แนวคิดหลังปรับโครงสร้าง (ต.ค. 2569)
 *  - "รายการประเมินสมรรถนะ" ของแต่ละ PLO ในแต่ละชั้นปี = Sub PLO (เก็บที่ curriculum_sub_plo)
 *  - ชั้นปีของ Sub PLO คือ YLO โดยตรง (ชั้นปี 1-4 = YLO1-YLO4) ไม่ต้องมีตาราง matrix ให้ตั้งค่าซ้ำ
 *  - รายวิชากำหนด YLO ไว้ที่หน้า "จัดการหลักสูตร" แล้วหน้า "จัดการ CLO รายวิชา" ดึง Sub PLO ของ YLO นั้นมาแสดงเอง
 *  - คะแนนเต็มของแต่ละรายวิชาคือ 100 คะแนน แบ่งให้ Sub PLO ที่ผูกกับ CLO ของวิชานั้น
 *    (max_score) พร้อมเกณฑ์ผ่านรายตัว (pass_score)
 *  - นักศึกษา "บรรลุ" PLO ข้อหนึ่ง เมื่อ Sub PLO ทุกตัวของ PLO นั้นผ่านเกณฑ์
 */

require_once __DIR__ . '/academic_helper.php';

/** คะแนนเต็มที่แบ่งได้ต่อ 1 รายวิชา */
const OUTCOME_SUBJECT_SCORE_BUDGET = 100.0;

/** ชั้นปีสูงสุดที่มี YLO */
const OUTCOME_MAX_YLO = 4;

/** คีย์ใน system_settings ที่ใช้กันไม่ให้ย้ายข้อมูลซ้ำ */
const OUTCOME_MIGRATION_FLAG = 'outcomes.sub_plo_from_competency_items';

function outcomesColumnExists(PDO $db, string $table, string $column): bool
{
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?
    ");
    $stmt->execute([$table, $column]);
    return (int)$stmt->fetchColumn() > 0;
}

function outcomesTableExists(PDO $db, string $table): bool
{
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM information_schema.tables
        WHERE table_schema = DATABASE() AND table_name = ?
    ");
    $stmt->execute([$table]);
    return (int)$stmt->fetchColumn() > 0;
}

/** เพิ่มคอลัมน์ที่โครงสร้างใหม่ต้องใช้ (รันซ้ำได้ ไม่พังถ้ามีอยู่แล้ว) */
function outcomesEnsureSchema(PDO $db): void
{
    static $ready = false;
    if ($ready) {
        return;
    }

    // Sub PLO ต้องรู้ว่าอยู่ชั้นปีไหน (= YLO) และต้องให้คะแนนหรือไม่
    if (!outcomesColumnExists($db, 'curriculum_sub_plo', 'year_level')) {
        $db->exec("ALTER TABLE curriculum_sub_plo ADD COLUMN year_level TINYINT NULL AFTER description");
    }
    if (!outcomesColumnExists($db, 'curriculum_sub_plo', 'is_scorable')) {
        $db->exec("ALTER TABLE curriculum_sub_plo ADD COLUMN is_scorable TINYINT(1) NOT NULL DEFAULT 1 AFTER year_level");
    }

    // คะแนนที่ CLO แบ่งให้ Sub PLO แต่ละตัว พร้อมเกณฑ์ผ่าน
    if (!outcomesColumnExists($db, 'curriculum_clo_sub_plo', 'max_score')) {
        $db->exec("ALTER TABLE curriculum_clo_sub_plo ADD COLUMN max_score DECIMAL(6,2) NULL");
    }
    if (!outcomesColumnExists($db, 'curriculum_clo_sub_plo', 'pass_score')) {
        $db->exec("ALTER TABLE curriculum_clo_sub_plo ADD COLUMN pass_score DECIMAL(6,2) NULL");
    }

    // YLO ของรายวิชา ตั้งค่าที่หน้า "จัดการหลักสูตร"
    if (!outcomesColumnExists($db, 'curriculum_cycle_subject', 'ylo')) {
        $db->exec("ALTER TABLE curriculum_cycle_subject ADD COLUMN ylo TINYINT NULL AFTER subject_type");
    }

    // รหัส Sub PLO นับใหม่ทุกชั้นปี (PLO1 ของ YLO1 และ YLO2 ต่างก็เริ่มที่ 1.1)
    // จึงต้องย้าย unique key จาก (framework, code) ไปเป็น (framework, plo, ชั้นปี, code)
    if (!outcomesIndexExists($db, 'curriculum_sub_plo', 'uq_curriculum_sub_plo_year_code')) {
        $db->exec("
            ALTER TABLE curriculum_sub_plo
            ADD UNIQUE KEY uq_curriculum_sub_plo_year_code (framework_id, plo_id, year_level, code)
        ");
    }
    if (outcomesIndexExists($db, 'curriculum_sub_plo', 'uq_curriculum_sub_plo_code')) {
        // unique key เดิมถูก foreign key ของ framework_id ยืมใช้เป็นดัชนีอยู่
        // ต้องมีดัชนีธรรมดารองรับก่อน ถึงจะถอนตัวเดิมออกได้
        if (!outcomesIndexExists($db, 'curriculum_sub_plo', 'idx_curriculum_sub_plo_framework')) {
            $db->exec("ALTER TABLE curriculum_sub_plo ADD INDEX idx_curriculum_sub_plo_framework (framework_id)");
        }
        $db->exec("ALTER TABLE curriculum_sub_plo DROP INDEX uq_curriculum_sub_plo_code");
    }

    $ready = true;
}

function outcomesIndexExists(PDO $db, string $table, string $index): bool
{
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?
    ");
    $stmt->execute([$table, $index]);
    return (int)$stmt->fetchColumn() > 0;
}

/** แปลงเลข PLO จากรหัส เช่น "PLO3" -> 3 */
function outcomesPloNumber(string $ploCode): int
{
    return (int)preg_replace('/\D/', '', $ploCode);
}

/** เรียงรหัส Sub PLO ตามตัวเลขจริง (1.2 มาก่อน 1.10) */
function outcomesSubCodeOrder(string $code): int
{
    if (preg_match('/^(\d+)\.(\d+)$/', trim($code), $m)) {
        return ((int)$m[1] * 1000) + (int)$m[2];
    }
    return PHP_INT_MAX;
}

/**
 * ย้ายรายการประเมินสมรรถนะ (competency_items) มาเป็น Sub PLO
 *
 * ทำครั้งเดียวต่อฐานข้อมูล แล้วบันทึกธงไว้ใน system_settings
 * Sub PLO เดิมของหลักสูตรจะถูกแทนที่ทั้งหมด (ตามที่ตกลงไว้ว่าให้ยึดรายการประเมินเป็นหลัก)
 *
 * @return array{migrated:int, removed:int, skipped:bool}
 */
function outcomesMigrateCompetencyItems(PDO $db, bool $force = false): array
{
    outcomesEnsureSchema($db);

    if (!$force && academicGetSetting($db, OUTCOME_MIGRATION_FLAG) !== null) {
        return ['migrated' => 0, 'removed' => 0, 'skipped' => true];
    }

    if (!outcomesTableExists($db, 'competency_items')) {
        academicSetSetting($db, OUTCOME_MIGRATION_FLAG, date('c'));
        return ['migrated' => 0, 'removed' => 0, 'skipped' => true];
    }

    $rows = $db->query("
        SELECT ci.id, ci.plo_id, ci.year_level, ci.sequence_no, ci.competency_name, ci.is_scorable,
               cp.framework_id, cp.plo_code, COALESCE(cp.sort_order, cp.id) AS plo_order
        FROM competency_items ci
        INNER JOIN curriculum_plo cp ON cp.id = ci.plo_id
        ORDER BY cp.framework_id ASC, plo_order ASC, ci.year_level ASC, ci.sequence_no ASC, ci.id ASC
    ")->fetchAll(PDO::FETCH_ASSOC) ?: [];

    if (empty($rows)) {
        academicSetSetting($db, OUTCOME_MIGRATION_FLAG, date('c'));
        return ['migrated' => 0, 'removed' => 0, 'skipped' => true];
    }

    $frameworkIds = array_values(array_unique(array_map(
        static fn(array $r): int => (int)$r['framework_id'],
        $rows
    )));

    $removed = 0;
    $migrated = 0;

    $db->beginTransaction();
    try {
        $delStmt = $db->prepare("DELETE FROM curriculum_sub_plo WHERE framework_id = ?");
        foreach ($frameworkIds as $fid) {
            $delStmt->execute([$fid]);
            $removed += $delStmt->rowCount();
        }

        $ins = $db->prepare("
            INSERT INTO curriculum_sub_plo
                (framework_id, plo_id, code, description, year_level, is_scorable, sort_order)
            VALUES (:fid, :plo, :code, :desc, :year, :scorable, :sort)
        ");

        $counterByPlo = [];
        $sortByFramework = [];
        foreach ($rows as $row) {
            $ploId = (int)$row['plo_id'];
            $fid = (int)$row['framework_id'];
            $major = outcomesPloNumber((string)$row['plo_code']);
            if ($major <= 0) {
                continue;
            }
            $counterByPlo[$ploId] = ($counterByPlo[$ploId] ?? 0) + 1;
            $sortByFramework[$fid] = ($sortByFramework[$fid] ?? 0) + 1;

            $ins->execute([
                ':fid' => $fid,
                ':plo' => $ploId,
                ':code' => $major . '.' . $counterByPlo[$ploId],
                ':desc' => (string)$row['competency_name'],
                ':year' => (int)$row['year_level'] ?: null,
                ':scorable' => (int)$row['is_scorable'] === 0 ? 0 : 1,
                ':sort' => $sortByFramework[$fid],
            ]);
            $migrated++;
        }

        $db->commit();
    } catch (Throwable $e) {
        $db->rollBack();
        throw $e;
    }

    academicSetSetting($db, OUTCOME_MIGRATION_FLAG, date('c'));
    return ['migrated' => $migrated, 'removed' => $removed, 'skipped' => false];
}

/**
 * Sub PLO ของหลักสูตร (กรองตามชั้นปีได้)
 *
 * @return array<int, array{id:int, code:string, description:string, plo_id:int, plo_code:string,
 *                          plo_name:string, year_level:?int, is_scorable:int}>
 */
function outcomesSubPlos(PDO $db, int $frameworkId, ?int $yearLevel = null): array
{
    outcomesEnsureSchema($db);

    $sql = "
        SELECT s.id, s.code, s.description, s.plo_id, s.year_level, s.is_scorable,
               p.plo_code, p.name AS plo_name
        FROM curriculum_sub_plo s
        INNER JOIN curriculum_plo p ON p.id = s.plo_id
        WHERE s.framework_id = :fid
    ";
    $params = [':fid' => $frameworkId];
    if ($yearLevel !== null) {
        $sql .= " AND s.year_level = :yl";
        $params[':yl'] = $yearLevel;
    }
    $sql .= " ORDER BY COALESCE(p.sort_order, p.id) ASC, s.sort_order ASC, s.id ASC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $out = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) ?: [] as $row) {
        $out[] = [
            'id' => (int)$row['id'],
            'code' => (string)$row['code'],
            'description' => (string)($row['description'] ?? ''),
            'plo_id' => (int)$row['plo_id'],
            'plo_code' => (string)$row['plo_code'],
            'plo_name' => (string)($row['plo_name'] ?? ''),
            'year_level' => $row['year_level'] === null ? null : (int)$row['year_level'],
            'is_scorable' => (int)$row['is_scorable'] === 0 ? 0 : 1,
        ];
    }
    return $out;
}

/**
 * YLO ที่รายวิชากำหนดไว้ที่หน้า "จัดการหลักสูตร"
 *
 * @return array<string,int> subject_code => ylo (1-4)
 */
function outcomesSubjectYloMap(PDO $db): array
{
    outcomesEnsureSchema($db);

    $rows = $db->query("
        SELECT cs.subject_code, cs.ylo
        FROM curriculum_cycle_subject cs
        INNER JOIN curriculum_cycle c ON c.id = cs.cycle_id
        WHERE cs.ylo IS NOT NULL AND c.is_active = 1
    ")->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $map = [];
    foreach ($rows as $row) {
        $ylo = (int)$row['ylo'];
        if ($ylo >= 1 && $ylo <= OUTCOME_MAX_YLO) {
            $map[(string)$row['subject_code']] = $ylo;
        }
    }
    return $map;
}

/** YLO ของรายวิชาเดียว (null = ยังไม่กำหนด) */
function outcomesSubjectYlo(PDO $db, string $subjectCode): ?int
{
    $map = outcomesSubjectYloMap($db);
    return $map[$subjectCode] ?? null;
}

/**
 * คะแนนที่รายวิชาแบ่งไปแล้วและที่เหลือ (เต็ม 100 ต่อวิชา)
 *
 * @param int|null $excludeCloId ไม่นับคะแนนของ CLO นี้ (ใช้ตอนแก้ไข CLO เดิม)
 * @return array{budget:float, used:float, remaining:float}
 */
function outcomesSubjectScoreBudget(PDO $db, int $frameworkId, string $subjectCode, ?int $excludeCloId = null): array
{
    outcomesEnsureSchema($db);

    $sql = "
        SELECT COALESCE(SUM(cs.max_score), 0)
        FROM curriculum_clo_sub_plo cs
        INNER JOIN curriculum_clo c ON c.id = cs.clo_id
        WHERE c.framework_id = :fid AND c.subject_code = :code
    ";
    $params = [':fid' => $frameworkId, ':code' => $subjectCode];
    if ($excludeCloId !== null && $excludeCloId > 0) {
        $sql .= " AND c.id <> :clo";
        $params[':clo'] = $excludeCloId;
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $used = (float)$stmt->fetchColumn();
    $remaining = OUTCOME_SUBJECT_SCORE_BUDGET - $used;

    return [
        'budget' => OUTCOME_SUBJECT_SCORE_BUDGET,
        'used' => round($used, 2),
        'remaining' => round($remaining < 0 ? 0 : $remaining, 2),
    ];
}

/**
 * ตรวจคะแนนที่จะบันทึกให้ CLO หนึ่งตัว
 *
 * กติกา
 *  - คะแนนรวมของทุก CLO ในวิชาเดียวกันต้องไม่เกิน 100
 *  - เกณฑ์ผ่านของแต่ละ Sub PLO ต้องไม่เกินคะแนนเต็มของตัวเอง
 *
 * @param array $entries [['sub_plo_id'=>int, 'max_score'=>float|null, 'pass_score'=>float|null], ...]
 * @return array<int, array{sub_plo_id:int, max_score:?float, pass_score:?float}> ค่าที่ทำความสะอาดแล้ว
 */
function outcomesNormalizeCloScores(
    PDO $db,
    int $frameworkId,
    string $subjectCode,
    ?int $cloId,
    array $entries
): array {
    $budget = outcomesSubjectScoreBudget($db, $frameworkId, $subjectCode, $cloId);
    $clean = [];
    $total = 0.0;

    foreach ($entries as $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $subPloId = (int)($entry['sub_plo_id'] ?? 0);
        if ($subPloId <= 0) {
            continue;
        }

        $maxRaw = $entry['max_score'] ?? null;
        $passRaw = $entry['pass_score'] ?? null;

        $max = ($maxRaw === null || $maxRaw === '') ? null : (float)$maxRaw;
        $pass = ($passRaw === null || $passRaw === '') ? null : (float)$passRaw;

        if ($max !== null) {
            if ($max < 0) {
                throw new InvalidArgumentException('คะแนนของ Sub PLO ต้องไม่ติดลบ');
            }
            $max = round($max, 2);
            $total += $max;
        }
        if ($pass !== null) {
            if ($pass < 0) {
                throw new InvalidArgumentException('คะแนนผ่านต้องไม่ติดลบ');
            }
            $pass = round($pass, 2);
            if ($max === null) {
                throw new InvalidArgumentException('กรุณากรอกคะแนนของ Sub PLO ก่อนกำหนดคะแนนผ่าน');
            }
            if ($pass > $max) {
                throw new InvalidArgumentException('คะแนนผ่านต้องไม่เกินคะแนนที่กำหนดให้ Sub PLO นั้น');
            }
        }

        $clean[] = ['sub_plo_id' => $subPloId, 'max_score' => $max, 'pass_score' => $pass];
    }

    if ($total > $budget['remaining'] + 0.001) {
        throw new InvalidArgumentException(sprintf(
            'คะแนนรวมเกินโควตาของรายวิชา — เหลือให้แบ่งได้ %s คะแนน แต่กรอกมา %s คะแนน',
            rtrim(rtrim(number_format($budget['remaining'], 2, '.', ''), '0'), '.'),
            rtrim(rtrim(number_format($total, 2, '.', ''), '0'), '.')
        ));
    }

    return $clean;
}

/** บันทึกคะแนนของ Sub PLO ที่ผูกกับ CLO (เรียกหลัง replaceCloLinks แล้ว) */
function outcomesApplyCloScores(PDO $db, int $cloId, array $cleanEntries): void
{
    outcomesEnsureSchema($db);
    if (empty($cleanEntries)) {
        return;
    }

    $stmt = $db->prepare("
        UPDATE curriculum_clo_sub_plo
        SET max_score = :max, pass_score = :pass
        WHERE clo_id = :clo AND sub_plo_id = :sub
    ");
    foreach ($cleanEntries as $entry) {
        $stmt->execute([
            ':max' => $entry['max_score'],
            ':pass' => $entry['pass_score'],
            ':clo' => $cloId,
            ':sub' => $entry['sub_plo_id'],
        ]);
    }
}

/**
 * คะแนนเต็ม/เกณฑ์ผ่าน ของ Sub PLO ที่ผูกกับ CLO ของรายวิชาหนึ่ง
 *
 * @return array<int, array{clo_id:int, sub_plo_id:int, code:string, plo_code:string,
 *                          max_score:?float, pass_score:?float}>
 */
function outcomesSubjectCloScores(PDO $db, int $frameworkId, string $subjectCode): array
{
    outcomesEnsureSchema($db);

    $stmt = $db->prepare("
        SELECT cs.clo_id, cs.sub_plo_id, cs.max_score, cs.pass_score,
               s.code, s.year_level, p.plo_code
        FROM curriculum_clo_sub_plo cs
        INNER JOIN curriculum_clo c ON c.id = cs.clo_id
        INNER JOIN curriculum_sub_plo s ON s.id = cs.sub_plo_id
        INNER JOIN curriculum_plo p ON p.id = s.plo_id
        WHERE c.framework_id = :fid AND c.subject_code = :code
        ORDER BY cs.clo_id ASC, s.sort_order ASC, s.id ASC
    ");
    $stmt->execute([':fid' => $frameworkId, ':code' => $subjectCode]);

    $out = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) ?: [] as $row) {
        $out[] = [
            'clo_id' => (int)$row['clo_id'],
            'sub_plo_id' => (int)$row['sub_plo_id'],
            'code' => (string)$row['code'],
            'plo_code' => (string)$row['plo_code'],
            'year_level' => $row['year_level'] === null ? null : (int)$row['year_level'],
            'max_score' => $row['max_score'] === null ? null : (float)$row['max_score'],
            'pass_score' => $row['pass_score'] === null ? null : (float)$row['pass_score'],
        ];
    }
    return $out;
}

/**
 * ผลการบรรลุ Sub PLO ของนักศึกษา 1 คน คิดจากคะแนนจริงที่อาจารย์ให้ในแต่ละรายวิชา
 *
 * วิธีคิด (ตามที่คณะกำหนด)
 *  - Sub PLO หนึ่งตัวอาจถูกวัดในหลายรายวิชา/หลาย CLO — เอาคะแนนทุกที่มารวมกัน
 *  - เทียบกับผลรวมของ "คะแนนผ่าน" ของจุดที่มีการให้คะแนนแล้ว
 *  - ยังไม่มีคะแนนที่ไหนเลย = ยังไม่ประเมิน (pending)
 *
 * คีย์ของผลลัพธ์คือ sub_plo_id ไม่ใช่รหัสข้อความ เพราะรหัส (เช่น 1.1) ซ้ำกันได้ระหว่างชั้นปี
 *
 * @return array<int, array{id:int, code:string, plo_code:string, year_level:?int, earned:float,
 *                          possible:float, required:float, status:string, sources:int}>
 */
function outcomesStudentSubPloResults(PDO $db, int $frameworkId, string $studentId): array
{
    outcomesEnsureSchema($db);

    if (!outcomesTableExists($db, 'student_clo_sub_scores')) {
        return [];
    }

    $stmt = $db->prepare("
        SELECT s.id AS sub_plo_id, s.code, s.year_level, p.plo_code,
               cs.max_score, cs.pass_score,
               sc.score
        FROM curriculum_clo_sub_plo cs
        INNER JOIN curriculum_clo c ON c.id = cs.clo_id
        INNER JOIN curriculum_sub_plo s ON s.id = cs.sub_plo_id
        INNER JOIN curriculum_plo p ON p.id = s.plo_id
        LEFT JOIN subject sj ON sj.subject_code = c.subject_code
        LEFT JOIN student_clo_sub_scores sc
               ON sc.clo_id = cs.clo_id
              -- ตารางคะแนนถูกสร้างด้วย utf8mb4_unicode_ci ส่วนตารางหลักสูตรเป็น utf8mb4_0900_ai_ci
              -- จึงต้องบังคับ collation ให้ตรงกัน ไม่งั้น MySQL ฟ้อง error 1267
              AND sc.sub_plo_code COLLATE utf8mb4_general_ci = s.code COLLATE utf8mb4_general_ci
              AND sc.student_id = :sid
              AND (sj.subject_id IS NULL OR sc.subject_id = sj.subject_id)
        WHERE c.framework_id = :fid
    ");
    $stmt->execute([':sid' => $studentId, ':fid' => $frameworkId]);

    $results = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) ?: [] as $row) {
        $key = (int)$row['sub_plo_id'];
        if (!isset($results[$key])) {
            $results[$key] = [
                'id' => $key,
                'code' => (string)$row['code'],
                'plo_code' => (string)$row['plo_code'],
                'year_level' => $row['year_level'] === null ? null : (int)$row['year_level'],
                'earned' => 0.0,
                'possible' => 0.0,
                'required' => 0.0,
                'status' => 'pending',
                'sources' => 0,
            ];
        }

        if ($row['score'] === null) {
            continue; // จุดนี้ยังไม่ได้ให้คะแนน ไม่นำมาคิด
        }

        $results[$key]['earned'] += (float)$row['score'];
        $results[$key]['possible'] += (float)($row['max_score'] ?? 0);
        $results[$key]['required'] += (float)($row['pass_score'] ?? 0);
        $results[$key]['sources']++;
    }

    foreach ($results as &$item) {
        if ($item['sources'] === 0) {
            $item['status'] = 'pending';
        } else {
            $item['status'] = ($item['earned'] + 0.001) >= $item['required'] ? 'achieved' : 'not_achieved';
        }
        $item['earned'] = round($item['earned'], 2);
        $item['possible'] = round($item['possible'], 2);
        $item['required'] = round($item['required'], 2);
    }
    unset($item);

    return $results;
}

/**
 * สรุปผลระดับ PLO — บรรลุเมื่อ Sub PLO ทุกตัวของ PLO นั้นผ่านหมด
 *
 * @param array $subPlos    Sub PLO ที่ต้องการสรุป (จาก outcomesSubPlos)
 * @param array $results    ผลรายตัวจาก outcomesStudentSubPloResults
 * @return array{status:string, total:int, achieved:int, pending:int}
 */
function outcomesSummarizePlo(array $subPlos, array $results): array
{
    $total = 0;
    $achieved = 0;
    $pending = 0;

    foreach ($subPlos as $sub) {
        if ((int)$sub['is_scorable'] === 0) {
            continue; // ข้อที่ไม่กำหนดตัวชี้วัด ไม่นำมาตัดสิน
        }
        $total++;
        $status = $results[$sub['id']]['status'] ?? 'pending';
        if ($status === 'achieved') {
            $achieved++;
        } elseif ($status === 'pending') {
            $pending++;
        }
    }

    if ($total === 0) {
        $status = 'none';
    } elseif ($achieved === $total) {
        $status = 'achieved';
    } elseif ($pending > 0 && $achieved + $pending === $total) {
        $status = 'pending';
    } else {
        $status = 'not_achieved';
    }

    return ['status' => $status, 'total' => $total, 'achieved' => $achieved, 'pending' => $pending];
}

/** คีย์ใน system_settings สำหรับการนับรหัส Sub PLO ใหม่แยกตามชั้นปี */
const OUTCOME_RENUMBER_FLAG = 'outcomes.sub_plo_code_per_year';

/**
 * จัดรหัส Sub PLO ให้เรียง 1..N ใหม่ โดยนับแยกตาม PLO และชั้นปี
 * (PLO1 ของ YLO1 เริ่ม 1.1 และ PLO1 ของ YLO2 ก็เริ่ม 1.1 เช่นกัน)
 *
 * คะแนนนักศึกษาอ้าง Sub PLO ด้วยรหัสข้อความคู่กับ clo_id จึงต้องตามไปแก้เฉพาะ
 * คะแนนของ CLO ที่ผูกกับ Sub PLO ตัวนั้นจริง ๆ ไม่ใช่แก้ทุกแถวที่รหัสตรงกัน
 *
 * @param int|null $ploId     จำกัดเฉพาะ PLO นี้ (null = ทุก PLO)
 * @param int|null $yearLevel จำกัดเฉพาะชั้นปีนี้ (null = ทุกชั้นปี)
 */
function outcomesRenumberSubPlos(PDO $db, int $frameworkId, ?int $ploId = null, ?int $yearLevel = null): void
{
    outcomesEnsureSchema($db);

    $sql = "
        SELECT s.id, s.code, s.plo_id, s.year_level, p.plo_code
        FROM curriculum_sub_plo s
        INNER JOIN curriculum_plo p ON p.id = s.plo_id
        WHERE s.framework_id = :fid
    ";
    $params = [':fid' => $frameworkId];
    if ($ploId !== null) {
        $sql .= " AND s.plo_id = :pid";
        $params[':pid'] = $ploId;
    }
    if ($yearLevel !== null) {
        $sql .= " AND s.year_level = :yl";
        $params[':yl'] = $yearLevel;
    }
    $sql .= " ORDER BY s.plo_id ASC, s.year_level ASC, s.sort_order ASC, s.id ASC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $updCode = $db->prepare("UPDATE curriculum_sub_plo SET code = :code, sort_order = :sort WHERE id = :id");
    $hasScores = outcomesTableExists($db, 'student_clo_sub_scores');
    $updScores = $hasScores ? $db->prepare("
        UPDATE student_clo_sub_scores
        SET sub_plo_code = :new
        WHERE sub_plo_code COLLATE utf8mb4_general_ci = :old COLLATE utf8mb4_general_ci
          AND clo_id IN (SELECT clo_id FROM curriculum_clo_sub_plo WHERE sub_plo_id = :sub)
    ") : null;

    // ใช้รหัสชั่วคราวก่อน กัน unique key ชนกันระหว่างสลับเลข
    $temp = $db->prepare("UPDATE curriculum_sub_plo SET code = :code WHERE id = :id");
    foreach ($rows as $i => $row) {
        $temp->execute([':code' => '~' . $row['id'], ':id' => (int)$row['id']]);
    }

    $counters = [];
    foreach ($rows as $row) {
        $major = outcomesPloNumber((string)$row['plo_code']);
        if ($major <= 0) {
            continue;
        }
        $key = $row['plo_id'] . '|' . (string)$row['year_level'];
        $counters[$key] = ($counters[$key] ?? 0) + 1;
        $newCode = $major . '.' . $counters[$key];

        $updCode->execute([':code' => $newCode, ':sort' => $counters[$key], ':id' => (int)$row['id']]);

        if ($updScores !== null && (string)$row['code'] !== $newCode) {
            $updScores->execute([':new' => $newCode, ':old' => (string)$row['code'], ':sub' => (int)$row['id']]);
        }
    }
}

/** นับรหัสใหม่แยกตามชั้นปีครั้งแรกครั้งเดียว (ของเดิมนับต่อกันข้ามชั้นปี) */
function outcomesRenumberIfNeeded(PDO $db): void
{
    if (academicGetSetting($db, OUTCOME_RENUMBER_FLAG) !== null) {
        return;
    }
    outcomesEnsureSchema($db);

    $ids = $db->query("SELECT DISTINCT framework_id FROM curriculum_sub_plo")->fetchAll(PDO::FETCH_COLUMN) ?: [];
    foreach ($ids as $fid) {
        outcomesRenumberSubPlos($db, (int)$fid);
    }
    academicSetSetting($db, OUTCOME_RENUMBER_FLAG, date('c'));
}

/** รหัส Sub PLO ถัดไปของ PLO นั้นในชั้นปีนั้น เช่น PLO1/YLO2 มีถึง 1.3 -> 1.4 */
function outcomesNextSubCode(PDO $db, int $frameworkId, int $ploId, string $ploCode, int $yearLevel): string
{
    $major = outcomesPloNumber($ploCode);
    if ($major <= 0) {
        throw new RuntimeException('รหัส PLO ไม่ถูกต้อง');
    }

    $stmt = $db->prepare("
        SELECT COUNT(*) FROM curriculum_sub_plo
        WHERE framework_id = :fid AND plo_id = :pid AND year_level = :yl
    ");
    $stmt->execute([':fid' => $frameworkId, ':pid' => $ploId, ':yl' => $yearLevel]);
    return $major . '.' . ((int)$stmt->fetchColumn() + 1);
}
