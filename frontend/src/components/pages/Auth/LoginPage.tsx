import { useState } from "react";
import { Eye, EyeOff, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/axios";

interface loginPageProps {
    onLoginSuccess: (roleId: number) => void;
    onGoToRegister: () => void;
}

const LoginForm = ({onLoginSuccess, onGoToRegister}: loginPageProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotusername, setForgotusername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const validatePassword = (pwd: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasMinLength = pwd.length >= 8;
    return hasUpperCase && hasLowerCase && hasNumber && hasMinLength;
  };

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
        toast.error("กรุณากรอก Username");
        return;
    }

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
      
      toast.success("Login successful");
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

    // 1. เช็คว่ากรอกข้อมูลครบไหม
    if (!newPassword || !confirmNewPassword) {
      toast.error("กรุณากรอกรหัสผ่านให้ครบทั้งสองช่อง");
      return;
    }

    // 2. เช็คว่ารหัสผ่านตรงกันไหม
    if (newPassword !== confirmNewPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/index.php?page=reset-password", {
        username: forgotusername,
        new_password: newPassword
      });

      if (response.data.status === "success") {
        toast.success("เปลี่ยนรหัสผ่านสำเร็จ!");
        setShowResetPassword(false); // กลับหน้า Login
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
      <div className="w-full max-w-md space-y-6"> 
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Reset Password</h2>
      </div>
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-username">Username (ID)</Label>
              <Input
                id="reset-username"
                placeholder="กรอกรหัสประจำตัวของคุณ"
                value={forgotusername}
                onChange={(e) => setForgotusername(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="ตั้งรหัสผ่านใหม่"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="ยืนยันรหัสผ่านใหม่"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 font-medium bg-foreground text-background hover:bg-foreground/90 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6"> 
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>
      <form onSubmit={handleLogin} className="space-y-6">

        <div className="space-y-4">
          {/* username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
            <Input
              id="username"
              type="username"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Remember me
            </Label>
          </div>
          
          <button
            type="button"
            onClick={() => setShowResetPassword(true)}
            className="text-sm font-medium text-foreground underline hover:text-foreground/80 transition-colors"
          >
            Reset password?
          </button>
        </div>

        {/* Submit */}
        <Button 
          type="submit" 
          className="w-full h-12 font-medium bg-foreground text-background hover:bg-foreground/90 rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
          ) : (
            "Sign in"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button 
            onClick={onGoToRegister} // เมื่อคลิกจะไปเรียกฟังก์ชันเปลี่ยนหน้าใน Index.tsx
            className="text-foreground font-semibold hover:underline underline-offset-4"
          >
            Sign up
          </button>
        </p>
          
      </form>
    </div>
  );
};

export default LoginForm;