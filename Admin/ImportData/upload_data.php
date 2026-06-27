<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin(); 
$user_id = $_SESSION['user_id']; 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");

// =========================================================
// 🛡️ ฟังก์ชันไม้ตาย: ล้างขยะและดักบั๊กจากไฟล์ Excel/CSV
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
        // ดักแก้ "ผศ. ดร. สมชาย" ให้เป็น "ผศ.ดร.สมชาย"
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

                    // =========================================================
                    // 1. นำเข้า "รายวิชา" (Courses)
                    // =========================================================
                    if ($importType === 'courses') {
                        $raw_subject_code = trim($data[0] ?? '');
                        if (empty($raw_subject_code) || strpos($raw_subject_code, 'รหัส') !== false) continue; 

                        $clean_subject_code = preg_replace('/\s+/', '', $raw_subject_code); 
                        $subject_name_th = trim($data[1] ?? 'ไม่ระบุชื่อวิชา');
                        
                        $raw_credit = trim($data[2] ?? '0'); 
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
                    // =========================================================
                    // 2. นำเข้า "โครงการ/งบประมาณ" (Projects)
                    // =========================================================
                    elseif ($importType === 'projects') {
                        $col0 = trim($data[0] ?? '');
                        if (strpos($col0, 'คณะพยาบาลศาสตร์') !== false || strpos($col0, 'ยุทธศาสตร์') !== false || strpos($col0, 'รวมยุทธศาสตร์') !== false) continue; 

                        $current_main_project = trim($data[4] ?? '');
                        if (!empty($current_main_project)) {
                            $last_main_project = $current_main_project;
                        } else {
                            $current_main_project = $last_main_project;
                        }

                        $sub_activity = trim($data[5] ?? '');
                        $final_project_name = $sub_activity ? $current_main_project . " - " . $sub_activity : $current_main_project;
                        
                        if (empty($final_project_name)) continue;

                        $raw_budget = trim($data[7] ?? '0');
                        $raw_budget = str_replace(',', '', $raw_budget); 
                        $clean_budget = ($raw_budget === '-' || strpos($raw_budget, 'ไม่') !== false) ? 0 : (float) $raw_budget;

                        $stmt_proj = $pdo->prepare("INSERT INTO project (project_name_th, description) VALUES (?, ?)");
                        $stmt_proj->execute([$final_project_name, $col0]); 
                        $new_project_id = $pdo->lastInsertId();

                        $stmt_budget = $pdo->prepare("INSERT INTO project_budget_years (project_id, budget_allocated) VALUES (?, ?)");
                        $stmt_budget->execute([$new_project_id, $clean_budget]);

                        $recordCount++;
                    }
                    // =========================================================
                    // 3. นำเข้า "ผลการเรียน/เกรด" (Grades & Enrollments)  ใหม่! 
                    // สมมติคอลัมน์ Excel: [0] รหัสนักศึกษา, [1] รหัสวิชา, [2] ปีการศึกษา, [3] เทอม, [4] เกรด
                    // =========================================================
                    elseif ($importType === 'grades') {
                        $raw_student_id = trim($data[0] ?? '');
                        if (empty($raw_student_id) || strpos($raw_student_id, 'รหัส') !== false) continue; 

                        $raw_subject_code = preg_replace('/\s+/', '', trim($data[1] ?? ''));
                        $academic_year = (int) trim($data[2] ?? (date('Y') + 543));
                        $semester = (int) trim($data[3] ?? 1);
                        
                        //  กันบั๊กพิมพ์เล็กพิมพ์ใหญ่ และช่องว่างในเกรด (เช่น ' a ' กลายเป็น 'A')
                        $grade = strtoupper(trim($data[4] ?? ''));

                        //  ป้องกันบั๊ก "เด็กผี" (หานักศึกษาไม่เจอ)
                        $stmt_check_stu = $pdo->prepare("SELECT student_id FROM student WHERE student_id = ?");
                        $stmt_check_stu->execute([$raw_student_id]);
                        if (!$stmt_check_stu->fetchColumn()) {
                            // แอบสร้างนักศึกษาจำลองไว้ก่อน เพื่อไม่ให้ระบบพัง (ไปแก้ชื่อทีหลังได้)
                            $stmt_add_stu = $pdo->prepare("INSERT INTO student (student_id, first_name_th, last_name_th) VALUES (?, ?, ?)");
                            try { $stmt_add_stu->execute([$raw_student_id, 'รอปรับปรุง', 'ข้อมูลนักศึกษา']); } catch(Exception $e) { continue; }
                        }

                        //  ป้องกันบั๊ก "วิชาล่องหน" (หารหัสวิชาไม่เจอ)
                        $stmt_check_sub = $pdo->prepare("SELECT subject_id FROM subject WHERE subject_code = ?");
                        $stmt_check_sub->execute([$raw_subject_code]);
                        $subject_id = $stmt_check_sub->fetchColumn();
                        
                        if (!$subject_id) {
                            $stmt_max = $pdo->query("SELECT MAX(subject_id) FROM subject");
                            $max_id = $stmt_max->fetchColumn();
                            $subject_id = $max_id ? $max_id + 1 : 1;
                            // แอบสร้างวิชาจำลองไว้ก่อน
                            $stmt_add_sub = $pdo->prepare("INSERT INTO subject (subject_id, subject_code, subject_name_th, credit) VALUES (?, ?, ?, ?)");
                            $stmt_add_sub->execute([$subject_id, $raw_subject_code, 'วิชารออัปเดตชื่อ', 0]);
                        }

                        // วิเคราะห์สถานะจากเกรด
                        $enroll_status = 'Active';
                        if ($grade === 'W') $enroll_status = 'Withdrawn';
                        if ($grade === 'F') $enroll_status = 'Failed';

                        //  ป้องกันบั๊ก "นำเข้าไฟล์ซ้ำ" (เช็คว่าเคยลงทะเบียนวิชานี้ในเทอมนี้ไปหรือยัง)
                        $stmt_check_enroll = $pdo->prepare("SELECT enrollment_id FROM enrollment WHERE student_id = ? AND subject_id = ? AND academic_year = ? AND semester = ?");
                        $stmt_check_enroll->execute([$raw_student_id, $subject_id, $academic_year, $semester]);
                        $enroll_id = $stmt_check_enroll->fetchColumn();

                        if ($enroll_id) {
                            // ถ้าเคยมีข้อมูลแล้ว ให้อัปเดตเกรด (ปลอดภัยเวลาเลขาฯ อัปโหลดไฟล์เกรดที่แก้ไขแล้วเข้ามาใหม่)
                            $stmt_upd = $pdo->prepare("UPDATE enrollment SET grade = ?, status = ? WHERE enrollment_id = ?");
                            $stmt_upd->execute([$grade, $enroll_status, $enroll_id]);
                        } else {
                            // ถ้าไม่เคยมี ให้ Insert ใหม่
                            $stmt_ins = $pdo->prepare("INSERT INTO enrollment (student_id, subject_id, academic_year, semester, grade, status) VALUES (?, ?, ?, ?, ?, ?)");
                            $stmt_ins->execute([$raw_student_id, $subject_id, $academic_year, $semester, $grade, $enroll_status]);
                        }
                        $recordCount++;
                    }
                }
                
                $pdo->commit(); 

            } catch (Exception $e) {
                $pdo->rollBack(); 
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "ข้อมูลในไฟล์ผิดรูปแบบ: " . $e->getMessage()]);
                exit();
            }
            fclose($handle);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "รองรับเฉพาะไฟล์ .csv เท่านั้น"]);
        exit();
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