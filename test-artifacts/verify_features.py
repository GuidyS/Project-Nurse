# -*- coding: utf-8 -*-
import json, sys, io, urllib.request, http.cookiejar
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
cj=http.cookiejar.CookieJar(); op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
def call(p,m="GET",b=None,x=""):
    d=json.dumps(b,ensure_ascii=False).encode() if b is not None else None
    h={"Content-Type":"application/json"} if b is not None else {}
    r=op.open(urllib.request.Request(f"http://localhost:8080/index.php?page={p}{x}",data=d,headers=h,method=m),timeout=20)
    return json.loads(r.read().decode())
call("login","POST",{"username":"46172040","password":"Test@1234"})
st=call("get-course-students",x="&subject_id=1")["data"]
eid=st[0]["id"]; sid=st[0]["studentId"]
print("F2 update-grade+subtasks:",call("update-grade","POST",{"id":eid,"subject_id":1,"grade":"A","midterm":25,"final":35,"assignment":18})["status"])
st2=[s for s in call("get-course-students",x="&subject_id=1")["data"] if s["id"]==eid][0]
print("   -> midterm saved:",st2.get("midterm"),"final:",st2.get("final"),"assignment:",st2.get("assignment"))
print("F3 save-clo-scores:",call("save-student-clo-scores","POST",{"subject_id":1,"student_id":sid,"scores":{"CLO1":88,"CLO2":72}})["status"])
cs=[s for s in call("get-course-students-clo",x="&subject_id=1")["data"]["students"] if str(s["studentId"])==str(sid)][0]
print("   -> scores read back:",cs["scores"],"overall:",cs["overall"],"status:",cs["status"])
mc=call("get-teacher-courses-overview")["data"]
print("F1 MyCourses progress (real):",[(c["code"],c["students"],c["cloProgress"]) for c in mc])
