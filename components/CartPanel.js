"use client";

import { useState, useContext } from "react";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { CartContext } from "@/hooks/useCart";

export default function CartPanel({ showToast }) {
  const router = useRouter();
  const {
    cart,
    updateQuantity,
    removeItem,
    clearCart,
    loading,
    actionLoading,
  } = useContext(CartContext) || {
    cart: { items: [], totalAmount: 0, totalItems: 0 },
    updateQuantity: () => {},
    removeItem: () => {},
    clearCart: () => {},
    loading: false,
    actionLoading: {},
  };

  const handleProcessTransaction = () => {
    console.log("🔵 Process Transaction clicked");
    console.log("Cart items:", cart.items.length);
    console.log("Loading:", loading);

    if (cart.items.length === 0) {
      showToast("กรุณาเลือกสินค้าก่อนทำการชำระเงิน", "warning");
      return;
    }

    console.log("🚀 Navigating to /payment");
    try {
      // ใช้ window.location สำรอง ถ้า router.push ไม่ทำงาน
      if (typeof window !== "undefined") {
        window.location.href = "/payment";
      } else {
        router.push("/payment");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      showToast("เกิดข้อผิดพลาดในการไปหน้าชำระเงิน", "error");
    }
  };

  const handleClearCart = () => {
    clearCart();
    showToast("ล้างตระกร้าสินค้าเรียบร้อย", "success");
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      // หา productId จาก itemId
      const item = cart.items.find((i) => i._id === itemId);
      const productId = item?.productId?._id || item?.productId;

      if (productId) {
        await removeItem(productId);
        showToast("ลบสินค้าจากตระกร้าเรียบร้อย", "success");
      }
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const tax = cart.totalAmount * 0.07; // 7% tax
  const finalTotal = cart.totalAmount + tax;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Cart Details</h2>
          <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            {cart.items.length}
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No Order</p>
            <p className="text-sm text-center px-4">
              Tap the product to add into order
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {cart.items.map((item) => (
              <div key={item._id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">
                    {item.productId?.name || "Product"}
                  </h3>
                  <button
                    onClick={() => {
                      const productId = item.productId?._id || item.productId;
                      if (productId) {
                        removeItem(productId);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    disabled={loading || actionLoading[`remove-${item._id}`]}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item._id, item.quantity - 1)
                      }
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      disabled={loading || actionLoading[`update-${item._id}`]}
                    >
                      {actionLoading[`update-${item._id}`] ? (
                        <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item._id, item.quantity + 1)
                      }
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      disabled={loading || actionLoading[`update-${item._id}`]}
                    >
                      {actionLoading[`update-${item._id}`] ? (
                        <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      ${(item.productId?.price || 0).toFixed(2)}
                    </p>
                    <p className="font-bold text-green-600">
                      $
                      {((item.productId?.price || 0) * item.quantity).toFixed(
                        2
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear Cart Button */}
      {cart.items.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100">
          <button
            onClick={handleClearCart}
            className="w-full py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
            disabled={loading}
          >
            Clear All Order
          </button>
        </div>
      )}

      {/* Order Summary */}
      {cart.items.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>${cart.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Voucher</span>
              <span>$0.00</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Transaction Button */}
      <div className="p-6 border-t border-gray-200">
        <Button
          onClick={handleProcessTransaction}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium text-lg"
          disabled={cart.items.length === 0 || loading}
        >
          Process Transaction
        </Button>
      </div>
    </div>
  );
}
