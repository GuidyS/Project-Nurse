CREATE TABLE IF NOT EXISTS storage_objects (
    storage_id CHAR(36) NOT NULL,
    object_key VARCHAR(512) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(127) NOT NULL,
    size_bytes BIGINT UNSIGNED NOT NULL,
    sha256 CHAR(64) NOT NULL,
    owner_type ENUM('student','faculty','project','system') NOT NULL,
    owner_id VARCHAR(100) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(100) DEFAULT NULL,
    access_scope ENUM('owner_admin','student_advisor_admin','project_member_admin','authenticated') NOT NULL,
    legacy_path VARCHAR(512) DEFAULT NULL,
    legacy_source ENUM('none','local','blob') NOT NULL DEFAULT 'none',
    status ENUM('active','missing','pending_delete','deleted') NOT NULL DEFAULT 'active',
    created_by BIGINT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    migrated_at TIMESTAMP NULL DEFAULT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (storage_id),
    UNIQUE KEY uq_storage_object_key (object_key),
    KEY idx_storage_owner (owner_type, owner_id),
    KEY idx_storage_resource (resource_type, resource_id),
    KEY idx_storage_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @add_storage_updated_at = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='storage_objects' AND column_name='updated_at') = 0,
    'ALTER TABLE storage_objects ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at',
    'SELECT 1'
);
PREPARE add_storage_updated_at_stmt FROM @add_storage_updated_at;
EXECUTE add_storage_updated_at_stmt;
DEALLOCATE PREPARE add_storage_updated_at_stmt;

SET @add_health_evidence = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='student_health_records' AND column_name='evidence_images') = 0,
    'ALTER TABLE student_health_records ADD COLUMN evidence_images JSON DEFAULT NULL COMMENT ''Object Storage references for general health evidence''',
    'SELECT 1'
);
PREPARE add_health_evidence_stmt FROM @add_health_evidence;
EXECUTE add_health_evidence_stmt;
DEALLOCATE PREPARE add_health_evidence_stmt;

SET @add_admission_evidence = IF(
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='student_health_records' AND column_name='admission_health_check') = 0,
    'ALTER TABLE student_health_records ADD COLUMN admission_health_check JSON DEFAULT NULL COMMENT ''Object Storage references for admission health evidence''',
    'SELECT 1'
);
PREPARE add_admission_evidence_stmt FROM @add_admission_evidence;
EXECUTE add_admission_evidence_stmt;
DEALLOCATE PREPARE add_admission_evidence_stmt;
