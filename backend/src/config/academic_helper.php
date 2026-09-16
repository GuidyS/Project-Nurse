<?php
/**
 * บันทึกประวัติการใช้งานระบบ (Audit Log)
 * เรียกใช้ทุกครั้งหลัง insert/update/delete สำเร็จ ในทุกไฟล์ CRUD ทุก role
 *
 * @param PDO         $db         instance ของ Connect/PDO ที่เปิดอยู่แล้วในไฟล์ที่เรียก
 * @param int|string  $userId     user_id ของผู้กระทำ (จาก $_SESSION['user_id'])
 * @param string      $actionType 'create' | 'update' | 'delete' | 'role_change'
 * @param string      $resource   ชื่อฟีเจอร์ที่กระทำ เช่น 'portfolio', 'student_vaccinations'
 * @param string      $details    รายละเอียดที่อ่านเข้าใจได้ เช่น 'ลบผลงาน: ใบประกาศนียบัตร IELTS'
 */
function logAudit(PDO $db, $userId, string $actionType, string $resource, string $details = ''): void {
    try {
        // รองรับกรณีอยู่หลัง Reverse Proxy หรือ Docker Network
        $ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if ($ipAddress && strpos($ipAddress, ',') !== false) {
            $ipAddress = trim(explode(',', $ipAddress)[0]);
        }

        $stmt = $db->prepare("
            INSERT INTO audit_log (user_id, action_type, resource, details, ip_address, created_at)
            VALUES (:user_id, :action_type, :resource, :details, :ip_address, NOW())
        ");
        $stmt->execute([
            ':user_id'     => $userId,
            ':action_type' => $actionType,
            ':resource'    => $resource,
            ':details'     => $details,
            ':ip_address'  => $ipAddress,
        ]);
    } catch (Exception $e) {
        // ไม่ให้กระทบการทำงานหลักของระบบหากบันทึก Log ล้มเหลว
        error_log('logAudit failed: ' . $e->getMessage());
    }
}