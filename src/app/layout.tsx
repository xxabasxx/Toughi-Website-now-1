import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "طوقی | بازار آنلاین پرندگان و حیوانات خانگی",
  description:
    "طوقی؛ بازار تخصصی و لوکس خرید و فروش کبوتر، پرندگان زینتی و حیوانات خانگی در سراسر ایران. امن، سریع و بدون واسطه.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0c09",
  width: "device-width",
  initialScale: 1,
};

const themeBootstrap = `try{document.documentElement.dataset.theme=localStorage.getItem("tooghi_theme")||"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gulzar&family=Lalezar&family=Vazirmatn:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-cream antialiased">{children}</body>
    </html>
  );
}
