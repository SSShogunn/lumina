import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NavBar from "../components/NavBar";
import Providers from "../components/Providers";

import "react-loading-skeleton/dist/skeleton.css"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lumina",
  description: "You PDF Ai",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body className={cn(inter.className, 'min-h-screen font-sans antialiased grainy')}>
          <NavBar />
          {children}
        </body>
      </Providers>
    </html>
  );
}
