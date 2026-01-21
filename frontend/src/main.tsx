import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * Entry Point ของแอปพลิเคชัน React
 * 
 * หน้าที่:
 * - สร้าง React Root และ render App component ลงใน DOM element ที่มี id="root"
 * - โหลด CSS หลัก (index.css) เพื่อให้ Tailwind CSS และ styles อื่นๆ ทำงาน
 * 
 * การทำงาน:
 * 1. หา DOM element ที่มี id="root" จาก index.html
 * 2. สร้าง React Root instance ด้วย createRoot()
 * 3. Render App component ลงใน root element
 */
createRoot(document.getElementById("root")!).render(<App />);
