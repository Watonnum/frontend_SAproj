"use client";

import Header from "../../components/Header";
import Card from "../../components/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import Toast from "../../components/Toast";
import { useProducts } from "../../hooks/useProducts";
import { useCart } from "../../hooks/useCart";
import { useState } from "react";

export default function ShopPage() {
  const { products, loading, error } = useProducts();
  const { addItem } = useCart();
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      2500
    );
  };

  const visibleProducts = products.filter(
    (p) =>
      p.status === "active" &&
      (typeof p.stock === "number" ? p.stock > 0 : true)
  );

  const handleAdd = async (id) => {
    try {
      await addItem(id, 1);
      showToast("เพิ่มลงตะกร้าแล้ว", "success");
    } catch (e) {
      showToast(e?.message || "เพิ่มลงตะกร้าล้มเหลว", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: "", type: "info" })}
          />
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">เลือกสินค้า</h1>
          <p className="text-gray-600 mt-1">กด “เพิ่มลงตะกร้า” เพื่อสั่งซื้อ</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
        {loading && (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        )}

        {!loading && visibleProducts.length === 0 && (
          <p className="text-gray-600">ยังไม่มีสินค้าที่พร้อมขาย</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProducts.map((p) => (
            <Card key={p._id}>
              <div className="p-4 flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{p.category}</p>
                  <p className="text-gray-900 font-bold mt-2">
                    ฿{Number(p.price || 0).toLocaleString()}
                  </p>
                  {typeof p.stock === "number" && (
                    <p className="text-xs text-gray-500 mt-1">
                      สต็อก: {p.stock}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      handleAdd(p._id);
                    }}
                    className="w-full cursor-pointer"
                  >
                    เพิ่มลงตะกร้า
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
