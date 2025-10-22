"use client";

import "./globals.css";
import Sidebar from "../components/Sidebar";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "../hooks/useAuth";
import { UsersProvider } from "../hooks/useUsers";
import { ProductsProvider } from "../hooks/useProducts";
import { CategoriesProvider } from "../hooks/useCategories";
import { CartProvider } from "../hooks/useCart";
import Login from "../components/Login"; // Assuming you extract login UI to a component
import LoadingSpinner from "../components/LoadingSpinner";

function AppContent({ children }) {
  const { isLoggedIn, loading, logout } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex">
      {isLoggedIn ? (
        <>
          <Sidebar onLogout={logout} />
          <main className="flex-1 ml-64 min-w-0">
            <div className="p-4">{children}</div>
          </main>
        </>
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
