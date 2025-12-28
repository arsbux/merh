import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#FDDF14",
};

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Ventra - Sell Anything. From Anywhere.",
  description: "Build a global storefront in 60 seconds. Accept worldwide payments and withdraw to any option based on your location.",
  manifest: "/manifest.json",
  icons: {
    icon: "/ventra-logo.svg",
    apple: "/ventra-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${manrope.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
