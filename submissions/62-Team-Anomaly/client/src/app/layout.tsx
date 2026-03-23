import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "WorkSync AI | Enterprise Support Engine",
  description: "Next-generation workspace resolution engine for enterprise operations.",
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${outfit.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script
          id="omnidimension-web-widget"
          src="https://omnidim.io/web_widget.js?secret_key=39109d83eaae732757c289e64bfa574d"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
