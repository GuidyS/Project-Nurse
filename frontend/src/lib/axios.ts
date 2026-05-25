import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        // 'Authorization': `Bearer ${token}` // ถ้ามีระบบ login
    }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // เพิ่มการดักจับ Error 401 ตรงนี้
    if (error.response && error.response.status === 401) {
      console.warn("Session หมดอายุ หรือยังไม่ได้เข้าสู่ระบบ");
      localStorage.removeItem('user'); // ล้างข้อมูล user เก่าทิ้ง
      // ถ้าไม่ได้อยู่หน้า login ให้เด้งกลับไปหน้า login
      if (window.location.pathname !== '/') {
        window.location.href = '/'; 
      }
    } else {
      console.error("API Error:", error);
    }
    return Promise.reject(error);
  }
);

export default api;