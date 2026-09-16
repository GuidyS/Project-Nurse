<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;
require_once __DIR__ . '/../../middlewares/auth_middleware.php';

// Only Admin (1) can save research
requireRole([1]);

try {
    $db = new Connect();
    $input = json_decode(file_get_contents("php://input"), true);
    
    $research_id = $input['research_id'] ?? null;
    $title = $input['title'] ?? '';
    $publication_date = $input['publication_date'] ?? null;
    $article_type = $input['article_type'] ?? 'research';
    $journal_name = $input['journal_name'] ?? null;
    $issue_number = $input['issue_number'] ?? null;
    $first_author_id = $input['first_author_id'] ?? null;
    $corresponding_author_id = $input['corresponding_author_id'] ?? null;
    
    // Convert array of co_author_ids to JSON, or use empty array
    $co_author_ids = isset($input['co_author_ids']) && is_array($input['co_author_ids']) ? json_encode($input['co_author_ids']) : '[]';
    
    $faculty_id = $input['faculty_id'] ?? $first_author_id; // Default owner to first author

    if (empty($title)) {
        throw new Exception("Title is required");
    }

    if ($research_id) {
        // Update
        $sql = "UPDATE faculty_research 
                SET title = :title, 
                    publication_date = :pub_date, 
                    article_type = :type, 
                    journal_name = :journal, 
                    issue_number = :issue,
                    first_author_id = :first_author, 
                    corresponding_author_id = :corr_author, 
                    co_author_ids = :co_authors,
                    faculty_id = :faculty_id
                WHERE research_id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':title' => $title,
            ':pub_date' => $publication_date,
            ':type' => $article_type,
            ':journal' => $journal_name,
            ':issue' => $issue_number,
            ':first_author' => $first_author_id,
            ':corr_author' => $corresponding_author_id,
            ':co_authors' => $co_author_ids,
            ':faculty_id' => $faculty_id,
            ':id' => $research_id
        ]);
        $msg = "Research updated successfully";
    } else {
        // Insert
        $sql = "INSERT INTO faculty_research 
                (title, publication_date, article_type, journal_name, issue_number, first_author_id, corresponding_author_id, co_author_ids, faculty_id) 
                VALUES (:title, :pub_date, :type, :journal, :issue, :first_author, :corr_author, :co_authors, :faculty_id)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':title' => $title,
            ':pub_date' => $publication_date,
            ':type' => $article_type,
            ':journal' => $journal_name,
            ':issue' => $issue_number,
            ':first_author' => $first_author_id,
            ':corr_author' => $corresponding_author_id,
            ':co_authors' => $co_author_ids,
            ':faculty_id' => $faculty_id
        ]);
        $msg = "Research added successfully";
    }

    echo json_encode(["status" => "success", "message" => $msg], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
