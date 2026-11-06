<?php
/**
 * ผลการประเมินสมรรถนะหลักของนักศึกษา 1 คน
 *
 * ใช้ร่วมกันทั้งหน้าของอาจารย์ที่ปรึกษาและหน้าของนักศึกษา เพื่อให้ทั้งสองหน้า
 * แสดงข้อมูลชุดเดียวกันเสมอ (บรรลุ/ไม่บรรลุ คำนวณจากคะแนนรายวิชาอัตโนมัติ)
 */

require_once __DIR__ . '/../../../config/curriculum_outcomes.php';
require_once __DIR__ . '/../../../config/academic_helper.php';

/** ตัดคำนำหน้าชื่อ PLO ที่ซ้ำกับรหัส เช่น "PLO 1: ..." -> "..." */
function competencyStripPloPrefix(string $name): string
{
    $name = trim($name);
    $stripped = preg_replace('/^[A-Za-z]+\s*\d+\s*[:\-]?\s*/', '', $name);
    return trim($stripped) !== '' ? trim($stripped) : $name;
}

/**
 * @param int|null $yearLevelOverride ระบุชั้นปีเองได้ (null = ใช้ชั้นปีจริงของนักศึกษา)
 * @return array ข้อมูลสำหรับคีย์ "data" ของ response
 */
function competencyResultPayload(PDO $db, string $studentId, ?int $yearLevelOverride = null): array
{
    $sStmt = $db->prepare("
        SELECT student_id, first_name_th, last_name_th, year_level, admission_year
        FROM student WHERE student_id = :sid LIMIT 1
    ");
    $sStmt->execute([':sid' => $studentId]);
    $student = $sStmt->fetch(PDO::FETCH_ASSOC);

    $fullName = $student
        ? trim(($student['first_name_th'] ?? '') . ' ' . ($student['last_name_th'] ?? ''))
        : $studentId;
    if ($fullName === '') {
        $fullName = $studentId;
    }

    $info = calculateRealtimeAcademicInfo($studentId, $student['admission_year'] ?? null, $db);
    $academicYear = $info['academic_year'];
    $yearLevel = ($yearLevelOverride !== null && $yearLevelOverride > 0)
        ? $yearLevelOverride
        : $info['year_level'];

    // หลักสูตร (ถอยไปใช้รายการล่าสุดถ้ายังไม่ได้ตั้ง is_active)
    $fwStmt = $db->query("SELECT id, curriculum_year, program_name FROM curriculum_framework WHERE is_active = 1 LIMIT 1");
    $framework = $fwStmt ? $fwStmt->fetch(PDO::FETCH_ASSOC) : null;
    if (!$framework) {
        $fwFallback = $db->query("SELECT id, curriculum_year, program_name FROM curriculum_framework ORDER BY id DESC LIMIT 1");
        $framework = $fwFallback ? $fwFallback->fetch(PDO::FETCH_ASSOC) : null;
    }

    if (!$framework) {
        return [
            "student_id" => $studentId,
            "full_name" => $fullName,
            "year_level" => $yearLevel,
            "academic_year" => $academicYear,
            "framework" => null,
            "items" => [],
            "groups" => [],
            "final_summary" => null,
            "max_year" => OUTCOME_MAX_YLO,
        ];
    }

    $frameworkId = (int)$framework['id'];

    $ploStmt = $db->prepare("
        SELECT id AS plo_id, plo_code, name AS plo_name
        FROM curriculum_plo WHERE framework_id = :fid ORDER BY sort_order ASC, plo_code ASC
    ");
    $ploStmt->execute([':fid' => $frameworkId]);
    $plos = $ploStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $results = outcomesStudentSubPloResults($db, $frameworkId, $studentId);

    $subPlosByYear = [];
    for ($y = 1; $y <= OUTCOME_MAX_YLO; $y++) {
        $subPlosByYear[$y] = outcomesSubPlos($db, $frameworkId, $y);
    }
    $yearSubPlos = $subPlosByYear[$yearLevel] ?? [];

    $itemsByPlo = [];
    $items = [];
    $seq = 0;
    foreach ($yearSubPlos as $sub) {
        $seq++;
        $result = $results[$sub['id']] ?? null;
        $row = [
            'id' => $sub['id'],
            'plo_id' => $sub['plo_id'],
            'plo_code' => $sub['plo_code'],
            'sequence_no' => $seq,
            'sub_plo_code' => $sub['code'],
            'competency_name' => $sub['description'],
            'is_scorable' => $sub['is_scorable'],
            'status' => (int)$sub['is_scorable'] === 0 ? 'none' : ($result['status'] ?? 'pending'),
            'earned' => $result['earned'] ?? 0,
            'required' => $result['required'] ?? 0,
            'possible' => $result['possible'] ?? 0,
            'sources' => $result['sources'] ?? 0,
        ];
        $itemsByPlo[$sub['plo_id']][] = $row;
        $items[] = $row;
    }

    $groups = array_map(function ($plo) use ($itemsByPlo, $results, $yearSubPlos) {
        $ploId = (int)$plo['plo_id'];
        $plo['plo_name'] = competencyStripPloPrefix((string)$plo['plo_name']);
        $plo['items'] = $itemsByPlo[$ploId] ?? [];
        $ownSubs = array_values(array_filter($yearSubPlos, fn(array $s): bool => $s['plo_id'] === $ploId));
        $plo['summary'] = outcomesSummarizePlo($ownSubs, $results);
        return $plo;
    }, $plos);

    // สรุปตอนจบชั้นปีสุดท้าย — รวมทุกชั้นปีของหลักสูตร (ชั้นปีอื่นแสดงผลรายข้ออย่างเดียว)
    $finalSummary = null;
    if ($yearLevel >= OUTCOME_MAX_YLO) {
        $allSubs = [];
        foreach ($subPlosByYear as $list) {
            foreach ($list as $sub) {
                $allSubs[] = $sub;
            }
        }

        $ploRows = [];
        foreach ($plos as $plo) {
            $ploId = (int)$plo['plo_id'];
            $own = array_values(array_filter($allSubs, fn(array $s): bool => $s['plo_id'] === $ploId));
            if (empty($own)) {
                continue;
            }
            $summary = outcomesSummarizePlo($own, $results);
            $earned = 0.0;
            $required = 0.0;
            foreach ($own as $sub) {
                $earned += $results[$sub['id']]['earned'] ?? 0;
                $required += $results[$sub['id']]['required'] ?? 0;
            }
            $ploRows[] = [
                'plo_id' => $ploId,
                'plo_code' => $plo['plo_code'],
                'plo_name' => competencyStripPloPrefix((string)$plo['plo_name']),
                'status' => $summary['status'],
                'total' => $summary['total'],
                'achieved' => $summary['achieved'],
                'pending' => $summary['pending'],
                'earned' => round($earned, 2),
                'required' => round($required, 2),
            ];
        }

        $counted = array_values(array_filter($ploRows, fn(array $r): bool => $r['status'] !== 'none'));
        $achievedCount = count(array_filter($counted, fn(array $r): bool => $r['status'] === 'achieved'));
        $pendingCount = count(array_filter($counted, fn(array $r): bool => $r['status'] === 'pending'));

        if (empty($counted)) {
            $overall = 'none';
        } elseif ($achievedCount === count($counted)) {
            $overall = 'achieved';
        } elseif ($pendingCount > 0 && $achievedCount + $pendingCount === count($counted)) {
            $overall = 'pending';
        } else {
            $overall = 'not_achieved';
        }

        $finalSummary = [
            'overall_status' => $overall,
            'plo_total' => count($counted),
            'plo_achieved' => $achievedCount,
            'plo_pending' => $pendingCount,
            'plos' => $ploRows,
        ];
    }

    return [
        "student_id" => $studentId,
        "full_name" => $fullName,
        "year_level" => $yearLevel,
        "academic_year" => $academicYear,
        "framework" => $framework,
        "items" => $items,
        "groups" => $groups,
        "final_summary" => $finalSummary,
        "max_year" => OUTCOME_MAX_YLO,
    ];
}
