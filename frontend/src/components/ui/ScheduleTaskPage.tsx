import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

interface ScheduleTaskPageProps {
  open?: boolean;
  onBack?: () => void;
  mode?: "full" | "edit-only";
  editInitialTask?: {
    studentId: string;
    studentName: string;
    task: string;
    dueDate: string;
    priority: Task["priority"];
    status: Task["status"];
  };
  onSaveEdit?: (task: {
    studentId: string;
    studentName: string;
    task: string;
    dueDate: string;
    priority: Task["priority"];
    status: Task["status"];
  }) => void;
}

interface Task {
  id: number;
  studentId: string;
  studentName: string;
  task: string;
  dueDate: string;
  priority: "สูง" | "กลาง" | "ต่ำ";
  status: "กำลังทำ" | "เสร็จสิ้น" | "รอดำเนินการ" | "เลยกำหนด";
}

const initialTasks: Task[] = [
  { id: 1, studentId: "64010001", studentName: "สมชาย ใจดี", task: "ฝึกตรวจสัญญาณชีพ", dueDate: "2024-01-20", priority: "สูง", status: "กำลังทำ" },
  { id: 2, studentId: "64010002", studentName: "สมหญิง รักเรียน", task: "เขียนรายงานการฝึก", dueDate: "2024-01-18", priority: "กลาง", status: "เสร็จสิ้น" },
  { id: 3, studentId: "64010003", studentName: "มานะ ตั้งใจ", task: "นำเสนอกรณีศึกษา", dueDate: "2024-01-25", priority: "สูง", status: "รอดำเนินการ" },
  { id: 4, studentId: "64010004", studentName: "มานี ขยัน", task: "ทบทวนขั้นตอนการดูแลผู้ป่วย", dueDate: "2024-01-15", priority: "สูง", status: "เลยกำหนด" },
  { id: 5, studentId: "64010005", studentName: "ปิติ สุขใจ", task: "ฝึกการเจาะเลือด", dueDate: "2024-01-22", priority: "กลาง", status: "กำลังทำ" },
  { id: 6, studentId: "64010006", studentName: "ปิยะ มุ่งมั่น", task: "สังเกตการณ์ผ่าตัด", dueDate: "2024-01-28", priority: "ต่ำ", status: "รอดำเนินการ" },
];

const priorityColors: Record<string, string> = {
  สูง: "bg-red-100 text-red-700 border-red-200",
  กลาง: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ต่ำ: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusColors: Record<string, string> = {
  กำลังทำ: "bg-blue-500 text-white",
  เสร็จสิ้น: "bg-green-500 text-white",
  รอดำเนินการ: "bg-gray-200 text-gray-700",
  เลยกำหนด: "bg-orange-500 text-white",
};

export default function ScheduleTaskPage({
  open = true,
  onBack,
  mode = "full",
  editInitialTask,
  onSaveEdit,
}: ScheduleTaskPageProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [search, setSearch] = useState("");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Task>>({});

  const filtered = tasks.filter(
    (t) =>
      t.studentId.includes(search) ||
      t.studentName.includes(search) ||
      t.task.includes(search)
  );

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "เสร็จสิ้น").length,
    inProgress: tasks.filter((t) => t.status === "กำลังทำ").length,
    overdue: tasks.filter((t) => t.status === "เลยกำหนด").length,
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setFormData({ ...task });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editTask || !formData) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === editTask.id ? { ...t, ...formData } as Task : t))
    );
    setIsEditOpen(false);
    setEditTask(null);
    toast.success("บันทึกการแก้ไขเรียบร้อยแล้ว");
  };

  const openCreate = () => {
    setFormData({
      studentId: "",
      studentName: "",
      task: "",
      dueDate: "",
      priority: "กลาง",
      status: "รอดำเนินการ",
    });
    setIsCreateOpen(true);
  };

  const handleCreate = () => {
    const newTask: Task = {
      id: Date.now(),
      studentId: formData.studentId || "",
      studentName: formData.studentName || "",
      task: formData.task || "",
      dueDate: formData.dueDate || "",
      priority: (formData.priority as Task["priority"]) || "กลาง",
      status: (formData.status as Task["status"]) || "รอดำเนินการ",
    };
    setTasks((prev) => [...prev, newTask]);
    setIsCreateOpen(false);
    toast.success("สร้างงานใหม่เรียบร้อยแล้ว");
  };

  const handleRush = (task: Task) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, priority: "สูง" as const } : t
      )
    );
    toast.info(`เร่งรัดงาน "${task.task}" ของ ${task.studentName} แล้ว`);
  };

  const statCards = [
    { label: "งานทั้งหมด", value: stats.total, icon: Calendar, color: "text-foreground" },
    { label: "เสร็จสิ้น", value: stats.done, icon: CheckCircle, color: "text-green-600" },
    { label: "กำลังทำ", value: stats.inProgress, icon: Clock, color: "text-foreground" },
    { label: "เลยกำหนด", value: stats.overdue, icon: AlertTriangle, color: "text-destructive" },
  ];

  const TaskFormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>รหัสนักศึกษา</Label>
          <Input value={formData.studentId || ""} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>ชื่อ-นามสกุล</Label>
          <Input value={formData.studentName || ""} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>งาน</Label>
        <Textarea value={formData.task || ""} onChange={(e) => setFormData({ ...formData, task: e.target.value })} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>กำหนดส่ง</Label>
          <Input type="date" value={formData.dueDate || ""} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>ความสำคัญ</Label>
          <Select value={formData.priority || "กลาง"} onValueChange={(v) => setFormData({ ...formData, priority: v as Task["priority"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="สูง">สูง</SelectItem>
              <SelectItem value="กลาง">กลาง</SelectItem>
              <SelectItem value="ต่ำ">ต่ำ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>สถานะ</Label>
          <Select value={formData.status || "รอดำเนินการ"} onValueChange={(v) => setFormData({ ...formData, status: v as Task["status"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="รอดำเนินการ">รอดำเนินการ</SelectItem>
              <SelectItem value="กำลังทำ">กำลังทำ</SelectItem>
              <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
              <SelectItem value="เลยกำหนด">เลยกำหนด</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (mode === "edit-only" && editInitialTask && open) {
      setFormData({ ...editInitialTask });
    }
  }, [mode, editInitialTask, open]);

  if (mode === "edit-only") {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && onBack) onBack(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>แก้ไขงาน</DialogTitle>
          </DialogHeader>
          <TaskFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={onBack}>ยกเลิก</Button>
            <Button
              onClick={() => {
                if (!formData.studentId || !formData.studentName || !formData.task || !formData.dueDate) return;
                onSaveEdit?.({
                  studentId: formData.studentId,
                  studentName: formData.studentName,
                  task: formData.task,
                  dueDate: formData.dueDate,
                  priority: (formData.priority as Task["priority"]) || "กลาง",
                  status: (formData.status as Task["status"]) || "รอดำเนินการ",
                });
                if (onBack) onBack();
              }}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && onBack) onBack(); }}>
      <DialogContent className="max-w-6xl max-h-[88vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Schedule Task</h1>
              <p className="text-muted-foreground">มอบหมายงานให้นักศึกษาฝึกปฏิบัติ</p>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" /> สร้างงานใหม่
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <Card key={i}>
                <CardContent className="flex items-start justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  </div>
                  <s.icon className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-foreground">รายการงาน</h2>
                <p className="text-sm text-muted-foreground">งานที่มอบหมายทั้งหมด</p>
              </div>
              <div className="relative mb-4 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-3 px-3 font-medium">รหัสนักศึกษา</th>
                      <th className="text-left py-3 px-3 font-medium">ชื่อ-นามสกุล</th>
                      <th className="text-left py-3 px-3 font-medium">งาน</th>
                      <th className="text-left py-3 px-3 font-medium">กำหนดส่ง</th>
                      <th className="text-center py-3 px-3 font-medium">ความสำคัญ</th>
                      <th className="text-center py-3 px-3 font-medium">สถานะ</th>
                      <th className="text-center py-3 px-3 font-medium">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-4 px-3 font-medium">{t.studentId}</td>
                        <td className="py-4 px-3">{t.studentName}</td>
                        <td className="py-4 px-3">{t.task}</td>
                        <td className="py-4 px-3">{t.dueDate}</td>
                        <td className="py-4 px-3 text-center">
                          <Badge variant="outline" className={`${priorityColors[t.priority]} text-xs`}>
                            {t.priority}
                          </Badge>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <Badge className={`${statusColors[t.status]} text-xs`}>
                            {t.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(t)} className="gap-1">
                              <Pencil className="w-3 h-3" /> แก้ไข
                            </Button>
                            <Button size="sm" onClick={() => handleRush(t)} className="bg-blue-600 hover:bg-blue-700 text-white">
                              เร่งลัน
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>แก้ไขงาน</DialogTitle>
          </DialogHeader>
          <TaskFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSaveEdit}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>สร้างงานใหม่</DialogTitle>
          </DialogHeader>
          <TaskFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleCreate}>สร้าง</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}