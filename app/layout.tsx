import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "./providers";
import "@/lib/env"; // Validate environment variables at startup

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "Surf Work - Real surf jobs, no spam",
  description:
    "The handcrafted job board for surf coaches and surf camps. Real work, no spam, no recruiters, no paywalls.",
  keywords: ["surf jobs", "surf coach", "surf camp", "surf instructor"],
  authors: [{ name: "Surf Work" }],
  openGraph: {
    title: "Surf Work - Real surf jobs, no spam",
    description:
      "The handcrafted job board for surf coaches and surf camps. Real work, no spam, no recruiters, no paywalls.",
    url: "https://surfwork.app",
    siteName: "Surf Work",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen flex flex-col bg-background">
        {/* Paper grain texture overlay */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.015] z-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <Providers>
          <Navbar />

          <main className="flex-1 relative z-0">
            {children}
          </main>

          <Footer />
        </Providers>
      </body>
    </html>
  );
}
