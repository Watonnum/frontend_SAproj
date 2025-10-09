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
  console.log("🌐 [API] Making request to:", url);

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log("🌐 [API] Request config:", config);
    const response = await fetch(url, config);
    console.log("🌐 [API] Response status:", response.status);

    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    console.log("🌐 [API] Response data:", data);
    return data;
  } catch (error) {
    console.error("🌐 [API] Error:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error or invalid JSON response", 0);
  }
}

// Product API functions
export const productApi = {
  // ดึงข้อมูลสินค้าทั้งหมด
  getAll: () => apiRequest("/products"),

  // ดึงข้อมูลสินค้าตาม ID
  getById: (id) => apiRequest(`/products/${id}`),

  // สร้างสินค้าใหม่
  create: (productData) =>
    apiRequest("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  // อัพเดทสินค้า
  update: (id, productData) =>
    apiRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),

  // ลบสินค้า
  delete: (id) =>
    apiRequest(`/products/${id}`, {
      method: "DELETE",
    }),
};

export const categoryApi = {
  // ดึงข้อมูลหมวดหมู่ทั้งหมด
  getAll: () => apiRequest("/categories"),

  // ดึงข้อมูลหมวดหมู่ตาม ID
  getById: (id) => apiRequest(`/categories/${id}`),

  // สร้างหมวดหมู่ใหม่
  create: (categoryData) =>
    apiRequest("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    }),

  // อัพเดทหมวดหมู่
  update: (id, categoryData) =>
    apiRequest(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    }),

  // ลบหมวดหมู่
  delete: (id) =>
    apiRequest(`/categories/${id}`, {
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
  updateCartItem: async (productId, quantity, userId = "guest") =>
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

export const usersApi = {
  // ดึงข้อมูลหมวดหมู่ทั้งหมด
  getAll: () => apiRequest("/users"),

  // ดึงข้อมูลหมวดหมู่ตาม ID
  getById: (id) => apiRequest(`/users/${id}`),

  // สร้างหมวดหมู่ใหม่
  create: (user) =>
    apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),

  // อัพเดทหมวดหมู่
  update: (id, user) =>
    apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),

  // ลบหมวดหมู่
  delete: (id) =>
    apiRequest(`/users/${id}`, {
      method: "DELETE",
    }),
};

export { ApiError };
