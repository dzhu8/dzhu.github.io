import type { Metadata } from "next";
import { Shantell_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

// Load Shantell Sans with Medium weight
const shantellSans = Shantell_Sans({
     subsets: ["latin"],
     weight: ["500"], // 500 represents Medium weight
     variable: "--font-shantell-sans",
});

// Load Geist Mono for content sections
const geistMono = Geist_Mono({
     subsets: ["latin"],
     variable: "--font-geist-mono",
});

export const metadata: Metadata = {
     title: "Daniel Zhu",
     description: "Personal website",
};

export default function RootLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     return (
          <html lang="en">
               <body className={`${shantellSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
          </html>
     );
}
