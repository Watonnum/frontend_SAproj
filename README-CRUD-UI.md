# CRUD System UI/UX

ระบบ CRUD ที่สวยงามและใช้งานง่าย สร้างด้วย Next.js และ Tailwind CSS

## ฟีเจอร์หลัก

### 🏠 หน้า Dashboard
- แสดงสถิติข้อมูลทั้งหมด
- กิจกรรมล่าสุด
- ปุ่มการดำเนินการด่วน
- การ์ดแสดงข้อมูลสำคัญ

### 📊 หน้าจัดการข้อมูล (/data)
- ตารางแสดงข้อมูลแบบ responsive
- ระบบค้นหาและกรองข้อมูล
- การเรียงลำดับ (Sorting)
- Pagination
- การจัดการข้อมูล (แก้ไข/ลบ)

### ➕ หน้าเพิ่มข้อมูล (/create)
- ฟอร์มที่มี validation
- การจัดกลุ่มข้อมูลอย่างเป็นระเบียบ
- Tips และคำแนะนำ
- Loading states

### ✏️ หน้าแก้ไขข้อมูล (/edit/[id])
- โหลดข้อมูลเดิมมาแสดง
- ฟอร์มแก้ไขที่เหมือนกับฟอร์มเพิ่ม
- ปุ่มรีเซ็ตข้อมูล
- คำเตือนการแก้ไข

## Components ที่สร้าง

### UI Components
- `Header` - Navigation bar พร้อม mobile menu
- `Card` - Container สำหรับเนื้อหา
- `Button` - ปุ่มหลายแบบ (primary, secondary, danger, etc.)
- `Input` - Input field พร้อม validation
- `Select` - Dropdown selection
- `Modal` - Modal dialog
- `ConfirmDialog` - Dialog ยืนยันการทำงาน
- `LoadingSpinner` - Spinner สำหรับโหลดข้อมูล
- `Toast` - แสดงข้อความแจ้งเตือน

### Features
- ✅ Responsive design
- ✅ Dark mode support (ระบบ CSS)
- ✅ Form validation
- ✅ Loading states
- ✅ Confirmation dialogs
- ✅ Search & Filter
- ✅ Pagination
- ✅ Sorting
- ✅ Thai language support

## การใช้งาน

### ติดตั้ง dependencies
\`\`\`bash
npm install
\`\`\`

### เรียกใช้เซิร์ฟเวอร์พัฒนา
\`\`\`bash
npm run dev
\`\`\`

### เข้าชมเว็บไซต์
เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

## โครงสร้างไฟล์

\`\`\`
app/
  ├── page.js                 # หน้า Dashboard
  ├── layout.js              # Layout หลัก
  ├── globals.css            # CSS หลัก
  ├── data/
  │   └── page.js            # หน้าจัดการข้อมูล
  ├── create/
  │   └── page.js            # หน้าเพิ่มข้อมูล
  └── edit/
      └── [id]/
          └── page.js        # หน้าแก้ไขข้อมูล

components/
  ├── Header.js              # Navigation
  ├── Card.js                # Card component
  ├── Button.js              # Button component
  ├── Input.js               # Input component
  ├── Select.js              # Select component
  ├── Modal.js               # Modal component
  ├── ConfirmDialog.js       # Confirm dialog
  ├── LoadingSpinner.js      # Loading spinner
  └── Toast.js               # Toast notification
\`\`\`

## การเชื่อมต่อ Backend

ในไฟล์นี้ใช้ Mock data สำหรับการทดสอบ เมื่อต้องการเชื่อมต่อ Backend จริง ให้แก้ไขในส่วนต่อไปนี้:

### 1. API Configuration
สร้างไฟล์ `lib/api.js` สำหรับจัดการ API calls

### 2. Data Fetching
แทนที่ Mock data ด้วย API calls ใน:
- `app/page.js` - Dashboard data
- `app/data/page.js` - List data
- `app/edit/[id]/page.js` - Single item data

### 3. Form Submissions
แก้ไข form handlers ใน:
- `app/create/page.js` - Create data
- `app/edit/[id]/page.js` - Update data
- `app/data/page.js` - Delete data

## การปรับแต่ง

### สี (Colors)
แก้ไขในไฟล์ `tailwind.config.js` หรือ `app/globals.css`

### ภาษา
ปรับเปลี่ยนข้อความในแต่ละ component

### ฟิลด์ข้อมูล
แก้ไขใน form components เพื่อเพิ่ม/ลด ฟิลด์ตามต้องการ

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

สร้างโดย: GitHub Copilot
วันที่: 14 กันยายน 2568
