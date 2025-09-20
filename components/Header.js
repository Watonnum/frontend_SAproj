"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, MapPin, Coins } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[var(--color-surface)] shadow-sm border-b brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
                <Coins className="w-5 h-5 text-[var(--color-on-primary)]" />
              </div>
              <div className="leading-tight">
                <div className="text-lg font-extrabold tracking-tight text-[var(--color-primary)]">
                  ยายรวย
                </div>
                <div className="text-xs brand-text-muted flex items-center gap-1">
                  <span>Daily Store</span>
                  <span>·</span>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>เอกชัย · บางบอน</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className="brand-text-muted hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/data"
              className="brand-text-muted hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              การจัดการ
            </Link>
            <Link
              href="/shop"
              className="brand-text-muted hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              เลือกสินค้า
            </Link>
            <Link
              href="/create"
              className="bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:brightness-110 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              + เพิ่มข้อมูล
            </Link>
            <Link
              href="/cart"
              className="ml-2 inline-flex items-center justify-center h-10 w-10 rounded-lg border brand-border brand-text-muted hover:text-[var(--color-primary)] hover:bg-black/5"
              aria-label="ตะกร้าสินค้า"
              title="ตะกร้าสินค้า"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="brand-text-muted hover:text-[var(--color-primary)] p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t brand-border py-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="brand-text-muted hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/data"
                className="brand-text-muted hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                การจัดการ
              </Link>
              <Link
                href="/shop"
                className="brand-text-muted hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                เลือกสินค้า
              </Link>
              <Link
                href="/create"
                className="bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:brightness-110 px-4 py-2 rounded-md text-sm font-medium transition-colors w-fit"
                onClick={() => setIsMenuOpen(false)}
              >
                + เพิ่มข้อมูล
              </Link>
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 brand-text-muted hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors w-fit"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-4 h-4" />
                ตะกร้าสินค้า
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
