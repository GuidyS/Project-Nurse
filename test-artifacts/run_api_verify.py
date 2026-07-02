# -*- coding: utf-8 -*-
"""Verify หลังแก้บั๊ก + ใส่ mock data — login admin 46172040 แล้วยิง endpoint ที่แก้"""
import json, sys, io, urllib.request, urllib.error, http.cookiejar
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
BASE="http://localhost:8080/index.php"
cj=http.cookiejar.CookieJar(); op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
def call(page, method="GET", body=None, extra=""):
    url=f"{BASE}?page={page}{extra}"; data=None; h={"Accept":"application/json"}
    if body is not None: data=json.dumps(body,ensure_ascii=False).encode(); h["Content-Type"]="application/json"
    req=urllib.request.Request(url,data=data,headers=h,method=method)
    try:
        r=op.open(req,timeout=30); return r.getcode(), r.read().decode("utf-8","replace")
    except urllib.error.HTTPError as e: return e.code, e.read().decode("utf-8","replace")
    except Exception as e: return -1, f"{type(e).__name__}: {e}"
def j(t):
    try: return json.loads(t)
    except: return None
def line(tag, code, t, extra=""):
    d=j(t); st=d.get("status") if isinstance(d,dict) else None
    ok = "OK " if st=="success" else ("HTML" if t.strip().startswith("<") else "ERR ")
    print(f"[{ok}] {tag:32} http{code} status={st} {extra}")
    if st!="success": print("        ", " ".join(t.split())[:130])

c,t=call("login","POST",{"username":"46172040","password":"Test@1234"})
print("LOGIN:", j(t).get("status"), "| role", j(t).get("user",{}).get("role_id"))
# CoursesPage
c,t=call("get-my-courses"); d=j(t); line("CoursesPage get-my-courses",c,t, f"courses={len(d.get('data',[])) if d else '?'}")
c,t=call("get-course-students",extra="&subject_id=1"); d=j(t); line("  get-course-students(1)",c,t, f"students={len(d.get('data',[])) if d else '?'}")
# MyCourses
c,t=call("get-teacher-courses-overview"); d=j(t); line("MyCourses overview",c,t, f"courses={len(d.get('data',[])) if d else '?'}")
# Grades
c,t=call("get-grading-data"); d=j(t); line("Grades get-grading-data",c,t, f"courses={len((d.get('data') or {}).get('courses',[])) if d else '?'}")
c,t=call("get-grading-data",extra="&subject_id=1"); d=j(t); line("  grading students(1)",c,t, f"students={len((d.get('data') or {}).get('students',[])) if d else '?'}")
# CLOMap
c,t=call("get-clo-map"); d=j(t); line("CLOMap get-clo-map",c,t, f"courses={len((d.get('data') or {}).get('courses',[])) if d else '?'} plos={len((d.get('data') or {}).get('plos',[])) if d else '?'}")
# CourseReports
c,t=call("get-report-filters"); d=j(t); line("CourseReports filters",c,t, f"years={len((d.get('data') or {}).get('years',[])) if d else '?'}")
c,t=call("get-course-report",extra="&year=2567&subject=103-111"); d=j(t); line("  course-report",c,t)
# CLOPage
c,t=call("get-clos",extra="&subject_id=1"); d=j(t); line("CLOPage get-clos(1)",c,t, f"clos={len(d.get('data',[])) if d and isinstance(d.get('data'),list) else '?'}")
c,t=call("add-clo","POST",{"subject_id":1,"description":"CLO ทดสอบเพิ่มจาก verify","ylo_id":"YLO2"}); line("  add-clo",c,t)
# CLOManagement
c,t=call("get-clo-management",extra="&subject_code=103-111"); d=j(t); line("CLOMgmt get(103-111)",c,t, f"clos={len(((d.get('data') or {}).get('clos')) or []) if d else '?'}")
c,t=call("save-clo-management","POST",{"subject_code":"103-111","clos":[{"id":"1","code":"CLO1","description":"x","plo":"PLO1","weight":100}]}); line("  save-clo-management",c,t)
# CourseStudents
c,t=call("get-course-students-clo",extra="&subject_id=1"); d=j(t); line("CourseStudents(1)",c,t, f"students={len((d.get('data') or {}).get('students',[])) if d else '?'}")
# Documents
c,t=call("get-documents"); d=j(t); line("Documents get-documents",c,t, f"docs={len((d.get('data') or {}).get('documents',[])) if d else '?'}")
c,t=call("upload-document","POST",{"name":"เอกสารทดสอบ verify","type":"TQF 3","course":"103-111"}); line("  upload-document",c,t)
