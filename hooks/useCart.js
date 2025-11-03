import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
} from "react";
import { cartApi } from "../lib/api";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { useProducts } from "./useProducts";

const CartContext = createContext(null);

export { CartContext };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { products, updateLocalProductStock } = useProducts();

  const [cart, setCart] = useState({
    items: [],
    totalAmount: 0,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // Track loading per action
  const [error, setError] = useState(null);
  const debounceTimers = useRef({}); // Store debounce timers

  const userId = user?._id || "guest";

  const fetchCart = useCallback(async () => {
    if (!userId || userId === "guest") {
      setCart({ items: [], totalAmount: 0, totalItems: 0 });
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.getCart(userId);
      setCart(data || { items: [], totalAmount: 0, totalItems: 0 });
    } catch (error) {
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (productId, quantity = 1, productName = "Product") => {
      // ป้องกัน spam click
      const actionKey = `add-${productId}`;
      if (actionLoading[actionKey] || loading) {
        toast.warning("กรุณารอสักครู่...");
        return;
      }

      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));

      try {
        // เช็ค stock ก่อนเพิ่มลงตระกร้า - ใช้ closure เพื่อได้ products ล่าสุด
        const currentProducts = products;
        const product = currentProducts.find((p) => p._id === productId);
        if (!product) {
          throw new Error("Product not found");
        }

        if (product.inStock < quantity) {
          throw new Error("Insufficient stock");
        }

        const data = await cartApi.addToCart(productId, quantity, userId);
        setCart(data.cart || data);

        // ลด stock ของสินค้า (delay เล็กน้อยเพื่อไม่ให้ re-render ทันที)
        setTimeout(() => {
          const newStock = product.inStock - quantity;
          updateLocalProductStock(productId, newStock);
        }, 50);

        toast.success(`Added ${productName} to cart`, {
          description: `Quantity: ${quantity}`,
        });
        return data;
      } catch (error) {
        setError(error.message || "Failed to add item");
        toast.error("Error adding item to cart", {
          description: error.message,
        });
        throw error;
      } finally {
        // ลด delay เพื่อลดการกระพริบ
        setTimeout(() => {
          setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
        }, 100);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, updateLocalProductStock, actionLoading, loading]
  );

  const updateQuantity = useCallback(
    async (itemId, newQuantity) => {
      // ป้องกัน spam click
      const actionKey = `update-${itemId}`;
      if (actionLoading[actionKey] || loading) {
        return;
      }

      // หา item ในตระกร้า
      const item = cart.items.find((i) => i._id === itemId);
      if (!item) return;

      const productId = item.productId?._id || item.productId;
      const quantityChange = newQuantity - item.quantity; // บวก = เพิ่ม, ลบ = ลด

      // Clear existing debounce timer
      if (debounceTimers.current[actionKey]) {
        clearTimeout(debounceTimers.current[actionKey]);
      }

      // Set loading state immediately for UI feedback
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));

      // Debounce the actual API call
      debounceTimers.current[actionKey] = setTimeout(async () => {
        try {
          // เช็ค stock ถ้าจะเพิ่มจำนวน
          if (quantityChange > 0) {
            const currentProducts = products;
            const product = currentProducts.find((p) => p._id === productId);
            if (!product || product.inStock < quantityChange) {
              throw new Error("Insufficient stock");
            }
          }

          const data = await cartApi.updateCartItem(
            productId,
            newQuantity,
            userId
          );
          setCart(data);

          // อัพเดท stock ของสินค้า (local update เท่านั้น)
          const currentProducts = products;
          const product = currentProducts.find((p) => p._id === productId);
          if (product) {
            const newStock = product.inStock - quantityChange; // ลด stock ตามจำนวนที่เพิ่ม
            updateLocalProductStock(productId, newStock);
          }
        } catch (error) {
          setError(error.message || "Failed to update cart");
          toast.error("Failed to update item quantity", {
            description: error.message,
          });
        } finally {
          setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
        }
      }, 200); // ลด debounce เป็น 200ms
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, cart.items, updateLocalProductStock, actionLoading, loading]
  );

  const removeItem = useCallback(
    async (productId) => {
      // ป้องกัน spam click
      const actionKey = `remove-${productId}`;
      if (actionLoading[actionKey] || loading) {
        return;
      }

      // หา item ที่จะลบ
      const itemToRemove = cart.items.find(
        (i) =>
          (i.productId?._id || i.productId) === productId || i._id === productId
      );
      if (!itemToRemove) return;

      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));

      try {
        // ลบออกจาก cart โดยใช้ productId (ไม่ใช่ cart item id)
        const realProductId =
          itemToRemove.productId?._id || itemToRemove.productId;
        const data = await cartApi.removeFromCart(realProductId, userId);
        setCart(data);

        // คืน stock กลับ (local update เท่านั้น)
        const currentProducts = products;
        const product = currentProducts.find((p) => p._id === realProductId);
        if (product) {
          const newStock = product.inStock + itemToRemove.quantity;
          updateLocalProductStock(realProductId, newStock);
        }

        toast.success("Item removed from cart");
      } catch (error) {
        setError(error.message || "Failed to remove item");
        toast.error("Error removing item");
      } finally {
        setTimeout(() => {
          setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
        }, 100);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, cart.items, updateLocalProductStock, actionLoading, loading]
  );

  const clearCart = useCallback(async () => {
    if (cart.items.length === 0) return;

    // ป้องกัน spam click
    if (loading) {
      toast.warning("กรุณารอสักครู่...");
      return;
    }

    // ใช้ actionLoading แทน loading เพื่อประสิทธิภาพ
    setActionLoading((prev) => ({ ...prev, clearCart: true }));

    try {
      // เก็บข้อมูล stock ที่ต้องคืน
      const stockToReturn = cart.items.map((item) => {
        const productId = item.productId?._id || item.productId;
        const currentProducts = products;
        const product = currentProducts.find((p) => p._id === productId);
        return {
          productId,
          quantity: item.quantity,
          currentStock: product?.inStock || 0,
        };
      });

      // ล้างตระกร้า
      await cartApi.clearCart(userId);
      setCart({ items: [], totalAmount: 0, totalItems: 0 });

      // คืน stock กลับ (local update เท่านั้น)
      const updatePromises = stockToReturn.map(
        ({ productId, quantity, currentStock }) => {
          const newStock = currentStock + quantity;
          updateLocalProductStock(productId, newStock);
        }
      );

      toast.success("Cart cleared and stock restored");
    } catch (error) {
      setError(error.message || "Failed to clear cart");
      toast.error("An error occurred while clearing the cart.");
    } finally {
      setTimeout(() => {
        setActionLoading((prev) => ({ ...prev, clearCart: false }));
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, cart.items, updateLocalProductStock, loading]);

  const value = {
    cart,
    loading,
    actionLoading,
    error,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
