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
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "request";
  channel: "in-app" | "email" | "both";
  direction: "received" | "sent";
  recipient: string;
  sender?: string;
  isRead: boolean;
  createdAt: string;
}

type NotificationCategory = "general" | "student" | "request" | "grade" | "project";

interface Recipient {
  id: number;
  name: string;
  identifier: string; // รองรับทั้งรหัสนศ., รหัสอจ., username
  role_id: number;
}

const NotificationsPage = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const canSendNotifications = Number(currentUser.role_id) !== 3;
  const roleId = Number(currentUser.role_id);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationChannel, setNotificationChannel] =
    useState<Notification["channel"]>("both");
  const [notificationType, setNotificationType] =
    useState<Notification["type"]>("info");
  const [notificationCategory, setNotificationCategory] =
    useState<NotificationCategory>("student");
  const [isSending, setIsSending] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const unreadCount = notifications.filter(
    (n) => n.direction === "received" && !n.isRead
  ).length;
  const requestCount = notifications.filter(
    (n) => n.direction === "received" && n.type === "request" && !n.isRead
  ).length;
  const sentCount = notifications.filter((n) => n.direction === "sent").length;

  const filteredRecipients = useMemo(
    () => recipients.filter((rec) => 
      rec.identifier.toLowerCase().includes(recipientSearch.toLowerCase()) || 
      rec.name.toLowerCase().includes(recipientSearch.toLowerCase())
    ),
    [recipients, recipientSearch]
  );

  const allFilteredSelected = filteredRecipients.length > 0 && filteredRecipients.every((rec) => selectedRecipients.includes(rec.id));

  // 🎯 ฟังก์ชันกรอง "ประเภทแจ้งเตือน" ตาม Role
  const getTypeOptions = () => {
    if (roleId === 1) {
      // Admin: เน้นเรื่องประกาศระบบทั่วไป ไม่มีเรื่องคำร้องขอ (Request)
      return [
        { value: "info", label: "ทั่วไป (Info)" },
        { value: "warning", label: "ประกาศเตือน (Warning)" },
        { value: "success", label: "สำเร็จ (Success)" },
      ];
    }
    // Teacher: มีเรื่องคำขอ/ส่งเอกสารเพิ่มเข้ามา
    return [
      { value: "info", label: "ทั่วไป" },
      { value: "warning", label: "เตือน" },
      { value: "success", label: "สำเร็จ" },
      { value: "request", label: "คำขอ / ส่งเอกสาร" },
    ];
  };

  // 🎯 ฟังก์ชันกรอง "หมวดการตั้งค่า" ตาม Role
  const getCategoryOptions = () => {
    if (roleId === 1) {
      // Admin: มีแค่หมวดประกาศทั่วไปของระบบ
      return [
        { value: "general", label: "ประกาศทั่วไป / ระบบ" },
      ];
    }
    // Teacher: มีหมวดหมู่เกี่ยวกับการเรียนการสอนครบถ้วน
    return [
      { value: "student", label: "เรื่องนักศึกษาทั่วไป" },
      { value: "request", label: "เอกสาร / คำร้องต่างๆ" },
      { value: "grade", label: "เรื่องเกรด / ผลการเรียน" },
      { value: "project", label: "เรื่องโครงการ" },
    ];
  };

  const resetForm = () => {
    setNotificationTitle("");
    setNotificationMessage("");
    setNotificationChannel("both");
    setNotificationType("info");
    setNotificationCategory(roleId === 1 ? "general" : "student");
    setSelectedRecipients([]);
    setRecipientSearch("");
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

  const loadRecipients = async () => {
    try {
      const response = await api.get("/index.php?page=get-notification-students"); // เรียกไฟล์เดิมที่คุณอัปเดตโค้ดข้างบน
      const data = Array.isArray(response.data) ? response.data : response.data?.data;
      setRecipients(Array.isArray(data) ? data : []);
    } catch (error) {
      setRecipients([]);
      toast({ title: "โหลดรายชื่อผู้รับไม่สำเร็จ", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadNotifications();
    if (canSendNotifications) {
      loadRecipients();
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
      window.dispatchEvent(new Event("updateNotificationBadge"));
    } catch (error) {
      toast({ title: "อ่านแจ้งเตือนไม่สำเร็จ", variant: "destructive" });
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/index.php?page=mark-notification-read", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast({ title: "อ่านทั้งหมดแล้ว" });
      window.dispatchEvent(new Event("updateNotificationBadge"));
    } catch (error) {
      toast({ title: "อ่านทั้งหมดไม่สำเร็จ", variant: "destructive" });
    }
  };

  const openDeleteConfirm = (id: number) => {
    setPendingDeleteId(id);
    setIsDeleteOpen(true);
  };

  const deleteNotification = async () => {
    if (pendingDeleteId == null) return;
    setIsDeleting(true);
    try {
      await api.post("/index.php?page=delete-notification", { id: pendingDeleteId });
      setNotifications((prev) => prev.filter((n) => n.id !== pendingDeleteId));
      setIsDeleteOpen(false);
      setPendingDeleteId(null);
      toast({ title: "ลบแจ้งเตือนสำเร็จ" });
      window.dispatchEvent(new Event("updateNotificationBadge"));
    } catch (error) {
      toast({ title: "ลบแจ้งเตือนไม่สำเร็จ", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailDialogOpen(true); // เปิดหน้าต่างดูรายละเอียด

    // หากเป็นการแจ้งเตือนที่เราได้รับและยังไม่ได้อ่าน ให้ปรับสถานะเป็นอ่านแล้วโดยอัตโนมัติ
    if (notification.direction === "received" && !notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const toggleRecipient = (userId: number) => {
    setSelectedRecipients((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  };

  const selectAllRecipients = () => {
    const filteredIds = filteredRecipients.map((s) => s.id);
    if (allFilteredSelected) {
      setSelectedRecipients((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedRecipients((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
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

    if (!notificationTitle.trim() || !notificationMessage.trim() || selectedRecipients.length === 0) {
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
        recipient_ids: selectedRecipients,
      });
      const sent = Number(response.data?.sent ?? selectedRecipients.length);
      const skipped = Number(response.data?.skipped ?? 0);

      await loadNotifications();
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "ส่งการแจ้งเตือนสำเร็จ"
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

  const getRoleBadge = (roleId: number) => {
    if (roleId === 1) return <Badge className="bg-destructive hover:bg-destructive text-[10px] h-4">Admin</Badge>;
    if (roleId === 2) return <Badge className="bg-blue-500 hover:bg-blue-600 text-[10px] h-4">อาจารย์</Badge>;
    return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] h-4">นักศึกษา</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            การแจ้งเตือน
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                {unreadCount} ใหม่
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            จัดการและส่งการแจ้งเตือนให้นักศึกษา
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={markAllAsRead} className="gap-2">
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
              <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[800px]">
                <DialogHeader className="shrink-0 space-y-1.5 border-b px-6 py-8 pr-12 text-left">
                  <DialogTitle>ส่งการแจ้งเตือนให้นักศึกษา</DialogTitle>
                  <DialogDescription>
                    ส่งแจ้งเตือนผ่าน In-App และ/หรือ Email ให้นักศึกษา
                  </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
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
                          {/* 🎯 เรียกใช้ฟังก์ชันดึงตัวเลือกประเภทตาม Role */}
                          {getTypeOptions().map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
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
                          {/* 🎯 เรียกใช้ฟังก์ชันดึงตัวเลือกหมวดหมู่ตาม Role */}
                          {getCategoryOptions().map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>เลือกผู้รับการแจ้งเตือน ({selectedRecipients.length} คน)</Label>
                      <Button variant="ghost" size="sm" onClick={selectAllRecipients} disabled={filteredRecipients.length === 0}>
                        {allFilteredSelected ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                      </Button>
                    </div>
                    <Input
                      placeholder="ค้นหาชื่อ หรือ รหัสประจำตัว/Username..."
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                    />
                    <div className="border rounded-lg max-h-[200px] overflow-y-auto">
                      {filteredRecipients.length > 0 ? (
                        filteredRecipients.map((rec) => (
                          <label
                            key={rec.id}
                            className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                          >
                            <Checkbox
                              checked={selectedRecipients.includes(rec.id)}
                              onCheckedChange={() => toggleRecipient(rec.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">{rec.name}</p>
                                {getRoleBadge(rec.role_id)}
                              </div>
                              <p className="text-xs text-muted-foreground">{rec.identifier}</p>
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-center text-muted-foreground">
                          ไม่พบผู้รับที่ตรงกับการค้นหา
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="shrink-0 border-t px-6 py-4 sm:space-x-2">
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
                  onClick={() => handleCardClick(notification)} 
                  // 🎯 เพิ่ม border border-transparent และ hover:border-primary/60 เพื่อทำกรอบสีเมื่อเอาเมาส์วาง
                  className={`bg-card rounded-xl shadow-card p-4 flex items-start gap-4 transition-all cursor-pointer hover:bg-muted/50 hover:shadow-md border border-transparent hover:border-primary/60 ${
                    !notification.isRead 
                      ? "border-l-4 border-l-primary" // ขอบซ้ายหนา 4px กรณีที่ยังไม่อ่าน
                      : "opacity-90 border-border/40" // ขอบจางๆ กรณีที่อ่านแล้ว
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
                      <span>
                        {notification.direction === 'sent' 
                          ? `ถึง: ${notification.recipient}` 
                          : `จาก: ${notification.sender || 'ระบบ'}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/20 hover:text-primary z-10"
                        onClick={(e) => {
                          e.stopPropagation(); // 🎯 5. ดักจับ Event ไม่ให้การกดปุ่ม "ติ๊กอ่านแล้ว" ทะลุไปเปิดหน้าต่างรายละเอียด
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive z-10"
                      onClick={(e) => {
                        e.stopPropagation(); // 🎯 ดักจับ Event ไม่ให้การกดปุ่ม "ลบ" ทะลุไปเปิดหน้าต่างรายละเอียด
                        openDeleteConfirm(notification.id);
                      }}
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

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && getTypeIcon(selectedNotification.type)}
              รายละเอียดการแจ้งเตือน
            </DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                {getTypeBadge(selectedNotification.type)}
                {getChannelBadge(selectedNotification.channel)}
              </div>
              
              <h3 className="text-xl font-semibold text-foreground leading-tight">
                {selectedNotification.title}
              </h3>
              
              <div className="bg-muted/50 p-4 rounded-xl border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>
              
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mt-4 p-3 bg-card border rounded-lg">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> 
                  เวลา: {selectedNotification.createdAt}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> 
                  {selectedNotification.direction === 'sent' 
                    ? `ผู้รับ: ${selectedNotification.recipient}` 
                    : `ผู้ส่ง: ${selectedNotification.sender || 'ระบบ'}`}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setPendingDeleteId(null);
        }}
        title="ยืนยันการลบ"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบการแจ้งเตือนนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        confirmLabel="ลบ"
        variant="destructive"
        onConfirm={deleteNotification}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default NotificationsPage;