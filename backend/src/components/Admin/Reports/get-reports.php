<?php
require_once __DIR__ . '/../../../config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$academicYear = $_GET['year'] ?? '2568';
$strategyFilter = $_GET['strategy'] ?? 'ทั้งหมด';
$responsibleFilter = $_GET['responsible'] ?? 'ทั้งหมด';
$searchTerm = trim($_GET['search'] ?? '');

function budgetCell(float|int $amount, ?string $note = null): array
{
    $cell = ['amount' => (float)$amount];
    if ($note !== null && trim($note) !== '') {
        $cell['note'] = $note;
    }
    return $cell;
}

function getBudgetSources(): array
{
    return [
        ['key' => 'university', 'label' => 'มหาวิทยาลัยสยาม'],
        ['key' => 'thonburiHospital', 'label' => 'โรงพยาบาลธนบุรี'],
        ['key' => 'nursingFaculty', 'label' => 'คณะพยาบาลศาสตร์'],
        ['key' => 'external', 'label' => 'หน่วยงานภายนอก'],
    ];
}

function normalizeBudgetCell(array $budget): array
{
    return budgetCell((float)($budget['amount'] ?? 0), $budget['note'] ?? null);
}

function fetchAnnualReportRows($db): array
{
    $itemStmt = $db->query("
        SELECT
            id,
            academic_year,
            strategy,
            plan_name,
            objective,
            kpi,
            project_code,
            project_name,
            activity_name,
            row_type,
            parent_item_id,
            responsible_person,
            sort_order
        FROM annual_project_report_items
        ORDER BY academic_year DESC, sort_order ASC, id ASC
    ");
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($items)) {
        return [];
    }

    $rows = [];
    $itemLookup = [];
    foreach ($items as $item) {
        $itemId = (int)$item['id'];
        $projectName = trim((string)($item['activity_name'] ?: $item['project_name']));

        $rows[$itemId] = [
            'id' => (string)$itemId,
            'academicYear' => (string)$item['academic_year'],
            'strategy' => $item['strategy'] ?: 'ไม่ระบุยุทธศาสตร์',
            'planName' => $item['plan_name'],
            'objective' => $item['objective'],
            'kpi' => $item['kpi'],
            'projectCode' => $item['project_code'],
            'projectName' => $projectName,
            'activityName' => $item['activity_name'],
            'responsiblePerson' => $item['responsible_person'],
            'rowType' => $item['row_type'] ?: 'project',
            'sortOrder' => (int)($item['sort_order'] ?? 0),
        ];

        $itemLookup[$itemId] = $item;
    }

    foreach ($items as $item) {
        $itemId = (int)$item['id'];
        $parentId = $item['parent_item_id'] ? (int)$item['parent_item_id'] : null;
        if ($parentId !== null && isset($itemLookup[$parentId])) {
            $rows[$itemId]['parentItemId'] = (string)$parentId;
            $rows[$itemId]['parentProjectCode'] = $itemLookup[$parentId]['project_code'] ?? null;
        }
    }

    $budgetStmt = $db->query("
        SELECT report_item_id, budget_type, source_key, amount, note
        FROM annual_project_report_budgets
        ORDER BY id ASC
    ");
    foreach ($budgetStmt->fetchAll(PDO::FETCH_ASSOC) as $budget) {
        $itemId = (int)$budget['report_item_id'];
        if (!isset($rows[$itemId])) {
            continue;
        }

        $budgetKey = $budget['budget_type'] === 'actual' ? 'actualBudget' : 'proposedBudget';
        $rows[$itemId][$budgetKey][$budget['source_key']] = normalizeBudgetCell($budget);
    }

    $documentStmt = $db->query("
        SELECT report_item_id, document_type, url
        FROM annual_project_report_documents
        ORDER BY id ASC
    ");
    foreach ($documentStmt->fetchAll(PDO::FETCH_ASSOC) as $document) {
        $itemId = (int)$document['report_item_id'];
        if (!isset($rows[$itemId])) {
            continue;
        }

        if ($document['document_type'] === 'approved_budget') {
            $rows[$itemId]['approvedBudgetUrl'] = $document['url'];
        }
        if ($document['document_type'] === 'summary_report') {
            $rows[$itemId]['summaryReportUrl'] = $document['url'];
        }
    }

    return array_values($rows);
}

function sumBudget(?array $budget): float
{
    if (!$budget) {
        return 0;
    }

    return array_reduce($budget, function ($sum, $cell) {
        return $sum + (float)($cell['amount'] ?? 0);
    }, 0.0);
}

function sumBudgetSource(array $rows, string $budgetKey, string $source): float
{
    return array_reduce($rows, function ($sum, $row) use ($budgetKey, $source) {
        return $sum + (float)($row[$budgetKey][$source]['amount'] ?? 0);
    }, 0.0);
}

function getBudgetNotes(array $row): array
{
    $notes = [];
    foreach (['proposedBudget', 'actualBudget'] as $budgetKey) {
        foreach (($row[$budgetKey] ?? []) as $cell) {
            if (!empty($cell['note'])) {
                $notes[] = $cell['note'];
            }
        }
    }
    return $notes;
}

function getDocumentStatus(array $row): array
{
    foreach (getBudgetNotes($row) as $note) {
        if (str_contains($note, 'ไม่ใช้งบ')) {
            return ['label' => 'ไม่ใช้งบ', 'code' => 'no_budget'];
        }
    }

    $hasApprovedBudget = !empty($row['approvedBudgetUrl']);
    $hasSummaryReport = !empty($row['summaryReportUrl']);

    if ($hasApprovedBudget && $hasSummaryReport) {
        return ['label' => 'เอกสารครบ', 'code' => 'complete'];
    }
    if ($hasApprovedBudget) {
        return ['label' => 'มีอนุมัติงบ', 'code' => 'approved_only'];
    }
    if ($hasSummaryReport) {
        return ['label' => 'มีสรุปโครงการ', 'code' => 'summary_only'];
    }
    return ['label' => 'ไม่มีลิงก์เอกสาร', 'code' => 'missing'];
}

function normalizeSearchText(string $value): string
{
    if (function_exists('mb_strtolower')) {
        return mb_strtolower($value, 'UTF-8');
    }
    return strtolower($value);
}

function rowMatchesSearch(array $row, string $searchTerm): bool
{
    if ($searchTerm === '') {
        return true;
    }

    $needle = normalizeSearchText($searchTerm);
    $fields = [
        $row['projectCode'] ?? '',
        $row['parentProjectCode'] ?? '',
        $row['projectName'] ?? '',
        $row['activityName'] ?? '',
        $row['responsiblePerson'] ?? '',
        $row['strategy'] ?? '',
        $row['kpi'] ?? '',
    ];

    foreach ($fields as $field) {
        if (str_contains(normalizeSearchText((string)$field), $needle)) {
            return true;
        }
    }
    return false;
}

function filterRows(array $rows, string $academicYear, string $strategyFilter, string $responsibleFilter, string $searchTerm): array
{
    return array_values(array_filter($rows, function ($row) use ($academicYear, $strategyFilter, $responsibleFilter, $searchTerm) {
        $matchesYear = ($row['academicYear'] ?? '') === $academicYear;
        $matchesStrategy = $strategyFilter === 'ทั้งหมด' || ($row['strategy'] ?? '') === $strategyFilter;
        $matchesResponsible = $responsibleFilter === 'ทั้งหมด' || ($row['responsiblePerson'] ?? '') === $responsibleFilter;

        return $matchesYear && $matchesStrategy && $matchesResponsible && rowMatchesSearch($row, $searchTerm);
    }));
}

function withComputedFields(array $rows): array
{
    return array_map(function ($row) {
        $row['proposedTotal'] = sumBudget($row['proposedBudget'] ?? null);
        $row['actualTotal'] = sumBudget($row['actualBudget'] ?? null);
        $row['documentStatus'] = getDocumentStatus($row);
        return $row;
    }, $rows);
}

function buildSummary(array $rows): array
{
    $proposedTotal = array_reduce($rows, fn($sum, $row) => $sum + sumBudget($row['proposedBudget'] ?? null), 0.0);
    $actualTotal = array_reduce($rows, fn($sum, $row) => $sum + sumBudget($row['actualBudget'] ?? null), 0.0);

    return [
        'totalProjects' => count(array_filter($rows, fn($row) => ($row['rowType'] ?? '') === 'project')),
        'totalActivities' => count(array_filter($rows, fn($row) => ($row['rowType'] ?? '') === 'activity')),
        'proposedTotal' => $proposedTotal,
        'actualTotal' => $actualTotal,
        'balance' => $proposedTotal - $actualTotal,
        'completeDocuments' => count(array_filter($rows, function ($row) {
            return !empty($row['approvedBudgetUrl']) && !empty($row['summaryReportUrl']);
        })),
    ];
}

function buildStrategySummaries(array $rows): array
{
    $grouped = [];
    foreach ($rows as $row) {
        $strategy = $row['strategy'] ?? 'ไม่ระบุยุทธศาสตร์';
        if (!isset($grouped[$strategy])) {
            $grouped[$strategy] = [
                'strategy' => $strategy,
                'projects' => 0,
                'activities' => 0,
                'proposedTotal' => 0,
                'actualTotal' => 0,
                'documents' => 0,
            ];
        }

        if (($row['rowType'] ?? '') === 'project') {
            $grouped[$strategy]['projects']++;
        }
        if (($row['rowType'] ?? '') === 'activity') {
            $grouped[$strategy]['activities']++;
        }
        $grouped[$strategy]['proposedTotal'] += sumBudget($row['proposedBudget'] ?? null);
        $grouped[$strategy]['actualTotal'] += sumBudget($row['actualBudget'] ?? null);
        if (!empty($row['approvedBudgetUrl']) || !empty($row['summaryReportUrl'])) {
            $grouped[$strategy]['documents']++;
        }
    }
    return array_values($grouped);
}

function buildBudgetBreakdown(array $rows): array
{
    return array_map(function ($source) use ($rows) {
        return [
            'key' => $source['key'],
            'label' => $source['label'],
            'proposedTotal' => sumBudgetSource($rows, 'proposedBudget', $source['key']),
            'actualTotal' => sumBudgetSource($rows, 'actualBudget', $source['key']),
        ];
    }, getBudgetSources());
}

function buildAvailableFilters(array $allRows, string $academicYear): array
{
    $yearRows = array_values(array_filter($allRows, fn($row) => ($row['academicYear'] ?? '') === $academicYear));
    $strategies = array_values(array_unique(array_map(fn($row) => $row['strategy'] ?? '', $yearRows)));
    $responsiblePeople = array_values(array_unique(array_filter(array_map(fn($row) => $row['responsiblePerson'] ?? '', $yearRows))));

    return [
        'academicYears' => array_values(array_unique(array_map(fn($row) => $row['academicYear'], $allRows))),
        'strategies' => array_values(array_filter($strategies)),
        'responsiblePeople' => $responsiblePeople,
    ];
}

try {
    $db = new Connect();
    $allRows = fetchAnnualReportRows($db);
    $filteredRows = filterRows($allRows, $academicYear, $strategyFilter, $responsibleFilter, $searchTerm);
    $rowsWithComputedFields = withComputedFields($filteredRows);

    echo json_encode([
        'status' => 'success',
        'data' => [
            'academicYear' => $academicYear,
            'filters' => [
                'strategy' => $strategyFilter,
                'responsible' => $responsibleFilter,
                'search' => $searchTerm,
            ],
            'availableFilters' => buildAvailableFilters($allRows, $academicYear),
            'budgetSources' => getBudgetSources(),
            'summary' => buildSummary($filteredRows),
            'strategySummaries' => buildStrategySummaries($filteredRows),
            'budgetBreakdown' => buildBudgetBreakdown($filteredRows),
            'rows' => $rowsWithComputedFields,
            'meta' => [
                'source' => 'database',
                'nextEndpoints' => [
                    'POST /index.php?page=import-report-files',
                    'GET /index.php?page=export-report&year=<year>&format=xlsx',
                ],
            ],
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}
