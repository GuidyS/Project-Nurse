<?php
/**
 * ตัวช่วยจัดการคะแนน CLO รายบุคคล
 *
 * ตรรกะการคิดคะแนน (ตามโครงสร้างคะแนนที่กำหนดในหน้า "จัดการ CLO รายวิชา")
 *  - รายวิชาหนึ่งมีคะแนนเต็ม 100 แบ่งให้ Sub PLO ของแต่ละ CLO (max_score)
 *  - คะแนนของ CLO   = ผลรวมคะแนน Sub PLO ของ CLO นั้น
 *  - คะแนนรวมรายวิชา = ผลรวมคะแนน CLO ทุกตัว (เต็ม 100)
 *
 * Sub PLO ที่ยังไม่กรอกคะแนนจะไม่ถูกนำมาบวก และ CLO ที่ยังไม่กรอกเลยถือว่า "ยังไม่ประเมิน" (null)
 */

if (!function_exists('cloScoreEnsureTable')) {
    /** สร้างตารางเก็บคะแนน Sub PLO อัตโนมัติ (รันซ้ำได้) */
    function cloScoreEnsureTable(PDO $db): void
    {
        $db->exec("
            CREATE TABLE IF NOT EXISTS student_clo_sub_scores (
                id BIGINT NOT NULL AUTO_INCREMENT,
                subject_id INT NOT NULL,
                student_id BIGINT NOT NULL,
                clo_id INT NOT NULL,
                sub_plo_code VARCHAR(20) NOT NULL,
                score DECIMAL(6,2) NULL,
                updated_by INT NULL,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uq_student_clo_sub (subject_id, student_id, clo_id, sub_plo_code),
                KEY idx_subject_student (subject_id, student_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }
}

if (!function_exists('cloScoreLoadForSubject')) {
    /**
     * อ่านคะแนน Sub PLO ทั้งวิชา
     * @return array [student_id][clo_id][sub_plo_code] = float
     */
    function cloScoreLoadForSubject(PDO $db, int $subjectId): array
    {
        cloScoreEnsureTable($db);

        $stmt = $db->prepare("
            SELECT student_id, clo_id, sub_plo_code, score
            FROM student_clo_sub_scores
            WHERE subject_id = :subject_id AND score IS NOT NULL
        ");
        $stmt->execute([':subject_id' => $subjectId]);

        $map = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $map[(string)$row['student_id']][(string)$row['clo_id']][(string)$row['sub_plo_code']] = (float)$row['score'];
        }

        return $map;
    }
}

if (!function_exists('cloScoreCalcClo')) {
    /**
     * คะแนนของ CLO หนึ่งตัว = ผลรวมคะแนน Sub PLO ที่ผูกกับ CLO นั้น
     *
     * @param array $subPloCodes  รหัส Sub PLO ที่ CLO นี้ผูกไว้ เช่น ['1.1','2.1']
     * @param array $scores       คะแนนที่กรอกไว้ ['1.1' => 20, ...]
     * @return float|null         null = ยังไม่ได้กรอกคะแนนสักตัว
     */
    function cloScoreCalcClo(array $subPloCodes, array $scores): ?float
    {
        if (empty($subPloCodes)) {
            return null;
        }

        $sum = 0.0;
        $filled = 0;
        foreach ($subPloCodes as $code) {
            if (isset($scores[$code]) && $scores[$code] !== null && $scores[$code] !== '') {
                $sum += (float)$scores[$code];
                $filled++;
            }
        }

        if ($filled === 0) {
            return null;
        }

        return round($sum, 2);
    }
}

if (!function_exists('cloScoreCalcOverall')) {
    /**
     * คะแนนรวมรายวิชา = ผลรวมคะแนน CLO ทุกตัว (เต็ม 100 ตามที่แบ่งไว้)
     *
     * @param array $cloScores  [clo_id => float|null]
     * @param int   $totalClos  จำนวน CLO ทั้งหมดของวิชา
     */
    function cloScoreCalcOverall(array $cloScores, int $totalClos): ?float
    {
        if ($totalClos <= 0) {
            return null;
        }

        $sum = 0.0;
        $filled = 0;
        foreach ($cloScores as $value) {
            if ($value !== null) {
                $sum += (float)$value;
                $filled++;
            }
        }

        if ($filled === 0) {
            return null;
        }

        return round($sum, 2);
    }
}

if (!function_exists('cloScoreBuildHeaders')) {
    /**
     * สร้างหัวตาราง CLO ของวิชา พร้อมรายละเอียด PLO / Sub PLO ที่ผูกไว้
     * ใช้ข้อมูลชุดเดียวกับหน้า "จัดการ CLO รายวิชา" (get_clos)
     */
    function cloScoreBuildHeaders(PDO $db, string $subjectCode): array
    {
        require_once __DIR__ . '/../../../config/curriculum_outcomes.php';

        $frameworkId = getActiveFrameworkId($db);
        $rawClos = [];
        $subCatalog = [];
        $ploCatalog = [];
        $scoreMap = [];   // [clo_id][sub code] => ['max_score'=>, 'pass_score'=>]

        if ($frameworkId && curriculumTablesReady($db) && curriculumHasRelationalData($db, $frameworkId)) {
            $rawClos = listClosBySubjectCode($db, $frameworkId, $subjectCode);
            // Sub PLO ใช้เฉพาะชั้นปี (YLO) ของรายวิชา เพราะรหัสซ้ำกันได้ระหว่างชั้นปี
            $subjectYlo = outcomesSubjectYlo($db, $subjectCode);
            $subCatalog = $subjectYlo === null
                ? []
                : array_map(
                    static fn(array $row): array => [
                        'code' => $row['code'],
                        'plo' => $row['plo_code'],
                        'description' => $row['description'],
                    ],
                    outcomesSubPlos($db, $frameworkId, $subjectYlo)
                );
            foreach (outcomesSubjectCloScores($db, $frameworkId, $subjectCode) as $row) {
                $scoreMap[$row['clo_id']][$row['code']] = [
                    'max_score' => $row['max_score'],
                    'pass_score' => $row['pass_score'],
                ];
            }
            $ploCatalog = getPloCatalogFromTables($db, $frameworkId);
        } else {
            $data = loadActiveMappingData($db);
            $rawClos = $data['subject_mappings'][$subjectCode]['clos'] ?? [];
            $subCatalog = $data['sub_plo_catalog'] ?? [];
            $ploCatalog = $data['course_plos'] ?? [];
        }

        // ทำ index ของคำอธิบาย Sub PLO / PLO ไว้ค้นเร็ว
        $subDesc = [];
        foreach ($subCatalog as $sub) {
            if (isset($sub['code'])) {
                $subDesc[(string)$sub['code']] = [
                    'plo' => $sub['plo'] ?? null,
                    'description' => $sub['description'] ?? '',
                ];
            }
        }

        $ploDesc = [];
        foreach ($ploCatalog as $plo) {
            $id = $plo['id'] ?? $plo['code'] ?? null;
            if ($id !== null) {
                $ploDesc[(string)$id] = $plo['name'] ?? $plo['description'] ?? '';
            }
        }

        $headers = [];
        foreach ($rawClos as $index => $clo) {
            $cloId = (int)($clo['clo_id'] ?? $clo['id'] ?? ($index + 1));
            $subCodes = array_values(array_filter((array)($clo['sub_plos'] ?? []), static fn($c) => $c !== null && $c !== ''));

            $subPlos = [];
            foreach ($subCodes as $code) {
                $score = $scoreMap[$cloId][(string)$code] ?? ['max_score' => null, 'pass_score' => null];
                $subPlos[] = [
                    'code' => (string)$code,
                    'plo' => $subDesc[(string)$code]['plo'] ?? null,
                    'description' => $subDesc[(string)$code]['description'] ?? '',
                    // คะแนนเต็ม/เกณฑ์ผ่าน ตั้งไว้ที่หน้า "จัดการ CLO รายวิชา"
                    'max_score' => $score['max_score'],
                    'pass_score' => $score['pass_score'],
                ];
            }

            $plos = [];
            foreach ((array)($clo['mapped_plos'] ?? []) as $ploId) {
                $plos[] = [
                    'code' => (string)$ploId,
                    'description' => $ploDesc[(string)$ploId] ?? '',
                ];
            }

            $cloMax = 0.0;
            $cloPass = 0.0;
            $hasMax = false;
            foreach ($subPlos as $sub) {
                if ($sub['max_score'] !== null) {
                    $cloMax += (float)$sub['max_score'];
                    $hasMax = true;
                }
                if ($sub['pass_score'] !== null) {
                    $cloPass += (float)$sub['pass_score'];
                }
            }

            $headers[] = [
                'clo_id' => $cloId,
                'clo_code' => $clo['clo_code'] ?? $clo['code'] ?? ('CLO' . ($index + 1)),
                'description' => $clo['description'] ?? '',
                'ylo' => $clo['ylo_id'] ?? null,
                'plos' => $plos,
                'sub_plos' => $subPlos,
                'max_score' => $hasMax ? round($cloMax, 2) : null,
                'pass_score' => $hasMax ? round($cloPass, 2) : null,
            ];
        }

        return $headers;
    }
}
