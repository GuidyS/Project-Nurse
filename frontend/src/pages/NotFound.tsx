import { useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * NotFound Component - 404 Error Page
 * 
 * หน้าที่:
 * - แสดงหน้า 404 เมื่อ user เข้าถึง route ที่ไม่มีอยู่
 * - Log error เพื่อ debug
 * - ให้ link กลับไปหน้าแรก
 * 
 * การทำงาน:
 * - ใช้ useLocation เพื่อดึง pathname ที่ user พยายามเข้าถึง
 * - Log error พร้อม pathname ใน console
 * - แสดง UI 404 พร้อม link กลับหน้าแรก
 */
const NotFound = () => {
  const location = useLocation();

  /**
   * useEffect Hook - Log 404 error
   * 
   * ทำงานเมื่อ pathname เปลี่ยน (เมื่อ user เข้าถึง route ใหม่ที่ไม่มี)
   * 
   * หน้าที่:
   * - Log error message พร้อม pathname ที่ user พยายามเข้าถึง
   * - ช่วยในการ debug และ track 404 errors
   */
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
