import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import typescript from 'typescript';

const source = await readFile(new URL('../src/lib/researchSummaryAggregation.ts', import.meta.url), 'utf8');
const compiled = typescript.transpileModule(source, {
  compilerOptions: { module: typescript.ModuleKind.ESNext, target: typescript.ScriptTarget.ES2020 },
}).outputText;
const { buildResearchYearIndex, researchPublicationYear } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);

const boundary = { month: 8, day: 15 };

test('calendar and academic years use the same date boundary as the UI', () => {
  assert.equal(researchPublicationYear('2024-08-14', 'calendar', boundary), 2567);
  assert.equal(researchPublicationYear('2024-08-14', 'academic', boundary), 2566);
  assert.equal(researchPublicationYear('2024-08-15', 'academic', boundary), 2567);
  assert.equal(researchPublicationYear('', 'academic', boundary), 0);
});

test('one pass counts each author and each publication funding once', () => {
  const publications = [
    {
      publication_date: '2024-08-14', publication_type: 'research', funding_type: 'internal', funding_amount: 100,
      authors: [{ faculty_id: 1, role: 'first_author' }, { faculty_id: 2, role: 'co_author' }],
    },
    {
      publication_date: '2024-08-15', publication_type: 'textbook', funding_type: 'external', funding_amount: 200,
      authors: [{ faculty_id: 1, role: 'first_author' }],
    },
  ];
  const index = buildResearchYearIndex(publications, 'academic', boundary);
  assert.deepEqual(index.totalsByYear.get(2566), { kpi: 1, coAuthor: 1, academic: 0 });
  assert.deepEqual(index.totalsByYear.get(2567), { kpi: 0, coAuthor: 0, academic: 1 });
  assert.deepEqual(index.countsByYear.get(2566).get(1), { kpi: 1, coAuthor: 0, academic: 0 });
  assert.deepEqual(index.countsByYear.get(2566).get(2), { kpi: 0, coAuthor: 1, academic: 0 });
  assert.deepEqual(index.fundingByYear.get(2566), { internal: 100, external: 0 });
  assert.deepEqual(index.fundingByYear.get(2567), { internal: 0, external: 200 });
});

test('index includes only the publications supplied by the active filter', () => {
  const included = {
    publication_date: '2024-08-15', publication_type: 'research', funding_type: 'none', funding_amount: 0,
    authors: [{ faculty_id: 1, role: 'corresponding' }],
  };
  const index = buildResearchYearIndex([included], 'calendar', boundary);
  assert.equal(index.totalsByYear.get(2567).kpi, 1);
  assert.equal(index.countsByYear.get(2567).has(2), false);
});
