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
      // กรองสินค้าตามหมวดหมู่ - รองรับทั้ง categoryId และ category name
      const filtered = products
        .filter((product) => {
          // ตรวจสอบ categoryId ก่อน (เป็น ObjectId)
          if (product.categoryId === categoryId) return true;

          // ตรวจสอบ categoryId เป็น object (populated)
          if (product.categoryId?._id === categoryId) return true;

          // ตรวจสอบ category name
          if (product.category === currentCategory.name) return true;

          // ตรวจสอบ categoryId เป็น string
          if (product.categoryId?.toString() === categoryId) return true;

          return false;
        })
        .filter(
          (product) =>
            // แสดงเฉพาะสินค้าที่มีข้อมูลครบถ้วน
            product.name &&
            product.price !== undefined &&
            product.price !== null &&
            product.isAvailable === true
        );

      setFilteredProducts(filtered);
    }
  }, [products, currentCategory, categoryId]);

  const handleAddToCart = async (product) => {
    try {
      await addItem(product._id, 1);
      setToast({
        show: true,
        message: `เพิ่ม ${product.name} ลงในตะกร้าแล้ว`,
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: "เกิดข้อผิดพลาดในการเพิ่มสินค้า",
        type: "error",
      });
    }
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (productsError || categoriesError) {
    return (
      <div className="text-center text-red-500 p-8">
        เกิดข้อผิดพลาด: {productsError || categoriesError}
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-gray-700">
          ไม่พบหมวดหมู่ที่ต้องการ
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header title={`หมวดหมู่: ${currentCategory.name}`} /> */}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        {/* Category Info */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
            {currentCategory.name}
          </h1>
          {currentCategory.description && (
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              {currentCategory.description}
            </p>
          )}

          {/* Category Stats */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              {filteredProducts.length} รายการ
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              หมวดหมู่: {currentCategory.name}
            </span>
          </div>
        </div>

        {/* Products in this category */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              ไม่มีสินค้าในหมวดหมู่นี้
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product._id}
                className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
                padding="sm"
              >
                {/* Product Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 overflow-hidden relative group">
                  {product.images || "/products.avif" ? (
                    <Image
                      src={product.images}
                      priority={true}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-12 h-12 sm:w-16 sm:h-16"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="absolute top-2 right-2">
                    {product.inStock > 0 ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        มีสินค้า
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        หมด
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info - Flex grow to fill remaining space */}
                <div className="flex flex-col flex-grow">
                  {/* Category Type */}
                  <div className="mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {product.categoryId?.name ||
                        currentCategory?.name ||
                        "หมวดหมู่"}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2 text-gray-800 leading-tight">
                    {product.name}
                  </h3>

                  {/* Product Description */}
                  {product.description && (
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Price and Stock Info */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl font-bold text-blue-600">
                          ฿{product.price?.toLocaleString() || "0"}
                        </span>
                        <span className="text-xs text-gray-500">
                          ราคาต่อหน่วย
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">
                          คงเหลือ
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            product.inStock > 10
                              ? "text-green-600"
                              : product.inStock > 0
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.inStock || 0}
                        </div>
                      </div>
                    </div>

                    {/* Product Status */}
                    <div className="mb-3">
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
                      disabled={!product.isAvailable || product.inStock === 0}
                      className="w-full text-sm sm:text-base py-2 sm:py-3"
                      variant={
                        !product.isAvailable || product.inStock === 0
                          ? "secondary"
                          : "primary"
                      }
                    >
                      {!product.isAvailable
                        ? "ไม่พร้อมจำหน่าย"
                        : product.inStock === 0
                        ? "สินค้าหมด"
                        : "เพิ่มในตะกร้า"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
