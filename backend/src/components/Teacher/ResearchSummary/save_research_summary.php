<?php
require_once __DIR__ . '/research_summary_helpers.php';
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/../../middlewares/auth_middleware.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') researchFail(405, 'Method not allowed');
// Reject cross-site HTML form submissions; mutations require JSON.
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) researchFail(415, 'ต้องส่งข้อมูลแบบ JSON');
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) researchFail(422, 'ข้อมูลไม่ถูกต้อง');
$facultyId = filter_var($input['faculty_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
$action = $input['action'] ?? '';
if (!$facultyId || !in_array($action, ['add', 'remove', 'update'], true)) researchFail(422, 'ข้อมูลไม่ถูกต้อง');
try {
    $db = new Connect();
    $access = researchAccess($db, (int)$_SESSION['user_id']);
    if (!$access['manage']) researchFail(403, 'คุณไม่มีสิทธิ์แก้ไขผลงานวิจัย');
    $stmt = $db->prepare('SELECT faculty_id FROM faculty WHERE faculty_id = ?');
    $stmt->execute([$facultyId]);
    if (!$stmt->fetchColumn()) researchFail(422, 'ไม่พบอาจารย์');
    if ($action === 'add') {
        $year = filter_var($input['year'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 2500, 'max_range' => 2700]]);
        $mode = $input['year_mode'] ?? '';
        $kind = $input['kind'] ?? '';
        if (!$year || !in_array($mode, ['academic', 'calendar'], true) || !in_array($kind, ['kpi', 'co_author', 'academic'], true)) researchFail(422, 'ปีหรือประเภทผลงานไม่ถูกต้อง');
        // โหมดปีการศึกษาใช้วันเปิดภาคการศึกษาที่ 1 ที่ตั้งค่าไว้ (เส้นแบ่งปีการศึกษาของทั้งระบบ)
        $boundary = academicYearBoundary($db);
        $academicStart = sprintf('-%02d-%02d', $boundary['month'], $boundary['day']);
        $date = ($year - 543) . ($mode === 'academic' ? $academicStart : '-01-01');
        $db->beginTransaction();
        $stmt = $db->prepare('INSERT INTO faculty_research (faculty_id, title, publication_year, publication_date, article_type, work_category, funding_type, funding_amount, irb_approved, intellectual_property_status, first_author_id, co_author_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$facultyId, 'บันทึกจำนวนผลงาน' . ($kind === 'academic' ? 'วิชาการ/ตำรา' : 'วิจัย') . ' ปี ' . $year,
            $year, $date, $kind === 'academic' ? 'academic' : 'research', 'research', 'none', 0, 0, 'none', $kind === 'kpi' ? $facultyId : null,
            json_encode($kind === 'kpi' ? [] : [$facultyId])]);
        $id = (int)$db->lastInsertId();
    } elseif ($action === 'update') {
        $id = filter_var($input['publication_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $fields = [];
        foreach (['title' => 255, 'journal' => 255, 'database_level' => 100, 'funding_source' => 255, 'award_name' => 255] as $key => $limit) {
            if (!is_string($input[$key] ?? null)) researchFail(422, 'ข้อมูลรายละเอียดผลงานไม่ถูกต้อง');
            $fields[$key] = trim($input[$key]);
            if (mb_strlen($fields[$key], 'UTF-8') > $limit) researchFail(422, 'ข้อความยาวเกินกำหนด');
        }
        $date = $input['publication_date'] ?? '';
        $type = $input['publication_type'] ?? '';
        $workCategory = $input['work_category'] ?? '';
        $fundingType = $input['funding_type'] ?? '';
        $ipStatus = $input['intellectual_property_status'] ?? '';
        $fundingAmountRaw = $input['funding_amount'] ?? null;
        $irbApproved = filter_var($input['irb_approved'] ?? null, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        $headFacultyId = filter_var($input['head_faculty_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $coAuthorIdsInput = $input['co_author_ids'] ?? null;
        if (!is_array($coAuthorIdsInput)) researchFail(422, 'รายชื่อ Co ไม่ถูกต้อง');
        $coAuthorIds = [];
        foreach ($coAuthorIdsInput as $coAuthorId) {
            $normalizedId = filter_var($coAuthorId, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            if ($normalizedId === false) researchFail(422, 'รายชื่อ Co ไม่ถูกต้อง');
            $coAuthorIds[] = (int)$normalizedId;
        }
        $coAuthorIds = array_values(array_unique($coAuthorIds));
        $revision = $input['revision'] ?? '';
        $parsedDate = is_string($date) ? DateTimeImmutable::createFromFormat('!Y-m-d', $date) : false;
        if (!$id || $fields['title'] === '' || !$parsedDate || $parsedDate->format('Y-m-d') !== $date
            || (int)$parsedDate->format('Y') < 1957 || (int)$parsedDate->format('Y') > 2157
            || !in_array($type, ['research', 'academic', 'textbook'], true)
            || !in_array($workCategory, ['research', 'innovation'], true)
            || !in_array($fundingType, ['none', 'internal', 'external'], true)
            || !in_array($ipStatus, ['none', 'applying', 'copyright', 'petty_patent', 'patent'], true)
            || $irbApproved === null || !$headFacultyId || !is_string($revision)) {
            researchFail(422, 'กรุณาระบุชื่อผลงาน วันที่ และประเภทให้ถูกต้อง');
        }
        $headFacultyId = (int)$headFacultyId;
        if (in_array($headFacultyId, $coAuthorIds, true)) {
            researchFail(422, 'Head ไม่สามารถเป็น Co ในผลงานเดียวกันได้');
        }
        if (!is_numeric($fundingAmountRaw) || (float)$fundingAmountRaw < 0 || (float)$fundingAmountRaw > 9999999999.99) {
            researchFail(422, 'จำนวนทุนต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป');
        }
        $fundingAmount = round((float)$fundingAmountRaw, 2);
        if ($fundingType !== 'none' && $fields['funding_source'] === '') {
            researchFail(422, 'กรุณาระบุแหล่งทุน');
        }
        if ($fundingType === 'none') {
            $fields['funding_source'] = '';
            $fundingAmount = 0;
        }
        $db->beginTransaction();
        $stmt = $db->prepare('SELECT * FROM faculty_research WHERE research_id = ? FOR UPDATE');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row || !isset(researchAuthorRoles($row)[$facultyId]) || !hash_equals(researchRevision($row), $revision)) {
            $db->rollBack();
            researchFail(409, 'รายการนี้เปลี่ยนแปลงแล้ว กรุณาโหลดข้อมูลใหม่ก่อนแก้ไข');
        }
        $currentHeadFacultyId = !empty($row['first_author_id'])
            ? (int)$row['first_author_id']
            : (!empty($row['corresponding_author_id']) ? (int)$row['corresponding_author_id'] : null);
        if ($currentHeadFacultyId !== null && $currentHeadFacultyId !== $headFacultyId) {
            $db->rollBack();
            researchFail(422, 'ผลงานนี้มี Head แล้ว ไม่สามารถเปลี่ยน Head ได้');
        }
        $selectedFacultyIds = array_values(array_unique(array_merge([$headFacultyId], $coAuthorIds)));
        $facultyPlaceholders = implode(',', array_fill(0, count($selectedFacultyIds), '?'));
        $stmt = $db->prepare("SELECT COUNT(*) FROM faculty WHERE faculty_id IN ($facultyPlaceholders)");
        $stmt->execute($selectedFacultyIds);
        if ((int)$stmt->fetchColumn() !== count($selectedFacultyIds)) {
            $db->rollBack();
            researchFail(422, 'มีรายชื่อ Head หรือ Co ที่ไม่พบในระบบ');
        }
        $stmt = $db->prepare('UPDATE faculty_research SET title = ?, publication_date = ?, publication_year = ?, article_type = ?, journal_name = ?, category = ?, work_category = ?, funding_type = ?, funding_source = ?, funding_amount = ?, irb_approved = ?, intellectual_property_status = ?, award_name = ?, faculty_id = ?, first_author_id = ?, corresponding_author_id = NULL, co_author_ids = ? WHERE research_id = ?');
        $stmt->execute([$fields['title'], $date, (int)$parsedDate->format('Y') + 543, $type, $fields['journal'], $fields['database_level'],
            $workCategory, $fundingType, $fields['funding_source'], $fundingAmount, $irbApproved ? 1 : 0, $ipStatus, $fields['award_name'],
            $headFacultyId, $headFacultyId, json_encode($coAuthorIds), $id]);
    } else {
        $id = filter_var($input['publication_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$id) researchFail(422, 'รายการผลงานไม่ถูกต้อง');
        $db->beginTransaction();
        $stmt = $db->prepare('SELECT * FROM faculty_research WHERE research_id = ? FOR UPDATE');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $roles = $row ? researchAuthorRoles($row) : [];
        if (!isset($roles[$facultyId])) {
            $db->rollBack();
            researchFail(409, 'รายการนี้เปลี่ยนแปลงแล้ว กรุณาโหลดข้อมูลใหม่');
        }
        unset($roles[$facultyId]);
        if (!$roles) {
            $stmt = $db->prepare('DELETE FROM faculty_research WHERE research_id = ?');
            $stmt->execute([$id]);
        } else {
            // Detach this author only; preserve the publication and its other authors.
            $coAuthors = array_keys(array_filter($roles, static fn($role) => $role === 'co_author'));
            $stmt = $db->prepare('UPDATE faculty_research SET faculty_id = ?, first_author_id = ?, corresponding_author_id = ?, co_author_ids = ? WHERE research_id = ?');
            $stmt->execute([(int)$row['faculty_id'] === $facultyId ? array_key_first($roles) : $row['faculty_id'],
                (int)$row['first_author_id'] === $facultyId ? null : $row['first_author_id'],
                (int)$row['corresponding_author_id'] === $facultyId ? null : $row['corresponding_author_id'], json_encode($coAuthors), $id]);
        }
    }
    // Data and audit must commit together; do not log names or publication titles.
    $stmt = $db->prepare('INSERT INTO audit_log (user_id, action_type, resource, details, ip_address) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([(int)$_SESSION['user_id'], $action === 'add' ? 'create' : ($action === 'update' ? 'update' : 'delete'), 'research_summary',
        'publication_id=' . $id . '; faculty_id=' . $facultyId, $_SERVER['REMOTE_ADDR'] ?? null]);
    $data = researchSummaryData($db, true);
    $db->commit();
    echo json_encode(['status' => 'success', 'message' => 'บันทึกอัตโนมัติแล้ว', 'data' => $data], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    researchFail(500, 'ไม่สามารถบันทึกผลงานได้ กรุณาโหลดข้อมูลใหม่ก่อนลองอีกครั้ง');
}
