"use client";
import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { usersApi, ApiError } from "../lib/api";

const UsersContext = createContext(null);

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
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

  const createUser = useCallback(async (userData) => {
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

  const deleteUser = useCallback(async (id) => {
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

  const value = {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUsers,
    deleteUser,
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
