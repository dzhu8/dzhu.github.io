import type { Metadata } from "next";
import { Shantell_Sans, Lora } from "next/font/google";
import "./globals.css";

// Load Shantell Sans with Medium weight
const shantellSans = Shantell_Sans({
     subsets: ["latin"],
     weight: ["500"], // 500 represents Medium weight
     variable: "--font-shantell-sans",
});

// Load Lora for content sections
const lora = Lora({
     subsets: ["latin"],
     weight: ["400", "500", "600", "700"], // Multiple weights for flexibility
     variable: "--font-lora",
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
               <body className={`${shantellSans.variable} ${lora.variable} antialiased`}>{children}</body>
          </html>
     );
}
