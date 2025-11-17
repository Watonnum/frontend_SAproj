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
      await loadOrders();
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
      setShowCancelDialog(false);
      setShowOrderModal(false);
      setCancelReason("");
      await loadOrders();
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

  const columns = [
    {
      key: "orderId",
      label: "Order ID",
      render: (value) => (
        <span className="font-mono text-sm font-semibold">{value}</span>
      ),
    },
    {
      key: "userName",
      label: "ผู้สั่งซื้อ",
    },
    {
      key: "totalItems",
      label: "จำนวนสินค้า",
      render: (value, row) => <span>{row.items?.length || 0} รายการ</span>,
    },
    {
      key: "totalAmount",
      label: "ยอดรวม",
      render: (value) => (
        <span className="font-semibold">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "status",
      label: "สถานะ",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[value]}`}
        >
          {STATUS_TEXT[value]}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "วันที่สั่งซื้อ",
      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "จัดการ",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewOrder(row._id)}
          >
            ดูรายละเอียด
          </Button>

          {canUpdate &&
            row.status !== "cancelled" &&
            row.status !== "completed" && (
              <Select
                value={row.status}
                onChange={(e) => handleStatusChange(row._id, e.target.value)}
                size="sm"
                disabled={actionLoading}
              >
                <option value="pending">รอดำเนินการ</option>
                <option value="processing">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
              </Select>
            )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {canViewAll ? "จัดการคำสั่งซื้อทั้งหมด" : "คำสั่งซื้อของฉัน"}
              </CardTitle>
              <div className="flex gap-3 items-center">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-48"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Button onClick={loadOrders} disabled={loading}>
                  รีเฟรช
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                ไม่พบคำสั่งซื้อ
              </div>
            ) : (
              <>
                <Table data={orders} columns={columns} />

                {pagination.pages > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    <Button
                      disabled={pagination.page === 1}
                      onClick={() => loadOrders({ page: pagination.page - 1 })}
                    >
                      ก่อนหน้า
                    </Button>
                    <span className="px-4 py-2">
                      หน้า {pagination.page} / {pagination.pages}
                    </span>
                    <Button
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => loadOrders({ page: pagination.page + 1 })}
                    >
                      ถัดไป
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
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
                <span>ยอดรวมทั้งหมด</span>
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
