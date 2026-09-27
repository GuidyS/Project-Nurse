<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/audit_helper.php';
require_once __DIR__ . '/../Approvals/approval-schema.php';
require_once __DIR__ . '/../ManageUsers/user-account-import-helper.php';
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../../../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

function getImportSchema($importType) {
    $schemas = [
        'students' => [
            'table' => 'student',
            'key' => 'student_id',
            'row_key' => 'student_id',
            'optional_columns' => [],
            'date_columns' => ['birth_date', 'graduation_date', 'dropout_date'],
            'columns' => ['student_id', 'title', 'first_name_th', 'last_name_th', 'first_name_en', 'last_name_en', 'gender', 'birth_date', 'email', 'phone', 'year_level', 'gpa', 'hometown_province', 'height', 'weight', 'bmi', 'home_phone', 'home_address', 'status', 'graduation_date', 'dropout_date', 'dropout_reason', 'admission_year']
        ],
        'teachers' => [
            'table' => 'faculty',
            'key' => 'faculty_id',
            'row_key' => 'faculty_id',
            'optional_columns' => [],
            'date_columns' => ['birth_date', 'license_expiry', 'start_work_date', 'academic_position_date'],
            'columns' => ['faculty_id', 'title', 'first_name_th', 'last_name_th', 'first_name_en', 'last_name_en', 'gender', 'birth_date', 'email', 'phone', 'current_address', 'nursing_council_no', 'license_expiry', 'start_work_date', 'academic_position_date', 'status']
        ],
        'courses' => [
            'table' => 'subject',
            'key' => 'subject_id',
            'row_key' => 'subject_code',
            'optional_columns' => ['subject_id'],
            'generated_id' => ['column' => 'subject_id', 'lookup' => 'subject_code'],
            'columns' => ['subject_id', 'subject_code', 'subject_name_th', 'subject_name_en', 'credit', 'credit_desc', 'description', 'is_active', 'program_id', 'department', 'subject_type', 'year_level', 'semester']
        ],
        'projects' => [
            'table' => 'project',
            'key' => 'project_id',
            'row_key' => 'project_name_th',
            'optional_columns' => ['project_id'],
            'lookup_existing' => ['column' => 'project_id', 'by' => ['project_name_th']],
            'columns' => ['project_id', 'project_name_th', 'project_name_en', 'description', 'mapping_json', 'responsible_faculty_id', 'academic_year']
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

function validateHeaders(array $headerMap, array $schema, string $importType) {
    $missingColumns = [];
    $optionalColumns = $schema['optional_columns'] ?? [];

    foreach ($schema['columns'] as $column) {
        if (in_array($column, $optionalColumns, true)) {
            continue;
        }

        if (!array_key_exists($column, $headerMap)) {
            $missingColumns[] = $column;
        }
    }

    if (!empty($missingColumns)) {
        throw new Exception("โครงสร้างไฟล์ไม่ตรงกับประเภท {$importType}: ขาดคอลัมน์ " . implode(', ', $missingColumns));
    }
}

function normalizeImportedDateParts(int $day, int $month, int $year, string $column, int $rowNumber): string {
    if ($year >= 2400) {
        $year -= 543;
    }

    if (!checkdate($month, $day, $year)) {
        throw new Exception("{$column} แถว {$rowNumber} ต้องเป็นวันที่รูปแบบ dd/mm/yyyy");
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
            throw new Exception("{$column} แถว {$rowNumber} ต้องเป็นวันที่รูปแบบ dd/mm/yyyy");
        }
        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $text, $matches)) {
        return normalizeImportedDateParts((int)$matches[1], (int)$matches[2], (int)$matches[3], $column, $rowNumber);
    }

    throw new Exception("{$column} แถว {$rowNumber} ต้องเป็นวันที่รูปแบบ dd/mm/yyyy");
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

function processExcelToDatabase($filePath, $importType, $db, $fileExt) {
    $rowCount = 0;
    $rowKeys = [];
    $schema = getImportSchema($importType);
    $sql = buildUpsertSql($schema);
    $rowKeyIndex = array_search($schema['row_key'], $schema['columns'], true);

    if ($fileExt === 'csv') {
        if (($handle = fopen($filePath, "r")) === false) {
            throw new Exception("ไม่สามารถอ่านไฟล์ CSV ได้");
        }

        $headers = fgetcsv($handle, 1000, ",");
        if ($headers === false) {
            fclose($handle);
            throw new Exception("ไม่พบหัวตารางในไฟล์นำเข้า");
        }

        $headerMap = buildHeaderMap($headers);
        validateHeaders($headerMap, $schema, $importType);

        $db->beginTransaction();
        try {
            $stmt = $db->prepare($sql);
            $rowNumber = 1;
            while (($data = fgetcsv($handle, 1000, ",")) !== false) {
                $rowNumber++;
                $values = getRowValuesBySchema($data, $headerMap, $schema, $rowNumber);
                if (empty($values[$rowKeyIndex])) continue;

                $rowKeys[] = (string)$values[$rowKeyIndex];
                $values = prepareExistingLookupValues($db, $values, $schema);
                $values = prepareGeneratedIdValues($db, $values, $schema);
                $stmt->execute($values);
                $rowCount++;
            }

            $db->commit();
            fclose($handle);
            return ['recordCount' => $rowCount, 'rowKeys' => $rowKeys];
        } catch (Exception $e) {
            $db->rollBack();
            fclose($handle);
            throw $e;
        }
    }

    $spreadsheet = IOFactory::load($filePath);
    $worksheet = $spreadsheet->getActiveSheet();
    $highestRow = $worksheet->getHighestRow();
    $highestColumnIndex = Coordinate::columnIndexFromString($worksheet->getHighestColumn());
    $headers = [];

    for ($column = 1; $column <= $highestColumnIndex; $column++) {
        $columnLetter = Coordinate::stringFromColumnIndex($column);
        $headers[] = $worksheet->getCell($columnLetter . '1')->getValue();
    }

    $headerMap = buildHeaderMap($headers);
    validateHeaders($headerMap, $schema, $importType);

    $db->beginTransaction();
    try {
        $stmt = $db->prepare($sql);
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
            if (empty($values[$rowKeyIndex])) continue;

            $rowKeys[] = (string)$values[$rowKeyIndex];
            $values = prepareExistingLookupValues($db, $values, $schema);
            $values = prepareGeneratedIdValues($db, $values, $schema);
            $stmt->execute($values);
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
    $adminUserId = approvalRequireAdmin($db);

    if (!isset($_FILES['file']) || !isset($_POST['importType'])) {
        throw new Exception("ข้อมูลไม่ครบถ้วน (ขาดไฟล์หรือประเภทการนำเข้า)");
    }

    $file = $_FILES['file'];
    $importType = $_POST['importType'];
    $userId = $adminUserId;

    $allowed = ["xlsx", "xls", "csv"];
    $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($fileExt, $allowed)) {
        throw new Exception("รองรับเฉพาะไฟล์ .xlsx, .xls และ .csv เท่านั้น");
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
            $importResult = processExcelToDatabase($uploadPath, $importType, $db, $fileExt);
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
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
