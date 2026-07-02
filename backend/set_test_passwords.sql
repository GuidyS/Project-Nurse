-- ตั้งรหัสผ่านที่รู้ค่า (Test@1234) ให้บัญชีจริง 2 ตัว เพื่อใช้ทดสอบ
-- (bcrypt hash ตรวจด้วย password_verify ของ PHP ได้ — $2b ใช้แทน $2y ได้)
-- admin  : 46172040  (role 1 - เข้าได้ทุกหน้า)
-- teacher: 41172008  (role 2)
UPDATE users SET password_hash='$2b$10$nrmbPOGrudK0kL3.4hvx5eQWbee5WC914plP9ievbFpdoal9WN1ti' WHERE username='46172040';
UPDATE users SET password_hash='$2b$10$j1SVNQaVRzBnqslL5uRJHutWtaiR9swr4FurLe4W9gWoPxmogIGN2' WHERE username='41172008';
