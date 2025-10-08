"use client";
import { useState, useEffect, useCallback } from "react";
import { usersApi, ApiError } from "../lib/api";

// Custom hook สำหรับจัดการ categories
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ดึงข้อมูลหมวดหมู่ทั้งหมด
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAll();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // สร้างหมวดหมู่ใหม่
  const createUsers = useCallback(async (usersData) => {
    setLoading(true);
    setError(null);
    try {
      const newUsers = await usersApi.create(usersData);
      setUsers((prev) => [...prev, newUsers]);
      return newUsers;
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการสร้างข้อมูล"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // อัพเดทหมวดหมู่
  const updateUsers = useCallback(async (id, usersData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUsers = await usersApi.update(id, usersData);
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? updatedUsers : user))
      );
      return updatedUsers;
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

  // ลบหมวดหมู่
  const deleteUsers = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await usersApi.delete(id);
      setCategories((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการลบข้อมูล"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ดึงข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUsers,
    updateUsers,
    deleteUsers,
  };
}

// Custom hook สำหรับดึงข้อมูลหมวดหมู่เดี่ยว
export function useCategory(id) {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getById(id);
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const createUsers = useCallback(async (usersData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await usersApi.create(usersData);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการสร้างข้อมูล"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // อัพเดทหมวดหมู่
  const updateUsers = useCallback(async (id, usersData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUsers = await categoryApi.update(id, usersData);
      setUsers((prev) =>
        prev.map((category) => (category._id === id ? updatedUsers : category))
      );
      return updatedUsers;
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

  const deleteUsers = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await usersApi.delete(id);
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการลบข้อมูล"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    updateUsers,
    createUsers,
    deleteUsers,
    loading,
    error,
    refetch: fetchUsers,
  };
}
