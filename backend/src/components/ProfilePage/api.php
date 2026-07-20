<?php
if (session_status() == PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../../config/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
}

$id = $_SESSION['user_id'];
$db = new Connect;

function normalizePdfPaths($value): array {
    if (empty($value)) {
        return [];
    }

    $decoded = json_decode($value, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        return array_values(array_filter($decoded, fn($path) => is_string($path) && trim($path) !== ''));
    }

    return [trim($value)];
}

try {
    $method = $_SERVER['REQUEST_METHOD'];

    // 🔍 [GET] ดึงข้อมูลมาโชว์ที่หน้า Profile
    if ($method === 'GET') {
        $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
        $stmt->execute([':id' => $id]);
        $u_info = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($u_info['role_id'] == 3) {
            $stmt = $db->prepare("SELECT * FROM student WHERE student_id = :id LIMIT 1");
            $stmt->execute(['id' => $u_info['username']]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

            $docStmt = $db->prepare("
                SELECT title, type, file_name, file_path
                FROM portfolio
                WHERE student_id = :id
                  AND (
                    mime_type = 'application/pdf'
                    OR file_name LIKE '%.pdf'
                    OR file_path LIKE '%.pdf'
                  )
                ORDER BY created_at DESC
            ");
            $docStmt->execute(['id' => $u_info['username']]);
            $profile['pdf_documents'] = $docStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "role" => "student", "data" => $profile]);
        } else {
            $stmt = $db->prepare("SELECT * FROM faculty WHERE faculty_id = :id LIMIT 1");
            $stmt->execute(['id' => $u_info['username']]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
            $profile['pdf_documents'] = [];

            $facultyDocs = [
                'nursing_council_file' => 'ไฟล์บัตรสภาการพยาบาล',
                'license_file' => 'ไฟล์ใบอนุญาต',
                'teaching_cert_file' => 'ไฟล์ใบรับรองการสอน'
            ];

            foreach ($facultyDocs as $field => $title) {
                foreach (normalizePdfPaths($profile[$field] ?? null) as $index => $filePath) {
                    $profile['pdf_documents'][] = [
                        'title' => $index === 0 ? $title : $title . ' #' . ($index + 1),
                        'type' => 'document',
                        'file_name' => basename($filePath),
                        'file_path' => $filePath
                    ];
                }
            }

            echo json_encode(["status" => "success", "role" => "teacher", "data" => $profile]);
        }
        exit;
    }

    // 📝 [POST] อัปเดตข้อมูลของตัวเองผ่านหน้า Profile
    if ($method === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $stmt = $db->prepare("SELECT username, role_id FROM users WHERE user_id = :id");
        $stmt->execute([':id' => $id]);
        $u_info = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($u_info['role_id'] == 3) {
            $sql = "UPDATE student SET first_name_en = ?, last_name_en = ?, gender = ?, birth_date = ?, email = ?, phone = ?, home_phone = ?, home_address = ?, hometown_province = ? WHERE student_id = ?";
            $db->prepare($sql)->execute([$input['first_name_en']??null, $input['last_name_en']??null, $input['gender']??null, $input['birth_date']??null, $input['email']??null, $input['phone']??null, $input['home_phone']??null, $input['home_address']??null, $input['hometown_province']??null, $u_info['username']]);
        } else {
            $sql = "UPDATE faculty SET first_name_en = ?, last_name_en = ?, gender = ?, birth_date = ?, email = ?, phone = ?, current_address = ?, nursing_council_no = ? WHERE faculty_id = ?";
            $db->prepare($sql)->execute([$input['first_name_en']??null, $input['last_name_en']??null, $input['gender']??null, $input['birth_date']??null, $input['email']??null, $input['phone']??null, $input['current_address']??null, $input['nursing_council_no']??null, $u_info['username']]);
        }
        echo json_encode(["status" => "success"]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>