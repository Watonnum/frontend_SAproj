"use client";

import Card from "../../components/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useProducts } from "../../hooks/useProducts";
import { useCart } from "../../hooks/useCart";
import { useState } from "react";
import Image from "next/image";
import { useCategories } from "@/hooks/useCategories";
import { useRouter } from "next/navigation";

export default function ShopPage() {
  const {
    fetchProducts,
    products,
    loading,
    error,
    updateLocalProductStock,
    updateProduct,
  } = useProducts();
  const { categories: categoriesData } = useCategories();
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [addingProductId, setAddingProductId] = useState(null);

  const data = (products || []).map((item) => ({
    id: item._id,
    name: item.name,
    description: item.description,
    categoryId: item.categoryId?._id || item.categoryId, // รองรับทั้ง object และ string
    categoryName: item.categoryId?.name || "ไม่ระบุ",
    price: item.price || 0,
    stock: item.inStock || 0,
    status: item.isAvailable,
    images: item.images || "/products.avif",
  }));

  // Filter and sort products with safety checks
  const filteredProducts = data
    .filter((p) => p.status === true && (p.stock || 0) > 0)
    .filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.categoryId === selectedCategory;
      const matchesSearch = (p.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()); // ||
      // (p.categoryName || "").toLowerCase().includes(searchTerm.toLowerCase());
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
    if (product.stock <= 0 || addingProductId === product.id) return;
    setAddingProductId(product.id);
    try {
      // addItem จาก useCart จะแสดง toast เอง
      await addItem(product.id, 1, product.name);
      await updateProduct(product.id, { inStock: product.stock - 1 });
      fetchProducts();
      // อัปเดตสต็อกใน UI
      // updateLocalProductStock(product.id, product.stock - 1);
    } catch (e) {
      console.error("Add to cart failed:", e);
      // ไม่ต้องแสดง toast เอง เพราะ useCart จัดการให้แล้ว
    } finally {
      setAddingProductId(null);
    }
  };

  const categories = [
    { _id: "all", name: "ทั้งหมด" },
    ...(categoriesData || []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              ค้นหาและกรองสินค้า
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  ค้นหาสินค้า
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อสินค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <svg
                    className="absolute left-3 top-3.5 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  หมวดหมู่
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div> */}

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  เรียงตาม
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="name">ชื่อสินค้า (ก-ฮ)</option>
                  <option value="price-low">ราคาต่ำ - สูง</option>
                  <option value="price-high">ราคาสูง - ต่ำ</option>
                  <option value="stock">สต็อกมากที่สุด</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-800">
              พบสินค้า {filteredProducts.length} รายการ
            </h3>
            {selectedCategory !== "all" && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {categories.find((c) => c._id === selectedCategory)?.name}
              </span>
            )}
            {searchTerm && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                &ldquo;{searchTerm}&rdquo;
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            อัพเดทล่าสุด: {new Date().toLocaleDateString("th-TH")}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {loading && products.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">กำลังโหลดสินค้า...</p>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              ไม่พบสินค้าที่ค้นหา
            </h3>
            <p className="text-gray-600 mb-6">
              ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="inline-flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              รีเซ็ตการค้นหา
            </Button>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white overflow-hidden"
            >
              <div className="relative">
                {/* Product Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
                  <Image
                    alt={product.name || "Product image"}
                    priority={true}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={product.images || "/products.avif"}
                    onError={(e) => {
                      e.target.src = "/products.avif";
                    }}
                  />

                  {/* Stock Badge */}
                  <div className="absolute top-3 right-3">
                    {product.stock > 10 ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ✅ พร้อมส่ง
                      </span>
                    ) : product.stock > 0 ? (
                      <span className="bg-yellow-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ⚠️ เหลือน้อย
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ❌ หมด
                      </span>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium">
                      {product.categoryName}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        ฿{Number(product.price).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        สต็อก: {product.stock} ชิ้น
                      </div>
                    </div>

                    {/* <div className="border right-0">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 10
                            ? "bg-green-100 text-green-800"
                            : product.stock > 0
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock > 10
                          ? "✅ พร้อมส่ง"
                          : product.stock > 0
                          ? "⚠️ เหลือน้อย"
                          : "❌ หมด"}
                      </div>
                    </div> */}
                  </div>

                  <Button
                    onClick={() => handleAdd(product)}
                    disabled={
                      product.stock === 0 || addingProductId === product.id
                    }
                    className={`w-full font-semibold py-3 transition-all duration-200 ${
                      product.stock === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : addingProductId === product.id
                        ? "bg-blue-400 cursor-wait"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    }`}
                  >
                    {addingProductId === product.id ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        กำลังเพิ่ม...
                      </span>
                    ) : product.stock === 0 ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        สินค้าหมด
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l-2.5 5m0 0L9.5 18M7 13l2.5 5M17 18a2 2 0 100-4 2 2 0 000 4zM9 18a2 2 0 100-4 2 2 0 000 4z"
                          />
                        </svg>
                        เพิ่มลงตะกร้า
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More Button - if needed */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <p className="text-gray-600 mb-4">
                แสดงสินค้าทั้งหมด {filteredProducts.length} รายการแล้ว
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span>🚚 ส่งฟรีเมื่อซื้อครบ 500 บาท</span>
                <span>📞 โทร 02-xxx-xxxx สอบถามเพิ่มเติม</span>
                <span>💬 แชทสด 24 ชั่วโมง</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
