import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-fredoka" });

export const metadata: Metadata = {
  title: "Birbal · Stories you solve",
  description: "A witty storyteller for kids. Every story is a mystery you help solve.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fdf6ea",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fredoka.variable}>
      <body className="font-sans antialiased">
        <p className="pointer-events-none fixed inset-x-0 z-40 text-center text-xs font-medium text-ink/60" style={{ top: "max(2px, env(safe-area-inset-top))" }}>
          *demo version
        </p>
        {children}
      </body>
    </html>
  );
}
