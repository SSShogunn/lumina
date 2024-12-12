import { Inter } from "next/font/google";
import "./globals.css";
import { cn, constructMetadata } from "@/lib/utils";
import NavBar from "../components/NavBar";
import Providers from "../components/Providers";
import { Toaster } from "@/components/ui/toaster";

import "react-loading-skeleton/dist/skeleton.css"
import "simplebar-react/dist/simplebar.min.css"

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata()

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body className={cn(inter.className, 'min-h-screen font-sans antialiased grainy')}>
          <Toaster />
          <NavBar />
          {children}
        </body>
      </Providers>
    </html>
  );
}
