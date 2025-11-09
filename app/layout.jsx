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
import { useState } from "react";

function AppContent({ children }) {
  const { isLoggedIn, loading, logout } = useAuth();
  const { isInitializing } = useCart();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // เช็คว่าเป็นหน้า POS หรือ Payment ที่ต้องใช้ full screen
  const isFullScreenPage = pathname === "/pos" || pathname === "/payment";

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
                onLogout={logout}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`transition-all duration-300 ${
                  sidebarCollapsed ? "w-16" : "w-64"
                } flex-shrink-0`}
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
