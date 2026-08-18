# ไฟล์ที่แก้ไข

สรุปไฟล์ที่แก้ในรอบนี้

## Frontend

- `frontend/src/components/pages/Teacher/StudentsInfo.tsx`
  - แก้ช่องค้นหาไม่ให้เว็บเด้งจาก `.includes is not a function`
  - เปลี่ยนให้ค้นหาด้วยการแปลงค่าเป็น string ก่อน
  - เปลี่ยนการส่งข้อความให้เรียก API ใหม่ `send-advisor-message`
  - ส่ง `student_id` ไป backend เพื่อให้ backend หา user ของนักศึกษาเอง

## Backend

- `backend/src/index.php`
  - เพิ่ม route ใหม่ `send-advisor-message`
  - route นี้ชี้ไปที่ `components/Teacher/Advises/send_advisor_message.php`

- `backend/src/components/Teacher/Advises/send_advisor_message.php`
  - เพิ่มไฟล์ API ใหม่สำหรับส่งข้อความจากอาจารย์ที่ปรึกษาถึงนักศึกษา
  - รับ `student_id`, `title`, `message`
  - หา `user_id` ของนักศึกษาจากตาราง `users` โดยใช้ `username = student_id`
  - บันทึกข้อความลงตาราง `notifications`

## ไฟล์ PLO/CLO ที่เกี่ยวข้อง

- `backend/src/components/Teacher/Advises/get_student_plo_mapping.php`
  - มีอยู่แล้วในโปรเจกต์
  - ใช้ดึงข้อมูล PLO/CLO mapping ที่เคยบันทึกไว้จากตาราง `student_plo_mapping_records`
  - ไม่ขึ้นใน `git diff` รอบล่าสุด เพราะไฟล์นี้ไม่มีการแก้เพิ่มในรอบสุดท้าย

- `backend/src/components/Teacher/Advises/save_student_plo_mapping.php`
  - มีอยู่แล้วในโปรเจกต์
  - ใช้บันทึกข้อมูลที่ติ๊ก PLO/CLO ลงตาราง `student_plo_mapping_records`
  - ไม่ขึ้นใน `git diff` รอบล่าสุด เพราะไฟล์นี้ไม่มีการแก้เพิ่มในรอบสุดท้าย

## ตรวจสอบแล้ว

- Frontend build ผ่านด้วย `vite build`
- PHP lint ผ่านสำหรับ `index.php`
- PHP lint ผ่านสำหรับ `send_advisor_message.php`
- ตรวจแล้วว่า `localhost:5173` ตอนนี้อ่านโค้ดจาก `New folder (4)` ไม่ใช่ `New folder (5)`
