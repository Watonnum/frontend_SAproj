"use client";

import {
  useState,
  useEffect,
  useContext,
  useMemo,
  memo,
  useCallback,
} from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Edit,
  Eye,
  Package,
} from "lucide-react";
import Image from "next/image";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { CartContext } from "@/hooks/useCart";
import LoadingSpinner from "./LoadingSpinner";
import Modal from "./Modal";
import ProductEditModal from "./ProductEditModal";

function ProductGrid({ onProductEdit, showToast }) {
  const { products, loading, error } = useProducts();
  const { categories } = useCategories();
  const { addItem, actionLoading } = useContext(CartContext) || {
    addItem: () => {},
    actionLoading: {},
  };

  // States for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("grid");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Modal states
  const [editModal, setEditModal] = useState({ isOpen: false, product: null });

  // Handle view mode change with smooth transition
  const handleViewModeChange = (newMode) => {
    if (newMode !== viewMode) {
      setViewMode(newMode);
    }
  };

  // Filter and sort products with memoization to prevent unnecessary recalculations
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" ||
        (product.categoryId && product.categoryId.name === selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);
  const sortedProducts = useMemo(() => {
    if (!filteredProducts || filteredProducts.length === 0) return [];

    return [...filteredProducts].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case "stock":
          aValue = a.inStock || 0;
          bValue = b.inStock || 0;
          break;
        case "name":
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredProducts, sortBy, sortOrder]);

  const handleAddToCart = useCallback(
    async (product) => {
      try {
        // เช็ค stock ก่อน
        if (!product.isAvailable || (product.inStock || 0) <= 0) {
          showToast("สินค้าหมดสต็อกหรือไม่พร้อมขาย", "warning");
          return;
        }

        await addItem(product._id, 1, product.name);
        showToast(`เพิ่ม ${product.name} ลงในตระกร้าเรียบร้อย`, "success");
      } catch (error) {
        showToast("เกิดข้อผิดพลาดในการเพิ่มสินค้า", "error");
      }
    },
    [addItem, showToast]
  );

  const handleEditProduct = useCallback((product) => {
    setEditModal({ isOpen: true, product });
  }, []);

  const handleModalClose = useCallback(() => {
    setEditModal({ isOpen: false, product: null });
  }, []);

  const ProductCard = memo(({ product }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
      {/* Product Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Stock Badge */}
        <div
          className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
            product.inStock > 10
              ? "bg-green-100 text-green-700"
              : product.inStock > 0
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {product.inStock || 0} ชิ้น
        </div>

        {/* Edit Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditProduct(product);
          }}
          className="absolute top-3 left-3 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-opacity-100 hover:scale-110"
        >
          <Edit className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-800 text-lg leading-tight mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500">
            {product.categoryId?.name || "ไม่ระบุหมวดหมู่"}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-green-600">
              ${(product.price || 0).toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => handleAddToCart(product)}
            disabled={
              !product.isAvailable ||
              (product.inStock || 0) <= 0 ||
              actionLoading[`add-${product._id}`]
            }
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 min-w-[60px] flex items-center justify-center transform hover:scale-105 ${
              !product.isAvailable || (product.inStock || 0) <= 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : actionLoading[`add-${product._id}`]
                ? "bg-green-400 text-white cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600 hover:shadow-lg"
            }`}
          >
            {actionLoading[`add-${product._id}`] ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : !product.isAvailable ? (
              "ไม่พร้อมขาย"
            ) : (product.inStock || 0) <= 0 ? (
              "หมด"
            ) : (
              "เพิ่ม"
            )}
          </button>
        </div>
      </div>
    </div>
  ));

  ProductCard.displayName = "ProductCard";

  const ProductListItem = memo(({ product }) => (
    <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
      {/* Product Image */}
      <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={64}
            height={64}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <Package className="w-8 h-8 text-gray-400" />
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500">
          {product.categoryId?.name || "ไม่ระบุหมวดหมู่"}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-lg font-bold text-green-600">
            ${(product.price || 0).toFixed(2)}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.inStock > 10
                ? "bg-green-100 text-green-700"
                : product.inStock > 0
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.inStock || 0} ชิ้น
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleEditProduct(product)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleAddToCart(product)}
          disabled={
            !product.isAvailable ||
            (product.inStock || 0) <= 0 ||
            actionLoading[`add-${product._id}`]
          }
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 min-w-[70px] flex items-center justify-center transform hover:scale-105 ${
            !product.isAvailable || (product.inStock || 0) <= 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : actionLoading[`add-${product._id}`]
              ? "bg-green-400 text-white cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600 hover:shadow-lg"
          }`}
        >
          {actionLoading[`add-${product._id}`] ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : !product.isAvailable ? (
            "ไม่พร้อมขาย"
          ) : (product.inStock || 0) <= 0 ? (
            "หมด"
          ) : (
            "เพิ่ม"
          )}
        </button>
      </div>
    </div>
  ));

  ProductListItem.displayName = "ProductListItem";

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded skeleton"></div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gray-200 rounded-lg skeleton"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-lg skeleton"></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64 h-12 bg-gray-200 rounded-xl skeleton"></div>
            <div className="h-12 w-32 bg-gray-200 rounded-xl skeleton"></div>
            <div className="h-12 w-32 bg-gray-200 rounded-xl skeleton"></div>
            <div className="h-12 w-32 bg-gray-200 rounded-xl skeleton"></div>
          </div>
        </div>
        {/* Products Skeleton */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-square bg-gray-200 skeleton"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2 skeleton"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 skeleton"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-200 rounded w-1/3 skeleton"></div>
                    <div className="h-10 bg-gray-200 rounded-xl w-16 skeleton"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">All Menu</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewModeChange("grid")}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === "grid"
                  ? "bg-green-100 text-green-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleViewModeChange("list")}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === "list"
                  ? "bg-green-100 text-green-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 focus:shadow-lg"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-all duration-300 hover:shadow-md focus:shadow-lg"
          >
            <option value="All">ทุกหมวดหมู่</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-all duration-300 hover:shadow-md focus:shadow-lg"
          >
            <option value="name">เรียงตามชื่อ</option>
            <option value="price">เรียงตามราคา</option>
            <option value="stock">เรียงตาม Stock</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-all duration-300 hover:shadow-md focus:shadow-lg"
          >
            <option value="asc">น้อยไปมาก</option>
            <option value="desc">มากไปน้อย</option>
          </select>
        </div>
      </div>

      {/* Products */}
      <div className="flex-1 p-6 overflow-y-auto">
        {sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Package className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">ไม่พบสินค้า</p>
            <p className="text-sm text-center">
              {searchTerm || selectedCategory !== "All"
                ? "ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา"
                : "ยังไม่มีสินค้าในระบบ"}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {sortedProducts.map((product) =>
              viewMode === "grid" ? (
                <ProductCard key={product._id} product={product} />
              ) : (
                <ProductListItem key={product._id} product={product} />
              )
            )}
          </div>
        )}
      </div>

      {/* Product Edit Modal */}
      {editModal.isOpen && (
        <ProductEditModal
          product={editModal.product}
          onClose={handleModalClose}
          onSave={(updatedProduct) => {
            showToast("แก้ไขสินค้าเรียบร้อย", "success");
            handleModalClose();
          }}
        />
      )}
    </div>
  );
}

ProductGrid.displayName = "ProductGrid";

export default memo(ProductGrid);
