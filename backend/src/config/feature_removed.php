<?php
// Retired endpoints must never connect to the database or mutate records.
http_response_code(410);
header('Content-Type: application/json; charset=UTF-8');
echo json_encode(['status' => 'error', 'message' => 'ฟังก์ชันนี้ยุติการใช้งานแล้ว'], JSON_UNESCAPED_UNICODE);
exit;
