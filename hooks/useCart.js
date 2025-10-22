import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { cartApi } from "../lib/api";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { useProducts } from "./useProducts";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { products, updateProduct, updateLocalProductStock } = useProducts();
  const [cart, setCart] = useState({
    items: [],
    totalAmount: 0,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setLoading(true);
      try {
        const data = await cartApi.addToCart(productId, quantity, userId);
        setCart(data.cart || data);
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
        setLoading(false);
      }
    },
    [userId]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      const item = cart.items.find(
        (i) => (i.productId?._id || i.productId) === productId
      );
      if (!item) return;

      const quantityChange = quantity - item.quantity;

      setLoading(true);
      try {
        const data = await cartApi.updateCartItem(productId, quantity, userId);
        setCart(data);

        const product = products.find((p) => p._id === productId);
        if (product) {
          const newStock = product.inStock - quantityChange;
          await updateProduct(productId, { inStock: newStock });
          updateLocalProductStock(productId, newStock);
        }
      } catch (error) {
        setError(error.message || "Failed to update cart");
        toast.error("Failed to update item quantity");
      } finally {
        setLoading(false);
      }
    },
    [userId, cart.items, products, updateProduct, updateLocalProductStock]
  );

  const removeItem = useCallback(
    async (productId) => {
      const itemToRemove = cart.items.find(
        (i) => (i.productId?._id || i.productId) === productId
      );
      if (!itemToRemove) return;

      setLoading(true);
      try {
        const data = await cartApi.removeFromCart(productId, userId);
        setCart(data);

        const product = products.find((p) => p._id === productId);
        if (product) {
          const newStock = product.inStock + itemToRemove.quantity;
          await updateProduct(productId, { inStock: newStock });
          updateLocalProductStock(productId, newStock);
        }
        toast.success("Item removed from cart");
      } catch (error) {
        setError(error.message || "Failed to remove item");
        toast.error("Error removing item");
      } finally {
        setLoading(false);
      }
    },
    [userId, cart.items, products, updateProduct, updateLocalProductStock]
  );

  const clearCart = useCallback(async () => {
    setLoading(true);
    try {
      const stockToReturn = cart.items.reduce((acc, item) => {
        const productId = item.productId?._id || item.productId;
        const product = products.find((p) => p._id === productId);
        if (product) {
          acc[productId] = {
            quantity: item.quantity,
            currentStock: product.inStock,
          };
        }
        return acc;
      }, {});

      await cartApi.clearCart(userId);
      setCart({ items: [], totalAmount: 0, totalItems: 0 });

      const updatePromises = Object.entries(stockToReturn).map(
        ([productId, { quantity, currentStock }]) => {
          const newStock = currentStock + quantity;
          updateLocalProductStock(productId, newStock);
          return updateProduct(productId, { inStock: newStock });
        }
      );

      await Promise.all(updatePromises);

      toast.success("Cart cleared and stock restored");
    } catch (error) {
      setError(error.message || "Failed to clear cart");
      toast.error("An error occurred while clearing the cart.");
    } finally {
      setLoading(false);
    }
  }, [userId, cart.items, products, updateProduct, updateLocalProductStock]);

  const value = {
    cart,
    loading,
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
