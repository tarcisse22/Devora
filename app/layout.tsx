import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteConfig } from "@/lib/site";
import { Navbar } from "@/components/navigation/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SearchProvider } from "@/components/search/search-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import "@/styles/globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Learn, practice, and master Computer Science`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <AuthProvider>
        <SearchProvider>
          <a
            href="#main"
            className="sr-only z-[200] rounded-md bg-accent-200 px-4 py-2 text-sm font-medium text-[#14101f] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
