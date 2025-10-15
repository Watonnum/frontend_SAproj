"use client";

import "./globals.css";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import Card, { CardHeader, CardTitle, CardContent } from "../components/Card";
import { useUsers } from "../hooks/useUsers";
import { useRouter } from "next/navigation";
import {
  checkLoginStatus,
  saveLoginStatus,
  clearLoginStatus,
} from "../lib/auth";
import Toast from "../components/Toast";

export default function RootLayout({ children }) {
  const [show, setShow] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [formLogin, setFormLogin] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(true); // สำหรับ loading เริ่มต้น
  const router = useRouter();
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const {
    users,
    loading: usersLoading,
    error: usersError,
    updateUsers,
    setUsers,
  } = useUsers();

  console.log("🔍 [Layout] Hook state:", { users, usersLoading, usersError });

  // ฟังก์ชันแสดง Toast
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "info" });
    }, 3000);
  };

  const usersData =
    users && Array.isArray(users) && users.length > 0
      ? users.map((user) => ({
          id: user._id || "guest",
          email: user.email || "",
          password: user.passwordHash || "",
          fName: user.fName,
          lName: user.lName,
          address: user.address,
          phoneNum: user.phoneNum,
          regisDate: user.regisDate,
          updateDate: user.updateDate,
          isActive: user.isActive,
        }))
      : [];

  const handleLogout = () => {
    // ค้นหา active user และเปลี่ยน isActive เป็น false
    const activeUser = users.find((user) => user.isActive === true);
    if (activeUser) {
      updateUsers(activeUser._id, { isActive: false });
      console.log("User logged out:", activeUser);
    }

    // รีเซ็ต form และซ่อน main content
    setShow(false);
    setFormLogin({
      email: "",
      password: "",
    });

    // ลบสถานะ login และ redirect ไปหน้าหลัก
    clearLoginStatus();
    router.push("/");
    showToast("ออกจากระบบเรียบร้อยแล้ว", "success");
    console.log("Logout successful");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formLogin);
    console.log({ usersData });

    if (validateLogin()) {
      // switch account status -> active
      const userMatched = users.find(
        (user) =>
          user.email === formLogin.email &&
          user.passwordHash === formLogin.password
      );
      if (userMatched) {
        updateUsers(userMatched._id, { isActive: true });
        console.log("Matched user:", userMatched);

        // บันทึกสถานะการ login
        saveLoginStatus(formLogin.email);
        setShow(true);
        showToast(`ยินดีต้อนรับ ${formLogin.email}`, "success");
      }
    } else {
      showToast("อีเมลหรือรหัสผ่านไม่ถูกต้อง", "error");
      console.log("Login failed");
    }

    console.log("[handleSubmit] - status show ==> ", show);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateLogin = () => {
    // ตรวจสอบ loading state
    if (usersLoading) {
      console.log("Still loading users data...");
      return false;
    }

    // ตรวจสอบ error
    if (usersError) {
      console.log("Error loading users:", usersError);
      return false;
    }

    // ตรวจสอบข้อมูลว่าง - เช็คทั้ง users และ usersData
    if (!users || !Array.isArray(users) || users.length === 0) {
      console.log("No users data available");
      return false;
    }

    if (!usersData || usersData.length === 0) {
      console.log("No usersData available");
      return false;
    }

    // ตรวจสอบ input ว่าง
    if (!formLogin.email.trim() || !formLogin.password.trim()) {
      console.log("Email or password is empty");
      return false;
    }

    // Debug ข้อมูล
    console.log("=== Debug Login ===");
    console.log("formLogin:", formLogin);
    console.log("usersData:", usersData);
    console.log("users from API:", users);
    // console.log(
    //   "users id",
    //   users.filter((data) => data.email === formLogin.email)
    // );

    const user = usersData.find(
      (data) =>
        data.email === formLogin.email && data.password === formLogin.password
    );

    if (user) {
      setShow(true);
      console.log("✅ Login successful!");
      console.log("db email:", user.email);
      console.log("db password:", user.password);
      // ไม่ต้อง replaceState ที่นี่ เพราะเราจะให้ผู้ใช้อยู่ในหน้าปัจจุบัน
      return true;
    }

    console.log("❌ Login failed - No matching user found");
    console.log(
      "Available emails:",
      usersData.map((u) => u.email)
    );
    console.log("Input email:", formLogin.email);
    console.log("Input password:", formLogin.password);
    return false;
  };

  useEffect(() => {
    console.log("[useEffect] - status show ==> ", show);
  }, [show]);

  // useEffect สำหรับตรวจสอบสถานะ login เมื่อ component mount
  useEffect(() => {
    // ตรวจสอบสถานะ login จาก localStorage
    const isLoggedIn = checkLoginStatus();
    setShow(isLoggedIn);
    setIsLoading(false);

    console.log("🔍 [Initial Check] Login status:", isLoggedIn);
  }, []);

  // useEffect สำหรับ Auto-logout เมื่อ localStorage เปลี่ยน
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "isLoggedIn" && e.newValue === null) {
        setShow(false);
        console.log("🔄 Auto logout detected");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // แสดง loading screen ในขณะที่กำลังตรวจสอบสถานะ
  if (isLoading) {
    return (
      <html lang="th">
        <body>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">กำลังโหลด...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="th">
      <body>
        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed top-4 right-4 z-50">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() =>
                setToast({ show: false, message: "", type: "info" })
              }
            />
          </div>
        )}

        <div className="min-h-screen flex">
          {/* Sidebar - Fixed position */}
          <div className={`${show ? "" : "hidden"}`}>
            <Sidebar onLogout={handleLogout} />
          </div>

          {/* Login Screen */}
          <div
            className={`min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 ${
              show ? "hidden" : ""
            }`}
          >
            <div className="w-full max-w-md">
              {/* Login Component */}
              <Card>
                <CardHeader className="font-bold text-3xl border-none text-center">
                  Sign in with Email
                </CardHeader>
                <CardHeader className="font-bold text-lg text-center text-gray-500">
                  Welcome back
                </CardHeader>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col border text-xl border-none gap-4 justify-center items-center pt-6"
                >
                  <div className="flex flex-col gap-1 w-full">
                    <p className="text-lg text-gray-400">Username</p>
                    <input
                      type="email"
                      name="email"
                      onChange={handleChange}
                      value={formLogin.email}
                      className="text-xl bg-gray-100 w-full rounded-xl px-4 py-1
                      invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-500 focus:outline focus:outline-sky-500 focus:invalid:border-pink-500 focus:invalid:outline-pink-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none dark:disabled:border-gray-700 dark:disabled:bg-gray-800/20"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <p className="text-lg text-gray-400">Password</p>
                    <div className="relative">
                      <input
                        type={`${isShowPassword ? "text" : "password"}`}
                        name="password"
                        onChange={handleChange}
                        value={formLogin.password}
                        className="text-xl bg-gray-100 w-full rounded-xl px-4 py-1
                      invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-500 focus:outline focus:outline-sky-500 focus:invalid:border-pink-500 focus:invalid:outline-pink-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none dark:disabled:border-gray-700 dark:disabled:bg-gray-800/20"
                        required
                      />
                      {isShowPassword ? (
                        <div
                          className="bottom-0 right-1 absolute z-50 cursor-pointer p-2"
                          onClick={() => {
                            setIsShowPassword(!isShowPassword);
                          }}
                        >
                          <FaRegEye />
                        </div>
                      ) : (
                        <div
                          className="bottom-0 right-1 absolute z-50 cursor-pointer p-2"
                          onClick={() => {
                            setIsShowPassword(!isShowPassword);
                          }}
                        >
                          <FaRegEyeSlash />
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="hover:cursor-pointer bg-black text-white hover:opacity-40 rounded-xl w-full px-4 py-2 duration-200 mt-4 select-none"
                  >
                    Login
                  </button>
                </form>
              </Card>
              {/* Login Component */}
            </div>
          </div>

          {/* Main Content Area - with left margin for sidebar */}
          <div
            className={`flex-1 ml-64 min-w-0 select-none ${
              show ? "" : "hidden"
            }`}
          >
            <div className="p-4">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
