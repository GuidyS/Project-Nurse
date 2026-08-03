/** Shared client-side password policy (must match backend validatePasswordPolicy). */

const WEAK_PASSWORDS = new Set([
  "12345678",
  "password",
  "qwerty12",
  "abcdefgh",
  "11111111",
  "00000000",
  "admin123",
  "nurse123",
]);

export const PASSWORD_POLICY_HINT =
  "อย่างน้อย 8 ตัวอักษร และควรมีทั้งตัวอักษรกับตัวเลข";

export function validatePasswordPolicy(password: string): string | null {
  if (password.length < 8) {
    return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return "รหัสผ่านนี้เดาง่ายเกินไป กรุณาตั้งรหัสที่ซับซ้อนกว่านี้";
  }
  return null;
}
