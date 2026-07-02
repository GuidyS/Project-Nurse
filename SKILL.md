---
name: project-nurse-teacher-api
description: Work with the Project Nurse Teacher Projects API integration and local test flow. Use when connecting, testing, or debugging the Teacher Projects frontend page, the projectspage backend endpoint, or the temporary local mock API on port 8080.
---

# Project Nurse Teacher API

## Scope

Use this skill for the Teacher Projects page integration in this repo.

The frontend page is:

- `frontend/src/components/pages/Teacher/ProjectsPage.tsx`

The API endpoint contract is:

- `GET http://localhost:8080/index.php?page=projectspage`
- `POST http://localhost:8080/index.php?page=projectspage`
- `PUT http://localhost:8080/index.php?page=projectspage`
- `DELETE http://localhost:8080/index.php?page=projectspage`

The expected response shape is:

```json
{
  "status": "success",
  "data": [
    {
      "project_id": 1,
      "project_name_th": "ชื่อโครงการ",
      "project_name_en": "Project name",
      "description": "รายละเอียด"
    }
  ]
}
```

## Connected Files

- `frontend/src/lib/axios.ts`: central axios client. Defaults to `http://localhost:8080/index.php` when `VITE_API_BASE_URL` is not set.
- `frontend/src/components/pages/Teacher/ProjectsPage.tsx`: Teacher Projects UI. Calls `?page=projectspage` through the central axios client for GET/POST/PUT/DELETE.
- `frontend/src/pages/Index.tsx`: supports direct testing with `http://localhost:5173/?page=projectspage`.
- `frontend/src/index.css`: merge conflict markers were removed so Vite can compile.
- `frontend/src/components/pages/Auth/LoginPage.tsx`: merge conflict markers were removed.
- `frontend/src/components/pages/Auth/RegisterPage.tsx`: merge conflict markers were removed.
- `test-artifacts/teacher-mock-api.cjs`: temporary Node mock API for testing when PHP/Docker backend is not available.

## Test Workflow

1. Start or confirm an API server on port `8080`.
   - Prefer the real PHP/Docker backend when available.
   - If PHP/Docker is unavailable, use `test-artifacts/teacher-mock-api.cjs` as a temporary local API with the same `projectspage` contract.

2. Confirm the endpoint:

```powershell
node -e "fetch('http://127.0.0.1:8080/index.php?page=projectspage').then(r=>r.text()).then(console.log)"
```

3. Open the frontend test page:

```text
http://localhost:5173/?page=projectspage
```

4. Verify CRUD behavior:

```powershell
node -e "const base='http://127.0.0.1:8080/index.php?page=projectspage'; (async()=>{ const get1=await fetch(base).then(r=>r.json()); console.log('GET', get1.status, get1.data.length); const post=await fetch(base,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project_name_th:'ทดสอบเพิ่มจาก Frontend',project_name_en:'Frontend Create Test',description:'created by API test'})}).then(r=>r.json()); console.log('POST', post.status, post.data.project_id); const put=await fetch(base,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({project_id:post.data.project_id,project_name_th:'ทดสอบแก้ไขจาก Frontend',project_name_en:'Frontend Update Test',description:'updated by API test'})}).then(r=>r.json()); console.log('PUT', put.status, put.data.project_name_th); const del=await fetch(base,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({project_id:post.data.project_id})}).then(r=>r.json()); console.log('DELETE', del.status); const get2=await fetch(base).then(r=>r.json()); console.log('GET_AFTER', get2.status, get2.data.length); })().catch(e=>{console.error(e); process.exit(1)})"
```

Expected result:

```text
GET success 2
POST success 3
PUT success ทดสอบแก้ไขจาก Frontend
DELETE success
GET_AFTER success 2
```

## Notes

- The mock API is only for local testing. Replace it with the real PHP/Docker backend when available.
- Keep the frontend calling the shared axios client instead of hard-coded `fetch` URLs.
- Do not change the `projectspage` response keys unless the frontend mapper is updated at the same time.
