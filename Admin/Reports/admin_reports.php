<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_middleware.php'; 
requireLogin(); 

$pdo = new PDO("mysql:host=db;dbname=MYSQL_DATABASE;charset=utf8mb4", "MYSQL_USER", "MYSQL_PASSWORD");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$action = $_GET['action'] ?? '';

// =========================================================================
// 1. ส่งข้อมูลสถิติและเทมเพลตกลับไปให้หน้า Frontend (get_templates)
// =========================================================================
if ($action === 'get_templates') {
    try {
        // ดึงสถิติจริงจาก Database
        $stmt_total_proj = $pdo->query("SELECT COUNT(*) FROM project");
        $total_projects = $stmt_total_proj->fetchColumn();

        $stmt_total_budget = $pdo->query("SELECT SUM(budget_allocated) FROM project_budget_years");
        $total_budget = $stmt_total_budget->fetchColumn() ?: 0;

        $response = [
            "status" => "success",
            "data" => [
                "stats" => [
                    "total" => $total_projects, // จำนวนโครงการทั้งหมด
                    "downloaded" => number_format($total_budget), // ประยุกต์ใช้แสดงยอดเงินรวม
                    "pending" => 0, 
                    "errors" => 0
                ],
                "templates" => [
                    ["id" => "1", "name" => "รายงานการคงอยู่ของนักศึกษา", "description" => "วิเคราะห์อัตราการคงอยู่และสาเหตุการพ้นสภาพ", "category" => "KPI", "iconName" => "TrendingUp", "lastGenerated" => date("Y-m-d")],
                    ["id" => "2", "name" => "รายงานสรุปงบแผนคณะฯ ตามยุทธศาสตร์", "description" => "สรุปงบประมาณแยกตามยุทธศาสตร์ที่ 1-5", "category" => "โครงการ/ยุทธศาสตร์", "iconName" => "PieChart", "lastGenerated" => date("Y-m-d")],
                    ["id" => "3", "name" => "รายงานสรุปผลการเรียน (เกรดเฉลี่ย)", "description" => "สรุปผลสัมฤทธิ์การศึกษาแยกตามชั้นปี", "category" => "การศึกษา", "iconName" => "BookOpen", "lastGenerated" => date("Y-m-d")]
                ]
            ]
        ];
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// =========================================================================
// 2. สร้างไฟล์รายงานของจริง (generate)
// =========================================================================
if ($action === 'generate') {
    $data = json_decode(file_get_contents("php://input"), true);
    $reportName = $data['reportName'] ?? '';

    // 💡 ถ้าคณบดีกดโหลด "รายงานสรุปงบแผนคณะฯ ตามยุทธศาสตร์"
    if (strpos($reportName, 'ยุทธศาสตร์') !== false) {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="Report_Strategy_Budget.csv"');
        $output = fopen('php://output', 'w');
        fputs($output, "\xEF\xBB\xBF"); // 🛡️ เติม BOM กันบั๊กภาษาไทยต่างดาวใน Excel

        fputcsv($output, ['กลุ่มยุทธศาสตร์', 'จำนวนโครงการ/กิจกรรม', 'งบประมาณรวม (บาท)']);

        // 🚀 SQL ขั้นเทพ: จัดกลุ่มยุทธศาสตร์และรวมเงิน (GROUP BY & SUM)
        $sql = "
            SELECT 
                p.description AS strategy_name,
                COUNT(p.project_id) AS total_projects,
                SUM(pb.budget_allocated) AS total_budget
            FROM project p
            LEFT JOIN project_budget_years pb ON p.project_id = pb.project_id
            WHERE p.description LIKE '%ยุทธศาสตร์%'
            GROUP BY p.description
            ORDER BY p.description ASC
        ";
        $stmt = $pdo->query($sql);
        
        $grand_total = 0;
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            fputcsv($output, [$row['strategy_name'], $row['total_projects'], number_format($row['total_budget'], 2)]);
            $grand_total += $row['total_budget'];
        }
        fputcsv($output, ['รวมทั้งสิ้น', '', number_format($grand_total, 2)]);
        fclose($output);
        exit();
    }
    
    echo json_encode(["status" => "success", "message" => "สร้างรายงาน $reportName สำเร็จ"]);
    exit();
}
?>