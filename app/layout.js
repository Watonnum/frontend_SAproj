import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "YaRuay Daily Store — ของครบ จบทุกวัน",
  description: "ของครบ จบทุกวัน | ยายรวย Daily Store (เอกชัย · บางบอน)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex">
          <Sidebar />
          <div className="flex-1 min-w-0 select-none">{children}</div>
        </div>
      </body>
    </html>
  );
}
