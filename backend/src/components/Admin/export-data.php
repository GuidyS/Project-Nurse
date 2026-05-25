<?php
require_once __DIR__ . '/../../config/config.php';

// นำเข้าเครื่องมือสร้าง Excel
require_once __DIR__ . '/../../vendor/autoload.php'; 
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['category'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"]);
    exit;
}

$category = $data['category'];
$format = $data['format'] ?? 'csv';
$fields = $data['fields'] ?? [];
$academicYear = $data['academicYear'] ?? '2568';

try {
    $db = new Connect();
    
    // เตรียมข้อมูลจาก Database
    $exportData = [];
    if ($category === 'students') {
        $stmt = $db->query("SELECT student_id, first_name_th, last_name_th FROM student ORDER BY student_id ASC");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $exportData[] = [
                $row['student_id'],
                $row['first_name_th'] . ' ' . $row['last_name_th'],
                'พยาบาลศาสตร์', 'พยาบาลศาสตร์' // ข้อมูลจำลอง
            ];
        }
    } else if ($category === 'teachers') {
        $stmt = $db->query("SELECT faculty_id, first_name_th, last_name_th FROM faculty ORDER BY faculty_id ASC");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $exportData[] = [
                $row['faculty_id'],
                $row['first_name_th'] . ' ' . $row['last_name_th'],
                'อาจารย์'
            ];
        }
    }

    // 🌟 กรณีส่งออกเป็น Excel (.xlsx)
    if ($format === 'xlsx') {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // ใส่หัวตาราง
        $colIndex = 1;
        foreach ($fields as $field) {
            $sheet->setCellValue([$colIndex, 1], $field); // 👈 แก้ตรงนี้
            $colIndex++;
        }
        
        // ใส่ข้อมูล
        $rowIndex = 2;
        foreach ($exportData as $rowData) {
            $colIndex = 1;
            foreach ($rowData as $value) {
                $sheet->setCellValue([$colIndex, $rowIndex], $value); // 👈 แก้ตรงนี้
                $colIndex++;
            }
            $rowIndex++;
        }

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="export_data_'.$academicYear.'.xlsx"');
        header('Cache-Control: max-age=0');
        
        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    } 
    // 🌟 กรณีส่งออกเป็น CSV 
    else {
        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="export_data_'.$academicYear.'.csv"');
        
        $output = fopen('php://output', 'w');
        fputs($output, "\xEF\xBB\xBF"); // แก้ภาษาไทยเพี้ยน
        fputcsv($output, $fields);
        
        foreach ($exportData as $rowData) {
            fputcsv($output, $rowData);
        }
        fclose($output);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}