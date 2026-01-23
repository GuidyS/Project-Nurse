import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` // ถ้ามีระบบ login
    },
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    // จัดการ Error ส่วนกลาง เช่น Token หมดอายุ
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;