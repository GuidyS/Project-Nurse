import type { AxiosInstance } from "axios";

export const PROJECT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

interface UploadProjectAttachmentParams {
  api: AxiosInstance;
  projectId: number | string;
  projectName: string;
  file: File;
}

export async function uploadProjectAttachment({
  api,
  projectId,
  projectName,
  file,
}: UploadProjectAttachmentParams) {
  const documentResponse = await api.post("/index.php?page=create-project-doc", {
    name: file.name,
    project_id: projectId,
    type: "proposal",
    date: new Date().toISOString().slice(0, 10),
    project: projectName,
  });

  if (documentResponse.data.status !== "success") {
    throw new Error(documentResponse.data.message || "ไม่สามารถสร้างเอกสารแนบได้");
  }

  const documentId = documentResponse.data.doc_id;
  if (!documentId) {
    throw new Error("ไม่พบรหัสเอกสารแนบ");
  }

  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("document_id", String(documentId));

  const uploadResponse = await api.post("/index.php?page=upload-project-file", uploadData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (uploadResponse.data.status !== "success") {
    throw new Error(uploadResponse.data.message || "ไม่สามารถอัปโหลดไฟล์แนบได้");
  }

  return uploadResponse.data;
}
