<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header("Content-Type: application/json; charset=UTF-8");

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }

    $docsSql = "
        SELECT
            d.id,
            d.project_id,
            d.name,
            COALESCE(NULLIF(p.project_name_th, ''), NULLIF(p.project_name_en, ''), d.project) AS project,
            d.type,
            d.date,
            d.status,
            d.file_path,
            d.file_name,
            d.mime_type,
            d.file_size
        FROM project_documents d
        LEFT JOIN project p ON p.project_id = d.project_id
        ORDER BY d.date DESC, d.id DESC
    ";
    $docs = $pdo->query($docsSql)->fetchAll(PDO::FETCH_ASSOC);

    $projectsSql = "
        SELECT
            project_id AS id,
            COALESCE(NULLIF(project_name_th, ''), NULLIF(project_name_en, ''), CONCAT('Project #', project_id)) AS name
        FROM project
        ORDER BY project_id DESC
    ";
    $projects = $pdo->query($projectsSql)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "docs" => $docs,
            "projects" => $projects
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "ไม่สามารถดึงข้อมูลเอกสารจากระบบได้: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>