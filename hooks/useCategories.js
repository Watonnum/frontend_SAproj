"use client";
import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { categoriesApi, ApiError } from "../lib/api";
import { checkLoginStatus, hasPermission } from "../lib/auth";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchCategories = useCallback(async () => {
    // ตรวจสอบ login status และ permission ก่อน
    const loggedIn = await checkLoginStatus();
    if (!loggedIn || !hasPermission("categories", "read")) {
      setCategories([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ตรวจสอบและ listen การเปลี่ยนแปลง login status
  useEffect(() => {
    const checkAuthStatus = async () => {
      const loginStatus = await checkLoginStatus();
      setIsLoggedIn(loginStatus);

      if (loginStatus && hasPermission("categories", "read")) {
        fetchCategories();
      } else {
        // เมื่อ logout หรือไม่มีสิทธิ์ ให้เคลียร์ข้อมูล
        setCategories([]);
        setError(null);
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
  }, [fetchCategories]);

  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await categoriesApi.create(categoryData);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการสร้างข้อมูล"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCategory = await categoriesApi.update(id, categoryData);
      setCategories((prev) =>
        prev.map((category) =>
          category._id === id ? updatedCategory : category
        )
      );
      return updatedCategory;
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

  const deleteCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriesApi.delete(id);
      setCategories((prev) => prev.filter((category) => category._id !== id));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการลบข้อมูล"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
}

// Custom hook สำหรับดึงข้อมูลหมวดหมู่เดี่ยว
export function useCategory(id) {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategory = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.getById(id);
      setCategory(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return {
    category,
    loading,
    error,
    refetch: fetchCategory,
  };
}
