-- Move faculty.teaching_degree_file → degree.file_path, then drop the faculty column.
-- Prefer attaching files to Doctoral+nursing, then other Doctoral/Master rows.
-- Run after degree seed / field_group alter if those apply.

-- 1) Copy onto the best existing degree row per faculty
UPDATE `degree` d
INNER JOIN `faculty` f ON f.faculty_id = d.faculty_id
SET d.file_path = f.teaching_degree_file
WHERE f.teaching_degree_file IS NOT NULL
  AND TRIM(f.teaching_degree_file) <> ''
  AND d.degree_id = (
    SELECT pick.degree_id
    FROM (
      SELECT
        deg.degree_id,
        deg.faculty_id,
        ROW_NUMBER() OVER (
          PARTITION BY deg.faculty_id
          ORDER BY
            CASE
              WHEN deg.degree_level = 'Doctoral' AND deg.field_group = 'nursing' THEN 1
              WHEN deg.degree_level = 'Doctoral' THEN 2
              WHEN deg.degree_level = 'Master' AND deg.field_group = 'nursing' THEN 3
              WHEN deg.degree_level = 'Master' THEN 4
              ELSE 5
            END,
            deg.degree_id
        ) AS rn
      FROM `degree` deg
    ) pick
    WHERE pick.faculty_id = d.faculty_id
      AND pick.rn = 1
  );

-- 2) Faculty with a teaching_degree_file but no degree row yet
INSERT INTO `degree` (`faculty_id`, `file_path`)
SELECT f.faculty_id, f.teaching_degree_file
FROM `faculty` f
LEFT JOIN `degree` d ON d.faculty_id = f.faculty_id
WHERE f.teaching_degree_file IS NOT NULL
  AND TRIM(f.teaching_degree_file) <> ''
  AND d.degree_id IS NULL;

-- 3) Drop old column (ignore if already dropped when re-run)
ALTER TABLE `faculty` DROP COLUMN `teaching_degree_file`;
