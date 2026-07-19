/** Shared client-side password policy (must match backend validatePasswordPolicy). */

const WEAK_PASSWORDS = new Set([
  "123456789012",
  "1234567890123",
  "password1234",
  "password12345",
  "qwerty123456",
  "abcdefghijk1",
  "111111111111",
  "000000000000",
  "admin1234567",
  "welcome12345",
  "nurse1234567",
]);

export const PASSWORD_POLICY_HINT =
  "อย่างน้อย 12 ตัวอักษร และมีทั้งตัวอักษรกับตัวเลข";

export function validatePasswordPolicy(password: string): string | null {
  if (password.length < 12) {
    return "รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร";
  }
  if (!/[A-Za-z\u0E00-\u0E7F]/.test(password) || !/[0-9]/.test(password)) {
    return "รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข";
  }
  if (/^(.)\1+$/u.test(password)) {
    return "รหัสผ่านต้องไม่เป็นตัวอักษรซ้ำทั้งหมด";
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return "รหัสผ่านนี้เดาง่ายเกินไป กรุณาตั้งรหัสที่ซับซ้อนกว่านี้";
  }
  return null;
}
