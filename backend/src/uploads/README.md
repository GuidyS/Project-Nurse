# Uploads — single storage root

All uploaded files for this project belong under:

`backend/src/uploads/`

Apache serves this as `/uploads/...` (document root = `backend/src`).

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
└── faculty-documents/       # Optional staging for legacy imported faculty images
```

## Rules

1. **One root only** — do not create `uploads/` under feature folders
   (e.g. not under `components/Admin/ImportData/`).
2. **Per-user files** go in `user-documents/{owner_id}/`.
3. **Public URL** for a saved relative path like `uploads/portfolio/x.jpg`
   is `http://localhost:8080/uploads/portfolio/x.jpg`.
4. Store the same relative path (starting with `uploads/...`) in the database.
5. Import archives in `imports/` are for audit/reprocess; prefer not linking them in UI.

## Migrated from

- `components/Admin/ImportData/uploads/imports/*` → `uploads/imports/*`
 