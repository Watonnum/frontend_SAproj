"use client";
import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { usersApi, ApiError } from "../lib/api";
import { checkLoginStatus, hasPermission } from "../lib/auth";

const UsersContext = createContext(null);

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchUsers = useCallback(async () => {
    // ตรวจสอบ login status และ permission ก่อน
    if (!checkLoginStatus()) {
      setUsers([]);
      setError(null);
      setLoading(false);
      return;
    }

    // เช็ค permission สำหรับ users API (ต้องการ admin)
    if (!hasPermission("users", "read")) {
      setUsers([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ตรวจสอบและ listen การเปลี่ยนแปลง login status
  useEffect(() => {
    const checkAuthStatus = () => {
      const loginStatus = checkLoginStatus();
      setIsLoggedIn(loginStatus);

      if (loginStatus && hasPermission("users", "read")) {
        fetchUsers();
      } else {
        // เมื่อ logout หรือไม่มีสิทธิ์ ให้เคลียร์ข้อมูล
        setUsers([]);
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
  }, [fetchUsers]);

  const createUsers = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await usersApi.create(userData);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create user");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUsers = useCallback(async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await usersApi.update(id, userData);
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? updatedUser : user))
      );
      return updatedUser;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update user");
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
      setError(err instanceof ApiError ? err.message : "Failed to delete user");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkDeleteUsers = useCallback(async (ids) => {
    setLoading(true);
    setError(null);
    try {
      await usersApi.bulkDelete(ids);
      setUsers((prev) => prev.filter((user) => !ids.includes(user._id)));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to bulk delete users"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    users,
    loading,
    error,
    fetchUsers,
    createUsers,
    updateUsers,
    deleteUsers,
    bulkDeleteUsers,
    setUsers,
  };

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}
