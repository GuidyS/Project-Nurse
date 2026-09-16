<?php
/**
 * บันทึกประวัติการใช้งานระบบ (Audit Log)
 * เรียกใช้ทุกครั้งหลัง insert/update/delete สำเร็จ ในทุกไฟล์ CRUD ทุก role
 *
 * @param PDO         $db         instance ของ Connect ที่เปิดอยู่แล้วในไฟล์ที่เรียก
 * @param int|string  $userId     user_id ของผู้กระทำ (จาก $_SESSION['user_id'])
 * @param string      $actionType 'create' | 'update' | 'delete' | 'role_change'
 * @param string      $resource   ชื่อ resource/ฟีเจอร์ที่กระทำ เช่น 'portfolio', 'student_vaccinations'
 * @param string      $details    รายละเอียดสั้นๆ ที่มนุษย์อ่านแล้วเข้าใจ เช่น 'ลบผลงาน: ใบประกาศนียบัตร IELTS'
 */
function logAudit(PDO $db, $userId, string $actionType, string $resource, string $details = ''): void {
    try {
        // รองรับกรณีอยู่หลัง reverse proxy/load balancer ที่ REMOTE_ADDR อาจเป็น IP ของ proxy เอง
        $ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? null;
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
        // การบันทึก audit log ล้มเหลว ต้องไม่ทำให้ request หลัก (save/delete จริง) พังไปด้วย
        // แค่บันทึกไว้ใน server log เงียบๆ พอ ไม่ throw ต่อ
        error_log('logAudit failed: ' . $e->getMessage());
    }
}