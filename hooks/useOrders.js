import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export function useOrders() {
  const { user, getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 50,
  });

  const userId = user?.id || user?._id;

  // สร้าง Order ใหม่จาก Cart
  const createOrder = useCallback(
    async (orderData) => {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        // สร้าง clean object โดยเอาเฉพาะข้อมูลที่จำเป็น
        const requestBody = {
          userId: userId,
          paymentMethod: orderData?.paymentMethod || "cash",
          notes: orderData?.notes || "",
        };

        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Backend error:", data);
          console.error("Response status:", response.status);
          throw new Error(data.message || "Failed to create order");
        }

        toast.success("สร้างออเดอร์สำเร็จ!");
        return data.order;
      } catch (err) {
        console.error("Error creating order:", err);
        setError(err.message);
        toast.error(err.message || "เกิดข้อผิดพลาดในการสร้างออเดอร์");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, getToken]
  );

  // ดึง Orders ทั้งหมด (สำหรับ admin/manager)
  const fetchAllOrders = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        const params = new URLSearchParams();
        if (filters.status && filters.status !== "all") {
          params.append("status", filters.status);
        }
        if (filters.startDate) {
          params.append("startDate", filters.startDate);
        }
        if (filters.endDate) {
          params.append("endDate", filters.endDate);
        }
        if (filters.page) {
          params.append("page", filters.page);
        }
        if (filters.limit) {
          params.append("limit", filters.limit);
        }

        const response = await fetch(
          `${API_BASE_URL}/orders?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch orders");
        }

        setOrders(data.orders);
        if (data.pagination) {
          setPagination(data.pagination);
        }

        return data.orders;
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
        toast.error(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  // ดึง Orders ของ User
  const fetchUserOrders = useCallback(
    async (targetUserId, filters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        const params = new URLSearchParams();
        if (filters.status && filters.status !== "all") {
          params.append("status", filters.status);
        }
        if (filters.page) {
          params.append("page", filters.page);
        }
        if (filters.limit) {
          params.append("limit", filters.limit);
        }

        const userIdToFetch = targetUserId || userId;
        const response = await fetch(
          `${API_BASE_URL}/orders/user/${userIdToFetch}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user orders");
        }

        setOrders(data.orders);
        if (data.pagination) {
          setPagination(data.pagination);
        }

        return data.orders;
      } catch (err) {
        console.error("Error fetching user orders:", err);
        setError(err.message);
        toast.error(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [userId, getToken]
  );

  // ดึง Order เดียว
  const fetchOrderById = useCallback(
    async (orderId) => {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch order");
        }

        return data.order;
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message);
        toast.error(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  // อัพเดทสถานะ Order
  const updateOrderStatus = useCallback(
    async (orderId, status) => {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `${API_BASE_URL}/orders/${orderId}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update order status");
        }

        // อัพเดท orders ใน state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? data.order : order
          )
        );

        toast.success("อัพเดทสถานะออเดอร์สำเร็จ");
        return data.order;
      } catch (err) {
        console.error("Error updating order status:", err);
        setError(err.message);
        toast.error(err.message || "เกิดข้อผิดพลาดในการอัพเดทสถานะ");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  // ยกเลิก Order
  const cancelOrder = useCallback(
    async (orderId, cancelReason = "") => {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `${API_BASE_URL}/orders/${orderId}/cancel`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              cancelReason,
              cancelledBy: userId,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to cancel order");
        }

        // อัพเดท orders ใน state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? data.order : order
          )
        );

        toast.success("ยกเลิกออเดอร์สำเร็จ");
        return data.order;
      } catch (err) {
        console.error("Error cancelling order:", err);
        setError(err.message);
        toast.error(err.message || "เกิดข้อผิดพลาดในการยกเลิกออเดอร์");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, getToken]
  );

  // ดึงสถิติ Orders
  const fetchOrderStats = useCallback(
    async (filters = {}) => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        const params = new URLSearchParams();
        if (filters.startDate) {
          params.append("startDate", filters.startDate);
        }
        if (filters.endDate) {
          params.append("endDate", filters.endDate);
        }

        const response = await fetch(
          `${API_BASE_URL}/orders/stats?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch order stats");
        }

        return data;
      } catch (err) {
        console.error("Error fetching order stats:", err);
        toast.error(err.message || "เกิดข้อผิดพลาดในการดึงสถิติ");
        return null;
      }
    },
    [getToken]
  );

  return {
    orders,
    loading,
    error,
    pagination,
    createOrder,
    fetchAllOrders,
    fetchUserOrders,
    fetchOrderById,
    updateOrderStatus,
    cancelOrder,
    fetchOrderStats,
  };
}
