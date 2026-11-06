import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectDetailsEditor, type ReportDetails } from '@/components/ui/ProjectReportDetailsDialog';
import { getProjectCodeError } from '@/lib/projectCode';
import { useToast } from '@/hooks/use-toast';
import { parseProjectMergeQueue, type ProjectMergeQueue } from '@/lib/projectMergeQueue';

type LegacyDecision = { source_id: string; decision: string; reason: string; confirm_actual: boolean; target_project_id: string };
const emptyDetails = (): ReportDetails => ({ project_id: '', budgets: {}, activities: [], strategy: '', plan_name: '', objective: '', kpi: '' });

export default function ProjectMergeWorkbench({ year, onChanged }: { year: string; onChanged: () => void }) {
  const [queue, setQueue] = useState<ProjectMergeQueue | null>(null); const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);
  const [form, setForm] = useState({ project_id: '', project_name_th: '', responsible_faculty_id: '', project_type: 'other', report_item_id: '' });
  const [details, setDetails] = useState<ReportDetails>(emptyDetails);
  const [decisions, setDecisions] = useState<Record<string, LegacyDecision>>({});
  const [attached, setAttached] = useState<number[]>([]); const [deleted, setDeleted] = useState<number[]>([]);
  const [dates, setDates] = useState<Record<string, string>>({}); const [urls, setUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [closeChecked, setCloseChecked] = useState(false);
  const { toast } = useToast();
  const load = useCallback(async (signal?: AbortSignal) => {
    const currentRequest = ++requestId.current;
    setLoading(true); setQueue(null); setCloseChecked(false); setError('');
    try {
      const r = await api.get('/index.php', { params: { page: 'project-merge-queue', year }, signal });
      const next = parseProjectMergeQueue(r.data);
      if (!signal?.aborted && currentRequest === requestId.current) setQueue(next);
    } catch (e: unknown) {
      if (!signal?.aborted && currentRequest === requestId.current) setError(e instanceof Error ? e.message : 'โหลดรายการตรวจย้ายไม่สำเร็จ');
    } finally {
      if (!signal?.aborted && currentRequest === requestId.current) setLoading(false);
    }
  }, [year]);
  useEffect(() => {
    const controller = new AbortController();
    setForm({ project_id: '', project_name_th: '', responsible_faculty_id: '', project_type: 'other', report_item_id: '' });
    setDetails(emptyDetails()); setDecisions({}); setAttached([]); setDeleted([]); setDates({}); setUrls({}); setCloseChecked(false); setQueue(null); setError('');
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  const chooseProject = async (code: string) => {
    if (!queue || loading || busy) return;
    const p = queue.projects.find(p => p.project_id === code);
    setForm(p ? { project_id: p.project_id, project_name_th: p.project_name_th || '', responsible_faculty_id: String(p.responsible_faculty_id || ''), project_type: p.project_type, report_item_id: String(p.report_item_id || '') } : { project_id: '', project_name_th: '', responsible_faculty_id: '', project_type: 'other', report_item_id: '' });
    setDetails(emptyDetails()); setAttached([]); setDeleted([]);
    if (p?.report_item_id) try { const r = await api.get('/index.php', { params: { page: 'get-project-details', project_id: code } }); setDetails(r.data.data); } catch (e: any) { setError(e.response?.data?.message || 'โหลดโครงการไม่สำเร็จ'); }
  };
  const chooseReport = (id: string) => {
    if (!queue || loading || busy) return;
    const r = queue.reports.find(r => String(r.id) === id);
    setForm(prev => ({ ...prev, report_item_id: id, project_id: prev.project_id || r?.project_code || '', project_name_th: prev.project_name_th || r?.project_name || '' }));
    setDetails(r ? { project_id: '', sort_order: Number(r.sort_order || 0), strategy: r.strategy || '', plan_name: r.plan_name || '', objective: r.objective || '', kpi: r.kpi || '', budgets: r.budgets || {}, activities: r.activities || [] } : emptyDetails());
    setDates({}); setUrls({}); setAttached([]); setDeleted([]);
  };
  const execute = async (page: string, payload: object) => {
    if (!queue || loading || busy) return;
    setBusy(true); setError('');
    try { await api.post(`/index.php?page=${page}`, payload); toast({ title: 'บันทึกสำเร็จ' }); await load(); onChanged(); setCloseChecked(false); setForm({ project_id: '', project_name_th: '', responsible_faculty_id: '', project_type: 'other', report_item_id: '' }); setDetails(emptyDetails()); setDecisions({}); setAttached([]); setDeleted([]); }
    catch (e: any) { setError(e.response?.data?.message || 'ดำเนินการไม่สำเร็จ'); }
    finally { setBusy(false); }
  };
  const save = () => {
    if (!queue || loading || busy) return;
    const validation = getProjectCodeError(form.project_id);
    if (validation || !form.project_name_th.trim() || !form.responsible_faculty_id) { setError(validation || 'กรุณาระบุชื่อและจับคู่ผู้รับผิดชอบ'); return; }
    execute('commit-project-merge', { ...details, ...form, project_id: form.project_id.trim(), academic_year: Number(year), report_item_id: form.report_item_id ? Number(form.report_item_id) : null, legacy_decisions: Object.values(decisions).filter(d => d.decision), document_dates: dates, document_urls: urls, attach_activity_ids: attached, deleted_activity_ids: deleted });
  };
  const report = queue?.reports.find(r => String(r.id) === form.report_item_id);
  const pending = queue ? Object.values(queue.pending).reduce((sum, n) => sum + n, 0) : null;
  return <Card className="border-primary/30"><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle className="text-base">ตรวจย้ายข้อมูลและปิดรอบปี {year}</CardTitle><Button variant="outline" onClick={() => setExpanded(v => !v)}>{expanded ? 'ซ่อนรายละเอียด' : 'เปิดหน้าตรวจย้าย'}</Button></div>
    <p className="text-sm text-muted-foreground">{queue ? `สถานะ: ${queue.periodStatus === 'closed' ? 'ปิดรอบแล้ว' : queue.periodStatus === 'review' ? 'รอยืนยันย้ายรายปี' : 'เปิดรอบ'} · โครงการรอจับคู่ ${queue.pending.projects} · รายการรายงานรอจับคู่ ${queue.pending.report_items} · ยอดเดิมรอตรวจ ${queue.pending.legacy_budgets}` : loading ? 'กำลังโหลด...' : 'ข้อมูลตรวจย้ายยังไม่พร้อมใช้งาน'}</p><p className="text-sm text-muted-foreground">ยอดที่ยังไม่ตรวจย้ายจะไม่รวมในรายงานใหม่ การปิดรอบไม่สร้างยอดเงินเพิ่มเติม</p>
  </CardHeader>
    {error && <div className="px-6 pb-3"><p role="alert" className="text-destructive">{error}</p><Button variant="outline" disabled={loading || busy} onClick={() => load()}>ลองโหลดรายการตรวจย้ายใหม่</Button></div>}
    {expanded && queue && <CardContent className="space-y-5">
      {queue.periodStatus === 'closed' ? <p>ข้อมูลปีนี้ปิดรอบแล้ว รายงานอ่านจากภาพข้อมูล ณ วันที่ปิด</p> : <>
        <div className="grid gap-3 sm:grid-cols-2"><div><Label>จับคู่กับโครงการในระบบ</Label><select aria-label="จับคู่กับโครงการในระบบ" className="h-10 w-full rounded-md border bg-background px-2" onChange={e => chooseProject(e.target.value)} value={queue.projects.some((p: any) => p.project_id === form.project_id) ? form.project_id : ''}><option value="">สร้างโครงการใหม่ / ระบุรหัสเอง</option>{queue.projects.map((p: any) => <option key={p.project_id} value={p.project_id}>{p.project_id} · {p.project_name_th || 'ยังไม่มีชื่อ'} {p.report_item_id ? '(เชื่อมแล้ว)' : ''}</option>)}</select></div>
          <div><Label>รายงานต้นฉบับที่ต้องการจับคู่</Label><select aria-label="รายงานต้นฉบับที่ต้องการจับคู่" className="h-10 w-full rounded-md border bg-background px-2" value={form.report_item_id} onChange={e => chooseReport(e.target.value)}><option value="">ไม่มีต้นฉบับรายงาน / สร้างรายละเอียดใหม่</option>{form.report_item_id && !report && <option value={form.report_item_id}>รายงานที่เชื่อมกับโครงการนี้แล้ว</option>}{queue.reports.map((r: any) => <option key={r.id} value={r.id}>{r.project_code || '(ไม่มีรหัส)'} · {r.project_name}</option>)}</select></div>
          <div><Label>รหัสโครงการหลัก</Label><Input aria-label="รหัสโครงการหลัก" readOnly={queue.projects.some((p: any) => p.project_id === form.project_id)} maxLength={100} value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} /></div><div><Label>ชื่อโครงการ</Label><Input aria-label="ชื่อโครงการที่ยืนยัน" value={form.project_name_th} onChange={e => setForm({ ...form, project_name_th: e.target.value })} /></div>
          <div><Label>จับคู่ผู้รับผิดชอบ</Label><select aria-label="จับคู่ผู้รับผิดชอบ" className="h-10 w-full rounded-md border bg-background px-2" value={form.responsible_faculty_id} onChange={e => setForm({ ...form, responsible_faculty_id: e.target.value })}><option value="">เลือกอาจารย์ด้วยตนเอง</option>{queue.faculty.map((f: any) => <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_id} · {f.name}</option>)}</select>{report?.responsible_person && <p className="text-xs text-muted-foreground">ข้อความเดิม: {report.responsible_person}</p>}</div>
          <div><Label>ประเภทโครงการใหม่</Label><select className="h-10 w-full rounded-md border bg-background px-2" value={form.project_type} onChange={e => setForm({ ...form, project_type: e.target.value })}>{Object.entries({ other: 'อื่น ๆ', academic_service: 'บริการวิชาการ', culture: 'ทำนุบำรุงศิลปวัฒนธรรม', research: 'วิจัย', teaching: 'การเรียนการสอน', quality_assurance: 'การประกันคุณภาพ' }).map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></div>
        </div>
        <div className="space-y-3"><h3 className="font-semibold">ตรวจความหมายและกระทบยอดเงินเดิมทีละรายการ</h3>{queue.legacy_budgets.length === 0 && <p className="text-sm text-muted-foreground">ไม่มียอดเดิมที่รอตรวจในปีนี้</p>}{queue.legacy_budgets.map((b: any) => {
          const d = decisions[b.source_id] || { source_id: b.source_id, decision: '', reason: '', confirm_actual: false, target_project_id: '' };
          const update = (next: Partial<LegacyDecision>) => setDecisions(prev => ({ ...prev, [b.source_id]: { ...d, ...next } }));
          return <div key={b.source_id} className="space-y-2 rounded-lg border p-3"><p>โครงการเดิม {b.project_id} · ปี {b.original.fiscal_year ?? 'ยังไม่ระบุ'} · ยอดจากช่องเดิม {b.original.legacy_amount ?? 'ยังไม่ระบุ'} · ใช้จริงเดิม {b.original.spent ?? 'ยังไม่ระบุ'}</p><p className="text-sm text-muted-foreground">{b.original.result}</p><div className="grid gap-2 sm:grid-cols-2"><select aria-label={`ความหมายยอดเดิม ${b.source_id}`} className="h-10 rounded-md border bg-background px-2" value={d.decision} onChange={e => update({ decision: e.target.value })}><option value="">ยังไม่ตรวจ / ไม่นำรายการนี้ไปยืนยัน</option><option value="proposed">ยืนยันยอดนี้เป็นงบเสนอ</option><option value="history">เก็บยอดเดิมในประวัติ ใช้ยอดที่ตรวจแล้วด้านล่าง</option></select><Input placeholder="รหัสโครงการปลายทาง (ว่าง = โครงการที่เลือก)" value={d.target_project_id} onChange={e => update({ target_project_id: e.target.value })} /><Input placeholder="เหตุผล / การแก้ยอดที่ขัดแย้ง" value={d.reason} onChange={e => update({ reason: e.target.value })} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.confirm_actual} onChange={e => update({ confirm_actual: e.target.checked })} />ตรวจงบใช้จริงต้นฉบับเทียบกับยอดที่ยืนยันแล้ว</label></div></div>;
        })}</div>
        {queue.orphan_activities?.length > 0 && <div className="space-y-2"><h3 className="font-semibold">กิจกรรมเดิมที่ยังไม่มีโครงการแม่</h3><p className="text-sm text-muted-foreground">เลือกเพื่อจับคู่กับโครงการด้านบน แล้วตรวจยอดกิจกรรมในรายละเอียดด้านล่าง</p>{queue.orphan_activities.map((a: any) => <label key={a.id} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={attached.includes(Number(a.id))} onChange={e => { const id = Number(a.id); setAttached(ids => e.target.checked ? [...ids, id] : ids.filter(x => x !== id)); setDetails(prev => ({ ...prev, activities: e.target.checked ? [...prev.activities, { ...a, id }] : prev.activities.filter(x => x.id !== id) })); }} />{a.id} · {a.activity_name || a.project_name} · {a.responsible_person || 'ยังไม่ระบุผู้รับผิดชอบ'}</label>)}</div>}
        <ProjectDetailsEditor value={details} onChange={setDetails} disabled={busy} onDelete={id => setDeleted(ids => [...ids, id])} />
        {report?.documents?.length > 0 && <div className="space-y-2"><h3 className="font-semibold">ตรวจเอกสารเดิม</h3>{report.documents.map((d: any) => <div className="grid gap-2 rounded border p-2 sm:grid-cols-2" key={d.id}><Input aria-label={`ลิงก์เอกสารเดิม ${d.id}`} value={urls[d.id] ?? d.url} onChange={e => setUrls({ ...urls, [d.id]: e.target.value })} /><Input aria-label={`วันที่เอกสารเดิม ${d.id}`} type="date" value={dates[d.id] ?? (d.created_at || '').slice(0, 10)} onChange={e => setDates({ ...dates, [d.id]: e.target.value })} /></div>)}</div>}
        <Button disabled={busy || !form.project_id || !form.project_name_th || !form.responsible_faculty_id} onClick={save}>ยืนยันจับคู่และยอดที่ตรวจแล้ว</Button>
        <div className="space-y-3 border-t pt-4"><h3 className="font-semibold">ปิดรอบรายปี</h3><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={closeChecked} onChange={e => setCloseChecked(e.target.checked)} />ตรวจยอด โครงการ กิจกรรม และเอกสารแล้ว ยืนยันข้อมูลร่วมรายปี หรือเลือกเก็บภาพรายงานแบบอ่านอย่างเดียว</label>{queue.periodStatus === 'review' && <Button variant="outline" disabled={busy || pending > 0 || !closeChecked} onClick={() => execute('activate-project-year', { academic_year: Number(year) })}>ยืนยันเปิดใช้ข้อมูลร่วมปี {year}</Button>}<Button disabled={busy || pending > 0 || !closeChecked} onClick={() => execute('close-project-year', { academic_year: Number(year) })}>ยืนยันปิดรอบปี {year}</Button></div>
      </>}
      <div className="border-t pt-4"><p className="mb-2 text-sm text-muted-foreground">จบการย้ายได้เมื่อทุกรายการทุกปีผ่านการตรวจแล้ว ต้นฉบับและการตัดสินใจยังเก็บในประวัติ</p><Button variant="outline" disabled={busy} onClick={() => execute('finalize-project-merge', {})}>ตรวจและจบการย้ายข้อมูลเดิมทั้งหมด</Button></div>
    </CardContent>}
  </Card>;
}
