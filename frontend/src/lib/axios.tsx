import axios from 'axios';

/**
 * Axios Instance สำหรับเรียก API
 * 
 * หน้าที่:
 * - สร้าง axios instance ที่มี baseURL และ headers ตั้งค่าไว้แล้ว
 * - จัดการ response และ error แบบ global
 * 
 * Configuration:
 * - baseURL: ดึงจาก environment variable VITE_API_BASE_URL
 * - headers: ตั้ง Content-Type เป็น JSON
 * - withCredentials: ส่ง cookies ไปกับ request (สำหรับ session management)
 * 
 * Interceptors:
 * - Response Interceptor: จัดการ error แบบ global (เช่น token หมดอายุ, network error)
 */
const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` // ถ้ามีระบบ login
    },
});

/**
 * Response Interceptor
 * 
 * หน้าที่:
 * - จัดการ response และ error จาก API calls ทั้งหมด
 * - Log error เพื่อ debug
 * - สามารถเพิ่ม logic สำหรับจัดการ token expiration, refresh token ได้ที่นี่
 * 
 * @param {any} response - Response object จาก API
 * @param {any} error - Error object จาก API
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // จัดการ Error ส่วนกลาง เช่น Token หมดอายุ
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;