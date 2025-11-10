"use client";

import { useState, useEffect } from "react";
import { CartProvider } from "@/hooks/useCart";
import ProductGrid from "@/components/ProductGrid";
import CartPanel from "../../components/CartPanel";
import Toast from "../../components/Toast";

export default function POSPage() {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // แสดง Toast notification
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      3000
    );
  };

  // ปิดการแจ้งเตือนทั้งหมด
  const clearAllToasts = () => {
    setToast({ show: false, message: "", type: "info" });
  };

  return (
    <CartProvider>
      <div className="h-full flex bg-gray-50 overflow-hidden">
        {/* Toast Notification */}
        {/* {
          toast.show
          // && (
          //   <Toast
          //     message={toast.message}
          //     type={toast.type}
          //     isVisible={toast.show}
          //     onClose={() => setToast({ show: false, message: "", type: "info" })}
          //     onClearAll={clearAllToasts}
          //   />
          // )
        } */}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Product Grid */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ProductGrid onProductEdit={() => {}} showToast={showToast} />
          </div>

          {/* Cart Panel */}
          <div className="w-96 flex-shrink-0 border-l border-gray-200">
            <CartPanel showToast={showToast} />
          </div>
        </div>
      </div>
    </CartProvider>
  );
}
