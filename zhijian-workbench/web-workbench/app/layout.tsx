import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "小纸笺 · 工作台",
  description: "幼师的智能工作台",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
