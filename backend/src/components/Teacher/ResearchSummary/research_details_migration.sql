-- Run once after the base schema has created faculty_research.
ALTER TABLE faculty_research
    ADD COLUMN work_category ENUM('research', 'innovation') NOT NULL DEFAULT 'research' AFTER category,
    ADD COLUMN funding_type ENUM('none', 'internal', 'external') NOT NULL DEFAULT 'none' AFTER work_category,
    ADD COLUMN funding_source VARCHAR(255) NULL DEFAULT NULL AFTER funding_type,
    ADD COLUMN funding_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER funding_source,
    ADD COLUMN irb_approved TINYINT(1) NOT NULL DEFAULT 0 AFTER funding_amount,
    ADD COLUMN intellectual_property_status ENUM('none', 'applying', 'copyright', 'petty_patent', 'patent') NOT NULL DEFAULT 'none' AFTER irb_approved,
    ADD COLUMN award_name VARCHAR(255) NULL DEFAULT NULL AFTER intellectual_property_status;

CREATE INDEX idx_faculty_research_reporting
    ON faculty_research (publication_year, work_category, funding_type, irb_approved);
