// API configuration และ utility functionssssss
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error or invalid JSON response", 0);
  }
}

// Product API functions
export const productApi = {
  // ดึงข้อมูลสินค้าทั้งหมด
  getAll: () => apiRequest("/product"),

  // ดึงข้อมูลสินค้าตาม ID
  getById: (id) => apiRequest(`/product/${id}`),

  // สร้างสินค้าใหม่
  create: (productData) =>
    apiRequest("/product", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  // อัพเดทสินค้า
  update: (id, productData) =>
    apiRequest(`/product/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),

  // ลบสินค้า
  delete: (id) =>
    apiRequest(`/product/${id}`, {
      method: "DELETE",
    }),
};

export const cartApi = {
  // add item to cart
  addToCart: async (productId, quantity = 1, userId = "guest") =>
    apiRequest("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, userId }),
    }),

  // show cart
  getCart: async (userId = "guest") => apiRequest(`/cart/${userId}`),

  // update amount item in cart
  updateCarItem: async (productId, quantity, userId = "guest") =>
    apiRequest("/cart/update", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity, userId }),
    }),

  // remove item
  removeFromCart: (productId, userId = "guest") =>
    apiRequest("/cart/remove", {
      method: "DELETE",
      body: JSON.stringify({ productId, userId }),
    }),

  // clear cart
  clearCart: (userId = "guest") =>
    apiRequest(`/cart/clear/${userId}`, {
      method: "DELETE",
    }),
};

export { ApiError };
