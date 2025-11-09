"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function InitialLoading({
  isLoading,
  children,
  minLoadingTime = 1000,
}) {
  const [showContent, setShowContent] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Timer สำหรับเวลาขั้นต่ำในการแสดง loading
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [minLoadingTime]);

  useEffect(() => {
    // แสดง content เมื่อข้อมูลโหลดเสร็จและเวลาขั้นต่ำผ่านไปแล้ว
    if (!isLoading && minTimeElapsed) {
      setShowContent(true);
    }
  }, [isLoading, minTimeElapsed]);

  if (!showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <div className="mt-4 space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              กำลังโหลดข้อมูล
            </h2>
            <p className="text-sm text-gray-600">
              กรุณารอสักครู่ ระบบกำลังเตรียมข้อมูลให้คุณ...
            </p>
          </div>

          {/* Skeleton loading bars */}
          <div className="mt-8 space-y-3 max-w-sm mx-auto">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
