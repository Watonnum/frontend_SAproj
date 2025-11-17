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

// ฟังก์ชันสำหรับดึง auth token
function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log("🌐 [API] Making request to:", url);

  // เพิ่ม auth token ลงใน headers อัตโนมัติ
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    headers,
    ...options,
  };

  try {
    console.log("🌐 [API] Request config:", config);
    const response = await fetch(url, config);
    console.log("🌐 [API] Response status:", response.status);

    if (!response.ok) {
      // แยกประเภท error ให้ชัดเจน
      if (response.status === 401) {
        // 401 = Token หมดอายุหรือไม่ถูกต้อง
        const currentToken = getAuthToken();
        const isLoggedIn = localStorage.getItem("isLoggedIn");

        if (currentToken && isLoggedIn === "true") {
          // ถ้ามี token และ logged in แล้ว แต่ได้ 401 = token หมดอายุ
          localStorage.removeItem("authToken");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("loginTime");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userData");

          // ส่ง event เพื่อให้ระบบรู้ว่าต้อง logout
          window.dispatchEvent(new CustomEvent("auth-changed"));

          throw new ApiError(
            "Session expired. Please login again.",
            response.status
          );
        } else {
          // ถ้ายังไม่ได้ login (ไม่มี token หรือ isLoggedIn = false)
          // ไม่ต้อง throw error เพื่อไม่ให้ console แสดง error ในหน้า login
          console.log("🔒 [API] Authentication required (not logged in)");
          return null; // ส่ง null กลับไปแทน
        }
      } else if (response.status === 403) {
        // 403 = Permission denied - ไม่ลบ token
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message ||
            "Access denied. You don't have permission to access this resource.",
          response.status
        );
      }

      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    console.error("🌐 [API] Request failed:", error);
    throw error;
  }
}

// API request function without auth (สำหรับ login page)
async function apiRequestNoAuth(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log("🌐 [API] Making no-auth request to:", url);

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    console.log("🌐 [API] Response status:", response.status);

    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    console.error("🌐 [API] No-auth request failed:", error);
    throw error;
  }
}

// Product API functions
export const productsApi = {
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

export const categoriesApi = {
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
  addToCart: async (productId, quantity = 1, userId) => {
    if (!userId) {
      throw new Error("User ID is required");
    }
    return apiRequest("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, userId }),
    });
  },

  // show cart
  getCart: async (userId) => {
    if (!userId) {
      throw new Error("User ID is required");
    }
    return apiRequest(`/cart/${userId}`);
  },

  // update amount item in cart
  updateCartItem: async (productId, quantity, userId) => {
    if (!userId) {
      throw new Error("User ID is required");
    }
    return apiRequest("/cart/update", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity, userId }),
    });
  },

  // remove item
  removeFromCart: (productId, userId) => {
    if (!userId) {
      throw new Error("User ID is required");
    }
    return apiRequest("/cart/remove", {
      method: "DELETE",
      body: JSON.stringify({ productId, userId }),
    });
  },

  // clear cart
  clearCart: (userId) => {
    if (!userId) {
      throw new Error("User ID is required");
    }
    return apiRequest(`/cart/clear/${userId}`, {
      method: "DELETE",
    });
  },
};

export const usersApi = {
  // ดึงข้อมูลหมวดหมู่ทั้งหมด
  getAll: () => apiRequest("/users"),

  // ดึงข้อมูลหมวดหมู่ตาม ID
  getById: (id) => apiRequest(`/users/${id}`),

  // ดึงข้อมูล user ตาม email (สำหรับ login - ไม่ต้อง auth)
  getByEmail: (email) => apiRequestNoAuth(`/users/email/${email}`),

  // Quick login สำหรับ recent accounts
  quickLogin: (email, rememberToken) =>
    apiRequestNoAuth(`/users/quick-login`, {
      method: "POST",
      body: JSON.stringify({ email, rememberToken }),
    }),

  // สร้าง user ใหม่
  create: (user) =>
    apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),

  // อัพเดท user
  update: (id, user) =>
    apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),

  // ลบ user
  delete: (id) =>
    apiRequest(`/users/${id}`, {
      method: "DELETE",
    }),

  // ลบ users แบบ bulk
  bulkDelete: (ids) =>
    apiRequest("/users/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};

export { ApiError };

const api = {
  baseURL: API_BASE_URL,
  products: productsApi,
  categories: categoriesApi,
  cart: cartApi,
  users: usersApi,
};

export default api;
