"use client";

import Header from "../../components/Header";
import Card from "../../components/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import Toast from "../../components/Toast";
import { useProducts } from "../../hooks/useProducts";
import { useCart } from "../../hooks/useCart";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useCategories } from "@/hooks/useCategories";

export default function ShopPage() {
  const { products, loading, error } = useProducts();
  const { categories: categoriesData } = useCategories();
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      3000
    );
  };

  const data = (products || []).map((item) => ({
    id: item._id,
    name: item.name,
    description: item.description,
    categoryId: item.categoryId,
    categoryName:
      categoriesData?.find((cat) => cat._id === item.categoryId)?.name ||
      "ไม่ระบุ",
    price: item.price || 0,
    stock: item.inStock || 0,
    status: item.isAvailable,
    images: item.images || "/products.avif",
  }));

  // Filter and sort products
  const filteredProducts = data
    .filter((p) => p.status === true && p.stock > 0)
    .filter((p) => {
      const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "stock":
          return b.stock - a.stock;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleAdd = async (product) => {
    try {
      await addItem(product.id, 1);
      showToast(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`, "success");
    } catch (e) {
      showToast(e?.message || "เพิ่มลงตะกร้าล้มเหลว", "error");
    }
  };

  const categories = [
    { _id: "all", name: "ทั้งหมด" },
    ...(categoriesData || [])
  ];
  return (
    <div className="min-h-screen bg-gray-50">
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

        {!loading && filteredProducts.length === 0 && (
          <p className="text-gray-600">ยังไม่มีสินค้าที่พร้อมขาย</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={p.id}>
              <div className="p-4 flex flex-col h-full">
                <div className="flex-1">
                  <Image
                    alt="Product image"
                    priority={true} // from annotation nextjs runtime
                    width={150}
                    height={150}
                    className="bg-amber-50 mx-auto mb-8"
                    src={"/products.avif"}
                  />
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {p.categoryId.name}
                  </p>
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
                      handleAdd(p.id);
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
