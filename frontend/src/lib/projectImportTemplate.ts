import api from "@/lib/axios";

const PROJECT_IMPORT_TEMPLATE_FILE = "แพทเทิร์นนำเข้าข้อมูลโครงการ.xlsx";

const readBlobErrorMessage = async (error: unknown): Promise<string | null> => {
  const responseData = (error as { response?: { data?: unknown } })?.response?.data;
  if (!(responseData instanceof Blob)) return null;

  try {
    const payload = JSON.parse(await responseData.text()) as { message?: string };
    return payload.message || null;
  } catch {
    return null;
  }
};

export async function downloadProjectImportTemplate(): Promise<void> {
  try {
    const response = await api.get("/index.php?page=project-import-template", {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = PROJECT_IMPORT_TEMPLATE_FILE;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: unknown) {
    const message = await readBlobErrorMessage(error);
    throw new Error(message || "ไม่สามารถดาวน์โหลดแพทเทิร์นข้อมูลโครงการได้");
  }
}
