import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ClipboardCheck, Loader2, Save, Trash2, UserPlus } from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";

type ProjectType = "academic_service" | "culture" | "other";

interface ProjectAssessmentData {
  project: {
    project_id: string;
    project_name_th: string;
    project_name_en: string | null;
    project_type: ProjectType;
    academic_year: string | null;
    status: string;
  };
  students: StudentOption[];
  participants: Participant[];
  outcomes: OutcomeLink[];
  results: OutcomeResult[];
}

interface StudentOption {
  student_id: string;
  student_code: string;
  name: string;
  year_level: string | null;
}

interface Participant extends StudentOption {
  status: string;
  is_satisfied: string | number | null;
  satisfaction_comment: string | null;
}

interface OutcomeLink {
  id: string;
  outcome_type: "clo" | "plo" | "ylo";
  outcome_code: string;
}

interface OutcomeResult {
  student_id: string;
  project_outcome_link_id: string;
  score_percent: string | null;
  pass_status: string | number | null;
}

interface SatisfactionDraft {
  value: "" | "0" | "1";
  comment: string;
}

interface OutcomeDraft {
  score: string;
  passStatus: "" | "0" | "1";
}

const projectTypeLabel: Record<ProjectType, string> = {
  academic_service: "บริการวิชาการ",
  culture: "ทำนุบำรุงศิลปวัฒนธรรม",
  other: "อื่น ๆ / ยังไม่จำแนก",
};

const participantStatusLabel: Record<string, string> = {
  Registered: "ลงทะเบียน",
  Joined: "เข้าร่วมแล้ว",
  Passed: "ผ่าน",
  Failed: "ไม่ผ่าน",
};

export default function ProjectAssessments() {
  const { toast } = useToast();
  const [projectId] = useState(() => sessionStorage.getItem("pendingProjectId") || "");
  const [data, setData] = useState<ProjectAssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [participantStatus, setParticipantStatus] = useState("Joined");
  const [pendingRemove, setPendingRemove] = useState<Participant | null>(null);
  const [satisfactionDrafts, setSatisfactionDrafts] = useState<Record<string, SatisfactionDraft>>({});
  const [outcomeDrafts, setOutcomeDrafts] = useState<Record<string, Record<string, OutcomeDraft>>>({});

  const navigate = (page: string) => {
    window.dispatchEvent(new CustomEvent("app:navigate", { detail: { page } }));
  };

  const loadData = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get("/index.php?page=project-assessments", { params: { project_id: projectId } });
      if (response.data.status !== "success") throw new Error(response.data.message);

      const nextData = response.data.data as ProjectAssessmentData;
      setData(nextData);

      const satisfaction: Record<string, SatisfactionDraft> = {};
      const outcomes: Record<string, Record<string, OutcomeDraft>> = {};
      const resultMap = new Map(
        nextData.results.map((result) => [
          `${result.student_id}:${result.project_outcome_link_id}`,
          result,
        ]),
      );

      nextData.participants.forEach((participant) => {
        satisfaction[participant.student_id] = {
          value: participant.is_satisfied === null ? "" : String(participant.is_satisfied) as "0" | "1",
          comment: participant.satisfaction_comment || "",
        };
        outcomes[participant.student_id] = {};
        nextData.outcomes.forEach((outcome) => {
          const result = resultMap.get(`${participant.student_id}:${outcome.id}`);
          outcomes[participant.student_id][outcome.id] = {
            score: result?.score_percent ?? "",
            passStatus: result?.pass_status === null || result?.pass_status === undefined
              ? ""
              : String(result.pass_status) as "0" | "1",
          };
        });
      });

      setSatisfactionDrafts(satisfaction);
      setOutcomeDrafts(outcomes);
      sessionStorage.removeItem("pendingProjectId");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลการประเมินโครงการได้";
      toast({ title: "เกิดข้อผิดพลาด", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableStudents = useMemo(() => {
    if (!data) return [];
    const participantIds = new Set(data.participants.map((participant) => String(participant.student_id)));
    return data.students.filter((student) => !participantIds.has(String(student.student_id)));
  }, [data]);

  const postAction = async (payload: Record<string, unknown>, successMessage?: string) => {
    const response = await api.post("/index.php?page=project-assessments", {
      project_id: projectId,
      ...payload,
    });
    if (response.data.status !== "success") throw new Error(response.data.message);
    toast({ title: "สำเร็จ", description: successMessage || response.data.message });
  };

  const addParticipant = async () => {
    if (!selectedStudentId) {
      toast({ title: "กรุณาเลือกนักศึกษา", variant: "destructive" });
      return;
    }
    try {
      setSavingKey("add-participant");
      await postAction({
        action: "add_participant",
        student_id: selectedStudentId,
        participant_status: participantStatus,
      });
      setSelectedStudentId("");
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถเพิ่มผู้เข้าร่วมได้";
      toast({ title: "เกิดข้อผิดพลาด", description: message, variant: "destructive" });
    } finally {
      setSavingKey("");
    }
  };

  const removeParticipant = async () => {
    if (!pendingRemove) return;
    try {
      setSavingKey(`remove-${pendingRemove.student_id}`);
      await postAction({ action: "remove_participant", student_id: pendingRemove.student_id });
      setPendingRemove(null);
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถนำผู้เข้าร่วมออกได้";
      toast({ title: "เกิดข้อผิดพลาด", description: message, variant: "destructive" });
    } finally {
      setSavingKey("");
    }
  };

  const saveSatisfaction = async (participant: Participant) => {
    const draft = satisfactionDrafts[participant.student_id];
    if (!draft || draft.value === "") {
      toast({ title: "กรุณาระบุความพึงพอใจ", variant: "destructive" });
      return;
    }
    try {
      setSavingKey(`satisfaction-${participant.student_id}`);
      await postAction({
        action: "save_satisfaction",
        student_id: participant.student_id,
        is_satisfied: Number(draft.value),
        comment: draft.comment,
      });
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถบันทึกความพึงพอใจได้";
      toast({ title: "เกิดข้อผิดพลาด", description: message, variant: "destructive" });
    } finally {
      setSavingKey("");
    }
  };

  const saveOutcomes = async (participant: Participant) => {
    if (!data) return;
    const participantDrafts = outcomeDrafts[participant.student_id] || {};
    try {
      setSavingKey(`outcomes-${participant.student_id}`);
      await postAction({
        action: "save_outcomes",
        student_id: participant.student_id,
        results: data.outcomes.map((outcome) => ({
          project_outcome_link_id: outcome.id,
          score_percent: participantDrafts[outcome.id]?.score ?? "",
          pass_status: participantDrafts[outcome.id]?.passStatus ?? "",
        })),
      });
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถบันทึกผลการประเมินได้";
      toast({ title: "เกิดข้อผิดพลาด", description: message, variant: "destructive" });
    } finally {
      setSavingKey("");
    }
  };

  if (loading) {
    return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!projectId || !data) {
    return (
      <Card>
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">กรุณาเลือกโครงการจากหน้าจัดการโครงการก่อน</p>
          <Button variant="outline" onClick={() => navigate("projectspage")}>กลับไปหน้าจัดการโครงการ</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" className="mb-2 -ml-3 gap-2" onClick={() => navigate("projectspage")}>
            <ArrowLeft className="h-4 w-4" /> กลับไปหน้าจัดการโครงการ
          </Button>
          <h1 className="text-3xl font-bold">ประเมินผู้เข้าร่วมโครงการ</h1>
          <p className="mt-1 text-muted-foreground">{data.project.project_name_th}</p>
        </div>
        <Badge variant="outline" className="w-fit text-sm">{projectTypeLabel[data.project.project_type]}</Badge>
      </div>

      {data.project.project_type === "other" ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            กรุณากำหนดประเภทโครงการก่อนเริ่มประเมินผู้เข้าร่วม
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><UserPlus className="h-5 w-5" />เพิ่มผู้เข้าร่วมโครงการ</CardTitle>
              <CardDescription>เลือกนักศึกษาที่ต้องการนำเข้าสู่การประเมินของโครงการนี้</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 md:flex-row">
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="เลือกนักศึกษา" /></SelectTrigger>
                <SelectContent>
                  {availableStudents.map((student) => (
                    <SelectItem key={student.student_id} value={String(student.student_id)}>
                      {student.student_code} · {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={participantStatus} onValueChange={setParticipantStatus}>
                <SelectTrigger className="md:w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Registered">ลงทะเบียน</SelectItem>
                  <SelectItem value="Joined">เข้าร่วมแล้ว</SelectItem>
                  <SelectItem value="Passed">ผ่าน</SelectItem>
                  <SelectItem value="Failed">ไม่ผ่าน</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addParticipant} disabled={!selectedStudentId || savingKey === "add-participant"}>
                {savingKey === "add-participant" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                เพิ่มผู้เข้าร่วม
              </Button>
            </CardContent>
          </Card>

          {data.project.project_type === "academic_service" && data.outcomes.length === 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="flex flex-col items-center justify-between gap-3 p-5 sm:flex-row">
                <p className="text-sm text-amber-900">โครงการนี้ยังไม่ได้เชื่อม CLO/PLO/YLO จึงยังบันทึกผลการประเมินไม่ได้</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    sessionStorage.setItem("pendingProjectId", projectId);
                    navigate("project-links");
                  }}
                >
                  เชื่อมโยงระดับ LO
                </Button>
              </CardContent>
            </Card>
          )}

          {data.participants.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">ยังไม่มีนักศึกษาเข้าร่วมโครงการ</CardContent></Card>
          ) : (
            <div className="space-y-4">
              {data.participants.map((participant) => (
                <Card key={participant.student_id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg">{participant.student_code} · {participant.name}</CardTitle>
                      <CardDescription className="mt-1">
                        ชั้นปี {participant.year_level || "—"} · {participantStatusLabel[participant.status] || participant.status}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setPendingRemove(participant)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {data.project.project_type === "culture" ? (
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label>ความพึงพอใจ</Label>
                          <Select
                            value={satisfactionDrafts[participant.student_id]?.value || ""}
                            onValueChange={(value: "0" | "1") => setSatisfactionDrafts((current) => ({
                              ...current,
                              [participant.student_id]: {
                                value,
                                comment: current[participant.student_id]?.comment || "",
                              },
                            }))}
                          >
                            <SelectTrigger><SelectValue placeholder="เลือกผลความพึงพอใจ" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">พึงพอใจ</SelectItem>
                              <SelectItem value="0">ไม่พึงพอใจ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>ความคิดเห็นเพิ่มเติม</Label>
                          <Textarea
                            value={satisfactionDrafts[participant.student_id]?.comment || ""}
                            onChange={(event) => setSatisfactionDrafts((current) => ({
                              ...current,
                              [participant.student_id]: {
                                value: current[participant.student_id]?.value || "",
                                comment: event.target.value,
                              },
                            }))}
                            rows={2}
                          />
                        </div>
                        <Button className="w-fit gap-2" onClick={() => saveSatisfaction(participant)} disabled={savingKey === `satisfaction-${participant.student_id}`}>
                          {savingKey === `satisfaction-${participant.student_id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          บันทึกความพึงพอใจ
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data.outcomes.map((outcome) => {
                          const draft = outcomeDrafts[participant.student_id]?.[outcome.id] || { score: "", passStatus: "" };
                          return (
                            <div key={outcome.id} className="grid items-end gap-3 rounded-lg border p-3 md:grid-cols-[1fr_160px_180px]">
                              <div>
                                <Badge variant="secondary" className="uppercase">{outcome.outcome_type}</Badge>
                                <p className="mt-2 font-medium">{outcome.outcome_code}</p>
                              </div>
                              <div className="grid gap-1.5">
                                <Label>คะแนนร้อยละ</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={draft.score}
                                  onChange={(event) => setOutcomeDrafts((current) => ({
                                    ...current,
                                    [participant.student_id]: {
                                      ...(current[participant.student_id] || {}),
                                      [outcome.id]: { ...draft, score: event.target.value },
                                    },
                                  }))}
                                  placeholder="0–100"
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <Label>ผลประเมิน</Label>
                                <Select
                                  value={draft.passStatus || "not_assessed"}
                                  onValueChange={(value) => setOutcomeDrafts((current) => ({
                                    ...current,
                                    [participant.student_id]: {
                                      ...(current[participant.student_id] || {}),
                                      [outcome.id]: { ...draft, passStatus: value === "not_assessed" ? "" : value as "0" | "1" },
                                    },
                                  }))}
                                >
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not_assessed">ยังไม่ประเมิน</SelectItem>
                                    <SelectItem value="1">ผ่าน</SelectItem>
                                    <SelectItem value="0">ไม่ผ่าน</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          );
                        })}
                        {data.outcomes.length > 0 && (
                          <Button className="gap-2" onClick={() => saveOutcomes(participant)} disabled={savingKey === `outcomes-${participant.student_id}`}>
                            {savingKey === `outcomes-${participant.student_id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            บันทึกผล CLO/PLO/YLO
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmActionDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => { if (!open) setPendingRemove(null); }}
        title="นำผู้เข้าร่วมออกจากโครงการ"
        description="ข้อมูลความพึงพอใจและผล CLO/PLO/YLO ของนักศึกษาคนนี้ในโครงการจะถูกลบด้วย"
        onConfirm={removeParticipant}
        isLoading={savingKey.startsWith("remove-")}
      />
    </div>
  );
}

