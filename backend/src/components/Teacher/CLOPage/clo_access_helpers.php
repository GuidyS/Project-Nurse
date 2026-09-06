<?php
/**
 * ตัวช่วยตรวจสิทธิ์การเข้าถึง CLO รายวิชา
 *
 * กติกา
 *  - admin (role_id = 1) แก้ไขได้ทุกวิชา และเป็น role เดียวที่แก้ YLO / Sub PLO ของหลักสูตรได้
 *  - อาจารย์ท่านอื่นแก้ไข CLO ได้เฉพาะวิชาที่ตนเองเป็นผู้สอน (curriculum_subject_meta.instructor_id)
 */

if (!function_exists('cloAccessRoleId')) {
    /** role_id ของผู้ใช้ที่ล็อกอินอยู่ (null ถ้าไม่มี) */
    function cloAccessRoleId(PDO $db, $userId): ?int
    {
        $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $roleId = $stmt->fetchColumn();

        return $roleId === false || $roleId === null ? null : (int)$roleId;
    }
}

if (!function_exists('cloAccessIsAdmin')) {
    function cloAccessIsAdmin(PDO $db, $userId): bool
    {
        return cloAccessRoleId($db, $userId) === 1;
    }
}

if (!function_exists('cloAccessFacultyId')) {
    /** faculty_id ของผู้ใช้ (ระบบเก็บ faculty_id ไว้ในคอลัมน์ users.username) */
    function cloAccessFacultyId(PDO $db, $userId): ?string
    {
        $stmt = $db->prepare("SELECT username FROM users WHERE user_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $username = $stmt->fetchColumn();

        return $username === false || $username === null || $username === '' ? null : (string)$username;
    }
}

if (!function_exists('cloAccessMySubjectCodes')) {
    /**
     * รหัสวิชาที่ผู้ใช้คนนี้เป็นผู้สอน
     * อ่านจากตาราง curriculum_* ก่อน ถ้ายังไม่มีข้อมูลจึงถอยไปอ่าน mapping_json
     */
    function cloAccessMySubjectCodes(PDO $db, $userId): array
    {
        $facultyId = cloAccessFacultyId($db, $userId);
        if ($facultyId === null) {
            return [];
        }

        $frameworkId = getActiveFrameworkId($db);
        if ($frameworkId && curriculumTablesReady($db) && curriculumHasRelationalData($db, $frameworkId)) {
            return getInstructorSubjectCodes($db, $frameworkId, $facultyId);
        }

        $codes = [];
        $mappingData = loadActiveMappingData($db);
        foreach ($mappingData['subject_mappings'] ?? [] as $code => $data) {
            if (isset($data['instructor_id']) && (string)$data['instructor_id'] === $facultyId) {
                $codes[] = (string)$code;
            }
        }

        return $codes;
    }
}

if (!function_exists('cloAccessCanEditSubject')) {
    /** แก้ CLO ของวิชานี้ได้ไหม (admin ได้ทุกวิชา / อาจารย์ได้เฉพาะวิชาตัวเอง) */
    function cloAccessCanEditSubject(PDO $db, $userId, string $subjectCode): bool
    {
        if (cloAccessIsAdmin($db, $userId)) {
            return true;
        }

        return in_array($subjectCode, cloAccessMySubjectCodes($db, $userId), true);
    }
}

if (!function_exists('cloAccessDenySubject')) {
    /** ตอบ 403 แล้วจบการทำงาน เมื่อไม่มีสิทธิ์แก้วิชานั้น */
    function cloAccessDenySubject(string $subjectCode): void
    {
        http_response_code(403);
        echo json_encode([
            "status" => "error",
            "message" => "คุณไม่ได้เป็นผู้สอนรายวิชา $subjectCode จึงไม่สามารถแก้ไข CLO ของวิชานี้ได้",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}

if (!function_exists('cloAccessRequireAdmin')) {
    /** ใช้กับ endpoint ที่ต้องเป็น admin เท่านั้น (แก้ YLO / Sub PLO ของหลักสูตร) */
    function cloAccessRequireAdmin(PDO $db, $userId): void
    {
        if (cloAccessIsAdmin($db, $userId)) {
            return;
        }

        http_response_code(403);
        echo json_encode([
            "status" => "error",
            "message" => "เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไข YLO / Sub PLO ของหลักสูตรได้",
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}
