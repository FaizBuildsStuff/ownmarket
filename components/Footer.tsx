"use client";

import Link from "next/link";
import { Grid3X3, ShieldCheck, Sparkles, MessageCircleMore } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10 lg:py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-zinc-900 text-xs font-semibold text-zinc-50">
                OM
              </div>
              <p className="text-sm font-semibold text-zinc-900">OwnMarket</p>
            </div>
            <p className="text-xs text-zinc-500">
              Discord marketplace for Nitro, boosts, OG handles & more.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-900">Marketplace</p>
            <nav className="space-y-2 text-xs text-zinc-500">
              <Link
                href="/marketplace"
                className="block hover:text-zinc-900 transition-colors"
              >
                Browse listings
              </Link>
              <Link
                href="/cart"
                className="block hover:text-zinc-900 transition-colors"
              >
                Your cart
              </Link>
              <Link
                href="/perks"
                className="block hover:text-zinc-900 transition-colors"
              >
                Available perks
              </Link>
              <Link
                href="/dashboard"
                className="block hover:text-zinc-900 transition-colors"
              >
                Seller dashboard
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-900">Safety & support</p>
            <nav className="space-y-2 text-xs text-zinc-500">
              <Link
                href="/safety"
                className="block hover:text-zinc-900 transition-colors"
              >
                Safety guide
              </Link>
              <Link
                href="/support"
                className="block hover:text-zinc-900 transition-colors"
              >
                Customer support
              </Link>
              <Link
                href="/contact"
                className="block hover:text-zinc-900 transition-colors"
              >
                Contact us
              </Link>
              <Link
                href="/discord"
                className="block hover:text-zinc-900 transition-colors"
              >
                Join Discord
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-900">Quick links</p>
            <nav className="space-y-2 text-xs text-zinc-500">
              <Link
                href="/"
                className="block hover:text-zinc-900 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors"
              >
                <Grid3X3 className="h-3 w-3" />
                Marketplace
              </Link>
              <Link
                href="/safety"
                className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors"
              >
                <ShieldCheck className="h-3 w-3" />
                Safety
              </Link>
              <Link
                href="/perks"
                className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                Perks
              </Link>
              <Link
                href="/discord"
                className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors"
              >
                <MessageCircleMore className="h-3 w-3" />
                Discord
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} OwnMarket. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/safety" className="hover:text-zinc-900 transition-colors">
              Terms
            </Link>
            <Link href="/safety" className="hover:text-zinc-900 transition-colors">
              Privacy
            </Link>
            <Link href="/support" className="hover:text-zinc-900 transition-colors">
              Support
            </Link>
            <Link href="/contact" className="hover:text-zinc-900 transition-colors">
              Contact
            </Link>
            <Link href="/discord" className="hover:text-zinc-900 transition-colors">
              Discord
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
