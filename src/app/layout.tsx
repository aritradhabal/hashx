import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./index.css";
import Navbar from "@/custom-components/navbar/Navbar";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/Providers/Providers";
import "@rainbow-me/rainbowkit/styles.css";

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

export const metadata: Metadata = {
  title: "HashX",
  description: "Prediction Market on Hedera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.className} antialiased`}
      >
        <Providers>
          <Navbar />
          <div className="h-screen w-screen pt-20 pb-10">{children}</div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
