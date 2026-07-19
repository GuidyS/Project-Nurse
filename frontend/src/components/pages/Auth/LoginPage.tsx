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

  const handleBackToLogin = () => {
    setShowResetPassword(false);
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
    const response = await api.post("/index.php?page=login", {
      username: username,
      password: password,
    });

    if (response.data.status === "success") {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      toast.success("เข้าสู่ระบบสำเร็จ");
      onLoginSuccess(response.data.user);
    }
  } catch (error: any) {
    const message = error.response?.data?.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
    toast.error(message);
    console.error("Login Error:", error);
  } finally {
    setIsLoading(false);
  }
  };

  if (showResetPassword) {
    return (
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl border border-border shadow-xl">
        <div className="space-y-4 text-center flex flex-col items-center">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full shadow-md border-4 border-[#8a2be2]/10">
            <img
              src="../../Nurse_logo.jpg"
              alt="Logo"
              className="object-cover w-full h-full scale-110"
            />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-card-foreground">รีเซ็ตรหัสผ่าน</h2>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground space-y-2">
          <p>
            ระบบปิดการรีเซ็ตรหัสผ่านแบบสาธารณะแล้ว เพราะเดิมสามารถเปลี่ยนรหัสได้โดยรู้เพียง Username
          </p>
          <p>
            หากลืมรหัสผ่าน ให้ติดต่อผู้ดูแลระบบ หรือถ้ายังเข้าสู่ระบบได้ ให้ไปที่เมนู
            <span className="font-medium text-foreground"> ตั้งค่า → ความปลอดภัย </span>
            เพื่อเปลี่ยนรหัสผ่าน
          </p>
        </div>

        <Button
          type="button"
          onClick={handleBackToLogin}
          className="w-full h-12 font-medium bg-[#8a2be2] text-white hover:bg-[#8a2be2]/90 rounded-xl"
        >
          กลับไปเข้าสู่ระบบ
        </Button>
      </div>
    );
  }

  return (
    // เปลี่ยนจาก bg-white border-slate-200 เป็น bg-card border-border
    <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl border border-border shadow-xl">
      <div className="w-full max-w-md space-y-6"> 
        <div className="space-y-4 text-center flex flex-col items-center">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full shadow-md border-4 border-[#8a2be2]/10">
            <img 
              src="../../Nurse_logo.jpg" 
              alt="Logo" 
              className="object-cover w-full h-full scale-110" 
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">เข้าสู่ระบบ</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className={cn("text-sm font-medium text-foreground", loginErrors.username && "text-destructive")}
              >
                รหัสประจำตัว
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
                className="h-12 bg-background border-border text-foreground"
              />
              {loginErrors.username && (
                <p className="text-sm font-medium text-destructive">{loginErrors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={cn("text-sm font-medium text-foreground", loginErrors.password && "text-destructive")}
              >
                รหัสผ่าน
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
                  className="h-12 pr-12 bg-background border-border text-foreground"
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
                <p className="text-sm font-medium text-destructive">{loginErrors.password}</p>
              )}
            </div>
          </div>

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
              className="text-sm font-medium text-foreground underline hover:text-foreground/80 transition-colors"
            >
              รีเซ็ตรหัสผ่าน?
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 font-medium bg-[#8a2be2] text-white hover:bg-[#8a2be2]/90 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "เข้าสู่ระบบ"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ยังไม่ได้สมัครสมาชิก?{" "}
            <button 
              onClick={onGoToRegister}
              className="text-foreground hover:text-[#8a2be2] font-semibold hover:underline underline-offset-4 transition-colors"
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
