import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

interface loginPageProps {
    onLoginSuccess: (roleId: number) => void;
    onGoToRegister: () => void;
}

const LoginForm = ({onLoginSuccess, onGoToRegister}: loginPageProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<{ username?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotusername, setForgotusername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetErrors, setResetErrors] = useState<{
    username?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  }>({});

  const handleBackToLogin = () => {
    setShowResetPassword(false);
    setForgotusername("");
    setNewPassword("");
    setConfirmNewPassword("");
    setResetErrors({});
    setIsLoading(false);
  };

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      nextErrors.username = "กรุณากรอก Username";
    }
    if (!password.trim()) {
      nextErrors.password = "กรุณากรอก Password";
    }

    if (Object.keys(nextErrors).length > 0) {
      setLoginErrors(nextErrors);
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoginErrors({});
    setIsLoading(true);
    
    try {
    // 1. ยิง API จริงๆ
    const response = await api.post("/index.php?page=login", {
      username: username,
      password: password,
    });

    // 2. ถ้าสำเร็จ (Status 200 และ backend ตอบ success)
    if (response.data.status === "success") {
      // --- ส่วนที่ต้องเพิ่ม/แก้ไข ---
      // เก็บข้อมูล user และ permissions ลงใน localStorage เพื่อให้ HasPermission นำไปใช้ได้
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      toast.success("เข้าสู่ระบบสำเร็จ");
      onLoginSuccess(response.data.user);
      // ----------------------------
    }
  } catch (error: any) {
    // 3. ถ้าพลาด (เช่น 401 หรือ 400 จาก PHP)
    const message = error.response?.data?.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
    toast.error(message);
    console.error("Login Error:", error);
  } finally {
    setIsLoading(false);
  }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: {
      username?: string;
      newPassword?: string;
      confirmNewPassword?: string;
    } = {};

    if (!forgotusername.trim()) {
      nextErrors.username = "กรุณากรอก Username";
    }
    if (!newPassword.trim()) {
      nextErrors.newPassword = "กรุณากรอก New Password";
    }
    if (!confirmNewPassword.trim()) {
      nextErrors.confirmNewPassword = "กรุณากรอก Confirm New Password";
    } else if (newPassword && newPassword !== confirmNewPassword) {
      nextErrors.confirmNewPassword = "รหัสผ่านไม่ตรงกัน";
    }

    if (Object.keys(nextErrors).length > 0) {
      setResetErrors(nextErrors);
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setResetErrors({});
    setIsLoading(true);
    try {
      const response = await api.post("/index.php?page=reset-password", {
        username: forgotusername,
        new_password: newPassword
      });

      if (response.data.status === "success") {
        toast.success("เปลี่ยนรหัสผ่านสำเร็จ!");
        setShowResetPassword(false); // กลับหน้า Login
        setForgotusername("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้");
    } finally {
      setIsLoading(false);
    }
  };

  if (showResetPassword) {
    return (
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl border border-slate-200 shadow-xl">
        <div className="space-y-4 text-center flex flex-col items-center">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full shadow-md border-4 border-[#8a2be2]/10">
            <img
              src="../../Nurse_logo.jpg"
              alt="Logo"
              className="object-cover w-full h-full scale-110"
            />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-700">รีเซ็ตรหัสผ่าน</h2>
        </div>
        <form onSubmit={handleResetPassword} className="space-y-6" noValidate>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="reset-username"
                className={cn("text-sm font-medium text-slate-700", resetErrors.username && "text-red-600")}
              >
                Username (ID)
              </Label>
              <Input
                id="reset-username"
                placeholder="กรอกรหัสประจำตัวของคุณ"
                value={forgotusername}
                error={Boolean(resetErrors.username)}
                aria-invalid={Boolean(resetErrors.username)}
                onChange={(e) => {
                  setForgotusername(e.target.value);
                  if (resetErrors.username) {
                    setResetErrors((current) => ({ ...current, username: undefined }));
                  }
                }}
                className="h-12"
              />
              {resetErrors.username && (
                <p className="text-sm font-medium text-red-600">{resetErrors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="new-password"
                className={cn("text-sm font-medium text-slate-700", resetErrors.newPassword && "text-red-600")}
              >
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="ตั้งรหัสผ่านใหม่"
                value={newPassword}
                error={Boolean(resetErrors.newPassword)}
                aria-invalid={Boolean(resetErrors.newPassword)}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (resetErrors.newPassword) {
                    setResetErrors((current) => ({ ...current, newPassword: undefined }));
                  }
                }}
                className="h-12"
              />
              {resetErrors.newPassword && (
                <p className="text-sm font-medium text-red-600">{resetErrors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirm-new-password"
                className={cn("text-sm font-medium text-slate-700", resetErrors.confirmNewPassword && "text-red-600")}
              >
                Confirm New Password
              </Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="ยืนยันรหัสผ่านใหม่"
                value={confirmNewPassword}
                error={Boolean(resetErrors.confirmNewPassword)}
                aria-invalid={Boolean(resetErrors.confirmNewPassword)}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  if (resetErrors.confirmNewPassword) {
                    setResetErrors((current) => ({ ...current, confirmNewPassword: undefined }));
                  }
                }}
                className="h-12"
              />
              {resetErrors.confirmNewPassword && (
                <p className="text-sm font-medium text-red-600">{resetErrors.confirmNewPassword}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 font-medium bg-[#8a2be2] text-background hover:bg-[#8a2be2]/90 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                "ยืนยัน"
              )}
            </Button>
          </div>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          จำรหัสผ่านได้แล้ว?{" "}
          <button
            type="button"
            onClick={handleBackToLogin}
            disabled={isLoading}
            className="font-semibold text-slate-700 transition-colors hover:text-[#8a2be2] hover:underline underline-offset-4 disabled:pointer-events-none disabled:opacity-50"
          >
            เข้าสู่ระบบ
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl border border-slate-200 shadow-xl">
      <div className="w-full max-w-md space-y-6"> 
        <div className="space-y-4 text-center flex flex-col items-center">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full shadow-md border-4 border-[#8a2be2]/10">
            <img 
              src="../../Nurse_logo.jpg" 
              alt="Logo" 
              className="object-cover w-full h-full scale-110" // ใช้ scale เพื่อปรับซูมเข้าเล็กน้อยถ้าขอบขาวเยอะ
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-700">เข้าสู่ระบบ</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">

          <div className="space-y-4">
            {/* username */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className={cn("text-sm font-medium text-slate-700", loginErrors.username && "text-red-600")}
              >
                Username
              </Label>
              <Input
                id="username"
                type="username"
                placeholder="Your username"
                value={username}
                error={Boolean(loginErrors.username)}
                aria-invalid={Boolean(loginErrors.username)}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (loginErrors.username) {
                    setLoginErrors((current) => ({ ...current, username: undefined }));
                  }
                }}
                className="h-12"
              />
              {loginErrors.username && (
                <p className="text-sm font-medium text-red-600">{loginErrors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={cn("text-sm font-medium text-slate-700", loginErrors.password && "text-red-600")}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  error={Boolean(loginErrors.password)}
                  aria-invalid={Boolean(loginErrors.password)}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginErrors.password) {
                      setLoginErrors((current) => ({ ...current, password: undefined }));
                    }
                  }}
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              {loginErrors.password && (
                <p className="text-sm font-medium text-red-600">{loginErrors.password}</p>
              )}
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label 
                htmlFor="remember" 
                className="text-sm font-normal text-muted-foreground cursor-pointer"
              >
                จดจำ
              </Label>
            </div>
            
            <button
              type="button"
              onClick={() => setShowResetPassword(true)}
              className="text-sm font-medium text-slate-700 underline hover:text-foreground/80 transition-colors"
            >
              รีเซ็ตรหัสผ่าน?
            </button>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full h-12 font-medium bg-[#8a2be2] text-background hover:bg-[#8a2be2]/90 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : (
              "เข้าสู่ระบบ"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ยังไม่ได้สมัครสมาชิก?{" "}
            <button 
              onClick={onGoToRegister} // เมื่อคลิกจะไปเรียกฟังก์ชันเปลี่ยนหน้าใน Index.tsx
              className="text-text-slate-700 hover:text-[#8a2be2] font-semibold hover:underline underline-offset-4"
            >
              สมัครสมาชิก
            </button>
          </p>
            
        </form>
      </div>
    </div>
  );
};

export default LoginForm;