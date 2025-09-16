import { useState, useEffect, useCallback } from "react";
import { cartApi } from "../lib/api";

export function useCart(userId = "guest") {
  const [cart, setCart] = useState({ item: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);

    try {
      const data = await cartApi.getCart(userId);
      setCart(data);
    } catch (error) {
      setError("โหลดตระกร้าล้มเหลว");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      setLoading(true);

      try {
        const data = await cartApi.addToCart(productId, quantity, userId);
        setCart(data);
      } catch (error) {
        setError(error.message || "เพิ่มสินค้าล้มเหลว");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      setLoading(true);

      try {
        const data = await cartApi.updateCartItem(productId, quantity, userId);
        setCart(data);
      } catch (error) {
        setError(error.message || "update cart fail");
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const removeItem = useCallback(
    async (productId) => {
      setLoading(true);

      try {
        const data = await cartApi.removeFromCart(productId, userId);
        setCart(data);
      } catch (error) {
        setError(error.message || "remove item fail");
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const clearCart = useCallback(async () => {
    setLoading(true);

    try {
      const data = await cartApi.clearCart(userId);
      setCart(data);
    } catch (error) {
      setError(
        error.message ||
          "Clear not success. something wrong. Pls check clearCart's Method api"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
