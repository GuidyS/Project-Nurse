import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/academicYear.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { getAcademicYear, academicYearOptions, syncAcademicClock, getCurrentAcademicYear } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const cases = [
  ["2026-03-31T23:59:59+07:00", 2568],
  ["2026-04-01T00:00:00+07:00", 2569],
  ["2027-01-01T00:00:00+07:00", 2569],
  ["2027-04-01T00:00:00+07:00", 2570],
  ["2026-03-31T16:59:59Z", 2568],
  ["2026-03-31T17:00:00Z", 2569],
  ["2026-03-31T10:00:00-07:00", 2569],
  ["2028-02-29T12:00:00+07:00", 2570],
];
for (const timezone of ["UTC", "Asia/Bangkok", "America/Los_Angeles"]) {
  test(`April boundary is independent of browser timezone: ${timezone}`, () => {
    process.env.TZ = timezone;
    for (const [date, expected] of cases) assert.equal(getAcademicYear(new Date(date)), expected, date);
  });
}
test("year options include the current empty year and every historical year", () => {
  assert.deepEqual(academicYearOptions(["2561", 2568, "2568", "invalid"], 2569), ["2569", "2568", "2561"]);
  assert.deepEqual(academicYearOptions([], 2569), ["2569"]);
});
test("server time overrides a different workstation year", () => {
  syncAcademicClock("2030-04-01T12:00:00+07:00");
  assert.equal(getCurrentAcademicYear(), 2573);
  assert.throws(() => syncAcademicClock("invalid"));
});
