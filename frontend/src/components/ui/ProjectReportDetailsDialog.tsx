import { useEffect, useId, useState } from 'react';
import api from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export type SourceBudgets = Record<string, { proposed?: number | string | null; actual?: number | string | null; note?: string }>;
export type ReportActivity = { id?: number; activity_code?: string; activity_name: string; responsible_person?: string; plan_name?: string; objective?: string; kpi?: string; budgets: SourceBudgets };
export type ReportDetails = { project_id: string; report_item_id?: number; academic_year?: number; sort_order?: number; strategy?: string; plan_name?: string; objective?: string; kpi?: string; read_only?: boolean; budgets: SourceBudgets; activities: ReportActivity[]; sources?: Record<string, string>; documents?: { id: number; name: string; date: string; file_path?: string; report_item_id: number; report_document_type: string }[] };
const projectBudgetSources: Record<string, string> = { university: 'มหาวิทยาลัยสยาม', thonburiHospital: 'โรงพยาบาลธนบุรี', nursingFaculty: 'คณะพยาบาลศาสตร์', external: 'หน่วยงานภายนอก', unspecified: 'ยังไม่ระบุแหล่งเงิน' };

export function ProjectBudgetEditor({ value, onChange, disabled = false }: { value: SourceBudgets; onChange: (next: SourceBudgets) => void; disabled?: boolean }) {
  return <div className="overflow-x-auto rounded-md border"><table className="w-full min-w-[540px] text-sm"><thead><tr className="bg-muted"><th className="p-2 text-left">แหล่งเงิน</th><th className="p-2 text-left">งบเสนอ</th><th className="p-2 text-left">งบใช้จริง</th><th className="p-2 text-left">หมายเหตุ</th></tr></thead><tbody>
    {Object.entries(projectBudgetSources).map(([source, label]) => <tr key={source} className="border-t"><td className="p-2">{label}</td>{(['proposed', 'actual', 'note'] as const).map(key => <td key={key} className="p-2"><Input aria-label={`${label} ${key === 'proposed' ? 'งบเสนอ' : key === 'actual' ? 'งบใช้จริง' : 'หมายเหตุ'}`} disabled={disabled} type={key === 'note' ? 'text' : 'number'} min={key === 'note' ? undefined : 0} step={key === 'note' ? undefined : '0.01'} placeholder={key === 'note' ? '' : 'ยังไม่ระบุ'} value={value[source]?.[key] ?? ''} onChange={e => onChange({ ...value, [source]: { ...value[source], [key]: e.target.value } })} /></td>)}</tr>)}
  </tbody></table></div>;
}

export function ProjectDetailsEditor({ value, onChange, disabled = false, strategyReadOnly = false, onDelete }: { value: ReportDetails; onChange: (next: ReportDetails) => void; disabled?: boolean; strategyReadOnly?: boolean; onDelete?: (id: number) => void }) {
  const fieldId = useId();
  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        {strategyReadOnly ? <>
          <p className="text-sm font-medium">ยุทธศาสตร์</p>
          <p className="whitespace-pre-wrap break-words text-sm">{value.strategy?.trim() || 'ยังไม่ระบุ'}</p>
          <p className="text-xs text-muted-foreground">ทุกกิจกรรมย่อยใช้ยุทธศาสตร์เดียวกับโครงการหลัก แก้ไขได้ที่เมนูแก้ไขโครงการ</p>
        </> : <>
          <Label htmlFor={`${fieldId}-strategy`}>ยุทธศาสตร์</Label>
          <Input id={`${fieldId}-strategy`} disabled={disabled} value={value.strategy ?? ''} onChange={e => onChange({ ...value, strategy: e.target.value })} />
        </>}
      </div>
      {(['plan_name', 'objective', 'kpi'] as const).map((key, index) => <div className="space-y-1" key={key}>
        <Label htmlFor={`${fieldId}-${key}`}>{['แผนงาน', 'วัตถุประสงค์', 'KPI'][index]}</Label>
        <Input id={`${fieldId}-${key}`} aria-describedby={key === 'plan_name' ? `${fieldId}-plan-help` : undefined} disabled={disabled} value={value[key] ?? ''} onChange={e => onChange({ ...value, [key]: e.target.value })} />
        {key === 'plan_name' && <p id={`${fieldId}-plan-help`} className="text-xs text-muted-foreground">ชื่อแผนที่โครงการหรือกิจกรรมสังกัด เช่น แผนพัฒนาทักษะนักศึกษา สามารถเว้นว่างได้</p>}
      </div>)}
    </div>
    <div className="space-y-1"><Label>ลำดับรายงาน</Label><Input aria-label="ลำดับรายงาน" disabled={disabled} type="number" min="0" step="1" value={value.sort_order ?? 0} onChange={e => onChange({ ...value, sort_order: Number(e.target.value) })} /></div>
    <div><h3 className="mb-2 font-semibold">ยอดรวมโครงการ (รวมกิจกรรมแล้ว)</h3><p className="mb-2 text-sm text-muted-foreground">ช่องว่างหมายถึงยังไม่ระบุ</p><ProjectBudgetEditor value={value.budgets} onChange={budgets => onChange({ ...value, budgets })} disabled={disabled} /></div>
    <div className="space-y-4"><div className="flex items-center justify-between"><h3 className="font-semibold">กิจกรรมย่อย</h3>{!disabled && <Button type="button" variant="outline" onClick={() => onChange({ ...value, activities: [...value.activities, { activity_code: '', activity_name: '', responsible_person: '', budgets: {} }] })}>เพิ่มกิจกรรม</Button>}</div>
      {value.activities.map((activity, index) => <div className="space-y-3 rounded-lg border p-3" key={activity.id ?? `new-${index}`}><div className="grid gap-3 sm:grid-cols-3"><Input aria-label="รหัสกิจกรรม" disabled={disabled || Boolean(activity.id)} readOnly={Boolean(activity.id)} maxLength={100} placeholder="รหัสกิจกรรม" value={activity.activity_code ?? ''} onChange={e => onChange({ ...value, activities: value.activities.map((a, i) => i === index ? { ...a, activity_code: e.target.value } : a) })} /><Input aria-label="ชื่อกิจกรรม" disabled={disabled} placeholder="ชื่อกิจกรรม" value={activity.activity_name} onChange={e => onChange({ ...value, activities: value.activities.map((a, i) => i === index ? { ...a, activity_name: e.target.value } : a) })} /><Input aria-label="ผู้รับผิดชอบกิจกรรม" disabled={disabled} placeholder="ผู้รับผิดชอบกิจกรรม" value={activity.responsible_person ?? ''} onChange={e => onChange({ ...value, activities: value.activities.map((a, i) => i === index ? { ...a, responsible_person: e.target.value } : a) })} /></div>
        <div className="grid gap-2 sm:grid-cols-3">{(['plan_name', 'objective', 'kpi'] as const).map((key, fieldIndex) => <Input key={key} aria-label={['แผนงานกิจกรรม', 'วัตถุประสงค์กิจกรรม', 'KPI กิจกรรม'][fieldIndex]} placeholder={['แผนงานกิจกรรม', 'วัตถุประสงค์กิจกรรม', 'KPI กิจกรรม'][fieldIndex]} disabled={disabled} value={activity[key] ?? ''} onChange={e => onChange({ ...value, activities: value.activities.map((a, i) => i === index ? { ...a, [key]: e.target.value } : a) })} />)}</div>
        <ProjectBudgetEditor disabled={disabled} value={activity.budgets} onChange={budgets => onChange({ ...value, activities: value.activities.map((a, i) => i === index ? { ...a, budgets } : a) })} />
        {!disabled && <Button type="button" variant="outline" onClick={() => { if (activity.id) onDelete?.(activity.id); onChange({ ...value, activities: value.activities.filter((_, i) => i !== index) }); }}>ลบกิจกรรม</Button>}
      </div>)}
    </div>
  </div>;
}

export default function ProjectReportDetailsDialog({ projectId, open, onOpenChange, onSaved }: { projectId: string | null; open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void }) {
  const [data, setData] = useState<ReportDetails | null>(null);
  const [deleted, setDeleted] = useState<number[]>([]);
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const [doc, setDoc] = useState({ name: '', date: '', url: '', report_item_id: '', purpose: 'summary_report' });
  const { toast } = useToast();
  useEffect(() => {
    if (!open || projectId === null) return;
    const controller = new AbortController(); setData(null); setError(''); setDeleted([]); setDoc({ name: '', date: '', url: '', report_item_id: '', purpose: 'summary_report' });
    api.get('/index.php', { params: { page: 'get-project-details', project_id: projectId }, signal: controller.signal }).then(r => setData(r.data.data)).catch(e => { if (!controller.signal.aborted) setError(e.response?.data?.message || 'โหลดรายละเอียดไม่สำเร็จ'); });
    return () => controller.abort();
  }, [open, projectId]);
  let admin = false; try { admin = Number(JSON.parse(localStorage.getItem('user') || '{}').role_id) === 1; } catch { /* no session */ }
  const readOnly = !admin || Boolean(data?.read_only);
  const save = async () => {
    if (!data) return;
    if (data.activities.some(activity => !activity.id && !activity.activity_code?.trim())) { setError('กรุณาระบุรหัสกิจกรรมสำหรับกิจกรรมใหม่'); return; }
    setSaving(true);
    const payload = { ...data, deleted_activity_ids: deleted };
    delete payload.strategy;
    try { await api.post('/index.php?page=save-project-details', payload); toast({ title: 'บันทึกกิจกรรมและงบสำเร็จ' }); onSaved(); onOpenChange(false); }
    catch (e: any) { setError(e.response?.data?.message || 'บันทึกไม่สำเร็จ'); } finally { setSaving(false); }
  };
  const addDocument = async () => {
    if (!data) return;
    try { await api.post('/index.php?page=create-project-doc', { project_id: data.project_id, report_item_id: Number(doc.report_item_id || data.report_item_id), report_document_type: doc.purpose, name: doc.name, date: doc.date, attachment_type: 'website_url', attachment_url: doc.url, type: doc.purpose === 'budget_document' ? 'financial' : 'summary' }); toast({ title: 'เพิ่มเอกสารสำเร็จ' }); const updated = await api.get('/index.php', { params: { page: 'get-project-details', project_id: data.project_id } }); setData(prev => prev ? { ...prev, documents: updated.data.data.documents } : prev); setDoc({ name: '', date: '', url: '', report_item_id: '', purpose: 'summary_report' }); onSaved(); }
    catch (e: any) { setError(e.response?.data?.message || 'เพิ่มเอกสารไม่สำเร็จ'); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="app-dialog-3xl"><DialogHeader><DialogTitle>กิจกรรม งบแยกแหล่ง และเอกสาร — {projectId}</DialogTitle></DialogHeader>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {data ? <div className="space-y-5 overflow-y-auto"><p className="text-sm text-muted-foreground">ปี {data.academic_year} {data.read_only ? '· ปิดรอบแล้ว อ่านอย่างเดียว' : ''}</p><ProjectDetailsEditor value={data} onChange={setData} strategyReadOnly disabled={readOnly || saving} onDelete={id => setDeleted(ids => [...ids, id])} />
      {Boolean(data.documents?.length) && <div className="space-y-2"><h3 className="font-semibold">เอกสารรายงานร่วม</h3>{data.documents.map(d => <p key={d.id} className="text-sm">{d.name} · {d.date} · {d.report_document_type === 'budget_document' ? 'งบประมาณ' : d.report_document_type === 'summary_report' ? 'สรุปโครงการ' : 'ทั่วไป'} · {d.report_item_id === data.report_item_id ? 'ระดับโครงการ' : data.activities.find(a => a.id === d.report_item_id)?.activity_name || 'กิจกรรม'} {d.file_path && /^https?:\/\//i.test(d.file_path) && <a href={d.file_path} target="_blank" rel="noopener noreferrer" className="text-primary underline">เปิดเอกสาร</a>}</p>)}</div>}
      {!readOnly && <><div className="space-y-2 rounded-lg border p-3"><h3 className="font-semibold">เพิ่มลิงก์เอกสารรายงาน</h3><div className="grid gap-2 sm:grid-cols-2"><Input placeholder="ชื่อเอกสาร" value={doc.name} onChange={e => setDoc({ ...doc, name: e.target.value })} /><Input type="date" value={doc.date} onChange={e => setDoc({ ...doc, date: e.target.value })} /><Input placeholder="https://..." value={doc.url} onChange={e => setDoc({ ...doc, url: e.target.value })} /><select className="h-10 rounded-md border bg-background px-2" value={doc.purpose} onChange={e => setDoc({ ...doc, purpose: e.target.value })}><option value="summary_report">สรุปโครงการ</option><option value="budget_document">เอกสารงบประมาณ</option></select><select className="h-10 rounded-md border bg-background px-2" value={doc.report_item_id} onChange={e => setDoc({ ...doc, report_item_id: e.target.value })}><option value="">ระดับโครงการ</option>{data.activities.filter(a => a.id).map(a => <option key={a.id} value={a.id}>{a.activity_name}</option>)}</select></div><Button variant="outline" disabled={!doc.name || !doc.date || !doc.url} onClick={addDocument}>เพิ่มเอกสาร</Button></div><Button disabled={saving} onClick={save}>{saving ? 'กำลังบันทึก...' : 'บันทึกกิจกรรมและงบ'}</Button></>}
    </div> : <p>กำลังโหลด...</p>}
  </DialogContent></Dialog>;
}
