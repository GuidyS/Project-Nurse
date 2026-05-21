const http = require("http");

let projects = [
  {
    project_id: 1,
    project_name_th: "โครงการทดสอบระบบพยาบาล",
    project_name_en: "Nursing System Test Project",
    description: "Mock data for testing Teacher Projects API",
  },
  {
    project_id: 2,
    project_name_th: "ระบบติดตามผลการเรียน",
    project_name_en: "Learning Outcome Tracker",
    description: "Local mock endpoint while PHP/Docker backend is unavailable",
  },
];

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning",
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:8080");

  if (req.method === "OPTIONS") {
    return sendJson(res, 200, { status: "success" });
  }

  if (url.pathname !== "/index.php" || url.searchParams.get("page") !== "projectspage") {
    return sendJson(res, 404, { status: "error", message: "API endpoint is not found!" });
  }

  try {
    if (req.method === "GET") {
      return sendJson(res, 200, { status: "success", data: projects });
    }

    const input = await readBody(req);

    if (req.method === "POST") {
      if (!input.project_name_th) {
        return sendJson(res, 400, { status: "error", message: "กรุณากรอกชื่อโครงการ" });
      }
      const nextProject = {
        project_id: Math.max(0, ...projects.map((project) => Number(project.project_id))) + 1,
        project_name_th: input.project_name_th,
        project_name_en: input.project_name_en || "",
        description: input.description || "",
      };
      projects = [nextProject, ...projects];
      return sendJson(res, 200, { status: "success", message: "เพิ่มโครงการสำเร็จ", data: nextProject });
    }

    if (req.method === "PUT") {
      const projectId = Number(input.project_id);
      const index = projects.findIndex((project) => Number(project.project_id) === projectId);
      if (index < 0 || !input.project_name_th) {
        return sendJson(res, 400, { status: "error", message: "ข้อมูลไม่ครบถ้วน" });
      }
      projects[index] = {
        ...projects[index],
        project_name_th: input.project_name_th,
        project_name_en: input.project_name_en || "",
        description: input.description || "",
      };
      return sendJson(res, 200, { status: "success", message: "แก้ไขข้อมูลสำเร็จ", data: projects[index] });
    }

    if (req.method === "DELETE") {
      const projectId = Number(input.project_id);
      projects = projects.filter((project) => Number(project.project_id) !== projectId);
      return sendJson(res, 200, { status: "success", message: "ลบข้อมูลสำเร็จ" });
    }

    return sendJson(res, 405, { status: "error", message: "Method Not Allowed" });
  } catch (error) {
    return sendJson(res, 500, { status: "error", message: error.message });
  }
});

server.listen(8080, () => {
  console.log("Teacher mock API listening at http://localhost:8080/index.php?page=projectspage");
});
