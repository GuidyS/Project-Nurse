import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

const queryClient = new QueryClient();

const applySavedTheme = () => {
  const theme = localStorage.getItem("theme") || "dark";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", shouldUseDark);
};

// 🔧 ปรับปรุงกงจักร SessionGateway ใหม่ให้ฉลาดขึ้น
const SessionGateway = ({ children }: { children: React.ReactNode }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // 💡 เช็คก้าวแรก: ถ้าในคอมพิวเตอร์ไม่มีข้อมูล 'user' อยู่เลย แปลว่ายังไม่ได้ล็อกอินแน่ๆ 
    // ไม่ต้องยิง API ไปกวนเซิร์ฟเวอร์ ให้ผ่านไปหน้าล็อกอินได้เลย ป้องกันลูปนรก!
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      setHasSession(false);
      setIsValidating(false);
      return;
    }

    // ถ้าเคยมีประวัติบันทึกไว้ ค่อยยิงไปพิสูจน์ตั๋วกับ Docker หลังบ้าน
    api.get("/index.php?page=profile")
      .then((res) => {
        if (res.data.status === "success") {
          setHasSession(true);
        }
      })
      .catch(() => {
        // ตั๋วผี/หมดอายุขัย ล้างข้อมูลทิ้ง
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");
        setHasSession(false);
      })
      .finally(() => {
        setIsValidating(false);
      });
  }, []);

  if (isValidating) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#8a2be2] border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">กำลังตรวจสอบสถานะระบบพยาบาล...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    applySavedTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <SessionGateway>
                  <Index />
                </SessionGateway>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;