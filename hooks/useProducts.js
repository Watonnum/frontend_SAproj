"use client";
import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { productApi, ApiError } from "../lib/api";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(products.length === 0);
    setError(null);
    try {
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ดึงข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // สร้างสินค้าใหม่
  const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await productApi.create(productData);
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการสร้างข้อมูล"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // อัพเดทสินค้า
  const updateProduct = useCallback(async (id, productData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProduct = await productApi.update(id, productData);
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
    } finally {
      setLoading(false);
    }
  }, []);

  // ลบสินค้า
  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await productApi.delete(id);
      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการลบข้อมูล"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // อัพเดทจำนวนสินค้าใน local state (สำหรับ real-time update)
  const updateLocalProductStock = useCallback((productId, newStock) => {
    setProducts((prevProducts) => {
      const updated = prevProducts.map((product) =>
        product._id === productId
          ? { ...product, inStock: Math.max(0, newStock) }
          : product
      );
      return updated;
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
      const data = await productApi.getById(id);
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
