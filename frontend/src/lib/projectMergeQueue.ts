import { z } from 'zod';
import type { ReportActivity, SourceBudgets } from '@/components/ui/ProjectReportDetailsDialog';

type MergeDocument = { id: number; url: string; created_at?: string };
type MergeReport = {
  id: number;
  project_code?: string;
  project_name?: string;
  responsible_person?: string;
  strategy?: string;
  plan_name?: string;
  objective?: string;
  kpi?: string;
  sort_order?: number;
  budgets: SourceBudgets;
  activities: ReportActivity[];
  documents: MergeDocument[];
};
export type ProjectMergeQueue = {
  projects: { project_id: string; project_name_th?: string; responsible_faculty_id?: number; project_type: string; report_item_id?: number }[];
  reports: MergeReport[];
  orphan_activities: (ReportActivity & { id: number; project_name?: string; documents: MergeDocument[] })[];
  legacy_budgets: { source_id: string; project_id: string; original: { fiscal_year?: number; legacy_amount?: number | string; spent?: number | string; result?: string } }[];
  pending: { projects: number; report_items: number; legacy_budgets: number };
  periodStatus: 'open' | 'review' | 'closed';
  faculty: { faculty_id: number; name: string }[];
  sources: Record<string, string>;
};

const text = z.string().nullish().transform(value => value ?? '');
const id = z.union([z.number(), z.string().regex(/^\d+$/)]).pipe(z.coerce.number().int().positive().safe());
const optionalId = id.nullish().transform(value => value ?? undefined);
const amount = z.union([z.number().finite(), z.string()]).nullish();
const budgetCells = z.record(z.object({ proposed: amount, actual: amount, note: text }));
// PHP encodes an empty associative budget array as []; both mean no amounts.
const budgets = z.union([budgetCells, z.array(z.never())]).transform(value => Array.isArray(value) ? {} : value);
const document = z.object({ id, url: text, created_at: text });
const metadata = { plan_name: text, objective: text, kpi: text };
const activity = z.object({
  id, activity_code: text, activity_name: text, responsible_person: text, project_name: text,
  ...metadata, budgets, documents: z.array(document).optional(),
});
const queueSchema = z.object({
  projects: z.array(z.object({ project_id: z.string().min(1), project_name_th: text, responsible_faculty_id: optionalId, project_type: z.string(), report_item_id: optionalId })),
  reports: z.array(z.object({
    id, project_code: text, project_name: text, responsible_person: text, strategy: text, ...metadata,
    sort_order: z.coerce.number().int().nonnegative().nullish().transform(value => value ?? 0),
    budgets, activities: z.array(activity), documents: z.array(document),
  })),
  orphan_activities: z.array(activity.extend({ documents: z.array(document) })),
  legacy_budgets: z.array(z.object({
    source_id: z.union([z.string(), z.number()]).transform(String), project_id: z.string(),
    original: z.object({ fiscal_year: z.coerce.number().int().nullish(), legacy_amount: amount, spent: amount, result: text }),
  })),
  pending: z.object({ projects: z.number().int().nonnegative().safe(), report_items: z.number().int().nonnegative().safe(), legacy_budgets: z.number().int().nonnegative().safe() }),
  periodStatus: z.enum(['open', 'review', 'closed']),
  faculty: z.array(z.object({ faculty_id: id, name: z.string() })),
  sources: z.record(z.string()),
});

export function parseProjectMergeQueue(response: unknown): ProjectMergeQueue {
  const result = z.object({ status: z.literal('success'), data: queueSchema }).safeParse(response);
  if (!result.success) {
    // Do not expose raw records or treat missing counters as zero.
    throw new Error('ข้อมูลรายการตรวจย้ายไม่ครบหรือรูปแบบไม่ถูกต้อง กรุณาลองโหลดใหม่');
  }
  return result.data.data as ProjectMergeQueue;
}
