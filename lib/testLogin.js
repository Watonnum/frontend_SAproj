// Test login function
async function testLogin() {
  try {
    console.log("🔍 Testing login...");

    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
      }),
    });

    console.log("📡 Response status:", response.status);

    const data = await response.json();
    console.log("📦 Response data:", data);

    if (response.ok) {
      console.log("✅ Login successful!");
      console.log("🎫 Token:", data.token);
      console.log("👤 User:", data.user);
    } else {
      console.error("❌ Login failed:", data.message);
    }
  } catch (error) {
    console.error("🚨 Error:", error);
  }
}

// Export for testing
if (typeof window !== "undefined") {
  window.testLogin = testLogin;
}

export default testLogin;
