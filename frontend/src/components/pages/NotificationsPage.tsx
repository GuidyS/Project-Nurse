import { useState } from "react";
import {
  Bell,
  Mail,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Send,
  Users,
  AlertCircle,
  Clock,
  X,
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "request";
  channel: "in-app" | "email" | "both";
  recipient: string;
  isRead: boolean;
  createdAt: string;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "คำขอนัดพบอาจารย์",
    message: "นายสมชาย รักเรียน ต้องการนัดพบเพื่อปรึกษาเรื่องการลงทะเบียน",
    type: "request",
    channel: "in-app",
    recipient: "นายสมชาย รักเรียน",
    isRead: false,
    createdAt: "10 นาทีที่แล้ว",
  },
  {
    id: 2,
    title: "แจ้งเตือนกำหนดส่งรายงาน",
    message: "ส่งการแจ้งเตือนกำหนดส่งรายงานโครงการวิจัยให้นักศึกษา 5 คน",
    type: "info",
    channel: "email",
    recipient: "นักศึกษาในที่ปรึกษา",
    isRead: false,
    createdAt: "1 ชั่วโมงที่แล้ว",
  },
  {
    id: 3,
    title: "นศ. ต้องการคำปรึกษา",
    message: "นางสาวพิมพ์ใจ สวยงาม ขอนัดพบเพื่อปรึกษาเรื่องการฝึกงาน",
    type: "request",
    channel: "in-app",
    recipient: "นางสาวพิมพ์ใจ สวยงาม",
    isRead: false,
    createdAt: "2 ชั่วโมงที่แล้ว",
  },
  {
    id: 4,
    title: "ส่งการแจ้งเตือนสำเร็จ",
    message: "แจ้งเตือนผลการเรียนถึงนักศึกษา 12 คน สำเร็จแล้ว",
    type: "success",
    channel: "both",
    recipient: "นักศึกษาทั้งหมด",
    isRead: true,
    createdAt: "1 วันที่แล้ว",
  },
  {
    id: 5,
    title: "เตือน: นศ. เกรดต่ำกว่าเกณฑ์",
    message: "พบนักศึกษา 2 คน ที่มีเกรดเฉลี่ยต่ำกว่า 2.00 ควรนัดพบ",
    type: "warning",
    channel: "in-app",
    recipient: "ระบบอัตโนมัติ",
    isRead: true,
    createdAt: "2 วันที่แล้ว",
  },
];

const students = [
  { id: 1, name: "นายสมชาย รักเรียน", studentId: "64010001" },
  { id: 2, name: "นางสาวสมหญิง ใจดี", studentId: "64010002" },
  { id: 3, name: "นายวิชัย เก่งกล้า", studentId: "64010003" },
  { id: 4, name: "นางสาวพิมพ์ใจ สวยงาม", studentId: "65010001" },
  { id: 5, name: "นายกิตติ อดทน", studentId: "65010002" },
  { id: 6, name: "นางสาวนภา ท้องฟ้า", studentId: "66010001" },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationChannel, setNotificationChannel] = useState<string>("both");
  const { toast } = useToast();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const requestCount = notifications.filter((n) => n.type === "request" && !n.isRead).length;

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
    switch (channel) {
      case "email":
        return (
          <Badge variant="outline" className="text-xs gap-1">
            <Mail className="h-3 w-3" /> Email
          </Badge>
        );
      case "in-app":
        return (
          <Badge variant="outline" className="text-xs gap-1">
            <Bell className="h-3 w-3" /> In-App
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs gap-1">
            <Bell className="h-3 w-3" /> ทั้งสอง
          </Badge>
        );
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    toast({
      title: "อ่านทั้งหมดแล้ว",
      description: "ทำเครื่องหมายอ่านแล้วทั้งหมดสำเร็จ",
    });
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast({
      title: "ลบแจ้งเตือน",
      description: "ลบการแจ้งเตือนสำเร็จ",
    });
  };

  const toggleStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
  };

  const sendNotification = () => {
    if (!notificationTitle || !notificationMessage || selectedStudents.length === 0) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "ต้องระบุหัวข้อ เนื้อหา และเลือกนักศึกษาอย่างน้อย 1 คน",
        variant: "destructive",
      });
      return;
    }

    const newNotification: Notification = {
      id: Date.now(),
      title: `ส่งแจ้งเตือน: ${notificationTitle}`,
      message: `ส่งไปยังนักศึกษา ${selectedStudents.length} คน`,
      type: "success",
      channel: notificationChannel as Notification["channel"],
      recipient: `${selectedStudents.length} คน`,
      isRead: false,
      createdAt: "เมื่อสักครู่",
    };

    setNotifications([newNotification, ...notifications]);
    setIsDialogOpen(false);
    setNotificationTitle("");
    setNotificationMessage("");
    setSelectedStudents([]);
    setNotificationChannel("both");

    toast({
      title: "ส่งการแจ้งเตือนสำเร็จ",
      description: `ส่งแจ้งเตือนไปยังนักศึกษา ${selectedStudents.length} คนแล้ว`,
    });
  };

  const filteredNotifications = (tab: string) => {
    switch (tab) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "requests":
        return notifications.filter((n) => n.type === "request");
      case "sent":
        return notifications.filter((n) => n.type === "success" || n.type === "info");
      default:
        return notifications;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  <Select value={notificationChannel} onValueChange={setNotificationChannel}>
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>เลือกนักศึกษา ({selectedStudents.length} คน)</Label>
                    <Button variant="ghost" size="sm" onClick={selectAllStudents}>
                      {selectedStudents.length === students.length ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                    </Button>
                  </div>
                  <div className="border rounded-lg max-h-[200px] overflow-y-auto">
                    {students.map((student) => (
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
                          <p className="text-xs text-muted-foreground">{student.studentId}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={sendNotification} className="gap-2">
                  <Send className="h-4 w-4" />
                  ส่งแจ้งเตือน
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
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
          <p className="text-2xl font-bold text-success">
            {notifications.filter((n) => n.type === "success").length}
          </p>
          <p className="text-xs text-muted-foreground">ส่งสำเร็จ</p>
        </div>
      </div>

      {/* Tabs */}
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
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
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
                <h3 className="font-semibold text-foreground mb-2">ไม่มีการแจ้งเตือน</h3>
                <p className="text-sm text-muted-foreground">ยังไม่มีการแจ้งเตือนในหมวดหมู่นี้</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
