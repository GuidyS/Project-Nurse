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
adv=call("get-advises")["data"]
print("Advises:",len(adv),"คน | ตัวอย่าง:",[(a["studentId"],a["gpa"],a["status"],a["lastContact"]) for a in adv[:3]])
st=call("get-advise-students")["data"]
print("AdviseStudents dropdown:",len(st),"| first:",st[0])
n=call("get-advise-notes")["data"]
print("Notes:",n["stats"], "| first:",(n["notes"][0]["studentId"],n["notes"][0]["topic"]) if n["notes"] else None)
r=call("save-advise-note","POST",{"studentId":st[0]["id"],"topic":"ทดสอบบันทึกจากระบบ","type":"academic","summary":"ทดสอบ save-advise-note"})
print("save-advise-note:",r["status"])
n2=call("get-advise-notes")["data"]; print("Notes after save:",n2["stats"]["total"])
noti=call("get-advisor-notifications")["data"]
print("Notifications:",len(noti["notifications"]),"unread:",noti["unreadCount"])
if noti["notifications"]:
    nid=[x["id"] for x in noti["notifications"] if not x["read"]][0]
    print("mark read:",call("update-notification-read","POST",{"action":"single","notification_id":nid})["status"])
    print("unread after:",call("get-advisor-notifications")["data"]["unreadCount"])
