"use client";
import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { categoryApi, ApiError } from "../lib/api";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryApi.getAll();
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

  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await categoryApi.create(categoryData);
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
      const updatedCategory = await categoryApi.update(id, categoryData);
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
      await categoryApi.delete(id);
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
      const data = await categoryApi.getById(id);
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
