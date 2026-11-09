-- อนุญาตให้รูปโปรไฟล์บุคลากรอ่านได้เฉพาะเจ้าของ Admin/SuperAdmin และคณบดี
-- สำรองฐานข้อมูลและหยุดการแก้ข้อมูลบุคลากรก่อนรัน migration นี้

SET @faculty_profile_scope_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'storage_objects'
      AND COLUMN_NAME = 'access_scope'
      AND COLUMN_TYPE LIKE '%faculty_profile_directory%'
);

SET @faculty_profile_scope_ddl = IF(
    @faculty_profile_scope_exists = 0,
    'ALTER TABLE storage_objects MODIFY COLUMN access_scope ENUM(''owner_admin'',''student_advisor_admin'',''project_member_admin'',''authenticated'',''faculty_profile_directory'') NOT NULL',
    'DO 0'
);

PREPARE faculty_profile_scope_stmt FROM @faculty_profile_scope_ddl;
EXECUTE faculty_profile_scope_stmt;
DEALLOCATE PREPARE faculty_profile_scope_stmt;

UPDATE storage_objects
SET access_scope = 'faculty_profile_directory'
WHERE resource_type = 'faculty_profile_picture'
  AND access_scope <> 'faculty_profile_directory';
