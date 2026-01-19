import { useState } from "react";
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [settings, setSettings] = useState({
    theme: "system",
    language: "th",
    emailNotifications: true,
    pushNotifications: true,
    gradeNotifications: true,
    projectNotifications: true,
    studentNotifications: true,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleSaveSettings = () => {
    toast({
      title: "บันทึกสำเร็จ",
      description: "การตั้งค่าของคุณได้รับการบันทึกแล้ว",
    });
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">ตั้งค่า</h1>
        <p className="text-muted-foreground">จัดการการตั้งค่าระบบและความเป็นส่วนตัว</p>
      </div>

      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              การแสดงผล
            </CardTitle>
            <CardDescription>ปรับแต่งธีมและภาษาของระบบ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>ธีม</Label>
                <p className="text-sm text-muted-foreground">เลือกธีมการแสดงผล</p>
              </div>
              <Select
                value={settings.theme}
                onValueChange={(value) => setSettings({ ...settings, theme: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      สว่าง
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      มืด
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      ตามระบบ
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  ภาษา
                </Label>
                <p className="text-sm text-muted-foreground">เลือกภาษาที่ใช้แสดงผล</p>
              </div>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="th">ไทย</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
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
                <Label>แจ้งเตือนเกรด</Label>
                <p className="text-sm text-muted-foreground">เมื่อมีการบันทึกหรือแก้ไขเกรด</p>
              </div>
              <Switch
                checked={settings.gradeNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, gradeNotifications: checked })
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

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>แจ้งเตือนนักศึกษา</Label>
                <p className="text-sm text-muted-foreground">เมื่อนักศึกษาส่งคำขอหรือเอกสาร</p>
              </div>
              <Switch
                checked={settings.studentNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, studentNotifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
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
              <Input
                id="confirm-password"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              />
            </div>

            <Button onClick={handleChangePassword} className="w-full sm:w-auto">
              <Lock className="h-4 w-4 mr-2" />
              เปลี่ยนรหัสผ่าน
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} size="lg">
            <Save className="h-4 w-4 mr-2" />
            บันทึกการตั้งค่า
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
