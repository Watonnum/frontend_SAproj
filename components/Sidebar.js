"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";

const NavItem = ({ href, icon: Icon, label, onClick }) => {
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
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
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
          <NavItem href="/customers" icon={Users} label="Customers" />
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
