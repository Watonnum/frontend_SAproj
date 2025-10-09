"use client";

import "./globals.css";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });
import Card, { CardHeader, CardTitle, CardContent } from "../components/Card";

export default function RootLayout({ children }) {
  const [show, setShow] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [formLogin, setFormLogin] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    console.log("[useEffect] - status show ==> ", show);
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formLogin);

    if (validateLogin()) {
      return "now showing";
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
    if (
      formLogin?.email === "ipae.wo@gmail.com" &&
      formLogin?.password === "poopae2524"
    ) {
      setShow(true);
      // delete query parameters -> clean url
      window.history.replaceState({}, "", "/");
    }

    console.log("[validateLogin] - status show ==> ", show);
    return;
  };

  return (
    <html lang="th">
      <body>
        <div className="min-h-screen flex">
          <div className={`${show ? "" : "hidden"} flex`}>
            <Sidebar />
          </div>
          <div
            className={`min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
              show ? "hidden" : ""
            }`}
          >
            <div className="py-32 select-none">
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
                  <div className="flex flex-col gap-1">
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
                  <div className="flex flex-col gap-1">
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
                    className="hover:cursor-pointer bg-black text-white hover:opacity-40 rounded-xl w-full px-4 py-2 duration-200 mt-4"
                  >
                    Login
                  </button>
                </form>
              </Card>
              {/* Login Component */}
            </div>
          </div>
          <div className={`flex-1 min-w-0 select-none ${show ? "" : "hidden"}`}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
