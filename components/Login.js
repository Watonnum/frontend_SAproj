"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Card, { CardHeader } from "./Card";
import { FaRegEye, FaRegEyeSlash, FaPlus, FaArrowLeft } from "react-icons/fa6";
import { toast } from "sonner";
import { usersApi } from "../lib/api";

// สีสำหรับ avatar แต่ละ account
const avatarColors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-red-500",
  "bg-yellow-500",
];

// Function จัดการ recent accounts ใน localStorage
const getRecentAccounts = () => {
  try {
    const accounts = localStorage.getItem("recentAccounts");
    return accounts ? JSON.parse(accounts) : [];
  } catch {
    return [];
  }
};

const saveRecentAccount = (accountData) => {
  try {
    let accounts = getRecentAccounts();

    // ลบ account ที่มีอยู่แล้ว (ถ้ามี)
    accounts = accounts.filter((acc) => acc.email !== accountData.email);

    // เพิ่ม account ใหม่ที่ด้านบน
    accounts.unshift({
      email: accountData.email,
      fName: accountData.fName,
      role: accountData.role,
      rememberToken: accountData.rememberToken, // เพิ่ม rememberToken
      lastLogin: new Date().toISOString(),
    });

    // เก็บเฉพาะ 5 accounts ล่าสุด
    accounts = accounts.slice(0, 5);

    localStorage.setItem("recentAccounts", JSON.stringify(accounts));
  } catch (error) {
    console.error("Failed to save recent account:", error);
  }
};

// ฟังก์ชันดึงข้อมูล user จาก API
const getUserByEmail = async (email) => {
  try {
    const userData = await usersApi.getByEmail(email);
    return userData;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return null;
  }
};

// ฟังก์ชันดึงข้อมูล user จาก localStorage (fallback)
const getUserFromStorage = (email) => {
  try {
    const storedUsers = localStorage.getItem("userProfiles");
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      return users.find((user) => user.email === email);
    }
    return null;
  } catch (error) {
    console.error("Failed to get user from storage:", error);
    return null;
  }
};

// ฟังก์ชันบันทึกข้อมูล user ลง localStorage (รวม remember token)
const saveUserToStorage = (userData) => {
  try {
    let storedUsers = [];
    const existingUsers = localStorage.getItem("userProfiles");
    if (existingUsers) {
      storedUsers = JSON.parse(existingUsers);
    }

    // ลบ user เดิมออก (ถ้ามี)
    storedUsers = storedUsers.filter((user) => user.email !== userData.email);

    // สร้าง remember token
    const rememberToken = btoa(userData.email + Date.now());

    // เพิ่ม user ใหม่ (รวม password สำหรับ auto-fill)
    storedUsers.push({
      email: userData.email,
      fName: userData.fName,
      role: userData.role,
      password: userData.password, // เก็บ password สำหรับ auto-fill
      rememberToken: rememberToken,
    });

    localStorage.setItem("userProfiles", JSON.stringify(storedUsers));
    console.log("💾 Saved user to localStorage:", {
      email: userData.email,
      fName: userData.fName,
      hasPassword: !!userData.password,
      hasRememberToken: !!rememberToken,
    });
  } catch (error) {
    console.error("Failed to save user to storage:", error);
  }
};

function AccountPicker({ onSelectAccount, onAddNew }) {
  const [recentAccounts, setRecentAccounts] = useState([]);

  // ดึงข้อมูล recent accounts และ update ข้อมูลจาก API
  useEffect(() => {
    const fetchAccountsData = async () => {
      const accounts = getRecentAccounts();
      console.log("🔄 Original accounts from localStorage:", accounts);

      // Update ข้อมูลจาก API สำหรับแต่ละ account
      const updatedAccounts = await Promise.all(
        accounts.map(async (account) => {
          try {
            // ดึงข้อมูลล่าสุดจาก API
            const apiData = await getUserByEmail(account.email);
            console.log(`🔍 API data for ${account.email}:`, apiData);

            if (apiData && apiData.fName) {
              const updated = {
                ...account,
                fName: apiData.fName, // ใช้ชื่อจาก API แทน
                role: apiData.role,
              };
              console.log(`✅ Updated account for ${account.email}:`, updated);
              return updated;
            } else {
              // ถ้าไม่มีข้อมูลใน API หรือไม่มี fName ให้ใช้ email เป็นชื่อแสดง
              const fallback = {
                ...account,
                fName: account.fName || account.email.split("@")[0], // ใช้ชื่อก่อน @ หรือใช้ email
              };
              console.log(`⚠️ Using fallback for ${account.email}:`, fallback);
              return fallback;
            }
          } catch (error) {
            console.error(
              `❌ Failed to update data for ${account.email}:`,
              error
            );
            return account;
          }
        })
      );

      console.log("📦 Final updated accounts:", updatedAccounts);
      setRecentAccounts(updatedAccounts);

      // อัปเดต localStorage ด้วยข้อมูลใหม่จาก API
      try {
        localStorage.setItem("recentAccounts", JSON.stringify(updatedAccounts));
        console.log("💾 Updated localStorage with fresh API data");
      } catch (error) {
        console.error("Failed to update localStorage:", error);
      }
    };

    fetchAccountsData();
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-900">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-white mb-12">
          Who&apos;s there?
        </h1>

        <div className="flex justify-center items-center gap-8 flex-wrap">
          {/* แสดง recent accounts */}
          {recentAccounts.map((account, index) => (
            <div
              key={account.email}
              className="flex flex-col items-center gap-3 cursor-pointer group"
              onClick={() => onSelectAccount(account)}
            >
              <div
                className={`w-24 h-24 rounded-lg ${avatarColors[index]} flex items-center justify-center group-hover:ring-4 group-hover:ring-white/50 transition-all duration-200`}
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl">😊</span>
                </div>
              </div>
              <p className="text-white text-lg font-medium">
                {account.fName || account.email}
              </p>
            </div>
          ))}

          {/* Add new account button */}
          <div
            className="flex flex-col items-center gap-3 cursor-pointer group"
            onClick={onAddNew}
          >
            <div className="w-24 h-24 rounded-lg bg-gray-700 border-2 border-gray-600 border-dashed flex items-center justify-center group-hover:border-white/50 group-hover:bg-gray-600 transition-all duration-200">
              <FaPlus className="text-gray-400 text-2xl group-hover:text-white" />
            </div>
            <p className="text-gray-400 text-lg font-medium group-hover:text-white">
              Add Account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ selectedAccount, onBack, onLoginSuccess }) {
  const [formLogin, setFormLogin] = useState({
    email: selectedAccount?.email || "",
    password: "",
  });
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(selectedAccount || null);
  const { login } = useAuth();

  // ดึงข้อมูล user เมื่อมีการเลือก account
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (selectedAccount && selectedAccount.email) {
        setIsLoading(true);
        try {
          // ดึงข้อมูลจาก API เพื่อให้ได้ข้อมูลล่าสุดเสมอ (force refresh)
          let userData = await getUserByEmail(selectedAccount.email);

          if (userData) {
            setUserInfo(userData);
            setFormLogin({
              email: userData.email,
              password: userData.password || "", // Auto-fill password จาก API
            });

            console.log("✅ Auto-filled login data from API:", {
              email: userData.email,
              password: userData.password,
              hasPassword: !!userData.password,
            });

            // บันทึกข้อมูลใหม่ลง localStorage (อัปเดตข้อมูลเก่า)
            saveUserToStorage(userData);
          } else {
            // ถ้า API ไม่มีข้อมูล ใช้ข้อมูลจาก selectedAccount
            setUserInfo(selectedAccount);
            setFormLogin({
              email: selectedAccount.email,
              password: "",
            });
            console.log("🆕 Using selectedAccount data:", selectedAccount);
          }
        } catch (error) {
          console.error("Failed to fetch user info:", error);
          // ถ้า API error ลองใช้ localStorage
          const storageData = getUserFromStorage(selectedAccount.email);
          if (storageData) {
            setUserInfo(storageData);
            setFormLogin({
              email: storageData.email,
              password: storageData.password || "", // ใช้ password จาก storage ถ้ามี
            });
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserInfo();
  }, [selectedAccount]);

  const handleQuickLogin = async (account) => {
    setIsLoading(true);
    try {
      const result = await usersApi.quickLogin(
        account.email,
        account.rememberToken
      );
      if (result.success) {
        // บันทึก token
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userData", JSON.stringify(result.user));

        // อัพเดท recent account
        saveRecentAccount({
          email: account.email,
          fName: result.user.fName,
          role: result.user.role,
        });

        toast.success(result.message);
        onLoginSuccess();
      } else {
        toast.error("Quick login failed");
      }
    } catch (error) {
      console.error("Quick login error:", error);
      toast.error("Quick login failed. Please use password login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formLogin.email, formLogin.password);
      if (result.success) {
        // บันทึกข้อมูล user ลง localStorage สำหรับใช้ครั้งต่อไป
        if (result.user) {
          const userStorageData = {
            email: result.user.email,
            fName: result.user.fName,
            role: result.user.role,
            password: formLogin.password, // เก็บ password ที่ user พิมพ์
          };
          saveUserToStorage(userStorageData);

          // ดึง rememberToken ที่สร้างใน saveUserToStorage
          const storedUsers = JSON.parse(
            localStorage.getItem("userProfiles") || "[]"
          );
          const currentUser = storedUsers.find(
            (u) => u.email === result.user.email
          );

          // บันทึก account ลง recent accounts พร้อม rememberToken
          saveRecentAccount({
            email: formLogin.email,
            fName: result.user?.fName || userInfo?.fName || formLogin.email,
            role: result.user?.role || "user",
            rememberToken: currentUser?.rememberToken,
          });
        } else {
          // ถ้าไม่มี user data ใน result
          saveRecentAccount({
            email: formLogin.email,
            fName: userInfo?.fName || formLogin.email,
            role: "user",
          });
        }

        toast.success(result.message);
        onLoginSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 bg-gray-900">
      <div className="w-full max-w-md">
        <Card className="bg-white">
          {selectedAccount && (
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">😊</span>
                </div>
                <div>
                  <p className="font-semibold">
                    {userInfo?.fName ||
                      selectedAccount.fName ||
                      selectedAccount.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedAccount.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <CardHeader className="font-bold text-3xl border-none text-center">
            {selectedAccount ? `Welcome back` : "Sign in with Email"}
          </CardHeader>
          <CardHeader className="font-bold text-lg text-center text-gray-500">
            {selectedAccount
              ? userInfo?.fName ||
                selectedAccount.fName ||
                "Enter your credentials"
              : "Enter your credentials"}
          </CardHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col border text-xl border-none gap-4 justify-center items-center pt-6"
          >
            <div className="flex flex-col gap-1 w-full">
              <p className="text-lg text-gray-400">Email</p>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                value={formLogin.email}
                className="text-xl bg-gray-100 w-full rounded-xl px-4 py-1"
                required
                disabled={!!selectedAccount}
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <p className="text-lg text-gray-400">Password</p>
              <div className="relative">
                <input
                  type={isShowPassword ? "text" : "password"}
                  name="password"
                  onChange={handleChange}
                  value={formLogin.password}
                  className="text-xl bg-gray-100 w-full rounded-xl px-4 py-1"
                  required
                />
                <div
                  className="bottom-0 right-1 absolute z-50 cursor-pointer p-2"
                  onClick={() => setIsShowPassword(!isShowPassword)}
                >
                  {isShowPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="hover:cursor-pointer bg-black text-white hover:opacity-40 rounded-xl w-full px-4 py-3 duration-200 mt-4 select-none disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>

            <div className="text-center mt-3">
              <p className="text-sm text-gray-500">
                {selectedAccount
                  ? "Password has been auto-filled. Click Login to continue."
                  : "Please enter your credentials to login"}
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function Login() {
  const [showAccountPicker, setShowAccountPicker] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setShowAccountPicker(false);
  };

  const handleAddNew = () => {
    setSelectedAccount(null);
    setShowAccountPicker(false);
  };

  const handleBack = () => {
    setSelectedAccount(null);
    setShowAccountPicker(true);
  };

  const handleLoginSuccess = () => {
    // Reset states after successful login
    setSelectedAccount(null);
    setShowAccountPicker(true);
  };

  // ถ้าไม่มี recent accounts ให้ไปหน้า login form เลย
  useEffect(() => {
    const recentAccounts = getRecentAccounts();
    if (recentAccounts.length === 0) {
      setShowAccountPicker(false);
    }
  }, []);

  if (showAccountPicker) {
    return (
      <AccountPicker
        onSelectAccount={handleSelectAccount}
        onAddNew={handleAddNew}
      />
    );
  }

  return (
    <LoginForm
      selectedAccount={selectedAccount}
      onBack={handleBack}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
