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
  Menu,
  X,
  Package,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronRight,
  Coffee,
  UtensilsCrossed,
  Sandwich,
  Soup,
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
  collapsed,
  active,
}) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left group ${
          active
            ? "bg-green-500 text-white shadow-lg"
            : "text-gray-600 hover:text-green-600 hover:bg-green-50"
        }`}
        title={collapsed ? label : ""}
      >
        <Icon
          className={`${collapsed ? "w-5 h-5" : "w-5 h-5"} flex-shrink-0`}
        />
        {!collapsed && <span className="truncate">{label}</span>}
      </button>
    );
  }

  if (isDropdown) {
    return (
      <div className="space-y-1">
        <button
          onClick={onToggle}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left group ${
            active
              ? "bg-green-500 text-white shadow-lg"
              : "text-gray-600 hover:text-green-600 hover:bg-green-50"
          }`}
          title={collapsed ? label : ""}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{label}</span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </>
          )}
        </button>
        {!collapsed && isExpanded && (
          <div className="ml-4 space-y-1 border-l-2 border-green-100 pl-4">
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
        active
          ? "bg-green-500 text-white shadow-lg"
          : "text-gray-600 hover:text-green-600 hover:bg-green-50"
      }`}
      title={collapsed ? label : ""}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
};

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const handleLogout = () => {
    // เพิ่ม logout logic ที่นี่
    console.log("Logout clicked");
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";
    if (name.includes("burger") || name.includes("chicken"))
      return UtensilsCrossed;
    if (name.includes("drink") || name.includes("beverage")) return Coffee;
    if (name.includes("dessert") || name.includes("sweet")) return Soup;
    return Sandwich;
  };

  const menuItems = [
    { href: "/pos", icon: LayoutDashboard, label: "POS System" },
    { href: "/data", icon: Package, label: "Products" },
    { href: "/categories", icon: BarChart3, label: "Categories" },
    { href: "/users-simple", icon: Users, label: "Users" },
    { href: "/orders", icon: FileText, label: "Orders" },
  ];

  return (
    <div
      className={`h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">MIT POS</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-2">
        {/* Main Menu */}
        {!collapsed && (
          <div className="text-xs uppercase text-gray-400 tracking-wider px-1 mb-3 font-semibold">
            Main Menu
          </div>
        )}

        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed}
              active={pathname === item.href}
            />
          ))}
        </div>

        {/* Categories Dropdown */}
        {!collapsed && (
          <div className="pt-4">
            <div className="text-xs uppercase text-gray-400 tracking-wider px-1 mb-3 font-semibold">
              Categories
            </div>
          </div>
        )}

        <NavItem
          icon={ShoppingBag}
          label="All Categories"
          isDropdown
          isExpanded={categoriesExpanded}
          onToggle={() => setCategoriesExpanded(!categoriesExpanded)}
          collapsed={collapsed}
          active={pathname.startsWith("/categories")}
        >
          <Link
            href="/categories"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>All Categories</span>
          </Link>
          {categories.map((category) => {
            const CategoryIcon = getCategoryIcon(category.name);
            return (
              <Link
                key={category._id}
                href={`/categories/${category._id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === `/categories/${category._id}`
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                }`}
              >
                <CategoryIcon className="w-4 h-4" />
                <span className="truncate">{category.name}</span>
              </Link>
            );
          })}
        </NavItem>
      </div>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        {!collapsed && (
          <div className="text-xs uppercase text-gray-400 tracking-wider px-1 mb-3 font-semibold">
            Account
          </div>
        )}
        <div className="space-y-1">
          <NavItem
            href="/settings"
            icon={Settings}
            label="Settings"
            collapsed={collapsed}
            active={pathname === "/settings"}
          />
          <NavItem
            icon={LogOut}
            label="Logout"
            onClick={handleLogout}
            collapsed={collapsed}
          />
        </div>
      </div>
    </div>
  );
}
