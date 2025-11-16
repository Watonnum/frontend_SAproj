"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CreditCard,
  DollarSign,
  Printer,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { CartContext } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import Button from "../../components/Button";
import Toast from "../../components/Toast";

export default function PaymentPage() {
  const router = useRouter();
  const { cart, clearCart } = useContext(CartContext) || {
    cart: { items: [], totalAmount: 0, totalItems: 0 },
    clearCart: () => {},
  };
  const { createOrder } = useOrders();

  const [paymentStatus, setPaymentStatus] = useState("pending"); // 'pending', 'processing', 'completed'
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // ถ้าไม่มีสินค้าในตระกร้า redirect กลับไป POS
    if (cart.items.length === 0) {
      router.push("/pos");
    }
  }, [cart.items, router]);

  // แสดง Toast notification
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      3000
    );
  };

  const handlePaymentConfirm = async (paymentMethod = "cash") => {
    setPaymentStatus("processing");

    try {
      // เรียก API สร้าง order
      const order = await createOrder({
        paymentMethod: paymentMethod,
        notes: "",
      });

      if (order) {
        setOrderDetails({
          id: order.orderId,
          items: order.items,
          subtotal: order.totalAmount,
          tax: 0,
          total: order.totalAmount,
          timestamp: order.createdAt,
          status: order.status,
          _id: order._id,
        });

        setPaymentStatus("completed");
        showToast("ชำระเงินเรียบร้อยแล้ว!", "success");

        // ล้างตระกร้าหลังจากชำระเงินสำเร็จ
        await clearCart();
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("pending");
      showToast(error.message || "เกิดข้อผิดพลาดในการชำระเงิน", "error");
    }
  };

  const handlePrintReceipt = () => {
    // Logic สำหรับพิมพ์ใบเสร็จ
    showToast("กำลังพิมพ์ใบเสร็จ...", "info");
    // ที่นี่จะเพิ่ม logic การพิมพ์จริง
  };

  const handleNewOrder = () => {
    router.push("/pos");
  };

  const tax = cart.totalAmount * 0.07;
  const finalTotal = cart.totalAmount + tax;

  if (cart.items.length === 0 && paymentStatus !== "completed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ไม่มีรายการสั่งซื้อ</p>
          <Button onClick={() => router.push("/pos")}>กลับไปยังหน้า POS</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "info" })}
        />
      )}

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/pos")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={paymentStatus === "processing"}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {paymentStatus === "completed"
                ? "การชำระเงินสำเร็จ"
                : "ยืนยันการชำระเงิน"}
            </h1>
          </div>

          {paymentStatus === "completed" && (
            <div className="flex items-center space-x-2 text-green-600">
              <Check className="w-6 h-6" />
              <span className="font-medium">ชำระเงินเรียบร้อย</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              รายละเอียดคำสั่งซื้อ
            </h2>

            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      {item.productId?.name || "Product"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      จำนวน: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      $
                      {((item.productId?.price || 0) * item.quantity).toFixed(
                        2
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (7%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {paymentStatus === "pending" && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  วิธีการชำระเงิน
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-medium text-gray-800">เงินสด</h3>
                        <p className="text-sm text-gray-600">
                          ชำระเงินสดที่เคาน์เตอร์
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg opacity-50">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-400">
                          บัตรเครดิต
                        </h3>
                        <p className="text-sm text-gray-400">
                          ยังไม่พร้อมใช้งาน
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handlePaymentConfirm("cash")}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-lg font-semibold"
                >
                  ยืนยันการชำระเงิน ${finalTotal.toFixed(2)}
                </Button>
              </>
            )}

            {paymentStatus === "processing" && (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  กำลังประมวลผล...
                </h3>
                <p className="text-gray-600">กรุณารอสักครู่</p>
              </div>
            )}

            {paymentStatus === "completed" && orderDetails && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  การชำระเงินสำเร็จ
                </h2>

                <div className="text-center py-8 mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    ชำระเงินเรียบร้อย!
                  </h3>
                  <p className="text-gray-600">Order ID: {orderDetails.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(orderDetails.timestamp).toLocaleString("th-TH")}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handlePrintReceipt}
                    variant="secondary"
                    className="w-full"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    พิมพ์ใบเสร็จ
                  </Button>

                  <Button
                    onClick={handleNewOrder}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    เริ่มคำสั่งซื้อใหม่
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
