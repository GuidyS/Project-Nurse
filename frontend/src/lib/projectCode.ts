export const getProjectCodeError = (value: string): string | null => {
  const code = value.trim();
  if (!code || [...code].length > 100 || !/^[A-Za-z0-9\u0E01-\u0E3A\u0E40-\u0E59 ._-]+$/u.test(code) || !/[A-Za-z0-9\u0E01-\u0E2E\u0E50-\u0E59]/u.test(code)) {
    return 'รหัสโครงการยาวไม่เกิน 100 ตัว รองรับไทย อังกฤษ ตัวเลข ขีด จุด ขีดล่าง และช่องว่าง';
  }
  return null;
};
