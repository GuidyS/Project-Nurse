import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  Clock,
  Mail,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "request";
  channel: "in-app" | "email" | "both";
  direction: "received" | "sent";
  recipient: string;
  isRead: boolean;
  createdAt: string;
}

type NotificationCategory = "general" | "student" | "request" | "grade" | "project";

interface Student {
  id: number;
  name: string;
  studentId: string;
}

const NotificationsPage = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const canSendNotifications = Number(currentUser.role_id) !== 3;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationChannel, setNotificationChannel] =
    useState<Notification["channel"]>("both");
  const [notificationType, setNotificationType] =
    useState<Notification["type"]>("info");
  const [notificationCategory, setNotificationCategory] =
    useState<NotificationCategory>("student");
  const [studentSearch, setStudentSearch] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const unreadCount = notifications.filter(
    (n) => n.direction === "received" && !n.isRead
  ).length;
  const requestCount = notifications.filter(
    (n) => n.direction === "received" && n.type === "request" && !n.isRead
  ).length;
  const sentCount = notifications.filter((n) => n.direction === "sent").length;

  const filteredStudents = useMemo(
    () => students.filter((student) => student.studentId.includes(studentSearch)),
    [students, studentSearch]
  );

  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) => selectedStudents.includes(student.id));

  const resetForm = () => {
    setNotificationTitle("");
    setNotificationMessage("");
    setNotificationChannel("both");
    setNotificationType("info");
    setNotificationCategory("student");
    setSelectedStudents([]);
    setStudentSearch("");
  };

  const loadNotifications = async () => {
    try {
      const response = await api.get("/index.php?page=get-notifications");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data;
      setNotifications(
        Array.isArray(data)
          ? data.map((notification) => ({
              ...notification,
              direction: notification.direction || "received",
            }))
          : []
      );
    } catch (error) {
      setNotifications([]);
      toast({
        title: "โหลดข้อมูลไม่สำเร็จ",
        description: "ไม่สามารถโหลดรายการแจ้งเตือนได้",
        variant: "destructive",
      });
    }
  };

  const loadStudents = async () => {
    try {
      const response = await api.get("/index.php?page=get-notification-students");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data;
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      setStudents([]);
      toast({
        title: "โหลดรายชื่อนักศึกษาไม่สำเร็จ",
        description: "ไม่สามารถโหลดรายชื่อนักศึกษาสำหรับแจ้งเตือนได้",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadNotifications();
    if (canSendNotifications) {
      loadStudents();
    }
  }, [canSendNotifications]);

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "request":
        return <Users className="h-5 w-5 text-primary" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "success":
        return <CheckCheck className="h-5 w-5 text-success" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeBadge = (type: Notification["type"]) => {
    switch (type) {
      case "request":
        return <Badge className="bg-primary text-primary-foreground">คำขอ</Badge>;
      case "warning":
        return <Badge className="bg-warning text-warning-foreground">เตือน</Badge>;
      case "success":
        return <Badge className="bg-success text-success-foreground">สำเร็จ</Badge>;
      default:
        return <Badge variant="secondary">แจ้งเตือน</Badge>;
    }
  };

  const getChannelBadge = (channel: Notification["channel"]) => {
    if (channel === "email") {
      return (
        <Badge variant="outline" className="text-xs gap-1">
          <Mail className="h-3 w-3" /> Email
        </Badge>
      );
    }

    if (channel === "in-app") {
      return (
        <Badge variant="outline" className="text-xs gap-1">
          <Bell className="h-3 w-3" /> In-App
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-xs gap-1">
        <Bell className="h-3 w-3" /> ทั้งสอง
      </Badge>
    );
  };

  const markAsRead = async (id: number) => {
    try {
      await api.post("/index.php?page=mark-notification-read", { id });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      toast({ title: "อ่านแจ้งเตือนไม่สำเร็จ", variant: "destructive" });
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/index.php?page=mark-notification-read", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast({ title: "อ่านทั้งหมดแล้ว" });
    } catch (error) {
      toast({ title: "อ่านทั้งหมดไม่สำเร็จ", variant: "destructive" });
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.post("/index.php?page=delete-notification", { id });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast({ title: "ลบแจ้งเตือนสำเร็จ" });
    } catch (error) {
      toast({ title: "ลบแจ้งเตือนไม่สำเร็จ", variant: "destructive" });
    }
  };

  const toggleStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    const filteredStudentIds = filteredStudents.map((s) => s.id);

    if (allFilteredSelected) {
      setSelectedStudents((prev) =>
        prev.filter((id) => !filteredStudentIds.includes(id))
      );
      return;
    }

    setSelectedStudents((prev) =>
      Array.from(new Set([...prev, ...filteredStudentIds]))
    );
  };

  const sendNotification = async () => {
    if (!canSendNotifications) {
      toast({
        title: "ไม่มีสิทธิ์ส่งแจ้งเตือน",
        description: "บัญชีนักศึกษาไม่สามารถส่งการแจ้งเตือนได้",
        variant: "destructive",
      });
      return;
    }

    if (!notificationTitle.trim() || !notificationMessage.trim() || selectedStudents.length === 0) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "ต้องระบุหัวข้อ เนื้อหา และเลือกนักศึกษาอย่างน้อย 1 คน",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await api.post("/index.php?page=send-notification", {
        title: notificationTitle.trim(),
        message: notificationMessage.trim(),
        channel: notificationChannel,
        type: notificationType,
        category: notificationCategory,
        student_ids: selectedStudents,
      });
      const sent = Number(response.data?.sent ?? selectedStudents.length);
      const skipped = Number(response.data?.skipped ?? 0);

      await loadNotifications();
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "ส่งการแจ้งเตือนสำเร็จ",
        description: skipped > 0
          ? `ส่งสำเร็จ ${sent} คน และข้าม ${skipped} คนตามการตั้งค่าผู้รับ`
          : `ส่งแจ้งเตือนไปยังนักศึกษา ${sent} คนแล้ว`,
      });
    } catch (error) {
      toast({ title: "ส่งการแจ้งเตือนไม่สำเร็จ", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);

    if (!open) {
      resetForm();
    }
  };

  const filteredNotifications = (tab: string) => {
    switch (tab) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "requests":
        return notifications.filter((n) => n.direction === "received" && n.type === "request");
      case "sent":
        return notifications.filter((n) => n.direction === "sent");
      default:
        return notifications;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            การแจ้งเตือน
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                {unreadCount} ใหม่
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            จัดการและส่งการแจ้งเตือนให้นักศึกษา (FR010, FR016)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            อ่านทั้งหมด
          </Button>
          {canSendNotifications && (
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  ส่งแจ้งเตือนใหม่
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>ส่งการแจ้งเตือนให้นักศึกษา</DialogTitle>
                  <DialogDescription>
                    ส่งแจ้งเตือนผ่าน In-App และ/หรือ Email ให้นักศึกษา
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>หัวข้อ</Label>
                    <Input
                      placeholder="เช่น แจ้งเตือนกำหนดส่งงาน"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>เนื้อหา</Label>
                    <Textarea
                      placeholder="เขียนข้อความแจ้งเตือน..."
                      rows={4}
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ช่องทางการส่ง</Label>
                    <Select
                      value={notificationChannel}
                      onValueChange={(value: Notification["channel"]) =>
                        setNotificationChannel(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-app">In-App เท่านั้น</SelectItem>
                        <SelectItem value="email">Email เท่านั้น</SelectItem>
                        <SelectItem value="both">ทั้ง In-App และ Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>ประเภทแจ้งเตือน</Label>
                      <Select
                        value={notificationType}
                        onValueChange={(value: Notification["type"]) =>
                          setNotificationType(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">ทั่วไป</SelectItem>
                          <SelectItem value="warning">เตือน</SelectItem>
                          <SelectItem value="success">สำเร็จ</SelectItem>
                          <SelectItem value="request">คำขอ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>หมวดการตั้งค่า</Label>
                      <Select
                        value={notificationCategory}
                        onValueChange={(value: NotificationCategory) =>
                          setNotificationCategory(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">ทั่วไป</SelectItem>
                          <SelectItem value="student">นักศึกษา</SelectItem>
                          <SelectItem value="request">คำขอนักศึกษา</SelectItem>
                          <SelectItem value="grade">เกรด</SelectItem>
                          <SelectItem value="project">โครงการ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>เลือกนักศึกษา ({selectedStudents.length} คน)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllStudents}
                        disabled={filteredStudents.length === 0}
                      >
                        {allFilteredSelected ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                      </Button>
                    </div>
                    <Input
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="ค้นหารหัสนักศึกษา"
                      value={studentSearch}
                      onChange={(e) =>
                        setStudentSearch(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                    />
                    <div className="border rounded-lg max-h-[200px] overflow-y-auto">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <label
                            key={student.id}
                            className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                          >
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => toggleStudent(student.id)}
                            />
                            <div>
                              <p className="text-sm font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {student.studentId}
                              </p>
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-muted-foreground">
                          ไม่พบนักศึกษาที่ตรงกับรหัสที่ค้นหา
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={sendNotification} className="gap-2" disabled={isSending}>
                    <Send className="h-4 w-4" />
                    {isSending ? "กำลังส่ง..." : "ส่งแจ้งเตือน"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
          <p className="text-xs text-muted-foreground">ทั้งหมด</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{unreadCount}</p>
          <p className="text-xs text-muted-foreground">ยังไม่อ่าน</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-warning">{requestCount}</p>
          <p className="text-xs text-muted-foreground">คำขอนัดพบ</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-success">{sentCount}</p>
          <p className="text-xs text-muted-foreground">ส่งสำเร็จ</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          <TabsTrigger value="unread" className="gap-1">
            ยังไม่อ่าน
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-1">
            คำขอจาก นศ.
            {requestCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {requestCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">ที่ส่งแล้ว</TabsTrigger>
        </TabsList>

        {["all", "unread", "requests", "sent"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-3">
            {filteredNotifications(tab).length > 0 ? (
              filteredNotifications(tab).map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-card rounded-xl shadow-card p-4 flex items-start gap-4 transition-colors ${
                    !notification.isRead ? "border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getTypeBadge(notification.type)}
                      {getChannelBadge(notification.channel)}
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <h4 className="font-semibold text-foreground">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {notification.createdAt}
                      </span>
                      <span>ถึง: {notification.recipient}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-xl shadow-card p-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  ไม่มีการแจ้งเตือน
                </h3>
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีการแจ้งเตือนในหมวดหมู่นี้
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
