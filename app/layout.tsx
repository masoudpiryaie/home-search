import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";

const persianFont = localFont({
  src: [
    {
      path: "../assets/fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/Vazirmatn-SemiBold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/Vazirmatn-Bold.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-persian",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HomeRent",
  description: "Property rental and sale platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={persianFont.variable}>
      <body className="pb-20 md:pb-0">
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
