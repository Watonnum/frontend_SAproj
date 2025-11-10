"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "../hooks/useAuth";
import { UsersProvider } from "../hooks/useUsers";
import { ProductsProvider } from "../hooks/useProducts";
import { CategoriesProvider } from "../hooks/useCategories";
import { CartProvider, useCart } from "../hooks/useCart";
import Login from "../components/Login";
import LoadingSpinner from "../components/LoadingSpinner";
import InitialLoading from "../components/InitialLoading";
import ClientOnly from "../components/ClientOnly";
import { useState, useEffect } from "react";

function AppContent({ children }) {
  const { isLoggedIn, loading, logout } = useAuth();
  const { isInitializing } = useCart();
  const pathname = usePathname();

  // จัดการ state ของ sidebar และบันทึกลง localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // โหลดค่าเริ่มต้นจาก localStorage ตั้งแต่แรก
    if (typeof window !== "undefined") {
      const savedCollapsed = localStorage.getItem("sidebarCollapsed");
      return savedCollapsed !== null ? JSON.parse(savedCollapsed) : false;
    }
    return false;
  });

  // โหลด state ของ sidebar จาก localStorage เมื่อ component mount หรือเปลี่ยนหน้า
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsed !== null) {
      const parsedCollapsed = JSON.parse(savedCollapsed);
      setSidebarCollapsed(parsedCollapsed);
    }
  }, [pathname]); // เพิ่ม pathname เป็น dependency เพื่อ reload state เมื่อเปลี่ยนหน้า

  // บันทึก state ของ sidebar ลง localStorage เมื่อมีการเปลี่ยนแปลง
  const handleSidebarToggle = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newCollapsed));
  };

  // เช็คว่าเป็นหน้า Payment ที่ต้องใช้ full screen (เอา POS ออก)
  const isFullScreenPage = pathname === "/payment";

  // แสดง loading ระหว่าง auth loading
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen select-none">
      {isLoggedIn ? (
        <InitialLoading isLoading={isInitializing} minLoadingTime={1500}>
          {isFullScreenPage ? (
            // Full screen layout สำหรับ POS และ Payment
            <main className="h-screen">{children}</main>
          ) : (
            // Layout แบบเดิมพร้อม sidebar
            <div className="h-screen flex bg-gray-50">
              <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={handleSidebarToggle}
                onLogout={logout}
              />
              <main className="flex-1 min-w-0 overflow-hidden">
                <div className="h-full overflow-y-auto">{children}</div>
              </main>
            </div>
          )}
        </InitialLoading>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientOnly>
          <UsersProvider>
            <AuthProvider>
              <ProductsProvider>
                <CategoriesProvider>
                  <CartProvider>
                    <AppContent>{children}</AppContent>
                  </CartProvider>
                </CategoriesProvider>
              </ProductsProvider>
            </AuthProvider>
          </UsersProvider>
        </ClientOnly>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
