<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// จัดการ Preflight Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin(); 
$user_id = $_SESSION['user_id']; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

// =========================================================
//  ฟังก์ชันไม้ตาย: ล้างขยะและดักบั๊กจากไฟล์ Excel/CSV
// =========================================================
function sanitizeData($string, $type = 'text') {
    if ($string === null) return '';
    
    // 1. ลบอักขระซ่อนเร้นที่มาจาก Excel (Zero-width space)
    $cleaned = preg_replace('/[\x{200B}-\x{200D}\x{FEFF}]/u', '', $string);
    $cleaned = str_replace("\xC2\xA0", ' ', $cleaned); 
    $cleaned = trim($cleaned);

    // 2. จัดการรหัสนักศึกษา/วิชา (ป้องกัน Excel ตัดเลข 0 ข้างหน้าทิ้ง)
    if ($type === 'student_id') {
        if (strlen($cleaned) == 8 && is_numeric($cleaned)) {
            $cleaned = '0' . $cleaned; // คืนชีพเลข 0 กลับมา
        }
    }

    // 3. จัดการชื่อ-สกุลภาษาไทย (ลบช่องว่างส่วนเกิน)
    if ($type === 'thai_name') {
        $cleaned = preg_replace('/\s+/', ' ', $cleaned);
        $cleaned = str_replace(['. ', ' .'], ['.', '.'], $cleaned);
        $cleaned = str_replace(['ผศ.ดร. ', 'อ. '], ['ผศ.ดร.', 'อ.'], $cleaned);
    }

    return $cleaned;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $importType = $_POST['importType'] ?? '';
    $file = $_FILES['file'] ?? null;

    if (!$importType || !$file || $file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400); echo json_encode(["status" => "error", "message" => "กรุณาเลือกไฟล์ให้ถูกต้อง"]); exit();
    }

    $recordCount = 0;
    $status = "success";
    $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if ($file_ext === 'csv') {
        if (($handle = fopen($file['tmp_name'], "r")) !== FALSE) {
            $pdo->beginTransaction(); 
            try {
                $last_main_project = ''; 

                while (($data = fgetcsv($handle, 2000, ",")) !== FALSE) {
                    if (empty(array_filter($data))) continue; 

                    // ---------------------------------------------------------
                    // 1. นำเข้า "รายวิชา" (ใช้ลอจิกเดิม)
                    // ---------------------------------------------------------
                    if ($importType === 'courses') {
                        $raw_subject_code = sanitizeData($data[0] ?? '');
                        if (empty($raw_subject_code) || strpos($raw_subject_code, 'รหัส') !== false) continue; 

                        $clean_subject_code = preg_replace('/\s+/', '', $raw_subject_code); 
                        $subject_name_th = sanitizeData($data[1] ?? 'ไม่ระบุชื่อวิชา', 'thai_name');
                        
                        $raw_credit = sanitizeData($data[2] ?? '0'); 
                        $parsed_credit = explode('(', $raw_credit)[0]; 
                        $clean_credit = (int) preg_replace('/[^0-9]/', '', $parsed_credit); 

                        $stmt_check = $pdo->prepare("SELECT subject_id FROM subject WHERE subject_code = ?");
                        $stmt_check->execute([$clean_subject_code]);
                        $existing_subject_id = $stmt_check->fetchColumn();

                        if ($existing_subject_id) {
                            $stmt_update = $pdo->prepare("UPDATE subject SET subject_name_th = ?, credit = ?, credit_desc = ? WHERE subject_id = ?");
                            $stmt_update->execute([$subject_name_th, $clean_credit, $raw_credit, $existing_subject_id]);
                        } else {
                            $stmt_max = $pdo->query("SELECT MAX(subject_id) FROM subject");
                            $max_id = $stmt_max->fetchColumn();
                            $next_subject_id = $max_id ? $max_id + 1 : 1;
                            $stmt_insert = $pdo->prepare("INSERT INTO subject (subject_id, subject_code, subject_name_th, credit, credit_desc) VALUES (?, ?, ?, ?, ?)");
                            $stmt_insert->execute([$next_subject_id, $clean_subject_code, $subject_name_th, $clean_credit, $raw_credit]);
                        }
                        $recordCount++;
                    } 
                    // ---------------------------------------------------------
                    // 2. นำเข้า "โครงการ/งบประมาณ" (ใช้ลอจิกเดิม)
                    // ---------------------------------------------------------
                    elseif ($importType === 'projects') {
                        $col0 = sanitizeData($data[0] ?? '');
                        if (strpos($col0, 'คณะพยาบาลศาสตร์') !== false || strpos($col0, 'ยุทธศาสตร์') !== false || strpos($col0, 'รวมยุทธศาสตร์') !== false) continue; 

                        $current_main_project = sanitizeData($data[4] ?? '', 'thai_name');
                        if (!empty($current_main_project)) {
                            $last_main_project = $current_main_project;
                        } else {
                            $current_main_project = $last_main_project;
                        }

                        $sub_activity = sanitizeData($data[5] ?? '', 'thai_name');
                        $final_project_name = $sub_activity ? $current_main_project . " - " . $sub_activity : $current_main_project;
                        if (empty($final_project_name)) continue;

                        $raw_budget = sanitizeData($data[7] ?? '0');
                        $raw_budget = str_replace(',', '', $raw_budget); 
                        $clean_budget = ($raw_budget === '-' || strpos($raw_budget, 'ไม่') !== false) ? 0 : (float) $raw_budget;

                        $stmt_proj = $pdo->prepare("INSERT INTO project (project_name_th, description) VALUES (?, ?)");
                        $stmt_proj->execute([$final_project_name, $col0]); 
                        $new_project_id = $pdo->lastInsertId();

                        $stmt_budget = $pdo->prepare("INSERT INTO project_budget_years (project_id, budget_allocated) VALUES (?, ?)");
                        $stmt_budget->execute([$new_project_id, $clean_budget]);
                        $recordCount++;
                    }
                    // ---------------------------------------------------------
                    // 3. นำเข้า "เกรดเฉลี่ยสะสม (GPA)" (ปลอดภัยต่อ PDPA)  อัปเดตใหม่ 
                    // รูปแบบไฟล์: [0] รหัสนักศึกษา, [1] ปีการศึกษา, [2] เกรดเฉลี่ยสะสม
                    // ---------------------------------------------------------
                    elseif ($importType === 'grades') {
                        $raw_student_id = sanitizeData($data[0] ?? '', 'student_id');
                        
                        // ข้ามบรรทัดหัวตาราง หรือ บรรทัดที่รหัสนักศึกษาว่างเปล่า
                        if (empty($raw_student_id) || strpos($raw_student_id, 'รหัส') !== false) continue; 

                        $academic_year = (int) sanitizeData($data[1] ?? (date('Y') + 543));
                        $gpa = (float) sanitizeData($data[2] ?? '0.00');

                        //  ป้องกันบั๊ก "เด็กผี" (หานักศึกษาไม่เจอ)
                        $stmt_check_stu = $pdo->prepare("SELECT student_id FROM student WHERE student_id = ?");
                        $stmt_check_stu->execute([$raw_student_id]);
                        
                        if (!$stmt_check_stu->fetchColumn()) {
                            // แอบสร้างนักศึกษาจำลองไว้ก่อน เพื่อไม่ให้ระบบพัง (ไปแก้ชื่อทีหลังในหน้าจัดการ User ได้)
                            $stmt_add_stu = $pdo->prepare("INSERT INTO student (student_id, first_name_th, last_name_th) VALUES (?, ?, ?)");
                            try { $stmt_add_stu->execute([$raw_student_id, 'รอปรับปรุง', 'ข้อมูลนักศึกษา']); } catch(Exception $e) { continue; }
                        }

                        // อัปเดตเฉพาะเกรดเฉลี่ยสะสม (GPA) เข้าไปที่โปรไฟล์นักศึกษาโดยตรง 
                        // *ไม่เก็บข้อมูลว่าเรียนวิชาอะไร ได้เกรดอะไร เพื่อป้องกันข้อมูลอ่อนไหวหลุด*
                        $stmt_update_gpa = $pdo->prepare("UPDATE student SET gpa = ? WHERE student_id = ?");
                        $stmt_update_gpa->execute([$gpa, $raw_student_id]);
                        
                        $recordCount++;
                    }
                }
                $pdo->commit(); 
            } catch (Exception $e) {
                $pdo->rollBack(); 
                http_response_code(500); echo json_encode(["status" => "error", "message" => "ข้อมูลในไฟล์ผิดรูปแบบ: " . $e->getMessage()]); exit();
            }
            fclose($handle);
        }
    } else {
        http_response_code(400); echo json_encode(["status" => "error", "message" => "รองรับเฉพาะไฟล์ .csv เท่านั้น"]); exit();
    }

    if ($recordCount > 0) {
        $originalName = $file['name'];
        $stmt_import = $pdo->prepare("INSERT INTO import_history (import_type, file_name, record_count, status, user_id, created_at) VALUES (?, ?, ?, 'success', ?, NOW())");
        $stmt_import->execute([$importType, $originalName, $recordCount, $user_id]);

        $shortFilename = mb_strlen($originalName) > 15 ? mb_substr($originalName, 0, 10) . "..." . mb_substr($originalName, -4) : $originalName;
        $stmt_log = $pdo->prepare("INSERT INTO audit_log (user_id, action_type, resource, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt_log->execute([$user_id, "IMPORT", $importType, "Imported {$recordCount} records from {$shortFilename}", $_SERVER['REMOTE_ADDR']]);

        echo json_encode(["status" => "success", "message" => "นำเข้าข้อมูล {$recordCount} รายการ สำเร็จเรียบร้อย!"]);
        exit();
    }
}
?>