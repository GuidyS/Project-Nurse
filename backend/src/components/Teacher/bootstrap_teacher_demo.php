<?php
function ensureTeacherDemoSchema(PDO $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS faculty (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(100) NOT NULL DEFAULT '',
        first_name_th VARCHAR(100) NOT NULL DEFAULT '',
        last_name_th VARCHAR(100) NOT NULL DEFAULT '',
        position VARCHAR(100) NOT NULL DEFAULT ''
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS student (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(100) NOT NULL DEFAULT '',
        first_name VARCHAR(100) NOT NULL DEFAULT '',
        last_name VARCHAR(100) NOT NULL DEFAULT '',
        status VARCHAR(100) NOT NULL DEFAULT 'Studying'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS subject_group (
        id SMALLINT PRIMARY KEY,
        subject_group_name VARCHAR(100) NOT NULL DEFAULT '',
        credit INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS subject (
        subject_id VARCHAR(50) PRIMARY KEY,
        subject_group_id SMALLINT NOT NULL DEFAULT 1,
        select_subject_id SMALLINT NOT NULL DEFAULT 1,
        subject_name_th VARCHAR(255) NOT NULL DEFAULT '',
        subject_name_en VARCHAR(255) NOT NULL DEFAULT ''
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("INSERT IGNORE INTO faculty (id, title, first_name_th, last_name_th, position) VALUES
        ('41172008', 'อ.', 'จรัสดาว', 'เรโนลด์', 'อาจารย์'),
        ('41172011', 'อ.', 'พิชาภรณ์', 'จันทนกุล', 'อาจารย์')");

    $pdo->exec("INSERT IGNORE INTO student (id, title, first_name, last_name, status) VALUES
        ('6604800001', 'นางสาว', 'ทดสอบ', 'นักศึกษา', 'Studying'),
        ('6604800002', 'นาย', 'ตัวอย่าง', 'ผู้เรียน', 'Studying')");

    $pdo->exec("INSERT IGNORE INTO subject_group (id, subject_group_name, credit) VALUES
        (1, 'กลุ่มวิชาพื้นฐาน', 3),
        (2, 'กลุ่มวิชาชีพ', 4)");

    $pdo->exec("INSERT IGNORE INTO subject (subject_id, subject_group_id, select_subject_id, subject_name_th, subject_name_en) VALUES
        ('NUR101', 1, 1, 'พื้นฐานการพยาบาล', 'Fundamentals of Nursing'),
        ('NUR201', 2, 1, 'การพยาบาลผู้ใหญ่', 'Adult Nursing')");
}
?>
