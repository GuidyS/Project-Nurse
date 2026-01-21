import { useState } from "react";
import { Eye, EyeOff, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { toast } from "sonner";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const validatePassword = (pwd: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasMinLength = pwd.length >= 8;
    return hasUpperCase && hasLowerCase && hasNumber && hasMinLength;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("กรุณากรอกอีเมลที่ถูกต้อง");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("รหัสผ่านไม่ตรงตามเงื่อนไขที่กำหนด");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("เข้าสู่ระบบสำเร็จ!", {
      description: `ยินดีต้อนรับ!`
    });
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      toast.error("กรุณากรอกอีเมลที่ถูกต้อง");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว", {
      description: `กรุณาตรวจสอบอีเมล ${forgotEmail}`
    });
    
    setIsLoading(false);
    setShowForgotPassword(false);
    setForgotEmail("");
  };

  if (showForgotPassword) {
    return (
      <form onSubmit={handleForgotPassword} className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">ลืมรหัสผ่าน?</h2>
          <p className="text-sm text-muted-foreground">
            กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="forgot-email" className="text-sm font-medium text-foreground">อีเมล</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="your@email.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-3">
          <Button 
            type="submit" 
            className="w-full h-12 font-medium bg-foreground text-background hover:bg-foreground/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : (
              <>
                ยืนยัน
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setShowForgotPassword(false)}
          >
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
    
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-4 text-muted-foreground">OR</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">Your Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Your Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
            error={email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
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
              error={password !== "" && !validatePassword(password)}
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
          
          <PasswordStrengthIndicator password={password} />
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
          onClick={() => setShowForgotPassword(true)}
          className="text-sm font-medium text-foreground underline hover:text-foreground/80 transition-colors"
        >
          Forgot password?
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

    </form>
  );
};

export default LoginForm;
