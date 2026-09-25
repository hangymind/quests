import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "澄问 · 问卷平台", description: "轻量、私有、专注的问卷平台" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
