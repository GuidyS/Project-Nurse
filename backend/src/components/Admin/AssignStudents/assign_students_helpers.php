<?php
/**
 * ตัวช่วยสำหรับหน้า "จัดการนักศึกษา" (มอบหมายนักศึกษาให้อาจารย์)
 *
 * เก็บข้อมูลในตาราง student_advisor_mapping เดิม โดยใช้คอลัมน์ advisor_type แยกประเภท
 *  - advisor   = อาจารย์ที่ปรึกษา   จำกัด 12 คน/อาจารย์ 1 ท่าน
 *  - practical = อาจารย์ปฏิบัติ     จำกัด 8 คน/อาจารย์ 1 ท่าน
 *
 * ข้อมูลเดิมที่เป็น 'หลัก' ถือเป็นอาจารย์ที่ปรึกษา (ของเดิมในระบบก่อนแยกประเภท)
 */

/** ประเภทอาจารย์ที่มอบหมายได้ + โควตา + ตำแหน่งที่จะให้อัตโนมัติ */
function assignStudentsTypes(): array
{
    return [
        'advisor' => [
            'label' => 'อาจารย์ที่ปรึกษา',
            'limit' => 12,
            'position_id' => 3, // อาจารย์ที่ปรึกษา
            'legacy' => ['หลัก'],
        ],
        'practical' => [
            'label' => 'อาจารย์ปฏิบัติ',
            'limit' => 8,
            'position_id' => 4, // อาจารย์ปฏิบัติ
            'legacy' => [],
        ],
    ];
}

function assignStudentsResolveType(?string $type): array
{
    $types = assignStudentsTypes();
    if ($type === null || !isset($types[$type])) {
        throw new InvalidArgumentException('ประเภทอาจารย์ไม่ถูกต้อง (ต้องเป็น advisor หรือ practical)');
    }

    return $types[$type] + ['key' => $type];
}

/** ค่า advisor_type ทั้งหมดที่นับเป็นประเภทนี้ (รวมค่าเดิมในระบบ) */
function assignStudentsTypeValues(array $type): array
{
    return array_merge([$type['key']], $type['legacy']);
}

/** เงื่อนไข SQL สำหรับกรองตามประเภท คืน [sqlFragment, params] */
function assignStudentsTypeCondition(array $type, string $alias = 'sam', string $prefix = 't'): array
{
    $values = assignStudentsTypeValues($type);
    $placeholders = [];
    $params = [];
    foreach ($values as $i => $value) {
        $key = ":{$prefix}{$i}";
        $placeholders[] = $key;
        $params[$key] = $value;
    }

    return ["$alias.advisor_type IN (" . implode(',', $placeholders) . ")", $params];
}

/**
 * ให้ตำแหน่งกับอาจารย์อัตโนมัติเมื่อได้รับมอบหมายนักศึกษาครั้งแรก
 * @return bool true = เพิ่งให้ตำแหน่งไปในรอบนี้
 */
function assignStudentsGrantPosition(PDO $db, string $facultyId, int $positionId): bool
{
    // ระบบผูก faculty_id ไว้กับ users.username
    $stmt = $db->prepare("SELECT user_id FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$facultyId]);
    $userId = $stmt->fetchColumn();

    if (!$userId) {
        return false; // อาจารย์ท่านนี้ยังไม่มีบัญชีผู้ใช้ในระบบ
    }

    $check = $db->prepare("SELECT COUNT(*) FROM user_position WHERE user_id = ? AND position_id = ?");
    $check->execute([$userId, $positionId]);
    if ((int)$check->fetchColumn() > 0) {
        return false; // มีตำแหน่งนี้อยู่แล้ว
    }

    $insert = $db->prepare("INSERT INTO user_position (user_id, position_id, is_primary) VALUES (?, ?, 0)");
    $insert->execute([$userId, $positionId]);

    return true;
}
