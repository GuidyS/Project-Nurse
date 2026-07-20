import React from 'react';

interface Props {
  permission: string;
  children: React.ReactNode;
}

const HasPermission: React.FC<Props> = ({ permission, children }) => {
  // ดึงข้อมูล permissions จาก localStorage หรือ Context ที่คุณเก็บไว้ตอน Login
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userPermissions: string[] = user.permissions || [];

  if (!userPermissions.includes(permission)) {
    return null; // ถ้าไม่มีสิทธิ์ จะไม่แสดงผล Component นั้นเลย
  }

  return <>{children}</>;
};

export default HasPermission;