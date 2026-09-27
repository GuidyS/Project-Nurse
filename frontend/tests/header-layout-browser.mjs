import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const output = path.resolve('tests/artifacts/page-headers');
mkdirSync(output, { recursive: true });
const results = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    await context.route('**/index.php?**', async route => {
      const endpoint = new URL(route.request().url()).searchParams.get('page');
      let body = { status: 'success', data: [] };
      if (endpoint === 'academic-calendar') body.data = { serverNow: '2026-09-27T12:00:00+07:00', academicYear: 2569 };
      if (endpoint === 'get-research-summary') body.data = { years: [2569], faculty: [], publications: [], can_manage: true };
      if (endpoint === 'get-documents') body.data = { documents: [], courses: [] };
      if (endpoint === 'get-advise-notes') body.data = { notes: [], stats: { total: 0, thisMonth: 0, warning: 0, critical: 0 } };
      if (endpoint === 'advisor-student-list') body.data = [{ student_id: 'TEST001', full_name: 'นักศึกษาทดสอบ', status: 'Active' }];
      if (endpoint === 'get-audit-logs') body = [];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    const page = await context.newPage();
    const cases = [
      ['teacher', 'my-courses'], ['teacher', 'my-projects'], ['teacher', 'research-summary'],
      ['teacher', 'documents'], ['teacher', 'advise-notes'], ['admin', 'audit-log'],
      ['student', 'student-health-records'], ['student', 'student-vaccinations'],
      ['teacher', 'advisor-health-records-view'], ['teacher', 'advisor-vaccination-view'],
    ];
    async function verify(label) {
      const header = page.locator('.app-page-header').first();
      await header.waitFor();
      await page.evaluate(() => document.fonts.ready);
      const geometry = await header.evaluate(el => {
        const h = el.querySelector('h1'), p = el.querySelector('.app-page-description');
        const box = el.getBoundingClientRect(), title = h.getBoundingClientRect(), desc = p?.getBoundingClientRect();
        const css = getComputedStyle(el);
        return { width: innerWidth, left: box.left, right: box.right, border: css.borderTopWidth,
          background: css.backgroundColor, titleInside: title.left >= box.left && title.right <= box.right,
          descriptionGap: desc ? desc.top - title.bottom : null,
          overflowing: el.scrollWidth > el.clientWidth + 1 };
      });
      results.push({ label, width, ...geometry });
      assert.equal(geometry.border, '1px', `${label}: border`);
      assert.notEqual(geometry.background, 'rgba(0, 0, 0, 0)', `${label}: background`);
      assert.ok(geometry.left >= 0 && geometry.right <= width + 1, `${label}: header outside viewport ${JSON.stringify(geometry)}`);
      assert.ok(geometry.titleInside && !geometry.overflowing, `${label}: heading overflow ${JSON.stringify(geometry)}`);
      if (geometry.descriptionGap !== null) assert.ok(geometry.descriptionGap >= 7, `${label}: cramped description ${JSON.stringify(geometry)}`);
      if (['my-courses', 'student-vaccinations', 'advisor-health-records-view-detail'].includes(label)) {
        await header.screenshot({ path: path.join(output, `${label}-${width}.png`) });
      }
    }
    for (const [role, route] of cases) {
      await page.goto(`http://localhost:5173/?previewRole=${role}&page=${route}`);
      await verify(route);
      if (route.startsWith('advisor-')) {
        await page.getByRole('button', { name: 'ดูข้อมูล', exact: true }).first().click();
        await verify(`${route}-detail`);
      }
    }
    await context.close();
  }
  writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`PASS: ${results.length} header layouts, desktop/mobile, synthetic API responses only`);
} finally {
  await browser.close();
}
