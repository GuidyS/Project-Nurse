# Frontend Developer Guide

คู่มือนี้เป็นเอกสารสำหรับผู้ที่จะมาพัฒนาต่อเฉพาะส่วน Frontend ของระบบ Nurse Management System

## ภาพรวม

Frontend ใช้ Vite + React + TypeScript เป็นโครงหลัก และใช้ Tailwind CSS ร่วมกับ shadcn/ui, Radix UI, lucide-react, axios, React Query และ sonner สำหรับ toast notification

ระบบตอนนี้ใช้ route หลักเพียง `/` แล้วสลับหน้าใน `src/pages/Index.tsx` ด้วย state `activeItem` แทนการแยก URL route ย่อยหลายหน้า

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui และ Radix UI
- lucide-react สำหรับ icon
- axios สำหรับเรียก Backend API
- @tanstack/react-query
- sonner และ local toaster สำหรับ notification

## การติดตั้งและรัน

ติดตั้ง dependencies:

```bash
npm install
```

รัน development server:

```bash
npm run dev
```

ค่า default จาก `vite.config.ts`:

- host: เปิดรับทุก host
- port: `5173`
- URL ใช้งานปกติ: `http://localhost:5173`

Build production:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Environment Variables

Frontend เรียก Backend ผ่าน `src/lib/axios.ts` โดยอ่านค่าจาก:

```env
VITE_API_BASE_URL=http://localhost:8080
```

แนะนำให้สร้างไฟล์ `.env` ไว้ที่โฟลเดอร์ `frontend/`:

```bash
frontend/.env
```

ตัวอย่าง:

```env
VITE_API_BASE_URL=http://localhost:8080
```

ถ้าไม่ได้ตั้งค่านี้ axios จะไม่มี base URL ชัดเจน และ API เช่น `/index.php?page=login` อาจยิงผิดที่

## โครงสร้างสำคัญ

```text
frontend/
  src/
    App.tsx
    main.tsx
    index.css
    lib/
      axios.ts
      utils.ts
    hooks/
    pages/
      Index.tsx
      NotFound.tsx
    components/
      layout/
        MainLayout.tsx
        AppSidebar.tsx
      pages/
        Auth/
          LoginPage.tsx
          RegisterPage.tsx
          HasPermission.tsx
          PasswordStrengthIndicator.tsx
        Admin/
        Student/
        Teacher/
      ui/
```

## จุดเริ่มต้นของ App

`src/main.tsx` mount React app

`src/App.tsx` ครอบ app ด้วย provider หลัก:

- `QueryClientProvider`
- `TooltipProvider`
- `Toaster`
- `Sonner`
- `BrowserRouter`

Route หลัก:

```tsx
<Route path="/" element={<Index />} />
<Route path="*" element={<NotFound />} />
```

## การสลับหน้าในระบบ

ไฟล์หลักคือ `src/pages/Index.tsx`

ระบบใช้ state:

```tsx
const [activeItem, setActiveItem] = useState("login");
```

แล้วใช้ `switch (activeItem)` เพื่อเลือก component ที่จะแสดง เช่น:

- `login`
- `register`
- `users-management`
- `dean-dashboard`
- `plo-ylo-report`
- `transcript`
- `profile`

ถ้าเป็นหน้า `login` หรือ `register` จะไม่แสดง sidebar และใช้ layout เต็มจอแบบ auth page

ถ้าไม่ใช่ auth page จะครอบด้วย:

```tsx
<MainLayout onItemClick={setActiveItem} activeItem={activeItem}>
  {renderPage()}
</MainLayout>
```

## Auth Flow

ไฟล์ที่เกี่ยวข้อง:

- `src/components/pages/Auth/LoginPage.tsx`
- `src/components/pages/Auth/RegisterPage.tsx`
- `src/components/pages/Auth/HasPermission.tsx`

Login เรียก API:

```ts
POST /index.php?page=login
```

เมื่อ login สำเร็จ ระบบเก็บข้อมูล user ลง `localStorage`:

```ts
localStorage.setItem("user", JSON.stringify(userData));
```

จากนั้นเลือกหน้าแรกตาม `role_id` และ `position_id`:

- `role_id = 1`: ไป `users-management`
- `role_id = 2`: ดู `position_id` เพื่อเลือก dashboard/รายงาน/หน้า advisor
- `role_id = 3`: ไป `transcript`
- ค่าอื่น: ไป `profile`

Register เรียก API:

```ts
POST /index.php?page=register
```

Reset password อยู่ใน `LoginPage.tsx` เป็น state ภายในหน้าเดียวกัน และเรียก:

```ts
POST /index.php?page=reset-password
```

## Form Validation UI

หน้า Login, Register และ Reset Password ใช้ pattern เดียวกัน:

- state เก็บ error ราย field
- ส่ง prop `error` เข้า `Input`
- label และข้อความ error ใช้ `text-red-600`
- input error ใช้ `border-red-500`

`Input` รองรับ prop:

```tsx
<Input error={Boolean(errors.username)} />
```

ถ้าจะเพิ่ม form ใหม่ แนะนำให้ใช้ pattern นี้เพื่อให้ UI สม่ำเสมอ

## API Client

ใช้ `src/lib/axios.ts`

ค่าหลัก:

```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true,
});
```

ทุก API ควร import client ตัวนี้:

```ts
import api from "@/lib/axios";
```

หลีกเลี่ยงการสร้าง axios client ใหม่ในแต่ละหน้า ถ้าไม่จำเป็น

## Styling

ไฟล์หลัก:

- `src/index.css`
- `tailwind.config.ts`

ใช้ Tailwind utility class เป็นหลัก และใช้ `cn` จาก `src/lib/utils.ts` สำหรับรวม class แบบมีเงื่อนไข

ตัวอย่าง:

```tsx
className={cn("text-sm font-medium text-slate-700", error && "text-red-600")}
```

สีหลักของหน้า Auth ตอนนี้ใช้ม่วง:

```text
#8a2be2
```

## UI Components

components พื้นฐานอยู่ใน:

```text
src/components/ui/
```

ก่อนสร้าง component ใหม่ ควรเช็กว่ามี component เดิมอยู่แล้วหรือไม่ เช่น:

- `Button`
- `Input`
- `Label`
- `Checkbox`
- `Dialog`
- `Select`
- `Table`
- `Tabs`
- `Tooltip`

สำหรับ icon ให้ใช้ `lucide-react`

## การเพิ่มหน้าใหม่

แนวทางปัจจุบัน:

1. สร้าง component หน้าใหม่ใน `src/components/pages/...`
2. import เข้า `src/pages/Index.tsx`
3. เพิ่ม `case` ใน `renderPage()`
4. ถ้าหน้านั้นต้องอยู่ใน sidebar ให้เพิ่ม item ใน `src/components/layout/AppSidebar.tsx`
5. ส่ง key เดียวกันผ่าน `setActiveItem`

ตัวอย่าง:

```tsx
case "new-page":
  return <NewPage />;
```

## Permission

ระบบ permission อ้างอิงข้อมูลจาก `localStorage.user.permissions`

ตรวจสอบ logic ใน:

```text
src/components/pages/Auth/HasPermission.tsx
```

ก่อนซ่อน/แสดงปุ่มหรือเมนูตามสิทธิ์ ควรใช้ pattern เดียวกับไฟล์นี้

## Public Assets

ไฟล์ static อยู่ใน:

```text
frontend/public/
```

โลโก้ที่ใช้ในหน้า Auth:

```text
public/Nurse_logo.jpg
```

## ข้อควรระวัง

- Backend ต้องเปิดที่ URL ตาม `VITE_API_BASE_URL`
- ถ้าใช้ Docker ตาม root `docker-compose.yml` frontend จะ expose port `5173`
- `Index.tsx` มีหลายหน้ารวมอยู่ใน switch เดียว การเปลี่ยน key ของ `activeItem` อาจกระทบ sidebar และ flow หลัง login
- ข้อความ comment บางไฟล์อาจเคยมี encoding เพี้ยน ให้แก้ด้วย editor ที่รองรับ UTF-8
- ตอน build อาจมี warning เรื่อง chunk ใหญ่ เพราะ app import หลายหน้ารวมใน bundle เดียว
- ถ้าต้องลด bundle size ในอนาคต ให้พิจารณา lazy loading รายหน้า

## Checklist ก่อนส่งงาน

รันคำสั่งเหล่านี้ก่อน push:

```bash
npm run build
npm run lint
```

ทดสอบด้วย browser อย่างน้อย:

- หน้า Login
- หน้า Register
- หน้า Reset Password
- Login สำเร็จตาม role ที่มีในฐานข้อมูล
- responsive viewport มือถือ

## Troubleshooting

ถ้า `vite` ไม่เจอ:

```bash
npm install
```

ถ้า API ไม่ทำงาน:

1. เช็ก `frontend/.env`
2. เช็กว่า Backend เปิดอยู่ที่ `http://localhost:8080`
3. เช็ก CORS ใน Backend
4. ดู console log ใน browser

ถ้า login สำเร็จแต่เมนูไม่ตรง:

1. เช็ก response จาก Backend ว่ามี `role_id`, `position_id`, `permissions`
2. เช็ก `localStorage.user`
3. เช็ก mapping ใน `src/pages/Index.tsx`
4. เช็ก sidebar ใน `src/components/layout/AppSidebar.tsx`
