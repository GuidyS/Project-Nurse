/**
 * บังคับภาษาของช่องกรอกชื่อ-นามสกุล (ต้องตรงกับ backend/src/config/name_validation.php)
 *  - ช่องภาษาไทย: อักษรไทย เว้นวรรค และ . - '
 * ตัวอักษรที่ไม่ตรงภาษาจะถูกตัดออกตั้งแต่ตอนพิมพ์
 */

const THAI_ALLOWED = /[^฀-๿\s.\-']/g;

export const onlyThai = (value: string) => value.replace(THAI_ALLOWED, "");

export const isThaiName = (value?: string | null) => !value || !THAI_ALLOWED.test(value);
