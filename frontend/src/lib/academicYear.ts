/**
 * ปีการศึกษาเริ่มนับที่ "วันเปิดภาคการศึกษาที่ 1" ซึ่งผู้ดูแลระบบตั้งค่าได้
 * ค่าเริ่มต้นคือ 15 สิงหาคม และเซิร์ฟเวอร์จะส่งค่าจริงมาให้ตอนโหลดปฏิทิน
 * (คิดตามเวลาไทยเสมอ ไม่ขึ้นกับ timezone ของเครื่องผู้ใช้)
 */
export interface AcademicBoundary {
  month: number;
  day: number;
}

const DEFAULT_BOUNDARY: AcademicBoundary = { month: 8, day: 15 };
let boundary: AcademicBoundary = DEFAULT_BOUNDARY;

export function syncAcademicBoundary(next: AcademicBoundary | undefined | null): void {
  if (!next) return;
  const month = Number(next.month);
  const day = Number(next.day);
  if (!Number.isInteger(month) || !Number.isInteger(day)) return;
  if (month < 1 || month > 12 || day < 1 || day > 31) return;
  boundary = { month, day };
}

export function getAcademicBoundary(): AcademicBoundary {
  return boundary;
}

export function getAcademicYear(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok", year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const today = month * 100 + day;
  const start = boundary.month * 100 + boundary.day;
  return year + 543 - (today < start ? 1 : 0);
}

let serverClock: { timestamp: number; receivedAt: number } | undefined;

export function syncAcademicClock(serverNow: string): void {
  const timestamp = Date.parse(serverNow);
  if (!Number.isFinite(timestamp)) throw new Error("Invalid academic calendar response");
  serverClock = { timestamp, receivedAt: performance.now() };
}

export function academicNow(): Date {
  return new Date(serverClock
    ? serverClock.timestamp + performance.now() - serverClock.receivedAt
    : Date.now());
}

export function getCurrentAcademicYear(): number {
  return getAcademicYear(academicNow());
}

export function academicYearOptions(existing: Array<string | number>, current: number): string[] {
  return [...new Set([...existing, current].map(Number))]
    .filter((year) => Number.isInteger(year) && year >= 2500 && year <= 2700)
    .sort((a, b) => b - a).map(String);
}
