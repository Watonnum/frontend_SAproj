"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "../hooks/useAuth";
import { UsersProvider } from "../hooks/useUsers";
import { ProductsProvider } from "../hooks/useProducts";
import { CategoriesProvider } from "../hooks/useCategories";
import { CartProvider } from "../hooks/useCart";
import Login from "../components/Login";
import LoadingSpinner from "../components/LoadingSpinner";

function AppContent({ children }) {
  const { isLoggedIn, loading, logout } = useAuth();
  const pathname = usePathname();

  // เช็คว่าเป็นหน้า POS หรือ Payment ที่ต้องใช้ full screen
  const isFullScreenPage = pathname === "/pos" || pathname === "/payment";

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      {isLoggedIn ? (
        isFullScreenPage ? (
          // Full screen layout สำหรับ POS และ Payment
          <main className="min-h-screen">{children}</main>
        ) : (
          // Layout แบบเดิมพร้อม sidebar
          <div className="flex">
            <Sidebar onLogout={logout} />
            <main className="flex-1 ml-64 min-w-0">
              <div className="p-4">{children}</div>
            </main>
          </div>
        )
      ) : (
        <Login />
      )}
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
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
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
