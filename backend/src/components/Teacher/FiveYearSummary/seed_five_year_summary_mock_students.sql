DROP PROCEDURE IF EXISTS seed_five_year_summary_mock_students;

DELIMITER $$

CREATE PROCEDURE seed_five_year_summary_mock_students()
BEGIN
    DECLARE year_index INT DEFAULT 0;
    DECLARE sequence_no INT;
    DECLARE academic_year_value INT;
    DECLARE graduate_total INT;
    DECLARE graduation_date_value DATE;
    DECLARE license_date_value DATETIME;

    DELETE FROM student
    WHERE description = 'FIVE_YEAR_SUMMARY_MOCK'
      AND student_id BETWEEN 9900000000000 AND 9900000000499;

    WHILE year_index < 5 DO
        SET academic_year_value = 2565 + year_index;
        SET graduate_total = 4 + year_index;
        SET graduation_date_value = STR_TO_DATE(
            CONCAT(academic_year_value - 543, '-09-01'),
            '%Y-%m-%d'
        );
        SET license_date_value = STR_TO_DATE(
            CONCAT(academic_year_value - 543, '-09-01 09:00:00'),
            '%Y-%m-%d %H:%i:%s'
        );
        SET sequence_no = 1;

        WHILE sequence_no <= graduate_total DO
            INSERT INTO student (
                student_id,
                user_id,
                program_id,
                title,
                first_name_th,
                last_name_th,
                year_level,
                status,
                graduation_date,
                admission_year,
                advisor_status,
                advisor_status_details,
                advisor_is_employed,
                license_first_attempt_passed,
                license_first_attempt_passed_at,
                license_within_one_year_passed,
                license_within_one_year_passed_at,
                description
            ) VALUES (
                9900000000000 + (year_index * 100) + sequence_no,
                NULL,
                1,
                'นางสาว',
                'ข้อมูลตัวอย่าง',
                CONCAT('ปี ', academic_year_value, ' ลำดับ ', sequence_no),
                4,
                'Graduted',
                graduation_date_value,
                academic_year_value - 4,
                CASE WHEN sequence_no <= graduate_total - 1 THEN 'จบการศึกษา' ELSE 'ปกติ' END,
                'ข้อมูล Mockup สำหรับหน้าผลสรุป 5 ปี',
                CASE WHEN sequence_no <= graduate_total - 2 THEN 1 ELSE 0 END,
                CASE WHEN sequence_no <= graduate_total - 2 THEN 1 ELSE 0 END,
                CASE WHEN sequence_no <= graduate_total - 2 THEN license_date_value ELSE NULL END,
                CASE WHEN sequence_no <= graduate_total - 1 THEN 1 ELSE 0 END,
                CASE WHEN sequence_no <= graduate_total - 1 THEN license_date_value ELSE NULL END,
                'FIVE_YEAR_SUMMARY_MOCK'
            );

            SET sequence_no = sequence_no + 1;
        END WHILE;

        SET year_index = year_index + 1;
    END WHILE;
END$$

DELIMITER ;

CALL seed_five_year_summary_mock_students();
DROP PROCEDURE seed_five_year_summary_mock_students;
