"use client";

import { useState, useEffect } from "react";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Select from "@/components/Select";
import Modal from "@/components/Modal";
import LoadingSpinner from "@/components/LoadingSpinner";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending", label: "รอดำเนินการ" },
  { value: "processing", label: "กำลังดำเนินการ" },
  { value: "completed", label: "เสร็จสิ้น" },
  { value: "cancelled", label: "ยกเลิก" },
];

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_TEXT = {
  pending: "รอดำเนินการ",
  processing: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { hasPermission, loading: permissionLoading } = usePermissions();
  const {
    orders,
    loading,
    pagination,
    fetchAllOrders,
    fetchUserOrders,
    fetchOrderById,
    updateOrderStatus,
    cancelOrder,
  } = useOrders();

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const canViewAll = hasPermission("orders", "read");
  const canUpdate = hasPermission("orders", "update");
  const canCancel = hasPermission("orders", "delete");

  const loadOrders = async () => {
    const filters = {
      status: statusFilter,
      limit: 50,
      page: 1,
    };

    if (canViewAll) {
      await fetchAllOrders(filters);
    } else {
      // ถ้าไม่มี permission ดูทั้งหมด ให้ดูของตัวเอง
      await fetchUserOrders(user?.id || user?._id, filters);
    }
  };

  useEffect(() => {
    // รอให้ user และ permission โหลดเสร็จก่อน
    if (user && !permissionLoading && !hasLoaded) {
      loadOrders();
      setHasLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, permissionLoading]);

  // useEffect แยกสำหรับ statusFilter เพื่อไม่ให้ conflict
  useEffect(() => {
    if (hasLoaded) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleViewOrder = async (orderId) => {
    const order = await fetchOrderById(orderId);
    if (order) {
      setSelectedOrder(order);
      setShowOrderModal(true);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!canUpdate) {
      toast.error("คุณไม่มีสิทธิ์อัพเดทสถานะ");
      return;
    }

    try {
      setActionLoading(true);
      await updateOrderStatus(orderId, newStatus);
      toast.success("อัพเดทสถานะสำเร็จ");
      setShowOrderModal(false); // ปิด modal
      await loadOrders(); // Refresh ข้อมูล
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!canCancel || !selectedOrder) return;

    try {
      setActionLoading(true);
      await cancelOrder(selectedOrder._id, cancelReason);
      toast.success("ยกเลิกคำสั่งซื้อสำเร็จ");
      setShowCancelDialog(false);
      setShowOrderModal(false);
      setCancelReason("");
      await loadOrders(); // Refresh ข้อมูล
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  // Payment method icons
  const getPaymentIcon = (method) => {
    const icons = {
      cash: "💵",
      credit_card: "💳",
      debit_card: "💳",
      apple_pay: "🍎",
      google_pay: "🔵",
      crypto: "₿",
    };
    return icons[method] || "💰";
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.orderId?.toLowerCase().includes(searchLower) ||
      order.userName?.toLowerCase().includes(searchLower) ||
      order.totalAmount?.toString().includes(searchLower)
    );
  });
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {canViewAll ? "จัดการคำสั่งซื้อทั้งหมด" : "คำสั่งซื้อของฉัน"}
          </h1>
          <p className="text-sm text-gray-500">
            จัดการและติดตามสถานะคำสั่งซื้อทั้งหมดในระบบ
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="ค้นหา Order ID, ชื่อลูกค้า, ยอดเงิน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm
                ? "ไม่พบคำสั่งซื้อที่ตรงกับการค้นหา"
                : "ไม่พบคำสั่งซื้อ"}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {order.orderId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {order.userName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            ${order.totalAmount?.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {order.items?.length || 0} item
                            {order.items?.length > 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                ) +
                                ", " +
                                new Date(order.createdAt).toLocaleTimeString(
                                  "en-GB",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )
                              : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
                              STATUS_COLORS[order.status]
                            }`}
                          >
                            {STATUS_TEXT[order.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {getPaymentIcon(order.paymentMethod)}
                            </span>
                            <span className="text-sm text-gray-600 capitalize">
                              {order.paymentMethod?.replace(/_/g, " ") ||
                                "Cash"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewOrder(order._id)}
                            className="text-sm text-blue-600 font-medium hover:bg-blue-600 hover:text-white hover:cursor-pointer border px-2 py-1 rounded duration-200 hover:scale-110"
                          >
                            ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-white">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      disabled={pagination.page === 1}
                      onClick={() => loadOrders({ page: pagination.page - 1 })}
                    >
                      ก่อนหน้า
                    </Button>
                    <Button
                      disabled={pagination.page === pagination.pages}
                      onClick={() => loadOrders({ page: pagination.page + 1 })}
                    >
                      ถัดไป
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        แสดง{" "}
                        <span className="font-medium">
                          {(pagination.page - 1) * pagination.limit + 1}
                        </span>{" "}
                        ถึง{" "}
                        <span className="font-medium">
                          {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total
                          )}
                        </span>{" "}
                        จาก{" "}
                        <span className="font-medium">{pagination.total}</span>{" "}
                        รายการ
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        disabled={pagination.page === 1}
                        onClick={() =>
                          loadOrders({ page: pagination.page - 1 })
                        }
                        size="sm"
                      >
                        ก่อนหน้า
                      </Button>
                      <span className="px-4 py-2 text-sm text-gray-700">
                        หน้า {pagination.page} / {pagination.pages}
                      </span>
                      <Button
                        disabled={pagination.page >= pagination.pages}
                        onClick={() =>
                          loadOrders({ page: pagination.page + 1 })
                        }
                        size="sm"
                      >
                        ถัดไป
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <Modal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          title={`รายละเอียดคำสั่งซื้อ ${selectedOrder.orderId}`}
        >
          <div className="space-y-4">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
              <div>
                <p className="text-sm text-gray-500">ผู้สั่งซื้อ</p>
                <p className="font-semibold">{selectedOrder.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">วันที่สั่งซื้อ</p>
                <p className="font-semibold">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">สถานะ</p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    STATUS_COLORS[selectedOrder.status]
                  }`}
                >
                  {STATUS_TEXT[selectedOrder.status]}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">การชำระเงิน</p>
                <p className="font-semibold">{selectedOrder.paymentMethod}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-semibold mb-2">รายการสินค้า</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>ถ้าอยากทำรายการสำเร็จ</span>
                <span className="text-blue-600">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div>
                <p className="text-sm text-gray-500">หมายเหตุ</p>
                <p className="text-sm">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              {/* เปลี่ยนสถานะเป็น Processing */}
              {canUpdate && selectedOrder.status === "pending" && (
                <Button
                  onClick={() =>
                    handleStatusChange(selectedOrder._id, "processing")
                  }
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  เริ่มดำเนินการ
                </Button>
              )}

              {/* เปลี่ยนสถานะเป็น Completed */}
              {canUpdate &&
                (selectedOrder.status === "pending" ||
                  selectedOrder.status === "processing") && (
                  <Button
                    onClick={() =>
                      handleStatusChange(selectedOrder._id, "completed")
                    }
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    ทำรายการสำเร็จ
                  </Button>
                )}

              {canCancel &&
                selectedOrder.status !== "cancelled" &&
                selectedOrder.status !== "completed" && (
                  <Button
                    variant="danger"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    ยกเลิกคำสั่งซื้อ
                  </Button>
                )}
              <Button
                variant="outline"
                onClick={() => setShowOrderModal(false)}
              >
                ปิด
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelOrder}
        title="ยกเลิกคำสั่งซื้อ"
        message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?"
        confirmText="ยกเลิกคำสั่งซื้อ"
        cancelText="ไม่"
        variant="danger"
        loading={actionLoading}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เหตุผลในการยกเลิก (ไม่บังคับ)
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows="3"
            placeholder="ระบุเหตุผล..."
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
