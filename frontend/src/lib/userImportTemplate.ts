import * as XLSX from "xlsx";

export type UserImportTemplateType = "students" | "teachers";

type TemplateDefinition = {
  fileName: string;
  sheetName: string;
  title: string;
  required: readonly string[];
  optional: readonly string[];
  dateColumns: readonly string[];
};

const templateDefinitions: Record<UserImportTemplateType, TemplateDefinition> = {
  students: {
    fileName: "แพทเทิร์นนำเข้าข้อมูลนักศึกษา.xlsx",
    sheetName: "ข้อมูลนักศึกษา",
    title: "แพทเทิร์นนำเข้าข้อมูลนักศึกษา",
    required: ["student_id", "title", "first_name_th", "last_name_th", "gender", "birth_date"],
    optional: [
      "email",
      "phone",
      "year_level",
      "gpa",
      "hometown_province",
      "height",
      "weight",
      "bmi",
      "home_phone",
      "home_address",
      "status",
      "graduation_date",
      "dropout_date",
      "dropout_reason",
      "admission_year",
    ],
    dateColumns: ["birth_date", "graduation_date", "dropout_date"],
  },
  teachers: {
    fileName: "แพทเทิร์นนำเข้าข้อมูลอาจารย์.xlsx",
    sheetName: "ข้อมูลอาจารย์",
    title: "แพทเทิร์นนำเข้าข้อมูลอาจารย์",
    required: ["faculty_id", "title", "first_name_th", "last_name_th", "gender", "birth_date"],
    optional: [
      "email",
      "phone",
      "current_address",
      "nursing_council_no",
      "license_expiry",
      "start_work_date",
      "academic_position_date",
      "status",
    ],
    dateColumns: ["birth_date", "license_expiry", "start_work_date", "academic_position_date"],
  },
};

const thaiLabels: Record<string, string> = {
  student_id: "รหัสนักศึกษา",
  faculty_id: "รหัสประจำตัวอาจารย์",
  title: "คำนำหน้า",
  first_name_th: "ชื่อภาษาไทย",
  last_name_th: "นามสกุลภาษาไทย",
  gender: "เพศ",
  birth_date: "วันเดือนปีเกิด",
  email: "อีเมล",
  phone: "เบอร์โทรศัพท์",
  year_level: "ชั้นปี",
  gpa: "เกรดเฉลี่ย (GPA)",
  hometown_province: "จังหวัดภูมิลำเนา",
  height: "ส่วนสูง",
  weight: "น้ำหนัก",
  bmi: "ดัชนีมวลกาย (BMI)",
  home_phone: "เบอร์โทรศัพท์บ้าน",
  home_address: "ที่อยู่ตามภูมิลำเนา",
  status: "สถานะ",
  graduation_date: "วันที่สำเร็จการศึกษา",
  dropout_date: "วันที่เปลี่ยนสถานะการศึกษา",
  dropout_reason: "เหตุผลการเปลี่ยนสถานะ",
  admission_year: "ปีที่เข้าศึกษา",
  current_address: "ที่อยู่ปัจจุบัน",
  nursing_council_no: "เลขใบประกอบวิชาชีพ",
  license_expiry: "วันหมดอายุใบอนุญาต",
  start_work_date: "วันที่เริ่มทำงาน",
  academic_position_date: "วันที่ได้รับตำแหน่งทางวิชาการ",
};

const columnWidth = (header: string) => {
  if (header.includes("address") || header.includes("reason")) return 34;
  if (header.includes("date") || header.includes("year")) return 20;
  if (header.includes("name") || header === "nursing_council_no") return 24;
  return 18;
};

const prepareDataSheet = (definition: TemplateDefinition) => {
  const columns = [...definition.required, ...definition.optional];
  const headers = columns.map((column) => thaiLabels[column] ?? column);
  const sheet = XLSX.utils.aoa_to_sheet([headers]);
  const idColumn = 0;

  // เตรียมช่องรหัสเป็นข้อความเพื่อรักษาเลขศูนย์นำหน้าเมื่อเปิดใน Excel
  for (let row = 2; row <= 500; row += 1) {
    const address = XLSX.utils.encode_cell({ r: row - 1, c: idColumn });
    sheet[address] = { t: "s", v: "", z: "@" };
  }

  sheet["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 499, c: headers.length - 1 } });
  sheet["!cols"] = columns.map((column) => ({ wch: columnWidth(column) }));
  sheet["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}1` };
  return sheet;
};

const prepareInstructionSheet = (definition: TemplateDefinition) => {
  const requiredRows = definition.required.map((column) => [
    thaiLabels[column] ?? column,
    column,
    "จำเป็น",
    definition.dateColumns.includes(column) ? "วันที่รูปแบบ dd/mm/yyyy โดยใช้ปี ค.ศ." : "ต้องกรอกข้อมูล",
  ]);
  const optionalRows = definition.optional.map((column) => [
    thaiLabels[column] ?? column,
    column,
    "ไม่จำเป็น",
    definition.dateColumns.includes(column)
      ? "เว้นว่างได้; หากกรอกให้ใช้วันที่รูปแบบ dd/mm/yyyy โดยใช้ปี ค.ศ."
      : "เว้นว่างได้ และจะไม่ล้างข้อมูลเดิมเมื่ออัปเดต",
  ]);

  const sheet = XLSX.utils.aoa_to_sheet([
    [definition.title],
    ["กรอกข้อมูลในชีตข้อมูลเท่านั้น และห้ามเปลี่ยนชื่อหัวคอลัมน์แถวแรก"],
    ["คอลัมน์รหัสควรกรอกเป็นข้อความเพื่อรักษาเลขศูนย์นำหน้า"],
    ["คอลัมน์ optional ที่เว้นว่างจะใช้ค่าเริ่มต้นสำหรับรายการใหม่ และไม่ล้างค่าเดิมสำหรับรายการที่มีอยู่แล้ว"],
    [],
    ["หัวคอลัมน์ภาษาไทย", "ชื่อฟิลด์ระบบ", "การกรอก", "รูปแบบ / หมายเหตุ"],
    ...requiredRows,
    ...optionalRows,
  ]);
  sheet["!cols"] = [{ wch: 28 }, { wch: 36 }, { wch: 16 }, { wch: 72 }];
  return sheet;
};

export function downloadUserImportTemplate(type: UserImportTemplateType) {
  const definition = templateDefinitions[type];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, prepareDataSheet(definition), definition.sheetName);
  XLSX.utils.book_append_sheet(workbook, prepareInstructionSheet(definition), "คำแนะนำ");
  XLSX.writeFile(workbook, definition.fileName, { compression: true });
}
