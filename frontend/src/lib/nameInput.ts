/**
 * บังคับภาษาของช่องกรอกชื่อ-นามสกุล (ต้องตรงกับ backend/src/config/name_validation.php)
 *  - ช่องภาษาไทย  : อักษรไทย เว้นวรรค และ . - '
 *  - ช่องภาษาอังกฤษ: A-Z a-z เว้นวรรค และ . - '
 * ตัวอักษรที่ไม่ตรงภาษาจะถูกตัดออกตั้งแต่ตอนพิมพ์
 */

const THAI_ALLOWED = /[^฀-๿\s.\-']/g;
const ENGLISH_ALLOWED = /[^A-Za-z\s.\-']/g;

export const onlyThai = (value: string) => value.replace(THAI_ALLOWED, "");

export const onlyEnglish = (value: string) => value.replace(ENGLISH_ALLOWED, "");

export const isThaiName = (value?: string | null) => !value || !THAI_ALLOWED.test(value);

export const isEnglishName = (value?: string | null) => !value || !ENGLISH_ALLOWED.test(value);
