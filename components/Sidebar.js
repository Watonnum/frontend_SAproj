"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  ShoppingBagIcon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useCategories } from "../hooks/useCategories";

const NavItem = ({
  href,
  icon: Icon,
  label,
  onClick,
  children,
  isDropdown,
  isExpanded,
  onToggle,
}) => {
  const pathname = usePathname();
  const active = pathname === href;

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${
          active
            ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
            : "brand-text-muted hover:text-[var(--color-primary)] hover:bg-black/5"
        }`}
      >
        <Icon className="w-4.5 h-4.5" />
        <span>{label}</span>
      </button>
    );
  }

  if (isDropdown) {
    return (
      <div>
        <button
          onClick={onToggle}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${
            active
              ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              : "brand-text-muted hover:text-[var(--color-primary)] hover:bg-black/5"
          }`}
        >
          <Icon className="w-4.5 h-4.5" />
          <span className="flex-1">{label}</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {isExpanded && children && (
          <div className="ml-6 mt-1 space-y-1">{children}</div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
          : "brand-text-muted hover:text-[var(--color-primary)] hover:bg-black/5"
      }`}
    >
      <Icon className="w-4.5 h-4.5" />
      <span>{label}</span>
    </Link>
  );
};

export default function Sidebar({ onLogout }) {
  const pathname = usePathname();
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const { categories, fetchCategories } = useCategories();

  // ดึงข้อมูล categories เมื่อ component mount
  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const toggleCategoryDropdown = () => {
    setIsCategoryExpanded(!isCategoryExpanded);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 shrink-0 border-r brand-border bg-[var(--color-surface)] px-4 py-4 gap-6 flex flex-col z-40">
      {/* Brand mini */}
      <div className="px-1">
        <div className="text-xs uppercase brand-text-muted tracking-wider">
          eCommerce
        </div>
      </div>

      {/* Management */}
      <div>
        <div className="text-[10px] uppercase brand-text-muted tracking-wider px-2 mb-2">
          Management
        </div>
        <div className="flex flex-col gap-1">
          <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/data" icon={ShoppingBag} label="Products" />
          <NavItem href="/accounts" icon={Users} label="Accounts" />
          <NavItem
            icon={ShoppingBagIcon}
            label="Categories"
            isDropdown={true}
            isExpanded={isCategoryExpanded}
            onToggle={toggleCategoryDropdown}
          >
            {/* Categories Dropdown Items */}
            <Link
              href="/categories"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                pathname === "/categories"
                  ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                  : "brand-text-muted hover:text-[var(--color-primary)] hover:bg-black/5"
              }`}
            >
              <span>All</span>
            </Link>
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category._id}`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === `/categories/${category._id}`
                    ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "brand-text-muted hover:text-[var(--color-primary)] hover:bg-black/5"
                }`}
              >
                <span>{category.name}</span>
              </Link>
            ))}
          </NavItem>
          <NavItem href="/cart" icon={ShoppingCart} label="Cart" />
        </div>
      </div>

      {/* Settings */}
      <div className="mt-auto">
        <div className="text-[10px] uppercase brand-text-muted tracking-wider px-2 mb-2">
          Setting
        </div>
        <div className="flex flex-col gap-1">
          <NavItem href="/settings" icon={Settings} label="Settings" />
          <NavItem icon={LogOut} label="Logout" onClick={handleLogout} />
        </div>
      </div>
    </aside>
  );
}
