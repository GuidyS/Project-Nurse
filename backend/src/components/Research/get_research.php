<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../../../config/config.php';

header('Access-Control-Allow-Origin: ' . (in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://127.0.0.1:5173'], true) ? ($_SERVER['HTTP_ORIGIN'] ?? '') : 'http://localhost:5173'));
header('Vary: Origin');
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user_id = $_SESSION['user_id'] ?? null;
require_once __DIR__ . '/../../middlewares/auth_middleware.php';

// Admin (1), Teacher (2), Dean (5)
requireRole([1, 2, 5]);

try {
    $db = new Connect();
    $stmt = $db->prepare("SELECT role_id, username FROM users WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $roleId = (int)$user['role_id'];
    $facultyId = $user['username'];

    $sql = "SELECT r.*, 
                   CONCAT(f1.first_name_th, ' ', f1.last_name_th) as first_author_name, 
                   CONCAT(f2.first_name_th, ' ', f2.last_name_th) as corresponding_author_name 
            FROM faculty_research r 
            LEFT JOIN faculty f1 ON r.first_author_id = f1.faculty_id
            LEFT JOIN faculty f2 ON r.corresponding_author_id = f2.faculty_id";
    
    // Teacher sees only their own
    if ($roleId === 2) {
        $sql .= " WHERE r.faculty_id = :fid 
                  OR r.first_author_id = :fid 
                  OR r.corresponding_author_id = :fid 
                  OR JSON_CONTAINS(r.co_author_ids, CONCAT('\"', :fid, '\"'))";
    }
    
    $sql .= " ORDER BY r.publication_date DESC, r.created_at DESC";
    
    $stmt = $db->prepare($sql);
    if ($roleId === 2) {
        $stmt->execute([':fid' => $facultyId]);
    } else {
        $stmt->execute();
    }
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Process color coding and structure
    $processed = [];
    foreach ($results as $row) {
        $color = 'black';
        if ($row['article_type'] === 'academic_article') {
            $color = 'blue';
        } else {
            // For Admin/Dean, it's just general info so we don't necessarily color code for them based on ownership, 
            // but for Teacher (Role 2) it matters. Let's color code based on the currently logged in user.
            if ($row['first_author_id'] == $facultyId || $row['corresponding_author_id'] == $facultyId) {
                $color = 'red';
            }
        }
        
        $row['color_code'] = $color;
        $row['co_author_ids'] = json_decode($row['co_author_ids'] ?: '[]', true);
        $processed[] = $row;
    }

    echo json_encode(["status" => "success", "data" => $processed], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
