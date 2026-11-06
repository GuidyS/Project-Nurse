<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../Teacher/ProjectShared/project_helpers.php';
require_once __DIR__ . '/../../Teacher/MyProjects/my_project_member_helpers.php';
require_once __DIR__ . '/../../Teacher/ProjectLinks/project_outcome_link_helpers.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/../../../config/admin_access.php';
require_once __DIR__ . '/../ManageUsers/user-account-import-helper.php';
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../../../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
require_once __DIR__ . '/project-import.php';

function getImportSchema($importType) {
    $schemas = [
        'students' => [
            'table' => 'student',
            'key' => 'student_id',
            'row_key' => 'student_id',
            'required_columns' => ['student_id', 'title', 'first_name_th', 'last_name_th', 'gender', 'birth_date'],
            'optional_columns' => [],
            'ignore_blank_optional_columns' => true,
            'date_columns' => ['birth_date', 'graduation_date', 'dropout_date'],
            'header_aliases' => [
                'student_id' => ['รหัสนักศึกษา'],
                'title' => ['คำนำหน้า'],
                'first_name_th' => ['ชื่อภาษาไทย'],
                'last_name_th' => ['นามสกุลภาษาไทย'],
                'gender' => ['เพศ'],
                'birth_date' => ['วันเดือนปีเกิด'],
                'email' => ['อีเมล'],
                'phone' => ['เบอร์โทรศัพท์'],
                'year_level' => ['ชั้นปี'],
                'gpa' => ['เกรดเฉลี่ย (GPA)'],
                'hometown_province' => ['จังหวัดภูมิลำเนา'],
                'height' => ['ส่วนสูง'],
                'weight' => ['น้ำหนัก'],
                'bmi' => ['ดัชนีมวลกาย (BMI)'],
                'home_phone' => ['เบอร์โทรศัพท์บ้าน'],
                'home_address' => ['ที่อยู่ตามภูมิลำเนา'],
                'status' => ['สถานะ'],
                'graduation_date' => ['วันที่สำเร็จการศึกษา'],
                'dropout_date' => ['วันที่เปลี่ยนสถานะการศึกษา'],
                'dropout_reason' => ['เหตุผลการเปลี่ยนสถานะ'],
                'admission_year' => ['ปีที่เข้าศึกษา'],
            ],
            'columns' => ['student_id', 'title', 'first_name_th', 'last_name_th', 'gender', 'birth_date', 'email', 'phone', 'year_level', 'gpa', 'hometown_province', 'height', 'weight', 'bmi', 'home_phone', 'home_address', 'status', 'graduation_date', 'dropout_date', 'dropout_reason', 'admission_year']
        ],
        'teachers' => [
            'table' => 'faculty',
            'key' => 'faculty_id',
            'row_key' => 'faculty_id',
            'required_columns' => ['faculty_id', 'title', 'first_name_th', 'last_name_th', 'gender', 'birth_date'],
            'optional_columns' => [],
            'ignore_blank_optional_columns' => true,
            'date_columns' => ['birth_date', 'license_expiry', 'start_work_date', 'academic_position_date'],
            'header_aliases' => [
                'faculty_id' => ['รหัสประจำตัวอาจารย์'],
                'title' => ['คำนำหน้า'],
                'first_name_th' => ['ชื่อภาษาไทย'],
                'last_name_th' => ['นามสกุลภาษาไทย'],
                'gender' => ['เพศ'],
                'birth_date' => ['วันเดือนปีเกิด'],
                'email' => ['อีเมล'],
                'phone' => ['เบอร์โทรศัพท์'],
                'current_address' => ['ที่อยู่ปัจจุบัน'],
                'nursing_council_no' => ['เลขใบประกอบวิชาชีพ'],
                'license_expiry' => ['วันหมดอายุใบอนุญาต'],
                'start_work_date' => ['วันที่เริ่มทำงาน'],
                'academic_position_date' => ['วันที่ได้รับตำแหน่งทางวิชาการ'],
                'status' => ['สถานะ'],
            ],
            'columns' => ['faculty_id', 'title', 'first_name_th', 'last_name_th', 'gender', 'birth_date', 'email', 'phone', 'current_address', 'nursing_council_no', 'license_expiry', 'start_work_date', 'academic_position_date', 'status']
        ],
        'courses' => [
            'table' => 'subject',
            'key' => 'subject_id',
            'row_key' => 'subject_code',
            'optional_columns' => ['subject_id'],
            'generated_id' => ['column' => 'subject_id', 'lookup' => 'subject_code'],
            'columns' => ['subject_id', 'subject_code', 'subject_name_th', 'subject_name_en', 'credit', 'credit_desc', 'description', 'is_active', 'program_id', 'department', 'subject_type', 'year_level', 'semester']
        ]
    ];

    if (!isset($schemas[$importType])) {
        throw new Exception("ประเภทการนำเข้าไม่ถูกต้อง");
    }

    return $schemas[$importType];
}

function normalizeHeader($value) {
    $value = preg_replace('/^\xEF\xBB\xBF/', '', (string)$value);
    return strtolower(trim($value));
}

function buildHeaderMap(array $headers) {
    $headerMap = [];
    foreach ($headers as $index => $header) {
        $normalized = normalizeHeader($header);
        if ($normalized !== '') {
            $headerMap[$normalized] = $index;
        }
    }
    return $headerMap;
}

function buildSchemaHeaderMap(array $headers, array $schema) {
    $rawHeaderMap = buildHeaderMap($headers);
    $headerAliases = $schema['header_aliases'] ?? [];
    $schemaHeaderMap = [];

    foreach ($schema['columns'] as $column) {
        $aliases = array_merge([$column], $headerAliases[$column] ?? []);
        foreach ($aliases as $alias) {
            $normalizedAlias = normalizeHeader($alias);
            if (array_key_exists($normalizedAlias, $rawHeaderMap)) {
                $schemaHeaderMap[$column] = $rawHeaderMap[$normalizedAlias];
                break;
            }
        }
    }

    return $schemaHeaderMap;
}

function getImportColumnLabel(string $column, array $schema): string {
    $aliases = $schema['header_aliases'][$column] ?? [];
    return $aliases[0] ?? $column;
}

function validateHeaders(array $headerMap, array $schema, string $importType) {
    $missingColumns = [];
    $requiredColumns = $schema['required_columns'] ?? null;

    if ($requiredColumns !== null) {
        foreach ($requiredColumns as $column) {
            if (!array_key_exists($column, $headerMap)) {
                $missingColumns[] = getImportColumnLabel($column, $schema);
            }
        }
    } else {
        $optionalColumns = $schema['optional_columns'] ?? [];

        foreach ($schema['columns'] as $column) {
            if (in_array($column, $optionalColumns, true)) {
                continue;
            }

            if (!array_key_exists($column, $headerMap)) {
                $missingColumns[] = getImportColumnLabel($column, $schema);
            }
        }
    }

    if (!empty($missingColumns)) {
        throw new InvalidArgumentException("โครงสร้างไฟล์ไม่ตรงกับประเภท {$importType}: ขาดคอลัมน์ " . implode(', ', $missingColumns));
    }
}

function rowHasImportValues(array $values): bool {
    return count(array_filter($values, static fn($value) => $value !== null && $value !== '')) > 0;
}

function validateRequiredRowValues(array $values, array $schema, int $rowNumber): void {
    $requiredColumns = $schema['required_columns'] ?? [];
    if (empty($requiredColumns)) {
        return;
    }

    $missing = [];
    foreach ($requiredColumns as $column) {
        $index = array_search($column, $schema['columns'], true);
        if ($index === false || $values[$index] === null || $values[$index] === '') {
            $missing[] = getImportColumnLabel($column, $schema);
        }
    }

    if (!empty($missing)) {
        throw new InvalidArgumentException("แถว {$rowNumber}: กรุณาระบุ " . implode(', ', $missing));
    }
}

function normalizeImportedDateParts(int $day, int $month, int $year, string $column, int $rowNumber): string {
    if ($year >= 2400) {
        $year -= 543;
    }

    if (!checkdate($month, $day, $year)) {
        throw new InvalidArgumentException("{$column} แถว {$rowNumber} ต้องเป็นวันที่รูปแบบ dd/mm/yyyy");
    }

    return sprintf('%04d-%02d-%02d', $year, $month, $day);
}

function normalizeImportedDateValue($value, string $column, int $rowNumber, ?Cell $cell = null): ?string {
    if ($value === null) {
        return null;
    }

    if ($cell !== null && is_numeric($value) && ExcelDate::isDateTime($cell)) {
        return ExcelDate::excelToDateTimeObject((float)$value)->format('Y-m-d');
    }

    if (is_int($value) || is_float($value) || (is_string($value) && preg_match('/^\d+(\.\d+)?$/', trim($value)))) {
        $serial = (float)$value;
        if ($serial >= 10000 && $serial < 100000) {
            return ExcelDate::excelToDateTimeObject($serial)->format('Y-m-d');
        }
    }

    $text = trim((string)$value);
    if ($text === '') {
        return null;
    }

    if (preg_match('/^(\d{4})-(\d{1,2})-(\d{1,2})$/', $text, $matches)) {
        $year = (int)$matches[1];
        if ($year >= 2400) {
            $year -= 543;
        }
        $month = (int)$matches[2];
        $day = (int)$matches[3];
        if (!checkdate($month, $day, $year)) {
            throw new InvalidArgumentException("{$column} แถว {$rowNumber} ต้องเป็นวันที่รูปแบบ dd/mm/yyyy");
        }
        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $text, $matches)) {
        return normalizeImportedDateParts((int)$matches[1], (int)$matches[2], (int)$matches[3], $column, $rowNumber);
    }

    throw new InvalidArgumentException("{$column} แถว {$rowNumber} ต้องเป็นวันที่รูปแบบ dd/mm/yyyy");
}

function getRowValuesBySchema(array $row, array $headerMap, array $schema, int $rowNumber, array $cells = []) {
    $values = [];
    $dateColumns = $schema['date_columns'] ?? [];
    foreach ($schema['columns'] as $column) {
        if (!array_key_exists($column, $headerMap)) {
            $values[] = null;
            continue;
        }

        $index = $headerMap[$column];
        $rawValue = $row[$index] ?? null;
        if (in_array($column, $dateColumns, true)) {
            $values[] = normalizeImportedDateValue($rawValue, $column, $rowNumber, $cells[$index] ?? null);
            continue;
        }

        $value = $rawValue === null ? '' : trim((string)$rawValue);
        $values[] = $value === '' ? null : $value;
    }
    if ($schema['table'] === 'project' && count(array_filter($values, static fn($value) => $value !== null)) > 0) {
        $codeIndex = array_search('project_id', $schema['columns'], true);
        try {
            $values[$codeIndex] = project_validate_code($values[$codeIndex]);
        } catch (InvalidArgumentException $e) {
            throw new InvalidArgumentException("project_id แถว {$rowNumber}: " . $e->getMessage());
        }
        $nameIndex = array_search('project_name_th', $schema['columns'], true);
        if ($values[$nameIndex] === null) {
            throw new InvalidArgumentException("project_name_th แถว {$rowNumber}: กรุณาระบุชื่อโครงการ");
        }
    }
    return $values;
}

function buildUpsertSql(array $schema) {
    $columns = $schema['columns'];
    $placeholders = implode(', ', array_fill(0, count($columns), '?'));
    $updates = [];
    $optionalColumns = $schema['optional_columns'] ?? [];

    if (empty($schema['key'])) {
        return "INSERT INTO {$schema['table']} (" . implode(', ', $columns) . ") VALUES ({$placeholders})";
    }

    foreach ($columns as $column) {
        if ($column === $schema['key'] || in_array($column, $optionalColumns, true)) {
            continue;
        }
        $updates[] = "{$column}=VALUES({$column})";
    }

    return "INSERT INTO {$schema['table']} (" . implode(', ', $columns) . ") VALUES ({$placeholders}) ON DUPLICATE KEY UPDATE " . implode(', ', $updates);
}

/**
 * ไฟล์ผู้ใช้อาจไม่มีคอลัมน์ optional หรือเว้นช่องว่างไว้ได้ โดยค่าที่ว่างต้องไม่ล้างข้อมูลเดิม
 * คืน SQL และค่าที่มีจริงในแถวนั้นเพื่อให้ INSERT ใช้ default ของฐานข้อมูล และ UPDATE แตะเฉพาะค่าที่กรอก
 */
function buildRowUpsert(array $schema, array $values): array {
    if (empty($schema['ignore_blank_optional_columns'])) {
        return [buildUpsertSql($schema), $values];
    }

    $requiredColumns = $schema['required_columns'] ?? [];
    $includedColumns = [];
    $includedValues = [];
    foreach ($schema['columns'] as $index => $column) {
        $value = $values[$index] ?? null;
        if (in_array($column, $requiredColumns, true) || ($value !== null && $value !== '')) {
            $includedColumns[] = $column;
            $includedValues[] = $value;
        }
    }

    $quotedColumns = array_map(static fn(string $column): string => "`{$column}`", $includedColumns);
    $placeholders = implode(', ', array_fill(0, count($includedColumns), '?'));
    $updates = [];
    foreach ($includedColumns as $column) {
        if ($column !== $schema['key']) {
            $updates[] = "`{$column}`=VALUES(`{$column}`)";
        }
    }

    $sql = "INSERT INTO `{$schema['table']}` (" . implode(', ', $quotedColumns) . ") VALUES ({$placeholders})";
    if (!empty($updates)) {
        $sql .= " ON DUPLICATE KEY UPDATE " . implode(', ', $updates);
    }
    return [$sql, $includedValues];
}

function prepareGeneratedIdValues(PDO $db, array $values, array $schema) {
    if (empty($schema['generated_id'])) {
        return $values;
    }

    $idColumn = $schema['generated_id']['column'];
    $lookupColumn = $schema['generated_id']['lookup'];
    $idIndex = array_search($idColumn, $schema['columns'], true);
    $lookupIndex = array_search($lookupColumn, $schema['columns'], true);

    if ($idIndex === false || $lookupIndex === false || !empty($values[$idIndex]) || empty($values[$lookupIndex])) {
        return $values;
    }

    $lookupStmt = $db->prepare("SELECT {$idColumn} FROM {$schema['table']} WHERE {$lookupColumn} = :lookup_value LIMIT 1");
    $lookupStmt->execute([':lookup_value' => $values[$lookupIndex]]);
    $existingId = $lookupStmt->fetchColumn();

    if ($existingId !== false) {
        $values[$idIndex] = $existingId;
        return $values;
    }

    $nextId = $db->query("SELECT COALESCE(MAX({$idColumn}), 0) + 1 FROM {$schema['table']}")->fetchColumn();
    $values[$idIndex] = $nextId;
    return $values;
}

function prepareExistingLookupValues(PDO $db, array $values, array $schema) {
    if (empty($schema['lookup_existing'])) {
        return $values;
    }

    $idColumn = $schema['lookup_existing']['column'];
    $idIndex = array_search($idColumn, $schema['columns'], true);
    if ($idIndex === false || !empty($values[$idIndex])) {
        return $values;
    }

    $conditions = [];
    $params = [];
    foreach ($schema['lookup_existing']['by'] as $lookupColumn) {
        $lookupIndex = array_search($lookupColumn, $schema['columns'], true);
        if ($lookupIndex === false || empty($values[$lookupIndex])) {
            return $values;
        }

        $conditions[] = "{$lookupColumn} = :{$lookupColumn}";
        $params[":{$lookupColumn}"] = $values[$lookupIndex];
    }

    $lookupStmt = $db->prepare("SELECT {$idColumn} FROM {$schema['table']} WHERE " . implode(' AND ', $conditions) . " LIMIT 1");
    $lookupStmt->execute($params);
    $existingId = $lookupStmt->fetchColumn();

    if ($existingId !== false) {
        $values[$idIndex] = $existingId;
    }

    return $values;
}

function processExcelToDatabase($filePath, $importType, $db) {
    if ($importType === 'projects') return processProjectWorkbook($filePath, $db);
    $rowCount = 0;
    $rowKeys = [];
    $schema = getImportSchema($importType);
    $rowKeyIndex = array_search($schema['row_key'], $schema['columns'], true);

    $spreadsheet = IOFactory::load($filePath);
    $worksheet = $spreadsheet->getActiveSheet();
    $highestRow = $worksheet->getHighestRow();
    $highestColumnIndex = Coordinate::columnIndexFromString($worksheet->getHighestColumn());
    $headers = [];

    for ($column = 1; $column <= $highestColumnIndex; $column++) {
        $columnLetter = Coordinate::stringFromColumnIndex($column);
        $headers[] = $worksheet->getCell($columnLetter . '1')->getValue();
    }

    $headerMap = buildSchemaHeaderMap($headers, $schema);
    validateHeaders($headerMap, $schema, $importType);

    $db->beginTransaction();
    try {
        $statementCache = [];
        for ($row = 2; $row <= $highestRow; $row++) {
            $rowData = [];
            $rowCells = [];
            for ($column = 1; $column <= $highestColumnIndex; $column++) {
                $columnLetter = Coordinate::stringFromColumnIndex($column);
                $cell = $worksheet->getCell($columnLetter . $row);
                $rowCells[] = $cell;
                $rowData[] = $cell->getValue();
            }

            $values = getRowValuesBySchema($rowData, $headerMap, $schema, $row, $rowCells);
            if (!rowHasImportValues($values)) continue;
            validateRequiredRowValues($values, $schema, $row);
            if ($values[$rowKeyIndex] === null || $values[$rowKeyIndex] === '') continue;

            $rowKeys[] = (string)$values[$rowKeyIndex];
            $values = prepareExistingLookupValues($db, $values, $schema);
            $values = prepareGeneratedIdValues($db, $values, $schema);
            [$sql, $rowValues] = buildRowUpsert($schema, $values);
            if (!isset($statementCache[$sql])) {
                $statementCache[$sql] = $db->prepare($sql);
            }
            $statementCache[$sql]->execute($rowValues);
            $rowCount++;
        }

        $db->commit();
        return ['recordCount' => $rowCount, 'rowKeys' => $rowKeys];
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

try {
    $db = new Connect();
    $adminUserId = adminRequireAccess($db);

    if (!isset($_FILES['file']) || !isset($_POST['importType'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วน (ขาดไฟล์หรือประเภทการนำเข้า)");
    }

    $file = $_FILES['file'];
    $importType = $_POST['importType'];
    $userId = $adminUserId;

    $allowedImportTypes = ['students', 'teachers', 'courses', 'projects'];
    if (!in_array($importType, $allowedImportTypes, true)) {
        throw new InvalidArgumentException("ประเภทการนำเข้าไม่ถูกต้อง");
    }

    $allowed = ["xlsx", "xls"];
    $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($fileExt, $allowed)) {
        throw new InvalidArgumentException("รองรับเฉพาะไฟล์ .xlsx และ .xls เท่านั้น");
    }

    $uploadDir = __DIR__ . "/../../../uploads/imports/$importType/";
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $newFileName = date("Ymd_His") . "_" . uniqid() . "." . $fileExt;
    $uploadPath = $uploadDir . $newFileName;

    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        $sql = "INSERT INTO import_history (user_id, type, file_name, status, created_at) 
                VALUES (:uid, :type, :fname, 'processing', NOW())";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':uid' => $userId,
            ':type' => $importType,
            ':fname' => $file['name']
        ]);
        $importId = $db->lastInsertId();

        try {
            $importResult = processExcelToDatabase($uploadPath, $importType, $db);
            $finalCount = (int)($importResult['recordCount'] ?? 0);
            $accountSummary = null;

            if (in_array($importType, ['students', 'teachers'], true)) {
                $accountCandidates = getImportedUserAccountCandidates($db, $importType, $importResult['rowKeys'] ?? []);
                $accountSummary = createUserAccountsFromRows($db, $accountCandidates, [
                    'faculty' => null,
                    'student' => 3,
                ]);
            }

            if ($importResult !== false) {
                $update = $db->prepare("UPDATE import_history SET status = 'success', record_count = :count WHERE id = :id");
                $update->execute([':count' => $finalCount, ':id' => $importId]);

                $message = "นำเข้าข้อมูลสำเร็จจำนวน $finalCount รายการ";
                if ($importType === 'projects' && isset($importResult['counts']) && is_array($importResult['counts'])) {
                    $projectCount = (int) ($importResult['counts']['projects'] ?? 0);
                    $activityCount = (int) ($importResult['counts']['activities'] ?? 0);
                    $budgetCount = (int) ($importResult['counts']['budgets'] ?? 0);
                    $message = "นำเข้าข้อมูลสำเร็จ: โครงการ $projectCount รายการ, กิจกรรม $activityCount รายการ, งบประมาณ $budgetCount รายการ";
                }
                if ($accountSummary !== null) {
                    $message .= " และ" . buildUserAccountCreationMessage($accountSummary);
                }

                // บันทึกเป็น 'create' ลงฐานข้อมูล (เพื่อไม่ให้ฐานข้อมูลปฏิเสธ) และส่ง resource 'import_data'
                logAudit(
                    $db,
                    $adminUserId,
                    'create',
                    'import_data',
                    "{$message} (ประเภท: {$importType}, ไฟล์: {$file['name']})"
                );

                echo json_encode([
                    "status" => "success",
                    "message" => $message,
                    "importId" => $importId,
                    "accountCreation" => $accountSummary
                ], JSON_UNESCAPED_UNICODE);
            }
        } catch (Exception $e) {
            $errorUpdate = $db->prepare("UPDATE import_history SET status = 'failed', error_details = :msg WHERE id = :id");
            $errorUpdate->execute([':msg' => $e->getMessage(), ':id' => $importId]);
            throw $e; 
        }
    } else {
        throw new Exception("ไม่สามารถบันทึกไฟล์ลงใน Server ได้");
    }

} catch (Exception $e) {
    $isConstraintConflict = $e instanceof PDOException && (string)$e->getCode() === '23000';
    http_response_code($isConstraintConflict ? 409 : project_error_status($e));
    echo json_encode([
        "status" => "error",
        "message" => $e instanceof PDOException ? "ไม่สามารถนำเข้าข้อมูล กรุณาตรวจรหัสซ้ำและความสัมพันธ์ของข้อมูล" : $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}
?>
