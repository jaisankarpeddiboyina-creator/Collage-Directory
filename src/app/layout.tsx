/*import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseMetadata: Metadata = {
  title: "Engineering College Directory | Verified Official Colleges",
  description:
    "Browse verified engineering colleges with official websites, ownership type, and district-wise filters.",
  keywords: ["engineering colleges", "directory", "verified", "official websites", "education"],
  authors: [{ name: "College Directory" }],
  icons: {



    icon: '/favicon.ico',
    shortcut : '/favicon.ico',
    apple:'/apple-touch-icon.png', 




  },
  openGraph: {
    title: "Engineering College Directory | Verified Official Colleges",
    description:
      "Browse verified engineering colleges with official websites, ownership type, and district-wise filters.",
    url: "/",
    siteName: "Engineering College Directory",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering College Directory | Verified Official Colleges",
    description:
      "Browse verified engineering colleges with official websites, ownership type, and district-wise filters.",
  },
};

// Provide dynamic metadata at the layout level so client pages can remain "use client".
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const raw = searchParams?.district;
  const district = Array.isArray(raw) ? raw[0] : raw ?? '';
  const trimmed = (district || '').toString().trim();

  if (trimmed) {
    return {
      title: `Engineering Colleges in ${trimmed} | Verified Directory`,
      description: `Browse verified engineering colleges in ${trimmed} with official websites, ownership type, and district-wise filters.`,
    };
  }

  return baseMetadata;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
*/

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Engineering College Directory | Verified Official Colleges",
  description:
    "Browse verified engineering colleges with official websites, ownership type, and district-wise filters.",
  keywords: [
    "engineering colleges",
    "directory",
    "verified",
    "official websites",
    "education",
  ],
  authors: [{ name: "College Directory" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
