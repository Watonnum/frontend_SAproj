"use client";
import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { productsApi, ApiError } from "../lib/api";
import { checkLoginStatus, hasPermission } from "../lib/auth";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchProducts = useCallback(async () => {
    // ตรวจสอบ login status และ permission ก่อน
    const loggedIn = await checkLoginStatus();
    if (!loggedIn || !hasPermission("products", "read")) {
      setProducts([]);
      setError(null);
      return;
    }

    // แสดง loading เฉพาะเมื่อไม่เคยโหลดมาก่อน
    if (!isInitialized) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await productsApi.getAll();
      setProducts(data);
      if (!isInitialized) {
        setIsInitialized(true);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
      );
    } finally {
      if (!isInitialized) {
        setLoading(false);
      }
    }
  }, [isInitialized]);

  // ดึงข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ตรวจสอบและ listen การเปลี่ยนแปลง login status
  useEffect(() => {
    const checkAuthStatus = async () => {
      const loginStatus = await checkLoginStatus();
      setIsLoggedIn(loginStatus);

      if (loginStatus && hasPermission("products", "read")) {
        fetchProducts();
      } else {
        // เมื่อ logout หรือไม่มีสิทธิ์ ให้เคลียร์ข้อมูล
        setProducts([]);
        setError(null);
        setIsInitialized(false);
      }
    };

    // เช็คสถานะเริ่มต้น
    checkAuthStatus();

    // Listen storage changes (เมื่อ login/logout)
    const handleStorageChange = (e) => {
      if (e.key === "isLoggedIn" || e.key === "authToken") {
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event สำหรับ same-tab changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, [fetchProducts]);

  // สร้างสินค้าใหม่
  const createProduct = useCallback(async (productData) => {
    setError(null);
    try {
      const newProduct = await productsApi.create(productData);
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการสร้างข้อมูล"
      );
      throw err;
    }
  }, []);

  // อัพเดทสินค้า
  const updateProduct = useCallback(async (id, productData) => {
    setError(null);
    try {
      const updatedProduct = await productsApi.update(id, productData);
      setProducts((prev) =>
        prev.map((product) => (product._id === id ? updatedProduct : product))
      );
      return updatedProduct;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "เกิดข้อผิดพลาดในการอัพเดทข้อมูล"
      );
      throw err;
    }
  }, []);

  // ลบสินค้า
  const deleteProduct = useCallback(async (id) => {
    setError(null);
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการลบข้อมูล"
      );
      throw err;
    }
  }, []);

  // อัพเดทจำนวนสินค้าใน local state (สำหรับ real-time update)
  const updateLocalProductStock = useCallback((productId, newStock) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product._id === productId) {
          // รักษาข้อมูล categoryId และข้อมูลอื่นๆ ไว้
          return {
            ...product,
            inStock: Math.max(0, newStock),
            // ให้แน่ใจว่า categoryId ยังอยู่
            categoryId: product.categoryId,
          };
        }
        return product;
      });
    });
  }, []);

  const value = {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateLocalProductStock,
    setProducts, // Expose setProducts for optimistic updates if needed
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}

// Custom hook สำหรับดึงข้อมูลสินค้าเดี่ยว
export function useProduct(id) {
  const [products, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getById(id);
      setProduct(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    products,
    setProduct,
    loading,
    error,
    refetch: fetchProduct,
  };
}
