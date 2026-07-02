import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, MessageSquare, UserCheck, Clock, CheckCircle } from 'lucide-react';
import { useState } from 'react';

// Mock notifications
const mockNotifications = [
  { 
    id: '1', 
    type: 'warning', 
    title: 'นักศึกษา GPA ต่ำ', 
    message: 'มานี ขยัน (65010002) มี GPA ต่ำกว่า 2.00 สองเทอมติด ต้องการการติดตาม', 
    date: '2024-01-15', 
    time: '10:30',
    read: false,
    studentId: '65010002'
  },
  { 
    id: '2', 
    type: 'request', 
    title: 'คำขอพบที่ปรึกษา', 
    message: 'สมหญิง รักเรียน (64010002) ต้องการนัดพบเพื่อปรึกษาเรื่องการลงทะเบียน', 
    date: '2024-01-14', 
    time: '14:15',
    read: false,
    studentId: '64010002'
  },
  { 
    id: '3', 
    type: 'info', 
    title: 'แจ้งเตือนประจำเดือน', 
    message: 'กรุณาตรวจสอบผลการเรียนของนักศึกษาในที่ปรึกษาประจำเดือนมกราคม', 
    date: '2024-01-10', 
    time: '09:00',
    read: true,
    studentId: null
  },
  { 
    id: '4', 
    type: 'transfer', 
    title: 'คำขอรับมอบนักศึกษา', 
    message: 'อ.สมศักดิ์ ขอมอบนักศึกษา วิชัย มานะ (64010005) มาอยู่ในความดูแล', 
    date: '2024-01-08', 
    time: '11:45',
    read: true,
    studentId: '64010005'
  },
  { 
    id: '5', 
    type: 'warning', 
    title: 'ขาดการติดต่อ', 
    message: 'ปิยะ มุ่งมั่น (66010002) ไม่ได้ติดต่อที่ปรึกษามากกว่า 30 วัน', 
    date: '2024-01-05', 
    time: '16:00',
    read: true,
    studentId: '66010002'
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'request':
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case 'transfer':
      return <UserCheck className="h-5 w-5 text-purple-500" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'warning':
      return <Badge className="bg-yellow-500">เตือน</Badge>;
    case 'request':
      return <Badge className="bg-blue-500">คำขอ</Badge>;
    case 'transfer':
      return <Badge className="bg-purple-500">รับมอบ</Badge>;
    default:
      return <Badge variant="secondary">ข้อมูล</Badge>;
  }
};

export default function AdvisorNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">การแจ้งเตือน</h1>
            <p className="text-muted-foreground">การแจ้งเตือนเกี่ยวกับนักศึกษาในที่ปรึกษา</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="mr-2 h-4 w-4" />
              อ่านทั้งหมด
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยังไม่อ่าน</CardTitle>
              <Bell className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{unreadCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การเตือน</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications.filter(n => n.type === 'warning').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คำขอพบ</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications.filter(n => n.type === 'request').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รับมอบ</CardTitle>
              <UserCheck className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications.filter(n => n.type === 'transfer').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>รายการแจ้งเตือน</CardTitle>
            <CardDescription>การแจ้งเตือนทั้งหมดเรียงตามวันที่</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                  !notification.read ? 'bg-primary/5 border-primary/20' : ''
                }`}
              >
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    {getTypeBadge(notification.type)}
                    {!notification.read && (
                      <Badge variant="outline" className="bg-primary/10">ใหม่</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{notification.date} {notification.time}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {notification.studentId && (
                    <Button variant="outline" size="sm">ดูโปรไฟล์</Button>
                  )}
                  {!notification.read && (
                    <Button size="sm" onClick={() => markAsRead(notification.id)}>
                      อ่านแล้ว
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
