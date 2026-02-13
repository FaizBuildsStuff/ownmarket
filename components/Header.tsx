"use client";

import { motion } from "framer-motion";
import {
  Grid3X3,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  MessageCircleMore,
} from "lucide-react";

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] as any },
  },
};

export function Header() {
  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="mb-6 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur md:mb-10 md:px-5"
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-zinc-900 text-xs font-semibold text-zinc-50 shadow-sm">
          OM
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-zinc-900">OwnMarket</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Discord marketplace for Nitro, boosts & more
          </p>
        </div>
      </div>

      <nav className="hidden items-center gap-5 text-xs font-medium text-zinc-500 md:flex">
        <button className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-zinc-900">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 text-[10px]">
            <Grid3X3 className="h-3 w-3 text-zinc-700" aria-hidden="true" />
          </span>
          Marketplace
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-zinc-900">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 text-[10px]">
            <ShieldCheck className="h-3 w-3 text-zinc-700" aria-hidden="true" />
          </span>
          Safety
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-zinc-900">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 text-[10px]">
            <Sparkles className="h-3 w-3 text-zinc-700" aria-hidden="true" />
          </span>
          Perks
        </button>
      </nav>

      <div className="flex items-center gap-2">
        <button className="hidden items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:text-zinc-900 md:inline-flex">
          <MessageCircle
            aria-hidden="true"
            className="h-3.5 w-3.5 text-zinc-700"
          />
          Support
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-50 shadow-sm transition-colors hover:bg-zinc-800">
          <MessageCircleMore
            aria-hidden="true"
            className="h-3.5 w-3.5 text-zinc-50"
          />
          Join Discord
        </button>
      </div>
    </motion.header>
  );
}

export default Header;

