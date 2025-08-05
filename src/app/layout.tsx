import type { Metadata } from "next";
import { Shantell_Sans, Lora } from "next/font/google";
import Script from "next/script";
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
     description: "The personal portfolio of Daniel Zhu, a PhD student in Biological Engineering at MIT, computational biologist and code enthusiast. Learn about my research work, side projects, and hobbies!",
     keywords: ["Daniel Zhu", "Biological Engineering", "MIT", "Computational Biology", "Software Development"],
     authors: [
          {
               name: "Daniel Zhu",
               url: "https://danielyzhu.com",
          },
     ],
     creator: "Daniel Zhu",
     openGraph: {
          title: "Daniel Zhu",
          description: "The personal portfolio of Daniel Zhu, a PhD student in Biological Engineering at MIT, computational biologist and code enthusiast. Learn about my research work, side projects, and hobbies!",
          url: "https://danielyzhu.com",
          siteName: "Daniel Zhu",
          images: [
               {
                    url: "/daniel_zhu.jpeg",
                    width: 1200,
                    height: 630,
                    alt: "Daniel Zhu",
               },
          ],
          locale: "en_US",
          type: "website",
     },
     twitter: {
          card: "summary_large_image",
          title: "Daniel Zhu",
          description: "The personal portfolio of Daniel Zhu, a PhD student in Biological Engineering at MIT, computational biologist and code enthusiast. Learn about my research work, side projects, and hobbies!",
          images: ["/daniel_zhu.jpeg"],
     },
};

export default function RootLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     return (
          <html lang="en">
               <body className={`${shantellSans.variable} ${lora.variable} antialiased`}>
                    {children}
                    <Script 
                         src="https://strava-embeds.com/embed.js" 
                         strategy="lazyOnload"
                         id="strava-embed-script"
                    />
               </body>
          </html>
     );
}
