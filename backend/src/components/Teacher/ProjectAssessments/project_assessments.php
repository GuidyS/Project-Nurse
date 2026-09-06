<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function projectAssessmentResponse(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function getAssessmentProject(PDO $db, int $projectId): array
{
    $stmt = $db->prepare("
        SELECT project_id, project_name_th, project_name_en, project_type, academic_year, status
        FROM project
        WHERE project_id = :project_id
        LIMIT 1
    ");
    $stmt->execute([':project_id' => $projectId]);
    $project = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$project) {
        projectAssessmentResponse(['status' => 'error', 'message' => 'ไม่พบโครงการ'], 404);
    }

    return $project;
}

function requireAssessableProject(array $project): void
{
    if (!in_array($project['project_type'], ['academic_service', 'culture'], true)) {
        projectAssessmentResponse([
            'status' => 'error',
            'message' => 'กรุณากำหนดประเภทโครงการเป็นบริการวิชาการหรือศิลปวัฒนธรรมก่อน',
        ], 422);
    }
}

function requireProjectParticipant(PDO $db, int $projectId, string $studentId): void
{
    $stmt = $db->prepare("
        SELECT 1
        FROM project_participants
        WHERE project_id = :project_id AND student_id = :student_id
        LIMIT 1
    ");
    $stmt->execute([':project_id' => $projectId, ':student_id' => $studentId]);
    if (!$stmt->fetchColumn()) {
        projectAssessmentResponse(['status' => 'error', 'message' => 'นักศึกษายังไม่ได้เข้าร่วมโครงการนี้'], 422);
    }
}

if (!isset($_SESSION['user_id'])) {
    projectAssessmentResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

try {
    $db = new Connect();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $projectId = (int)($_GET['project_id'] ?? 0);
        if ($projectId <= 0) {
            projectAssessmentResponse(['status' => 'error', 'message' => 'กรุณาระบุโครงการ'], 400);
        }

        $project = getAssessmentProject($db, $projectId);

        $studentStmt = $db->query("
            SELECT
                student_id,
                student_code,
                TRIM(CONCAT(COALESCE(title, ''), COALESCE(first_name_th, ''), ' ', COALESCE(last_name_th, ''))) AS name,
                year_level
            FROM student
            WHERE status = 'Active'
            ORDER BY student_code, student_id
        ");

        $participantStmt = $db->prepare("
            SELECT
                pp.student_id,
                pp.status,
                s.student_code,
                TRIM(CONCAT(COALESCE(s.title, ''), COALESCE(s.first_name_th, ''), ' ', COALESCE(s.last_name_th, ''))) AS name,
                s.year_level,
                ps.is_satisfied,
                ps.comment AS satisfaction_comment
            FROM project_participants pp
            INNER JOIN student s ON s.student_id = pp.student_id
            LEFT JOIN project_satisfaction_responses ps
                ON ps.project_id = pp.project_id AND ps.student_id = pp.student_id
            WHERE pp.project_id = :project_id
            ORDER BY s.student_code, s.student_id
        ");
        $participantStmt->execute([':project_id' => $projectId]);

        $outcomeStmt = $db->prepare("
            SELECT id, outcome_type, outcome_code
            FROM project_outcome_links
            WHERE project_id = :project_id
            ORDER BY FIELD(outcome_type, 'clo', 'plo', 'ylo'), outcome_code
        ");
        $outcomeStmt->execute([':project_id' => $projectId]);

        $resultStmt = $db->prepare("
            SELECT student_id, project_outcome_link_id, score_percent, pass_status, assessed_by, assessed_at
            FROM student_project_outcome_results
            WHERE project_id = :project_id
            ORDER BY student_id, project_outcome_link_id
        ");
        $resultStmt->execute([':project_id' => $projectId]);

        projectAssessmentResponse([
            'status' => 'success',
            'data' => [
                'project' => $project,
                'students' => $studentStmt->fetchAll(PDO::FETCH_ASSOC),
                'participants' => $participantStmt->fetchAll(PDO::FETCH_ASSOC),
                'outcomes' => $outcomeStmt->fetchAll(PDO::FETCH_ASSOC),
                'results' => $resultStmt->fetchAll(PDO::FETCH_ASSOC),
            ],
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        projectAssessmentResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        projectAssessmentResponse(['status' => 'error', 'message' => 'รูปแบบข้อมูลไม่ถูกต้อง'], 400);
    }

    $action = (string)($input['action'] ?? '');
    $projectId = (int)($input['project_id'] ?? 0);
    $studentId = trim((string)($input['student_id'] ?? ''));
    if ($projectId <= 0 || $studentId === '') {
        projectAssessmentResponse(['status' => 'error', 'message' => 'ข้อมูลโครงการหรือนักศึกษาไม่ครบ'], 400);
    }

    $project = getAssessmentProject($db, $projectId);
    requireAssessableProject($project);

    if ($action === 'add_participant') {
        $allowedStatuses = ['Registered', 'Joined', 'Passed', 'Failed'];
        $participantStatus = (string)($input['participant_status'] ?? 'Joined');
        if (!in_array($participantStatus, $allowedStatuses, true)) {
            projectAssessmentResponse(['status' => 'error', 'message' => 'สถานะผู้เข้าร่วมไม่ถูกต้อง'], 422);
        }

        $studentStmt = $db->prepare("SELECT 1 FROM student WHERE student_id = :student_id LIMIT 1");
        $studentStmt->execute([':student_id' => $studentId]);
        if (!$studentStmt->fetchColumn()) {
            projectAssessmentResponse(['status' => 'error', 'message' => 'ไม่พบนักศึกษา'], 404);
        }

        $stmt = $db->prepare("
            INSERT INTO project_participants (project_id, student_id, status)
            VALUES (:project_id, :student_id, :participant_status)
            ON DUPLICATE KEY UPDATE status = VALUES(status)
        ");
        $stmt->execute([
            ':project_id' => $projectId,
            ':student_id' => $studentId,
            ':participant_status' => $participantStatus,
        ]);

        projectAssessmentResponse(['status' => 'success', 'message' => 'เพิ่มผู้เข้าร่วมโครงการแล้ว']);
    }

    if ($action === 'remove_participant') {
        $db->beginTransaction();
        $stmt = $db->prepare("
            DELETE FROM student_project_outcome_results
            WHERE project_id = :project_id AND student_id = :student_id
        ");
        $stmt->execute([':project_id' => $projectId, ':student_id' => $studentId]);
        $stmt = $db->prepare("
            DELETE FROM project_satisfaction_responses
            WHERE project_id = :project_id AND student_id = :student_id
        ");
        $stmt->execute([':project_id' => $projectId, ':student_id' => $studentId]);
        $stmt = $db->prepare("
            DELETE FROM project_participants
            WHERE project_id = :project_id AND student_id = :student_id
        ");
        $stmt->execute([':project_id' => $projectId, ':student_id' => $studentId]);
        $db->commit();

        projectAssessmentResponse(['status' => 'success', 'message' => 'นำผู้เข้าร่วมออกจากโครงการแล้ว']);
    }

    requireProjectParticipant($db, $projectId, $studentId);

    if ($action === 'save_satisfaction') {
        if ($project['project_type'] !== 'culture') {
            projectAssessmentResponse(['status' => 'error', 'message' => 'บันทึกความพึงพอใจได้เฉพาะโครงการศิลปวัฒนธรรม'], 422);
        }
        if (!array_key_exists('is_satisfied', $input) || !in_array($input['is_satisfied'], [0, 1, false, true], true)) {
            projectAssessmentResponse(['status' => 'error', 'message' => 'กรุณาระบุผลความพึงพอใจ'], 422);
        }

        $stmt = $db->prepare("
            INSERT INTO project_satisfaction_responses
                (project_id, student_id, is_satisfied, comment)
            VALUES
                (:project_id, :student_id, :is_satisfied, :comment)
            ON DUPLICATE KEY UPDATE
                is_satisfied = VALUES(is_satisfied),
                comment = VALUES(comment),
                submitted_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
        ");
        $stmt->execute([
            ':project_id' => $projectId,
            ':student_id' => $studentId,
            ':is_satisfied' => (int)(bool)$input['is_satisfied'],
            ':comment' => trim((string)($input['comment'] ?? '')) ?: null,
        ]);

        projectAssessmentResponse(['status' => 'success', 'message' => 'บันทึกความพึงพอใจแล้ว']);
    }

    if ($action === 'save_outcomes') {
        if ($project['project_type'] !== 'academic_service') {
            projectAssessmentResponse(['status' => 'error', 'message' => 'บันทึกผล CLO/PLO/YLO ได้เฉพาะโครงการบริการวิชาการ'], 422);
        }

        $results = $input['results'] ?? null;
        if (!is_array($results)) {
            projectAssessmentResponse(['status' => 'error', 'message' => 'รูปแบบผลการประเมินไม่ถูกต้อง'], 400);
        }

        $linkStmt = $db->prepare("SELECT id FROM project_outcome_links WHERE project_id = :project_id");
        $linkStmt->execute([':project_id' => $projectId]);
        $validLinkIds = array_fill_keys(array_map('strval', $linkStmt->fetchAll(PDO::FETCH_COLUMN)), true);

        $facultyStmt = $db->prepare("
            SELECT f.faculty_id
            FROM users u
            INNER JOIN faculty f ON CAST(f.faculty_id AS CHAR) = CAST(u.username AS CHAR)
            WHERE u.user_id = :user_id
            LIMIT 1
        ");
        $facultyStmt->execute([':user_id' => $_SESSION['user_id']]);
        $assessedBy = $facultyStmt->fetchColumn() ?: null;

        $upsertStmt = $db->prepare("
            INSERT INTO student_project_outcome_results
                (project_id, student_id, project_outcome_link_id, score_percent, pass_status, assessed_by, assessed_at)
            VALUES
                (:project_id, :student_id, :link_id, :score_percent, :pass_status, :assessed_by, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
                score_percent = VALUES(score_percent),
                pass_status = VALUES(pass_status),
                assessed_by = VALUES(assessed_by),
                assessed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
        ");
        $deleteStmt = $db->prepare("
            DELETE FROM student_project_outcome_results
            WHERE project_id = :project_id
              AND student_id = :student_id
              AND project_outcome_link_id = :link_id
        ");

        $db->beginTransaction();
        foreach ($results as $result) {
            $linkId = (int)($result['project_outcome_link_id'] ?? 0);
            if ($linkId <= 0 || !isset($validLinkIds[(string)$linkId])) {
                throw new InvalidArgumentException('พบ CLO/PLO/YLO ที่ไม่ได้อยู่ในโครงการนี้');
            }

            $rawScore = $result['score_percent'] ?? null;
            if ($rawScore !== '' && $rawScore !== null && !is_numeric($rawScore)) {
                throw new InvalidArgumentException('คะแนนต้องเป็นตัวเลข');
            }
            $score = ($rawScore === '' || $rawScore === null) ? null : (float)$rawScore;
            $rawPass = $result['pass_status'] ?? null;
            if (!in_array($rawPass, ['', null, 0, 1, '0', '1', false, true], true)) {
                throw new InvalidArgumentException('ผลประเมินต้องเป็นผ่าน ไม่ผ่าน หรือยังไม่ประเมิน');
            }
            $passStatus = ($rawPass === '' || $rawPass === null) ? null : (int)(bool)$rawPass;

            if ($score !== null && ($score < 0 || $score > 100)) {
                throw new InvalidArgumentException('คะแนนต้องอยู่ระหว่าง 0–100');
            }

            if ($score === null && $passStatus === null) {
                $deleteStmt->execute([
                    ':project_id' => $projectId,
                    ':student_id' => $studentId,
                    ':link_id' => $linkId,
                ]);
                continue;
            }

            $upsertStmt->execute([
                ':project_id' => $projectId,
                ':student_id' => $studentId,
                ':link_id' => $linkId,
                ':score_percent' => $score,
                ':pass_status' => $passStatus,
                ':assessed_by' => $assessedBy,
            ]);
        }
        $db->commit();

        projectAssessmentResponse(['status' => 'success', 'message' => 'บันทึกผล CLO/PLO/YLO แล้ว']);
    }

    projectAssessmentResponse(['status' => 'error', 'message' => 'ไม่รู้จักคำสั่งที่ร้องขอ'], 400);
} catch (InvalidArgumentException $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    projectAssessmentResponse(['status' => 'error', 'message' => $e->getMessage()], 422);
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log('[ProjectAssessments] ' . $e->getMessage());
    projectAssessmentResponse(['status' => 'error', 'message' => 'ไม่สามารถจัดการข้อมูลการประเมินโครงการได้'], 500);
}
