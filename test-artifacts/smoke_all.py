# -*- coding: utf-8 -*-
"""Smoke test ทุก GET endpoint ใน index.php (login เป็น admin ก่อน)"""
import json, sys, io, urllib.request, urllib.error, http.cookiejar
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
BASE="http://localhost:8080/index.php"
cj=http.cookiejar.CookieJar(); op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
def call(p,m="GET",b=None,x=""):
    d=json.dumps(b,ensure_ascii=False).encode() if b is not None else None
    h={"Content-Type":"application/json"} if b is not None else {}
    try:
        r=op.open(urllib.request.Request(f"{BASE}?page={p}{x}",data=d,headers=h,method=m),timeout=25)
        return r.getcode(), r.read().decode("utf-8","replace")
    except urllib.error.HTTPError as e: return e.code, e.read().decode("utf-8","replace")
    except Exception as e: return -1, str(e)

_,t=call("login","POST",{"username":"46172040","password":"Test@1234"})
print("login:",json.loads(t)["status"])

GETS=[("profile","&user_id=5"),("sidebar",""),
("get-notifications",""),("get-notification-students",""),("get-notification-settings",""),
("get-users",""),("get-audit-logs",""),("get-approval-requests",""),("get-import-history",""),
("export-data","&type=students"),("performance",""),("projectspage",""),("teacher-dashboard",""),("teacher-courses",""),
("get-advises",""),("get-advisor-notifications",""),("get-assign-data",""),
("get-clo-management","&subject_code=103-111"),("get-clo-map",""),
("get-subjects",""),("get-clos","&subject_id=1"),("get-mapping","&subject_code=103-111"),
("get-report-filters",""),("get-course-report","&year=2567&subject=103-111"),
("get-my-courses",""),("get-course-students","&subject_id=1"),
("get-course-students-clo","&subject_id=1"),
("get-documents",""),("get-evidence",""),("get-five-year-summary",""),
("get-grading-data",""),("get-teacher-courses-overview",""),("get-practical-students",""),
("get-project","&project_id=1"),("get-project-docs",""),("get-project-links",""),("get-project-reports",""),
("get-schedule-tasks",""),("get-transfer-requests",""),
("transcript-api","&student_id=6603400001")]

bad=[]
for p,x in GETS:
    c,t=call(p,x=x)
    st=None
    try: st=json.loads(t).get("status")
    except: pass
    tag="OK " if st in ("success",) or (isinstance(st,type(None)) and c==200 and t.strip().startswith("[")) else "BAD"
    if tag=="BAD": bad.append(p)
    body=" ".join(t.split())[:110]
    print(f"[{tag}] {p:32} http{c} {body}")
print("\nBAD:",len(bad),bad)
