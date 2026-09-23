import { useEffect, useState } from "react";
import {
  Bell,
  Lock,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

const SettingsPage = () => {
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [settings, setSettings] = useState({
    language: "th",
    emailNotifications: true,
    pushNotifications: true,
    projectNotifications: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const response = await api.get("/index.php?page=get-notification-settings");
        const data = response.data?.data;

        if (!data) return;

        setSettings((current) => ({
          ...current,
          emailNotifications: Boolean(data.emailNotifications),
          pushNotifications: Boolean(data.pushNotifications),
          projectNotifications: Boolean(data.projectNotifications),
        }));
      } catch (error) {
        toast({
          title: "โหลดการตั้งค่าไม่สำเร็จ",
          description: "ไม่สามารถโหลดค่าการแจ้งเตือนล่าสุดได้",
          variant: "destructive",
        });
      }
    };

    loadNotificationSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);

    try {
      await api.post("/index.php?page=save-notification-settings", {
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        projectNotifications: settings.projectNotifications,
      });

      toast({
        title: "บันทึกสำเร็จ",
        description: "การตั้งค่าของคุณได้รับการบันทึกแล้ว",
      });
    } catch (error) {
      toast({
        title: "บันทึกไม่สำเร็จ",
        description: "ไม่สามารถบันทึกการตั้งค่าการแจ้งเตือนได้",
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณาตรวจสอบรหัสผ่านใหม่อีกครั้ง",
        variant: "destructive",
      });
      return;
    }
    if (passwords.new.length < 8) {
      toast({
        title: "รหัสผ่านสั้นเกินไป",
        description: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "เปลี่ยนรหัสผ่านสำเร็จ",
      description: "รหัสผ่านของคุณได้รับการเปลี่ยนแล้ว",
    });
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="app-page">
      {/* Header */}
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">ตั้งค่า</h1>
          <p className="app-page-description">จัดการการแจ้งเตือนและความปลอดภัยของบัญชีผู้ใช้</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Notification Settings */}
        <Card className="app-section-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              การแจ้งเตือน
            </CardTitle>
            <CardDescription>จัดการการแจ้งเตือนที่คุณต้องการรับ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>การแจ้งเตือนทางอีเมล</Label>
                <p className="text-sm text-muted-foreground">รับการแจ้งเตือนผ่านอีเมล</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>การแจ้งเตือนแบบ Push</Label>
                <p className="text-sm text-muted-foreground">รับการแจ้งเตือนบนเบราว์เซอร์</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, pushNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>แจ้งเตือนโครงการ</Label>
                <p className="text-sm text-muted-foreground">เมื่อมีการอัปเดตโครงการ</p>
              </div>
              <Switch
                checked={settings.projectNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, projectNotifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="app-section-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              ความปลอดภัย
            </CardTitle>
            <CardDescription>เปลี่ยนรหัสผ่านของคุณ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">รหัสผ่านปัจจุบัน</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">รหัสผ่านใหม่</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button onClick={handleChangePassword} className="w-full sm:w-auto">
              <Lock className="h-4 w-4 mr-2" />
              เปลี่ยนรหัสผ่าน
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} size="lg" disabled={isSavingSettings}>
            <Save className="h-4 w-4 mr-2" />
            {isSavingSettings ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
