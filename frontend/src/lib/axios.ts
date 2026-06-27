import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🎯 ดักจับเมื่อ Session ฝั่ง PHP Server หมดอายุขัย (Response 401)
    if (error.response && error.response.status === 401) {
      console.warn("Session หมดอายุ หรือยังไม่ได้เข้าสู่ระบบ");
      
      // 💡 1. เช็คก่อนว่า "เคยมีประวัติการล็อกอิน" ค้างอยู่ในระบบหรือไม่ ก่อนที่จะถูกล้าง
      const wasLoggedIn = localStorage.getItem('user') !== null;
      
      // 2. ล้างข้อมูลสิทธิ์ขยะหน้าบ้านที่หมดอายุแล้วออกให้หมดเกลี้ยง
      localStorage.removeItem('user'); 
      localStorage.removeItem('permissions'); 
      
      // 🚨 3. พระเอกของการแก้ลูปนรกอยู่ตรงนี้ครับ!
      // เราจะสั่งพาวาร์ป/รีโหลดหน้า "เฉพาะกรณีที่เคยล็อกอินอยู่ แล้วเซสชันตายกลางคัน" เท่านั้น
      // ถ้าไม่ได้ล็อกอินอยู่แล้ว (เช่น อยู่หน้า Login หรือพิมพ์รหัสผิด) จะไม่สั่งรีโหลดหน้าซ้ำเด็ดขาด!
      if (wasLoggedIn) {
          window.location.href = window.location.origin; 
      }
      
    } else {
      console.error("API Error:", error);
    }
    return Promise.reject(error);
  }
);

export default api;