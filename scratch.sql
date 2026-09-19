ALTER TABLE faculty_research
ADD COLUMN publication_date DATE NULL AFTER publication_year,
ADD COLUMN article_type VARCHAR(50) NULL AFTER publication_date,
ADD COLUMN journal_name VARCHAR(255) NULL AFTER article_type,
ADD COLUMN issue_number VARCHAR(100) NULL AFTER journal_name,
ADD COLUMN first_author_id BIGINT NULL AFTER issue_number,
ADD COLUMN corresponding_author_id BIGINT NULL AFTER first_author_id,
ADD COLUMN co_author_ids TEXT NULL AFTER corresponding_author_id;
