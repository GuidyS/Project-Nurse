// ชนิดข้อมูลกลางของ "นักศึกษาในความดูแล" ใช้ร่วมกันระหว่างหน้ารายชื่อและแผงข้อมูลย่อย
export interface StudentListItem {
  // student_id มาจาก API เป็นตัวเลขได้ (คอลัมน์เป็นชนิดตัวเลขใน DB) ห้ามสมมติว่าเป็น string เสมอ
  student_id: string | number;
  // คำนำหน้าจากข้อมูลส่วนตัวของนักศึกษา (student.title)
  title?: string | null;
  full_name: string;
  status: string;
}

export interface AdvisorDetailPanelProps {
  student: StudentListItem;
  onBack: () => void;
}
