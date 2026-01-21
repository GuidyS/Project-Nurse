import * as React from "react";

/**
 * Breakpoint สำหรับตรวจสอบว่าเป็น mobile device หรือไม่
 * ถ้าหน้าจอ < 768px ถือว่าเป็น mobile
 */
const MOBILE_BREAKPOINT = 768;

/**
 * useIsMobile Hook - ตรวจสอบว่า device เป็น mobile หรือไม่
 * 
 * หน้าที่:
 * - ติดตามขนาดหน้าจอและตรวจสอบว่าเป็น mobile (< 768px) หรือไม่
 * - อัพเดท state อัตโนมัติเมื่อขนาดหน้าจอเปลี่ยน
 * 
 * การทำงาน:
 * 1. ใช้ window.matchMedia เพื่อ listen การเปลี่ยนแปลงขนาดหน้าจอ
 * 2. ตรวจสอบ window.innerWidth < MOBILE_BREAKPOINT
 * 3. อัพเดท state เมื่อขนาดหน้าจอเปลี่ยน
 * 
 * @returns {boolean} - true ถ้าเป็น mobile device, false ถ้าไม่ใช่
 * 
 * ตัวอย่างการใช้งาน:
 * const isMobile = useIsMobile();
 * if (isMobile) { // แสดง UI สำหรับ mobile } else { // แสดง UI สำหรับ desktop }
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  /**
   * useEffect Hook - Setup media query listener
   * 
   * ทำงานเมื่อ component mount และ cleanup เมื่อ unmount
   * 
   * Flow:
   * 1. สร้าง MediaQueryList สำหรับตรวจสอบขนาดหน้าจอ
   * 2. ตั้งค่าเริ่มต้น (ตรวจสอบขนาดหน้าจอตอนนี้)
   * 3. เพิ่ม event listener สำหรับเมื่อขนาดหน้าจอเปลี่ยน
   * 4. Cleanup: ลบ event listener เมื่อ component unmount
   */
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
