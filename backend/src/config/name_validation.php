<?php
/**
 * ตรวจภาษาของชื่อ-นามสกุล
 *  - ช่องภาษาไทย  : ใส่ได้เฉพาะอักษรไทย เว้นวรรค และ . - '
 *  - ช่องภาษาอังกฤษ: ใส่ได้เฉพาะ A-Z a-z เว้นวรรค และ . - '
 * ปล่อยค่าว่างผ่านได้ (ไม่บังคับกรอก)
 */

const NAME_THAI_PATTERN = '/^[\p{Thai}\s.\-\']+$/u';
const NAME_ENGLISH_PATTERN = '/^[A-Za-z\s.\-\']+$/u';

function nameIsThai(?string $value): bool
{
    $value = trim((string)$value);
    return $value === '' || preg_match(NAME_THAI_PATTERN, $value) === 1;
}

function nameIsEnglish(?string $value): bool
{
    $value = trim((string)$value);
    return $value === '' || preg_match(NAME_ENGLISH_PATTERN, $value) === 1;
}

/**
 * ตรวจชุดชื่อทั้งหมดที่ส่งมา (เฉพาะคีย์ที่มีอยู่จริงใน $data)
 * @throws InvalidArgumentException ถ้าภาษาไม่ตรงกับช่อง
 */
function nameAssertLanguages(array $data): void
{
    $thaiFields = [
        'title' => 'คำนำหน้า',
        'first_name_th' => 'ชื่อภาษาไทย',
        'last_name_th' => 'นามสกุลภาษาไทย',
    ];
    $englishFields = [
        'first_name_en' => 'ชื่อภาษาอังกฤษ',
        'last_name_en' => 'นามสกุลภาษาอังกฤษ',
    ];

    foreach ($thaiFields as $field => $label) {
        if (array_key_exists($field, $data) && !nameIsThai($data[$field])) {
            throw new InvalidArgumentException("{$label} ต้องเป็นภาษาไทยเท่านั้น");
        }
    }
    foreach ($englishFields as $field => $label) {
        if (array_key_exists($field, $data) && !nameIsEnglish($data[$field])) {
            throw new InvalidArgumentException("{$label} ต้องเป็นภาษาอังกฤษเท่านั้น");
        }
    }
}
