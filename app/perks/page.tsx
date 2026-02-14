"use client";

import { Sparkles, Gift, Star, Zap } from "lucide-react";

export default function PerksPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-4xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Discord Perks
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          What you can buy & sell
        </h1>
        <p className="text-sm text-zinc-600">
          OwnMarket specializes in premium Discord perks at competitive prices.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <h2 className="text-base font-semibold text-zinc-900">
              Discord Nitro
            </h2>
          </div>
          <p className="text-xs text-zinc-600">
            Monthly and yearly Nitro subscriptions, often 20-35% cheaper than
            Discord&apos;s official pricing. Instant key delivery, global
            region support, and verified sellers only.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-sky-500" />
            <h2 className="text-base font-semibold text-zinc-900">
              Server Boosts
            </h2>
          </div>
          <p className="text-xs text-zinc-700">
            Level 2 and Level 3 server boost packages. Minimum 30-day
            commitments, bulk discounts available, and instant activation
            through verified boost providers.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-emerald-500" />
            <h2 className="text-base font-semibold text-zinc-900">
              OG Handles
            </h2>
          </div>
          <p className="text-xs text-zinc-600">
            Rare Discord usernames (short, no numbers, no separators). All
            handles are escrow-only, ownership verified before listing, and
            transferred securely through Discord&apos;s official system.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <Gift className="h-5 w-5 text-rose-500" />
            <h2 className="text-base font-semibold text-zinc-900">
              Server Slots & More
            </h2>
          </div>
          <p className="text-xs text-zinc-600">
            Additional server slots, custom emoji packs, verified server
            badges, and other premium Discord features. New categories added
            regularly based on community demand.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <h2 className="mb-3 text-base font-semibold text-zinc-900">
          Why buy here?
        </h2>
        <ul className="space-y-2 text-xs text-zinc-600">
          <li className="flex gap-2">
            <span className="font-semibold text-zinc-900">•</span>
            <span>
              <strong>Better prices:</strong> Save 20-40% vs. Discord&apos;s
              official rates
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-zinc-900">•</span>
            <span>
              <strong>Instant delivery:</strong> Most items activate within
              minutes
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-zinc-900">•</span>
            <span>
              <strong>Verified sellers:</strong> Every seller is checked and
              monitored
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-zinc-900">•</span>
            <span>
              <strong>Escrow protection:</strong> Your money is safe until you
              confirm receipt
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
