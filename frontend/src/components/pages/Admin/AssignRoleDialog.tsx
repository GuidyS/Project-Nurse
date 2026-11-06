import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

interface RoleUser {
  id: string;
  fullName: string;
  role: "admin" | "teacher" | "unassigned";
}

interface AssignRoleDialogProps {
  user: RoleUser;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const roles = [
  { value: "admin", label: "ผู้ดูแลระบบ" },
  { value: "teacher", label: "อาจารย์" },
];

const teacherSubRoles = [
  { value: "dean", label: "คณบดี" },
  { value: "instructor", label: "อาจารย์ประจำ" },
  { value: "project_manager", label: "อาจารย์รับผิดชอบโครงการ" },
  { value: "research", label: "อาจารย์งานวิจัย" },
  { value: "program_manager", label: "อาจารย์รับผิดชอบหลักสูตร" },
  { value: "advisor", label: "อาจารย์ที่ปรึกษา" },
  { value: "practical_instructor", label: "อาจารย์ภาคปฏิบัติ" },
];

const errorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || fallback : fallback;

export function AssignRoleDialog({ user, onClose, onSaved }: AssignRoleDialogProps) {
  const [newRole, setNewRole] = useState(user.role === "unassigned" ? "" : user.role);
  const [primaryPosition, setPrimaryPosition] = useState("");
  const [secondaryPositions, setSecondaryPositions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(user.role === "teacher");
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user.role !== "teacher") return;
    let active = true;
    setIsLoading(true);
    setLoadError("");

    const loadPositions = async () => {
      try {
        const response = await api.get("/index.php?page=manage-role", { params: { userId: user.id } });
        if (response.data.status !== "success") throw new Error("โหลดตำแหน่งผู้ใช้ล้มเหลว");
        if (active) {
          setPrimaryPosition(response.data.data.primaryPosition || "");
          setSecondaryPositions(response.data.data.secondaryPositions || []);
        }
      } catch (error) {
        if (active) setLoadError(errorMessage(error, "โหลดตำแหน่งผู้ใช้ล้มเหลว กรุณาลองอีกครั้ง"));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadPositions();
    return () => { active = false; };
  }, [user.id, user.role, loadAttempt]);

  const handleAssignRole = async () => {
    if (savingRef.current || isLoading || loadError || !newRole) return;
    let currentUserId: unknown;
    try {
      currentUserId = JSON.parse(localStorage.getItem("user") || "{}").user_id;
    } catch {
      currentUserId = null;
    }
    if (currentUserId != null && String(currentUserId) === String(user.id)) {
      toast({ title: "ไม่สามารถเปลี่ยน Role หรือตำแหน่งของบัญชีตัวเองได้", variant: "destructive" });
      return;
    }
    if (newRole === "teacher" && !primaryPosition) {
      toast({ title: "กรุณาเลือกตำแหน่งหลัก", variant: "destructive" });
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    try {
      const response = await api.post("/index.php?page=manage-role", {
        userId: user.id,
        newRole,
        primaryPosition: newRole === "teacher" ? primaryPosition : null,
        secondaryPositions: newRole === "teacher" ? secondaryPositions.filter((position) => position !== primaryPosition) : [],
      });
      if (response.data.status !== "success") throw new Error("ไม่สามารถอัปเดต Role ได้");
      toast({ title: "มอบหมาย Role สำเร็จ" });
      await onSaved();
      onClose();
    } catch (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: errorMessage(error, "ไม่สามารถอัปเดต Role ได้"), variant: "destructive" });
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !savingRef.current) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle>จัดการ Role/ตำแหน่ง</DialogTitle>
          <DialogDescription>เปลี่ยน Role ของ {user.fullName}</DialogDescription>
        </DialogHeader>
        {isLoading && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />กำลังโหลดตำแหน่งผู้ใช้...</p>}
        {loadError && (
          <div role="alert" className="space-y-2 text-sm text-destructive">
            <p>{loadError}</p>
            <Button variant="outline" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>ลองอีกครั้ง</Button>
          </div>
        )}
        <fieldset disabled={isLoading || isSaving || Boolean(loadError)} className="min-w-0 space-y-5 py-4 disabled:opacity-60">
          <div className="space-y-2.5">
            <Label htmlFor="assign-role">Role หลัก</Label>
            <Select value={newRole} disabled={isLoading || isSaving || Boolean(loadError)} onValueChange={(value) => {
              setNewRole(value);
              if (value !== "teacher") {
                setPrimaryPosition("");
                setSecondaryPositions([]);
              }
            }}>
              <SelectTrigger id="assign-role"><SelectValue placeholder="เลือก Role" /></SelectTrigger>
              <SelectContent>{roles.map((role) => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {newRole === "teacher" && (
            <>
              <div className="space-y-2.5">
                <Label htmlFor="assign-primary-position">ตำแหน่งหลัก</Label>
                <Select value={primaryPosition} disabled={isLoading || isSaving || Boolean(loadError)} onValueChange={(value) => {
                  setPrimaryPosition(value);
                  setSecondaryPositions((positions) => positions.filter((position) => position !== value));
                }}>
                  <SelectTrigger id="assign-primary-position"><SelectValue placeholder="เลือกตำแหน่งหลัก" /></SelectTrigger>
                  <SelectContent>{teacherSubRoles.map((position) => <SelectItem key={position.value} value={position.value}>{position.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-3 rounded-lg border border-border/80 bg-muted/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <Label>ตำแหน่งรอง</Label>
                  <span className="text-xs text-muted-foreground">{secondaryPositions.length} รายการ</span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {teacherSubRoles.map((position) => {
                    const isPrimary = primaryPosition === position.value;
                    const isSelected = secondaryPositions.includes(position.value);
                    return (
                      <Button key={position.value} type="button" variant="outline" disabled={isPrimary} aria-pressed={isSelected && !isPrimary}
                        className={cn(
                          "h-auto min-h-[52px] items-center justify-between gap-3 whitespace-normal rounded-lg px-3 py-2.5 text-left leading-snug transition-all",
                          "border-border/80 bg-background/60 hover:border-primary/60 hover:bg-primary/5",
                          isSelected && "border-primary/70 bg-primary/10 text-primary hover:bg-primary/15",
                          isPrimary && "border-muted bg-muted/30 text-muted-foreground opacity-70",
                        )}
                        onClick={() => setSecondaryPositions((positions) => positions.includes(position.value) ? positions.filter((value) => value !== position.value) : [...positions, position.value])}>
                        <span className="min-w-0 flex-1 break-words">{position.label}{isPrimary && <span className="mt-1 block text-xs text-muted-foreground">ตำแหน่งหลัก</span>}</span>
                        {isSelected && !isPrimary && <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-3.5 w-3.5" /></span>}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">เลือกได้หลายตำแหน่ง ตำแหน่งหลักจะไม่ถูกเลือกซ้ำเป็นตำแหน่งรอง</p>
              </div>
            </>
          )}
        </fieldset>
        <DialogFooter className="gap-2 border-t border-border/70 pt-4">
          <Button variant="outline" disabled={isSaving} onClick={onClose}>ยกเลิก</Button>
          <Button disabled={isLoading || isSaving || Boolean(loadError) || !newRole || (newRole === "teacher" && !primaryPosition)} onClick={handleAssignRole}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isSaving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
