"use client";

import { usersApi } from "@/lib/api";

export default function UsersSimplePage() {
  const handleTestAPI = async () => {
    try {
      console.log("🔍 [UsersSimplePage] Manual API call starting...");
      const data = await usersApi.getAll();
      console.log("✅ [UsersSimplePage] Data received:", data);
      alert(`ได้ข้อมูล ${data.length} users: ${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      console.error("❌ [UsersSimplePage] Error:", err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Users Simple Test</h1>

      <button
        onClick={handleTestAPI}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Test API Call
      </button>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Manual Test Commands:</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p className="mb-2">Test Backend directly:</p>
          <code className="block bg-gray-800 text-green-400 p-2 rounded">
            curl http://localhost:3000/api/users
          </code>
        </div>
      </div>
    </div>
  );
}
