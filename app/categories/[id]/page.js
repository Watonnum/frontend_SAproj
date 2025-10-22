"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Toast from "../../../components/Toast";
import { useProducts } from "../../../hooks/useProducts";
import { useCart } from "../../../hooks/useCart";
import { useCategories } from "../../../hooks/useCategories";
import Image from "next/image";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id;

  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const { addItem } = useCart();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    if (categories.length > 0) {
      const category = categories?.find((cat) => cat._id === categoryId);
      setCurrentCategory(category);
    }
  }, [categories, categoryId]);

  useEffect(() => {
    if (products.length > 0 && currentCategory) {
      // กรองสินค้าตามหมวดหมู่
      const filtered = products
        .filter((product) => {
          // ตรวจสอบ categoryId ในรูปแบบต่างๆ
          const productCategoryId =
            product.categoryId?._id || product.categoryId;
          return productCategoryId === categoryId;
        })
        .filter(
          (product) =>
            product.name &&
            product.price !== undefined &&
            product.price !== null &&
            product.isAvailable === true
        )
        .filter((product) => {
          // ค้นหาตามชื่อสินค้า
          return (
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "price-low":
              return (a.price || 0) - (b.price || 0);
            case "price-high":
              return (b.price || 0) - (a.price || 0);
            case "stock":
              return (b.inStock || 0) - (a.inStock || 0);
            default:
              return a.name.localeCompare(b.name);
          }
        });

      setFilteredProducts(filtered);
    }
  }, [products, currentCategory, categoryId, searchTerm, sortBy]);

  const handleAddToCart = async (product) => {
    try {
      await addItem(product._id, 1);
      setToast({
        show: true,
        message: `เพิ่ม ${product.name} ลงในตะกร้าแล้ว`,
        type: "success",
      });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    } catch (error) {
      setToast({
        show: true,
        message: "เกิดข้อผิดพลาดในการเพิ่มสินค้า",
        type: "error",
      });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    }
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (productsError || categoriesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-gray-600">{productsError || categoriesError}</p>
          <Link href="/categories" className="mt-4 inline-block">
            <Button>กลับไปหน้าสินค้า</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">
            ไม่พบหมวดหมู่ที่ต้องการ
          </h1>
          <p className="text-gray-600 mb-4">
            หมวดหมู่ที่คุณค้นหาอาจไม่มีอยู่ในระบบ
          </p>
          <Link href="/categories">
            <Button>กลับไปหน้าสินค้า</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Breadcrumb */}
            <div className="mb-4">
              <Link
                href="/categories"
                className="text-blue-200 hover:text-white transition-colors duration-200"
              >
                ร้านค้าออนไลน์
              </Link>
              <span className="mx-2 text-blue-300">›</span>
              <span className="text-white font-medium">
                {currentCategory.name}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {currentCategory.name}
            </h1>

            {currentCategory.description && (
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                {currentCategory.description}
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                📦 {filteredProducts.length} สินค้า
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                ⚡ ส่งเร็วภายใน 24 ชั่วโมง
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                🛡️ รับประกันความพอใจ 100%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}

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
              ค้นหาและกรองสินค้าใน {currentCategory.name}
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
                    placeholder={`ค้นหาในหมวด ${currentCategory.name}...`}
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
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {currentCategory.name}
            </span>
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

        {/* No Products Found */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "ไม่พบสินค้าที่ค้นหา" : "ไม่มีสินค้าในหมวดหมู่นี้"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "ลองเปลี่ยนคำค้นหาหรือดูสินค้าทั้งหมด"
                : "ขณะนี้ยังไม่มีสินค้าในหมวดหมู่นี้"}
            </p>
            <div className="space-x-4">
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center"
                  variant="secondary"
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
              )}
              <Link href="/categories">
                <Button className="inline-flex items-center">
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
                  ดูสินค้าทั้งหมด
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product._id}
                className="group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-white overflow-hidden"
              >
                <div className="relative">
                  {/* Product Image */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
                    <Image
                      src={product.images || "/products.avif"}
                      priority={true}
                      alt={product.name || "Product image"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "/products.avif";
                      }}
                    />

                    {/* Stock Badge */}
                    <div className="absolute top-3 right-3">
                      {(product.inStock || 0) > 10 ? (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          พร้อมส่ง
                        </span>
                      ) : (product.inStock || 0) > 0 ? (
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          เหลือน้อย
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          หมด
                        </span>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium">
                        {product.categoryId?.name ||
                          currentCategory?.name ||
                          "หมวดหมู่"}
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
                          ฿{(product.price || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          สต็อก: {product.inStock || 0} ชิ้น
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (product.inStock || 0) > 10
                              ? "bg-green-100 text-green-800"
                              : (product.inStock || 0) > 0
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {(product.inStock || 0) > 10
                            ? "✅ พร้อมส่ง"
                            : (product.inStock || 0) > 0
                            ? "⚠️ เหลือน้อย"
                            : "❌ หมด"}
                        </div>
                      </div>
                    </div>

                    {/* Product Status */}
                    <div className="mb-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          product.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isAvailable
                          ? "พร้อมจำหน่าย"
                          : "ไม่พร้อมจำหน่าย"}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={
                        !product.isAvailable || (product.inStock || 0) === 0
                      }
                      className={`w-full font-semibold py-3 transition-all duration-200 ${
                        !product.isAvailable || (product.inStock || 0) === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      }`}
                    >
                      {!product.isAvailable ? (
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
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                            />
                          </svg>
                          ไม่พร้อมจำหน่าย
                        </span>
                      ) : (product.inStock || 0) === 0 ? (
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
        )}

        {/* Footer Section */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <p className="text-gray-600 mb-4">
                แสดงสินค้าในหมวด {currentCategory.name} ทั้งหมด{" "}
                {filteredProducts.length} รายการแล้ว
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span>🚚 ส่งฟรีเมื่อซื้อครบ 500 บาท</span>
                <span>📞 โทร 02-xxx-xxxx สอบถามเพิ่มเติม</span>
                <span>💬 แชทสด 24 ชั่วโมง</span>
              </div>
              <div className="mt-4">
                <Link href="/categories">
                  <Button variant="secondary" className="mr-4">
                    ดูหมวดหมู่อื่นๆ
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button>ไปยังตะกร้า</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
