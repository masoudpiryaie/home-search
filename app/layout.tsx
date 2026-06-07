import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { GoogleAnalytics } from "@next/third-parties/google";
import EnableNotificationsModal from "@/app/components/EnableNotificationsModal";
import PushNotificationListener from "./components/PushNotificationListener";
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
const gaId = process.env.NEXT_PUBLIC_GA_ID;
const gtmContent = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  title: "HomeRent",
  description: "Property rental and sale platform",
  verification: gtmContent
    ? {
        google: gtmContent,
      }
    : undefined,
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
          <EnableNotificationsModal />
          <PushNotificationListener />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
