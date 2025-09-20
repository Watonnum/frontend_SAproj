"use client";
import Header from "../../components/Header";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useCart } from "../../hooks/useCart";
import { useState, useEffect } from "react";

export default function CartPage() {
  const {
    cart,
    loading = false,
    error = null,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
  } = useCart() || {};

  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    fetchCart?.();
  }, [fetchCart]);

  const handleQtyChange = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0 || newQty == 0)
      return removeItem(item.productId._id || item.productId);
    updateQuantity(item.productId._id || item.productId, newQty);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ตะกร้าสินค้า</h1>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
        {loading && (
          <div className="py-8 flex justify-center">
            <LoadingSpinner />
          </div>
        )}

        {cart?.items?.length === (0 || undefined) && (
          <p className="text-gray-600">ยังไม่มีสินค้าในตะกร้า</p>
        )}

        {cart?.items?.length > 0 && (
          <div className="space-y-4">
            {cart.items.map((it) => (
              <div
                key={it.productId._id || it.productId}
                className="flex items-center justify-between p-4 bg-white rounded border"
              >
                <div>
                  <p className="font-medium">{it.productId.name || "สินค้า"}</p>
                  <p className="text-sm text-gray-500">
                    ฿{it.price.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQtyChange(it, -1)}
                  >
                    -
                  </Button>
                  <span>{it.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQtyChange(it, +1)}
                  >
                    +
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => removeItem(it.productId._id || it.productId)}
                  >
                    ลบ
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-6">
              <div className="text-lg font-semibold">
                รวมทั้งสิ้น: ฿{cart?.total.toLocaleString()}
              </div>
              <div className="space-x-3">
                <Button variant="outline" onClick={() => setConfirmClear(true)}>
                  ล้างตะกร้า
                </Button>
                <Button variant="primary">ชำระเงิน (ยังไม่ทำ)</Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearCart();
          setConfirmClear(false);
        }}
        title="ยืนยันการล้างตะกร้า"
        message="คุณต้องการล้างสินค้าออกทั้งหมดหรือไม่?"
        type="warning"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
      />
    </div>
  );
}
