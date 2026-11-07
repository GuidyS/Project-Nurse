# Uploads — legacy/internal storage only

User-facing files are stored in the private S3-compatible bucket configured
with `STORAGE_*` environment variables. Database references use
`storage://<uuid>` and are opened only through the authenticated
`index.php?page=file-access&id=<uuid>` endpoint.

This directory remains temporarily for 30-day migration fallback and internal
import/purge archives. Apache must deny direct HTTP access to all contents.

All uploaded files for this project belong under:

`backend/src/uploads/`

The document root still maps this directory to `/uploads/...`, but Apache now
returns `403` for every direct request.

## Layout

```text
uploads/
├── imports/                 # Admin Excel/CSV import archives (not for end-user download)
│   ├── courses/
│   ├── students/
│   ├── teachers/
│   └── projects/
├── user-documents/          # Per-user PDFs from Admin user management
│   └── {faculty_id|student_id}/
├── portfolio/               # Student portfolio media
├── project_docs/            # Teacher project documents
├── faculty-documents/       # Optional staging for legacy imported faculty images
└── student-purge-archive/   # Internal purge audit archives; never public
```

## Rules

1. **One root only** — do not create `uploads/` under feature folders
   (e.g. not under `components/Admin/ImportData/`).
2. **Per-user files** go in `user-documents/{owner_id}/`.
3. Never create a public `/uploads/...` URL; direct access is intentionally denied.
4. New user files must use `config/storage.php` and store `storage://<uuid>`.
5. Import archives in `imports/` are for audit/reprocess and must never be linked in UI.

## Migration

Run the SQL migration first, then inventory without changing data:

```bash
php scripts/migrate_object_storage.php
```

Apply migration only after reviewing the summary:

```bash
php scripts/migrate_object_storage.php --apply
```

After at least 30 days, preview and then explicitly apply cleanup:

```bash
php scripts/migrate_object_storage.php --cleanup --before=YYYY-MM-DD
php scripts/migrate_object_storage.php --cleanup --before=YYYY-MM-DD --apply
```

Retry failed object deletions with a dry-run first:

```bash
php scripts/migrate_object_storage.php --retry-deletes
php scripts/migrate_object_storage.php --retry-deletes --apply
```

## Migrated from

- `components/Admin/ImportData/uploads/imports/*` → `uploads/imports/*`

