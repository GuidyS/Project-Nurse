-- Phase 1: copy legacy project.mapping_json relations to relational tables.
-- Run while project writes are paused and before deploying code that stops writing mapping_json.
-- This script is idempotent. It records a per-project JSON hash only when every validation passes.

CREATE TABLE IF NOT EXISTS project_mapping_json_backfill_audit (
  project_id VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci NOT NULL,
  mapping_hash CHAR(64) NOT NULL,
  migrated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id),
  CONSTRAINT fk_project_mapping_backfill_project
    FOREIGN KEY (project_id) REFERENCES project(project_id)
    ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT IGNORE INTO project_outcome_links (project_id, outcome_type, outcome_code)
SELECT p.project_id, 'plo', TRIM(JSON_UNQUOTE(j.item))
FROM project p
JOIN JSON_TABLE(
  COALESCE(p.mapping_json, JSON_OBJECT()),
  '$.plos[*]' COLUMNS (item JSON PATH '$')
) AS j
WHERE JSON_TYPE(j.item) = 'STRING'
  AND CHAR_LENGTH(TRIM(JSON_UNQUOTE(j.item))) BETWEEN 1 AND 50;

INSERT IGNORE INTO project_outcome_links (project_id, outcome_type, outcome_code)
SELECT p.project_id, 'clo', TRIM(JSON_UNQUOTE(j.item))
FROM project p
JOIN JSON_TABLE(
  COALESCE(p.mapping_json, JSON_OBJECT()),
  '$.clos[*]' COLUMNS (item JSON PATH '$')
) AS j
WHERE JSON_TYPE(j.item) = 'STRING'
  AND CHAR_LENGTH(TRIM(JSON_UNQUOTE(j.item))) BETWEEN 1 AND 50;

-- YLO is history-only. Current application writes replace only PLO/CLO rows.
INSERT IGNORE INTO project_outcome_links (project_id, outcome_type, outcome_code)
SELECT p.project_id, 'ylo', TRIM(JSON_UNQUOTE(j.item))
FROM project p
JOIN JSON_TABLE(
  COALESCE(p.mapping_json, JSON_OBJECT()),
  '$.ylos[*]' COLUMNS (item JSON PATH '$')
) AS j
WHERE JSON_TYPE(j.item) = 'STRING'
  AND CHAR_LENGTH(TRIM(JSON_UNQUOTE(j.item))) BETWEEN 1 AND 50;

DROP TEMPORARY TABLE IF EXISTS tmp_project_mapping_json_issues;
CREATE TEMPORARY TABLE tmp_project_mapping_json_issues (
  project_id VARCHAR(100) NOT NULL,
  issue_code VARCHAR(64) NOT NULL,
  detail VARCHAR(255) NOT NULL
);

INSERT INTO tmp_project_mapping_json_issues (project_id, issue_code, detail)
SELECT p.project_id, 'invalid_root', 'mapping_json must be an object or NULL'
FROM project p
WHERE p.mapping_json IS NOT NULL
  AND JSON_TYPE(p.mapping_json) <> 'OBJECT';

INSERT INTO tmp_project_mapping_json_issues (project_id, issue_code, detail)
SELECT p.project_id, 'unknown_key', CONCAT('unknown key: ', keys_json.key_name)
FROM project p
JOIN JSON_TABLE(
  COALESCE(JSON_KEYS(p.mapping_json), JSON_ARRAY()),
  '$[*]' COLUMNS (key_name VARCHAR(64) PATH '$')
) AS keys_json
WHERE keys_json.key_name NOT IN ('member_count', 'plos', 'clos', 'ylos');

INSERT INTO tmp_project_mapping_json_issues (project_id, issue_code, detail)
SELECT p.project_id, 'member_count_mismatch',
       CONCAT('json=', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p.mapping_json, '$.member_count')), 'null'),
              ', relational=', COALESCE(m.members, 0) + IF(p.responsible_faculty_id IS NULL, 0, 1))
FROM project p
LEFT JOIN (
  SELECT project_id, COUNT(DISTINCT faculty_id) AS members
  FROM project_faculty_members
  GROUP BY project_id
) AS m ON m.project_id = p.project_id
WHERE JSON_CONTAINS_PATH(p.mapping_json, 'one', '$.member_count') = 1
  AND (
    JSON_UNQUOTE(JSON_EXTRACT(p.mapping_json, '$.member_count')) NOT REGEXP '^[0-9]+$'
    OR CAST(JSON_UNQUOTE(JSON_EXTRACT(p.mapping_json, '$.member_count')) AS UNSIGNED)
       <> COALESCE(m.members, 0) + IF(p.responsible_faculty_id IS NULL, 0, 1)
  );

INSERT INTO tmp_project_mapping_json_issues (project_id, issue_code, detail)
SELECT p.project_id, 'invalid_outcome_container', CONCAT(path_name.path_key, ' must be an array')
FROM project p
JOIN (
  SELECT 'plos' AS path_key UNION ALL SELECT 'clos' UNION ALL SELECT 'ylos'
) AS path_name
WHERE JSON_CONTAINS_PATH(p.mapping_json, 'one', CONCAT('$.', path_name.path_key)) = 1
  AND JSON_TYPE(JSON_EXTRACT(p.mapping_json, CONCAT('$.', path_name.path_key))) <> 'ARRAY';

INSERT INTO tmp_project_mapping_json_issues (project_id, issue_code, detail)
SELECT p.project_id, 'invalid_plo_code', 'PLO code must be a non-empty string of at most 50 characters'
FROM project p
JOIN JSON_TABLE(COALESCE(p.mapping_json, JSON_OBJECT()), '$.plos[*]' COLUMNS (item JSON PATH '$')) AS j
WHERE JSON_TYPE(j.item) <> 'STRING'
   OR CHAR_LENGTH(TRIM(JSON_UNQUOTE(j.item))) NOT BETWEEN 1 AND 50;

INSERT INTO tmp_project_mapping_json_issues (project_id, issue_code, detail)
SELECT p.project_id, 'invalid_clo_code', 'CLO code must be a non-empty string of at most 50 characters'
FROM project p
JOIN JSON_TABLE(COALESCE(p.mapping_json, JSON_OBJECT()), '$.clos[*]' COLUMNS (item JSON PATH '$')) AS j
WHERE JSON_TYPE(j.item) <> 'STRING'
   OR CHAR_LENGTH(TRIM(JSON_UNQUOTE(j.item))) NOT BETWEEN 1 AND 50;

INSERT INTO tmp_project_mapping_json_issues (project_id, issue_code, detail)
SELECT p.project_id, 'invalid_ylo_code', 'YLO code must be a non-empty string of at most 50 characters'
FROM project p
JOIN JSON_TABLE(COALESCE(p.mapping_json, JSON_OBJECT()), '$.ylos[*]' COLUMNS (item JSON PATH '$')) AS j
WHERE JSON_TYPE(j.item) <> 'STRING'
   OR CHAR_LENGTH(TRIM(JSON_UNQUOTE(j.item))) NOT BETWEEN 1 AND 50;

INSERT INTO tmp_project_mapping_json_issues (project_id, issue_code, detail)
SELECT DISTINCT p.project_id, 'unsupported_project_type',
       CONCAT('PLO/CLO links require academic_service, current type=', p.project_type)
FROM project p
JOIN project_outcome_links pol ON pol.project_id = p.project_id AND pol.outcome_type IN ('plo', 'clo')
WHERE p.project_type <> 'academic_service';

INSERT INTO tmp_project_mapping_json_issues (project_id, issue_code, detail)
SELECT p.project_id, 'unmigrated_outcome', CONCAT(source.outcome_type, ':', source.outcome_code)
FROM (
  SELECT p.project_id, 'plo' AS outcome_type, TRIM(JSON_UNQUOTE(j.item)) AS outcome_code
  FROM project p
  JOIN JSON_TABLE(COALESCE(p.mapping_json, JSON_OBJECT()), '$.plos[*]' COLUMNS (item JSON PATH '$')) AS j
  WHERE JSON_TYPE(j.item) = 'STRING' AND CHAR_LENGTH(TRIM(JSON_UNQUOTE(j.item))) BETWEEN 1 AND 50
  UNION ALL
  SELECT p.project_id, 'clo', TRIM(JSON_UNQUOTE(j.item))
  FROM project p
  JOIN JSON_TABLE(COALESCE(p.mapping_json, JSON_OBJECT()), '$.clos[*]' COLUMNS (item JSON PATH '$')) AS j
  WHERE JSON_TYPE(j.item) = 'STRING' AND CHAR_LENGTH(TRIM(JSON_UNQUOTE(j.item))) BETWEEN 1 AND 50
  UNION ALL
  SELECT p.project_id, 'ylo', TRIM(JSON_UNQUOTE(j.item))
  FROM project p
  JOIN JSON_TABLE(COALESCE(p.mapping_json, JSON_OBJECT()), '$.ylos[*]' COLUMNS (item JSON PATH '$')) AS j
  WHERE JSON_TYPE(j.item) = 'STRING' AND CHAR_LENGTH(TRIM(JSON_UNQUOTE(j.item))) BETWEEN 1 AND 50
) AS source
JOIN project p ON p.project_id = source.project_id
LEFT JOIN project_outcome_links pol
  ON pol.project_id = source.project_id
 AND pol.outcome_type = source.outcome_type
 AND pol.outcome_code = source.outcome_code
WHERE pol.id IS NULL;

-- A previous ready marker must not survive a later failed validation run.
DELETE FROM schema_migrations WHERE version = '202610290002';

DELETE audit_row
FROM project_mapping_json_backfill_audit audit_row
LEFT JOIN project p ON p.project_id = audit_row.project_id
WHERE p.project_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM tmp_project_mapping_json_issues);

INSERT INTO project_mapping_json_backfill_audit (project_id, mapping_hash)
SELECT p.project_id, SHA2(CAST(p.mapping_json AS CHAR CHARACTER SET utf8mb4), 256)
FROM project p
WHERE p.mapping_json IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM tmp_project_mapping_json_issues)
ON DUPLICATE KEY UPDATE
  mapping_hash = VALUES(mapping_hash),
  migrated_at = CURRENT_TIMESTAMP;

INSERT INTO schema_migrations (version, name, notes)
SELECT '202610290002', 'backfill_project_mapping_json',
       JSON_ARRAY('Backfilled PLO/CLO/YLO links', 'Validated member_count', 'Recorded mapping hashes')
WHERE NOT EXISTS (SELECT 1 FROM tmp_project_mapping_json_issues);

SELECT project_id, issue_code, detail
FROM tmp_project_mapping_json_issues
ORDER BY project_id, issue_code;

SELECT CASE WHEN COUNT(*) = 0 THEN 'ready_for_phase_1_deploy' ELSE 'blocked_fix_issues_and_rerun' END AS migration_status,
       COUNT(*) AS issue_count
FROM tmp_project_mapping_json_issues;
