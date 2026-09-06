<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../ProjectShared/project_helpers.php';

$db = project_db();
project_require_auth($db, ['PROGRAM_REPORTS_VIEW']);

try {
    $radarStmt = $db->query("
        SELECT
            p.plo_code,
            COALESCE(NULLIF(rs.description, ''), p.name, p.plo_code) AS description,
            COALESCE(rs.achieved_score, 0) AS achieved_score
        FROM curriculum_plo p
        INNER JOIN curriculum_framework fw ON fw.id = p.framework_id AND fw.is_active = 1
        LEFT JOIN curriculum_report_stats rs
            ON rs.type = 'PLO' AND rs.code_name = p.plo_code
        ORDER BY p.sort_order ASC, p.id ASC
    ");
    $radarData = array_map(function (array $row): array {
        return [
            'subject' => $row['plo_code'],
            'description' => $row['description'],
            'A' => round((float) $row['achieved_score'], 2),
            'fullMark' => 100,
        ];
    }, $radarStmt->fetchAll(PDO::FETCH_ASSOC));

    $yearlyStmt = $db->query("
        SELECT
            y.ylo_code,
            p.plo_code,
            COALESCE(rs.achieved_score, 0) AS achieved_score
        FROM curriculum_ylo_plo y
        INNER JOIN curriculum_plo p ON p.id = y.plo_id
        INNER JOIN curriculum_framework fw ON fw.id = y.framework_id AND fw.is_active = 1
        LEFT JOIN curriculum_report_stats rs
            ON rs.type = 'YLO' AND rs.code_name = y.ylo_code
        WHERE y.is_active = 1
        ORDER BY y.ylo_code ASC, p.sort_order ASC, p.id ASC
    ");

    $yearlyMap = [];
    foreach ($yearlyStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        preg_match('/(\d+)/', (string) $row['ylo_code'], $matches);
        $year = $matches[1] ?? $row['ylo_code'];
        $yearKey = 'เธเธต ' . $year;
        if (!isset($yearlyMap[$yearKey])) {
            $yearlyMap[$yearKey] = ['year' => $yearKey];
        }

        $ploKey = strtolower((string) $row['plo_code']);
        $yearlyMap[$yearKey][$ploKey] = round((float) $row['achieved_score'], 2);
    }

    project_json([
        'status' => 'success',
        'data' => [
            'radarData' => $radarData,
            'yearlyData' => array_values($yearlyMap),
            'source' => 'curriculum_relational',
            'schema_version' => '2026-08-11.db-completeness-v1',
        ],
    ]);
} catch (Exception $e) {
    project_json(['status' => 'error', 'message' => 'Unable to load program reports'], 500);
}

?>