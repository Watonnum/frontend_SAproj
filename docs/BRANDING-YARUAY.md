# YaRuay Daily Store — คู่มือ UX/UI

สรุป
- ชื่อย่อร้าน: YaRuay Daily Store
- สโลแกน: “ของครบ จบทุกวัน”
- โลโก้/การจัดวาง:
	- บรรทัดบน: “ยายรวย” ขนาดใหญ่ เด่นด้วยสีแบรนด์
	- บรรทัดล่าง: “Daily Store · เอกชัย · บางบอน” ขนาดเล็กกว่า พร้อมไอคอนพินตำแหน่ง
- ไอคอน: ใช้ชุดไอคอน open‑source lucide-react (ShoppingCart, MapPin, Coins)

โทนสี (CSS Hex)
- ธีมเริ่มต้น: น้ำเงินกรมท่า–ครีม
	- Primary (Navy): `#0B3A5B`
	- Accent (Soft Gold): `#C8A96A`
	- Background (Cream): `#F6F0E8`
	- Surface: `#FFFFFF`
	- Text: `#0F172A`
	- Muted: `#475569`
	- Border: `#E5E7EB`
- ธีมสำรอง: เขียวมะกอก–ทอง
	- Primary (Olive): `#556B2F`
	- Accent (Gold): `#D4AF37`
	- ที่เหลือเท่าเดิม

การใช้งานสีผ่าน CSS Variables
- ไว้ใน `app/globals.css`
- ตัวอย่างการใช้งานใน Tailwind:
	- ปุ่มหลัก: `bg-[var(--color-primary)] text-[var(--color-on-primary)]`
	- เนื้อหา/การ์ด: ใช้ `.brand-surface` + `.brand-border`
	- ข้อความรอง: `.brand-text-muted`

องค์ประกอบหลัก (เทียบ e-commerce ทั่วไป)
- Header: โลโก้ซ้าย มือถือมีเมนู hamburger, ปุ่ม CTA “+ เพิ่มข้อมูล”, ไอคอนตะกร้าแยกต่างหาก
- Navbar: ลิงก์ชัดเจน โทน muted บนพื้น surface, hover เปลี่ยนเป็นสีแบรนด์
- Button: ขนาด sm/md/lg, แบบ primary/outline/danger/subtle มี focus ring ชัด และ state loading
- Card: มุมมน 2xl เงาอ่อน ขอบบาง ดูเรียบหรูแบบ storefront ปัจจุบัน
- Layout: คอนเทนต์กว้างสุด 7xl ระยะหายใจเหมาะสม เหมือน storefront ทั่วไป

การเข้าถึง (Accessibility)
- คอนทราสต์สีผ่านเกณฑ์ WCAG ในปุ่ม/ข้อความหลัก
- ขนาดคลิกขั้นต่ำ ~40px, โฟกัสมี ring ชัดเจน
- รองรับคีย์บอร์ดและหน้าจอเล็ก

การสลับธีม (ถ้าต้องการ)
- ใส่แอตทริบิวต์ `data-theme="olive"` บน `<html>` หรือ `<body>` เพื่อใช้ธีม Olive–Gold

การติดตั้งไอคอน
- โปรเจกต์นี้ใช้ `lucide-react` แล้ว (ดู package.json)
- ตัวอย่างใช้งาน: `import { ShoppingCart, MapPin, Coins } from "lucide-react"`

หมายเหตุ
- การปรับครั้งนี้เปลี่ยนสไตล์เท่านั้น ไม่กระทบฟังก์ชันเดิม (CRUD, hooks, การเรียก API)
