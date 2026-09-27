import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, timezoneId: 'America/Los_Angeles', acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const requests = [];
let serverNow = '2026-04-01T12:00:00+07:00';
const output = process.env.TEST_ARTIFACTS || path.resolve('tests/artifacts');
mkdirSync(output, { recursive: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
await context.route('**/index.php?**', async route => {
  const url = new URL(route.request().url());
  const endpoint = url.searchParams.get('page');
  let body = { status: 'success', data: [] };
  let status = 200;
  if (endpoint === 'academic-calendar') body.data = { serverNow, academicYear: 2569 };
  if (endpoint === 'profile') body.data = { role_id: 1, position_id: 1, username: 'test-admin', name: 'Test Admin', permissions: [] };
  if (endpoint === 'admin-reports') {
    const search = url.searchParams.get('search') || '';
    const year = url.searchParams.get('year');
    requests.push({ endpoint, search, year });
    await sleep(search === 'slow' ? 900 : 120);
    if (search === 'error') { status = 500; body = { status: 'error', message: 'Simulated failure' }; }
    else {
      const rows = search === 'empty' ? [] : Array.from({ length: 12 }, (_, i) => ({
        id: `fixture-${i}`, academicYear: year, strategy: 'ยุทธศาสตร์ทดสอบ', projectCode: `TEST-${i}`,
        projectName: `โครงการจำลอง ${search || 'เริ่มต้น'} ${i}`, rowType: 'project',
        proposedBudget: { test: { amount: 100 } }, actualBudget: {}, approvalStatus: 'approved',
      }));
      body.data = {
        academicYear: year, availableFilters: { academicYears: ['2568', '2561'], strategies: ['ยุทธศาสตร์ทดสอบ'], responsiblePeople: [] },
        rows, budgetSources: [{ key: 'test', label: 'งบทดสอบ' }],
        summary: { totalProjects: rows.length, totalActivities: 0, proposedTotal: rows.length * 100, actualTotal: 0, balance: rows.length * 100, completeDocuments: 0 },
        strategySummaries: [], budgetBreakdown: [],
      };
    }
  }
  if (endpoint === 'get-project') {
    const search = url.searchParams.get('search') || '';
    requests.push({ endpoint, search });
    await sleep(search === 'slow' ? 900 : 120);
    body = { status: 'success', academicYears: [2569, 2561], data: [{ project_id: 1, project_name_th: `โครงการจำลอง ${search || 'เริ่มต้น'}`, project_name_en: '', description: '', project_type: 'academic_service', academic_year: 2561, status: 'pending', member_details: [], member_names: [], member_faculty_ids: [] }] };
  }
  if (endpoint === 'get-documents') body.data = { documents: [], courses: [] };
  if (endpoint === 'export-years') body.data = { students: [2569, 2559], projects: [2569, 2561] };
  try { await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }); } catch { /* canceled requests are expected */ }
});
try {
  await page.goto('http://localhost:5173/?previewRole=admin&page=reports');
  const search = page.getByPlaceholder('ค้นหารหัส/ชื่อโครงการ/กิจกรรม');
  await search.waitFor();
  const exportButton = page.getByRole('button', { name: 'ส่งออก CSV' });
  await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(b => b.textContent.includes('ส่งออก CSV'))?.disabled);
  assert.match(await page.getByRole('combobox').first().innerText(), /2569/);
  await search.focus();
  await page.evaluate(() => window.scrollTo(0, 100));
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const before = await search.boundingBox();
  const count = requests.length;
  await search.pressSequentially('ทดสอบ ABC', { delay: 25 });
  assert.equal(await exportButton.isDisabled(), true);
  await sleep(700);
  assert.equal(requests.length - count, 1, 'typing burst should send one request');
  assert.equal(await search.inputValue(), 'ทดสอบ ABC');
  assert.equal(await search.evaluate(el => el === document.activeElement), true);
  assert.equal((await search.boundingBox()).y, before.y, 'search field must not shift');
  assert.equal(await page.evaluate(() => window.scrollY), scrollBefore, 'search must preserve scroll');
  await search.fill('slow');
  await sleep(380);
  await search.fill('latest');
  await sleep(1250);
  assert.equal(await page.getByText('โครงการจำลอง latest 0', { exact: true }).count(), 1);
  assert.equal(await page.getByText('โครงการจำลอง slow 0', { exact: true }).count(), 0);
  assert.equal(await search.evaluate(el => el === document.activeElement), true);
  const downloadPromise = page.waitForEvent('download');
  await exportButton.click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /2569/);
  await download.saveAs(path.join(output, 'report-fixture.csv'));
  assert.match(readFileSync(path.join(output, 'report-fixture.csv'), 'utf8'), /latest/);
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: 'ปีการศึกษา 2561', exact: true }).click();
  await sleep(300);
  serverNow = '2027-04-01T12:00:00+07:00';
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await sleep(400);
  assert.match(await page.getByRole('combobox').first().innerText(), /2561/, 'explicit historical selection must survive clock sync');
  await search.fill('empty');
  await sleep(600);
  assert.equal(await page.locator('tbody tr').filter({ hasText: 'โครงการจำลอง' }).count(), 0);
  await search.fill('error');
  await sleep(600);
  assert.equal(await exportButton.isDisabled(), true, 'failed refresh must not export stale rows');
  assert.match(await page.getByRole('status').first().innerText(), /ผลลัพธ์ยังไม่พร้อม/);
  await search.fill('');
  await sleep(600);
  await page.screenshot({ path: path.join(output, 'reports.png'), fullPage: false });
  console.log('PASS: Reports debounce, focus, layout, race, CSV, historic selection, empty/error recovery');

  await page.goto('http://localhost:5173/?previewRole=admin&page=projectspage');
  const projectSearch = page.getByPlaceholder(/ค้นหา.*โครงการ/).first();
  await projectSearch.waitFor();
  await sleep(500);
  await projectSearch.fill('slow');
  await sleep(380);
  await projectSearch.fill('latest');
  await sleep(1250);
  assert.equal(await page.getByText('โครงการจำลอง latest', { exact: true }).count(), 1);
  assert.equal(await page.getByText('โครงการจำลอง slow', { exact: true }).count(), 0);
  assert.equal(await projectSearch.evaluate(el => el === document.activeElement), true);
  await page.getByRole('button', { name: 'สร้างโครงการใหม่', exact: true }).click();
  assert.equal(await page.locator('input[type=number]').first().inputValue(), '2570');
  await page.screenshot({ path: path.join(output, 'project-create.png'), fullPage: false });
  console.log('PASS: Projects out-of-order responses, focus and server-derived new project year');

  await page.goto('http://localhost:5173/?previewRole=admin&page=export-data');
  await page.getByText('ข้อมูลโครงการ', { exact: true }).click();
  await sleep(350);
  await page.getByRole('combobox').first().click();
  assert.equal(await page.getByRole('option', { name: '2561', exact: true }).count(), 1);
  await page.keyboard.press('Escape');
  await page.getByText('ข้อมูลนักศึกษา', { exact: true }).click();
  assert.equal(await page.getByText('ปีที่เข้าศึกษา', { exact: true }).count() > 0, true);
  await page.getByRole('combobox').first().click();
  assert.equal(await page.getByRole('option', { name: '2559', exact: true }).count(), 1);
  await page.keyboard.press('Escape');
  console.log('PASS: Export historical years and separate admission-year label');

  await page.goto('http://localhost:5173/?previewRole=teacher&page=documents');
  await sleep(500);
  await page.getByRole('button', { name: /อัปโหลด/ }).first().click();
  assert.equal(await page.getByRole('dialog').locator('input').evaluateAll(inputs => inputs.some(el => el.value === '2570')), true);
  serverNow = '2028-04-01T12:00:00+07:00';
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await sleep(350);
  assert.equal(await page.getByRole('dialog').locator('input').evaluateAll(inputs => inputs.some(el => el.value === '2570')), true, 'open draft year must not change');
  console.log('PASS: Teacher document default year and draft preservation');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/?previewRole=admin&page=reports');
  const mobileSearch = page.getByPlaceholder('ค้นหารหัส/ชื่อโครงการ/กิจกรรม');
  await mobileSearch.waitFor();
  await sleep(400);
  await mobileSearch.focus();
  const mobileY = (await mobileSearch.boundingBox()).y;
  await mobileSearch.fill('mobile');
  await sleep(650);
  assert.equal((await mobileSearch.boundingBox()).y, mobileY);
  assert.equal(await mobileSearch.evaluate(el => el === document.activeElement), true);
  await page.screenshot({ path: path.join(output, 'reports-mobile.png') });
  console.log('PASS: Mobile search layout and focus');

  await page.setViewportSize({ width: 1440, height: 1100 });
  serverNow = '2026-03-31T23:59:59+07:00';
  await page.clock.install({ time: new Date(serverNow) });
  await page.clock.pauseAt(new Date(serverNow));
  await page.goto('http://localhost:5173/?previewRole=admin&page=reports');
  await sleep(500);
  assert.match(await page.getByRole('combobox').first().innerText(), /2568/);
  serverNow = '2026-04-01T00:00:02+07:00';
  await page.clock.runFor(3000);
  await sleep(300);
  assert.match(await page.getByRole('combobox').first().innerText(), /2569/, 'default year must roll over without reloading');
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: 'ปีการศึกษา 2561', exact: true }).click();
  serverNow = '2027-04-01T00:00:02+07:00';
  await page.clock.runFor(61000);
  await sleep(300);
  assert.match(await page.getByRole('combobox').first().innerText(), /2561/);
  await page.getByRole('combobox').first().click();
  assert.equal(await page.getByRole('option', { name: 'ปีการศึกษา 2570', exact: true }).count(), 1);
  await page.keyboard.press('Escape');
  console.log('PASS: Open-page April rollover and explicit-year preservation');

  assert.deepEqual(errors, [], 'no browser runtime errors');
} finally {
  await browser.close();
}
