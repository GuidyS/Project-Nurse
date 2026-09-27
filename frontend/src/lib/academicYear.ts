/** Academic years start on April 1 in Bangkok, independently of the browser timezone. */
export function getAcademicYear(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok", year: "numeric", month: "numeric",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  return year + 543 - (month < 4 ? 1 : 0);
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
