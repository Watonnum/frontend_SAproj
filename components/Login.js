"use client";

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Card, { CardHeader } from "./Card";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { toast } from "sonner";

export default function Login() {
  const [formLogin, setFormLogin] = useState({ email: "", password: "" });
  const [isShowPassword, setIsShowPassword] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(formLogin.email, formLogin.password);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full max-w-md">
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
                className="text-xl bg-gray-100 w-full rounded-xl px-4 py-1"
                required
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
              className="hover:cursor-pointer bg-black text-white hover:opacity-40 rounded-xl w-full px-4 py-2 duration-200 mt-4 select-none"
            >
              Login
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
