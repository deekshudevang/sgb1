import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SGB Workflow Hub — Enterprise Operations Platform",
  description: "Real-time order lifecycle management, team coordination, and automated customer notifications for small business operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
