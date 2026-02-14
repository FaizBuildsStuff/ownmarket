import type { Metadata, Viewport } from "next";
import type React from "react";
import { Roboto_Condensed } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ownmarket.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OwnMarket — Discord Marketplace for Nitro, Boosts & OG Handles",
    template: "%s | OwnMarket",
  },
  description:
    "Buy and sell Discord Nitro, server boosts, OG usernames, and vanity tags in one trusted marketplace. Verified sellers, escrow protection, and instant delivery.",
  keywords: [
    "Discord marketplace",
    "Discord Nitro",
    "Discord boosts",
    "OG usernames",
    "vanity tags",
    "Discord trading",
    "escrow",
    "verified sellers",
    "Nitro gift",
    "server boost",
  ],
  authors: [{ name: "OwnMarket", url: siteUrl }],
  creator: "OwnMarket",
  publisher: "OwnMarket",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "OwnMarket",
    title: "OwnMarket — Discord Marketplace for Nitro, Boosts & OG Handles",
    description:
      "Buy and sell Discord Nitro, server boosts, OG usernames, and vanity tags in one trusted marketplace. Verified sellers, escrow protection.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "OwnMarket — Discord marketplace for Nitro, boosts & more",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OwnMarket — Discord Marketplace for Nitro, Boosts & OG Handles",
    description:
      "Buy and sell Discord Nitro, boosts, OG usernames, and vanity tags. Verified sellers, escrow protection, instant delivery.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "marketplace",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OwnMarket",
    description:
      "Discord marketplace for Nitro, server boosts, OG usernames, and vanity tags. Verified sellers, escrow protection.",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/marketplace?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <body
        className={`${robotoCondensed.variable} font-sans antialiased bg-white text-zinc-900 overflow-x-hidden`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <header className="bg-white">
              <div className="mx-auto w-full max-w-6xl px-6 py-4 lg:px-10 lg:py-5">
                <Header />
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
