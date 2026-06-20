import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, MessageSquare, UserCheck, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

export default function AdvisorNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. ฟังก์ชันดึงข้อมูลการแจ้งเตือนจาก API
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/index.php?page=get-advisor-notifications');
      if (res.data.status === 'success') {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 2. ฟังก์ชันทำเครื่องหมายว่าอ่านแล้ว (เฉพาะรายการเดียว)
  const markAsRead = async (id: number) => {
    try {
      const res = await api.post('/index.php?page=update-notification-read', {
        action: 'single',
        notification_id: id
      });
      if (res.data.status === 'success') {
        // อัปเดต State หน้าบ้านทันทีโดยไม่ต้องรีโหลดหน้าจอใหม่ทั้งหมด
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast({ title: 'สำเร็จ', description: 'ทำเครื่องหมายว่าอ่านแล้ว' });
      }
    } catch (error) {
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถอัปเดตสถานะได้', variant: 'destructive' });
    }
  };

  // 3. ฟังก์ชันทำเครื่องหมายว่าอ่านแล้วทั้งหมด (Mark All as Read)
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      setIsProcessing(true);
      const res = await api.post('/index.php?page=update-notification-read', {
        action: 'all'
      });
      if (res.data.status === 'success') {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        toast({ title: 'สำเร็จ', description: 'ทำเครื่องหมายอ่านแล้วทั้งหมดเรียบร้อย' });
      }
    } catch (error) {
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถอัปเดตข้อมูลได้', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'request': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'warning': return <Badge variant="destructive">แจ้งเตือนด่วน</Badge>;
      case 'request': return <Badge className="bg-blue-500 text-white">คำขอนัดพบ</Badge>;
      case 'success': return <Badge className="bg-green-500 text-white">เสร็จสิ้น</Badge>;
      default: return <Badge variant="secondary">ทั่วไป</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">การแจ้งเตือน</h1>
            {unreadCount > 0 && (
              <Badge className="px-2.5 py-0.5 text-sm font-semibold bg-red-500 text-white animate-pulse rounded-full">
                {unreadCount} ใหม่
              </Badge>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={markAllAsRead} 
            disabled={unreadCount === 0 || isProcessing}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายการแจ้งเตือนทั้งหมด</CardTitle>
            <CardDescription>กล่องข้อความติดตามสถานะและคำขอจากนักศึกษาในความดูแล</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                ไม่มีข้อความแจ้งเตือนในขณะนี้
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    !notification.read ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-card text-muted-foreground'
                  }`}
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-slate-500'}`}>
                        {notification.title}
                      </p>
                      {getTypeBadge(notification.type)}
                      {!notification.read && (
                        <Badge variant="outline" className="bg-red-50/50 text-red-600 border-red-200 text-[10px] h-5">ใหม่</Badge>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                      <Clock className="h-3 w-3" />
                      <span>{notification.date} เวลา {notification.time} น.</span>
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
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}