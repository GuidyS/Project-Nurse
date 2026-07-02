# -*- coding: utf-8 -*-
"""ทดสอบจริง (dynamic) ยิง API backend ของ 9 โมดูล ด้วย session ของอาจารย์ T001
รันหลังจาก docker compose up + โหลด seed แล้ว:  python run_api_tests.py
"""
import json, sys, io, urllib.request, urllib.error, http.cookiejar
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

BASE = "http://localhost:8080/index.php"
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def call(page, method="GET", body=None, extra=""):
    url = f"{BASE}?page={page}{extra}"
    data, headers = None, {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        r = opener.open(req, timeout=30)
        return r.getcode(), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except Exception as e:
        return -1, f"{type(e).__name__}: {e}"

def jstatus(txt):
    try: return json.loads(txt).get("status")
    except Exception: return None

def short(txt, n=150):
    t = " ".join(txt.split())
    return t[:n] + ("..." if len(t) > n else "")

results = []
def record(tc, name, code, txt, verdict, note):
    results.append((tc, name, code, verdict, note, short(txt)))
    print(f"[{verdict:14}] {tc:14} {name}")
    print(f"               HTTP {code} | {short(txt)}")

# ---------- 0. LOGIN ----------
code, txt = call("login", "POST", {"username": "T001", "password": "Test@1234"})
st = jstatus(txt)
if st == "success":
    record("LOGIN", "Login อาจารย์ T001", code, txt, "PASS", "ล็อกอินได้ มี session")
else:
    record("LOGIN", "Login อาจารย์ T001", code, txt, "FAIL", "ล็อกอินไม่ได้ — หยุดทดสอบ")
    print("\n!! Login failed, abort."); sys.exit(1)

# helper verdicts
def expect_success(tc, name, code, txt, extra_ok=lambda t: True):
    st = jstatus(txt)
    if st == "success" and extra_ok(txt):
        record(tc, name, code, txt, "PASS", "")
    elif st == "error":
        record(tc, name, code, txt, "FAIL/ERR", "ระบบตอบ error")
    else:
        record(tc, name, code, txt, "FAIL", f"status={st}")

def expect_error(tc, name, code, txt):
    st = jstatus(txt)
    record(tc, name, code, txt, "PASS(neg)" if st == "error" or code in (400,401,500) else "UNEXPECTED", "ควรเป็น error")

# ---------- CLOPage (FR030) ----------
c,t = call("get-subjects");                         expect_success("TC-FR030-01","CLOPage: get-subjects",c,t)
c,t = call("get-clos", extra="&subject_id=1");      record("TC-FR030-02","CLOPage: get-clos (subject 1)",c,t,
        "PASS" if jstatus(t)=="success" else "DEFECT?", "ถ้า 401 = bug session_start หาย")
c,t = call("add-clo","POST",{"subject_id":1,"description":"CLO ทดสอบจาก API","ylo_id":"YLO3"})
record("TC-FR030-03","CLOPage: add-clo",c,t,"PASS" if jstatus(t)=="success" else "DEFECT?","อาจ 401 จาก session")
c,t = call("update-clo","POST",{"clo_id":1,"description":"แก้ไขจาก API","ylo_id":"YLO1"})
record("TC-FR030-05","CLOPage: update-clo",c,t,"PASS" if jstatus(t)=="success" else "DEFECT?","")
c,t = call("get-clos");                             expect_error("TC-FR030-07","CLOPage: get-clos ไม่ส่ง subject_id",c,t)

# ---------- CLOManagement (FR028/29) ----------
c,t = call("get-clo-management", extra="&subject_code=103-111")
expect_success("TC-FR028-01","CLOMgmt: get (param ถูก subject_code)",c,t)
c,t = call("get-clo-management", extra="&subject-code=103-111")
record("TC-FR028-04","CLOMgmt: get (param FE ใช้จริง subject-code)",c,t,
       "DEFECT-CONFIRMED" if jstatus(t)=="error" else "CHECK","FE ส่ง subject-code แต่ BE อ่าน subject_code")
c,t = call("save-clo-management","POST",{"subject_code":"103-111","clos":[
    {"id":"1","code":"CLO1","description":"x","plo":"PLO1","weight":40},
    {"id":"2","code":"CLO2","description":"y","plo":"PLO2","weight":80}]})
record("TC-FR028-03","CLOMgmt: save น้ำหนักรวม 120% (>100)",c,t,
       "DEFECT-CONFIRMED" if jstatus(t)=="success" else "CHECK","บันทึกได้แม้เกิน 100% = ไม่มี validation")

# ---------- CLOMap (FR034) ----------
c,t = call("get-clo-map")
record("TC-FR034-06","CLOMap: get-clo-map (เช็ค merge conflict)",c,t,
       "DEFECT-CONFIRMED" if (jstatus(t) not in ("success",) ) else "PASS",
       "ถ้า parse error/ไม่ใช่ JSON = ยืนยัน merge conflict markers")
c,t = call("save-clo-map","POST",{"103-111":["PLO1","PLO2","PLO3"]})
expect_success("TC-FR034-03","CLOMap: save-clo-map",c,t)

# ---------- CourseReports (FR033) ----------
c,t = call("get-report-filters");                   expect_success("TC-FR033-01","Reports: get-report-filters",c,t)
c,t = call("get-course-report", extra="&year=2567&subject=103-111")
expect_success("TC-FR033-02","Reports: get-course-report",c,t)
c,t = call("get-course-report", extra="&year=2567")
expect_error("TC-FR033-04","Reports: ตัวกรองไม่ครบ (ไม่ส่ง subject)",c,t)

# ---------- CoursesPage (FR009) ----------
c,t = call("get-my-courses");                       expect_success("TC-FR009-01","Courses: get-my-courses",c,t)
c,t = call("get-course-students", extra="&subject_id=1")
expect_success("TC-FR009-02","Courses: get-course-students",c,t)
c,t = call("update-grade","POST",{"id":1,"subject_id":1,"grade":"A","midterm":40,"final":45,"assignment":15})
expect_success("TC-FR009-03","Courses: update-grade (id=1 -> A)",c,t)

# ---------- CourseStudents (FR035) ----------
c,t = call("get-course-students-clo");              expect_success("TC-FR035-01","CourseStudents: list courses",c,t)
c,t = call("get-course-students-clo", extra="&subject_id=1")
expect_success("TC-FR035-02","CourseStudents: students+CLO (subject 1)",c,t)
c,t = call("save-student-clo-scores","POST",{"subject_id":1,"student_id":"6401001","scores":{"CLO1":80}})
record("TC-FR035-05","CourseStudents: save (stub?)",c,t,
       "STUB-CONFIRMED" if jstatus(t)=="success" else "CHECK","ตอบ success แต่ไม่บันทึก DB จริง")

# ---------- Documents (FR037) ----------
c,t = call("get-documents");                        expect_success("TC-FR037-01","Documents: get-documents",c,t)
c,t = call("upload-document","POST",{"name":"คู่มือทดสอบ API","type":"TQF 3","course":"103-111"})
record("TC-FR037-02","Documents: upload-document",c,t,"PASS" if jstatus(t)=="success" else "DEFECT?","อาจติด auth_middleware")
c,t = call("upload-document","POST",{"name":"","type":"","course":""})
expect_error("TC-FR037-03","Documents: upload ข้อมูลไม่ครบ",c,t)

# ---------- Grades (FR036) ----------
c,t = call("get-grading-data")
record("TC-FR036-06","Grades: get-grading-data (เช็ค path case)",c,t,
       "DEFECT-CONFIRMED" if (code==404 or jstatus(t) is None or "not found" in t.lower()) else "PASS",
       "index.php ชี้ Teacher/Grades/ แต่โฟลเดอร์จริง Teacher/grading/")
c,t = call("save-grading-data","POST",{"subject_id":1,"students":[{"id":"6401004","grade":"B+"}]})
record("TC-FR036-03","Grades: save-grading-data (ให้เกรด 6401004)",c,t,
       "PASS" if jstatus(t)=="success" else "DEFECT?","")

# ---------- MyCourses (FR038) ----------
c,t = call("get-teacher-courses-overview");         expect_success("TC-FR038-01","MyCourses: overview",c,t)

# ---------- SUMMARY ----------
print("\n" + "="*70)
print("SUMMARY")
from collections import Counter
cnt = Counter(r[3] for r in results)
for k,v in cnt.items(): print(f"  {k}: {v}")
print("="*70)
with open("api_test_results.json","w",encoding="utf-8") as f:
    json.dump([{"tc":r[0],"name":r[1],"http":r[2],"verdict":r[3],"note":r[4],"resp":r[5]} for r in results], f, ensure_ascii=False, indent=2)
print("saved api_test_results.json")
