# -*- coding: utf-8 -*-
import json, sys, io, urllib.request, http.cookiejar
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
def mk():
    cj=http.cookiejar.CookieJar(); return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
def call(op,p,m="GET",b=None,x=""):
    d=json.dumps(b,ensure_ascii=False).encode() if b is not None else None
    h={"Content-Type":"application/json"} if b is not None else {}
    r=op.open(urllib.request.Request(f"http://localhost:8080/index.php?page={p}{x}",data=d,headers=h,method=m),timeout=25)
    return json.loads(r.read().decode())

# --- Admin ---
op=mk(); call(op,"login","POST",{"username":"46172040","password":"Test@1234"})
d=call(op,"get-dean-dashboard")["data"]
print("Dean: students_by_year",d.get("students_by_year"),"| faculty_by_position",d.get("faculty_by_position"))
fy=call(op,"get-five-year-summary")["data"]
print("FiveYear: courses(with data)",len(fy["courseData"]),"| years",[y["year"] for y in fy["yearlyData"]])
r=call(op,"get-plo-ylo-report")["data"]
print("PLOYLO: plos",len(r["plos"]),"ylos",len(r["ylos"]),"| PLO1",r["plos"][0])
sl=call(op,"get-students-list")["data"]
print("StudentsList:",len(sl),"| first",sl[0]["studentId"],sl[0]["name"][:20])
sd=call(op,"get-student-detail",x=f"&student_id={sl[0]['student_id']}")["data"]
print("StudentDetail:",sd["studentId"],"| advisor:",sd["advisor"][:25],"| enrollments:",len(sd["enrollments"]))
pl=call(op,"get-project-links")["data"]
print("ProjectLinks: projects",len(pl["projects"]),"plos",pl["plos"])
sv=call(op,"create-project-links","POST",{"projectId":1,"links":{"plos":["PLO1","PLO2"],"ylos":["YLO1"],"clos":["CLO1"]}})
print("save links:",sv["status"])
pl2=call(op,"get-project-links")["data"]["links"]
print("links after save (p1):",pl2.get("1"))
pr=call(op,"get-project-reports",x="&project_id=1")["data"]
print("ProjectReports: stats",pr["stats"],"| budgetData",pr["budgetData"])

# --- อาจารย์ผู้รับผิดชอบโครงการ ---
op2=mk(); u=call(op2,"login","POST",{"username":"63172133","password":"Test@1234"})
print("PM login:",u["status"],"| position:",u["user"]["position_id"])
mp=call(op2,"get-my-projects")["data"]
print("MyProjects:",[(p["name"][:25],p["status"],p["progress"],p["budget"]) for p in mp])
