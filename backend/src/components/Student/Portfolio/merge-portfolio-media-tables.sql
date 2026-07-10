SET NAMES utf8mb4;
START TRANSACTION;

ALTER TABLE portfolio
  ADD COLUMN title VARCHAR(255) DEFAULT NULL AFTER student_id,
  ADD COLUMN type VARCHAR(100) DEFAULT NULL AFTER title,
  ADD COLUMN description TEXT DEFAULT NULL AFTER type,
  ADD COLUMN file_name VARCHAR(255) DEFAULT NULL AFTER description,
  ADD COLUMN mime_type VARCHAR(255) DEFAULT NULL AFTER file_data,
  ADD COLUMN file_category ENUM('image', 'video', 'document', 'other') NOT NULL DEFAULT 'document' AFTER mime_type,
  ADD COLUMN verified TINYINT(1) NOT NULL DEFAULT 0 AFTER file_category,
  ADD COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER verified,
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

UPDATE portfolio
SET
  title = COALESCE(title, JSON_UNQUOTE(JSON_EXTRACT(file_path, '$.title'))),
  type = COALESCE(type, JSON_UNQUOTE(JSON_EXTRACT(file_path, '$.type'))),
  verified = COALESCE(JSON_EXTRACT(file_path, '$.verified') + 0, verified)
WHERE JSON_VALID(file_path);

UPDATE portfolio p
JOIN (
  SELECT portfolio_id, MIN(image_id) AS image_id
  FROM portfolio_images
  WHERE portfolio_id IS NOT NULL
  GROUP BY portfolio_id
) first_image ON first_image.portfolio_id = p.portfolio_id
JOIN portfolio_images pi ON pi.image_id = first_image.image_id
SET
  p.file_data = COALESCE(p.file_data, pi.image_data),
  p.file_category = 'image',
  p.mime_type = COALESCE(p.mime_type, 'image/jpeg'),
  p.type = COALESCE(p.type, 'image'),
  p.title = COALESCE(p.title, 'หลักฐานรูปภาพ')
WHERE p.file_data IS NULL;

INSERT INTO portfolio (
  student_id,
  title,
  type,
  description,
  file_name,
  file_path,
  file_data,
  mime_type,
  file_category,
  verified,
  created_at,
  updated_at
)
SELECT
  p.student_id,
  COALESCE(p.title, 'หลักฐานรูปภาพ'),
  COALESCE(p.type, 'image'),
  p.description,
  p.file_name,
  NULL,
  pi.image_data,
  'image/jpeg',
  'image',
  p.verified,
  p.created_at,
  p.updated_at
FROM portfolio_images pi
JOIN portfolio p ON p.portfolio_id = pi.portfolio_id
JOIN (
  SELECT portfolio_id, MIN(image_id) AS image_id
  FROM portfolio_images
  WHERE portfolio_id IS NOT NULL
  GROUP BY portfolio_id
) first_image ON first_image.portfolio_id = pi.portfolio_id
WHERE pi.image_id <> first_image.image_id
   OR p.file_category <> 'image';

UPDATE portfolio p
JOIN (
  SELECT portfolio_id, MIN(video_id) AS video_id
  FROM portfolio_videos
  WHERE portfolio_id IS NOT NULL
  GROUP BY portfolio_id
) first_video ON first_video.portfolio_id = p.portfolio_id
JOIN portfolio_videos pv ON pv.video_id = first_video.video_id
SET
  p.file_data = COALESCE(p.file_data, pv.video_data),
  p.file_category = 'video',
  p.mime_type = COALESCE(p.mime_type, pv.mime_type, 'video/mp4'),
  p.type = COALESCE(p.type, 'video'),
  p.title = COALESCE(p.title, 'หลักฐานวิดีโอ')
WHERE p.file_data IS NULL;

INSERT INTO portfolio (
  student_id,
  title,
  type,
  description,
  file_name,
  file_path,
  file_data,
  mime_type,
  file_category,
  verified,
  created_at,
  updated_at
)
SELECT
  p.student_id,
  COALESCE(p.title, 'หลักฐานวิดีโอ'),
  COALESCE(p.type, 'video'),
  p.description,
  p.file_name,
  NULL,
  pv.video_data,
  COALESCE(pv.mime_type, 'video/mp4'),
  'video',
  p.verified,
  p.created_at,
  p.updated_at
FROM portfolio_videos pv
JOIN portfolio p ON p.portfolio_id = pv.portfolio_id
LEFT JOIN (
  SELECT portfolio_id, MIN(video_id) AS video_id
  FROM portfolio_videos
  WHERE portfolio_id IS NOT NULL
  GROUP BY portfolio_id
) first_video ON first_video.portfolio_id = pv.portfolio_id
WHERE pv.video_id <> first_video.video_id
   OR p.file_category <> 'video';

UPDATE portfolio
SET
  file_category = CASE
    WHEN mime_type LIKE 'image/%' THEN 'image'
    WHEN mime_type LIKE 'video/%' THEN 'video'
    WHEN mime_type IS NULL AND file_path REGEXP '\\.(jpg|jpeg|png|gif)$' THEN 'image'
    WHEN mime_type IS NULL AND file_path REGEXP '\\.(mp4|mov|avi)$' THEN 'video'
    ELSE file_category
  END,
  mime_type = CASE
    WHEN mime_type IS NOT NULL THEN mime_type
    WHEN file_path REGEXP '\\.pdf$' THEN 'application/pdf'
    WHEN file_path REGEXP '\\.(jpg|jpeg)$' THEN 'image/jpeg'
    WHEN file_path REGEXP '\\.png$' THEN 'image/png'
    WHEN file_path REGEXP '\\.gif$' THEN 'image/gif'
    WHEN file_path REGEXP '\\.mp4$' THEN 'video/mp4'
    ELSE mime_type
  END;

CREATE TABLE IF NOT EXISTS portfolio_images_backup LIKE portfolio_images;
INSERT INTO portfolio_images_backup SELECT * FROM portfolio_images;

CREATE TABLE IF NOT EXISTS portfolio_videos_backup LIKE portfolio_videos;
INSERT INTO portfolio_videos_backup SELECT * FROM portfolio_videos;

DROP TABLE IF EXISTS portfolio_images;
DROP TABLE IF EXISTS portfolio_videos;

COMMIT;
