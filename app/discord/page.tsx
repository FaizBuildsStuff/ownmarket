"use client";

import { MessageCircleMore, ShieldCheck, Users, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DiscordPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-4xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
      <header className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600">
          <MessageCircleMore className="h-8 w-8 text-white" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Join Our Discord
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Trade with 2,900+ members
          </h1>
          <p className="mx-auto max-w-lg text-sm text-zinc-600">
            OwnMarket&apos;s Discord server is where all trades happen. Join to
            access listings, escrow services, and 24/7 support.
          </p>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            <h2 className="text-base font-semibold text-zinc-900">
              Active community
            </h2>
          </div>
          <p className="text-xs text-zinc-600">
            2,900+ verified traders buying and selling daily. Real-time
            listings, instant notifications, and direct seller contact.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h2 className="text-base font-semibold text-zinc-900">
              Staff support
            </h2>
          </div>
          <p className="text-xs text-zinc-600">
            Human moderators + AI monitoring every trade. Dispute resolution
            within hours, not days. 99.4% successful resolution rate.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-sky-500" />
            <h2 className="text-base font-semibold text-zinc-900">
              Instant access
            </h2>
          </div>
          <p className="text-xs text-zinc-600">
            Join and start trading immediately. No waiting periods, no
            complicated verification. Just sign up and browse listings.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <h2 className="mb-2 text-xl font-semibold text-zinc-900">
          Ready to start trading?
        </h2>
        <p className="mb-6 text-sm text-zinc-600">
          Join our Discord server to access the full marketplace, escrow
          services, and seller tools.
        </p>
        <Button
          size="lg"
          className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
          asChild
        >
          <Link
            href="https://discord.gg/ownmarket"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircleMore className="mr-2 h-4 w-4" />
            Join Discord Server
          </Link>
        </Button>
        <p className="mt-4 text-xs text-zinc-500">
          By joining, you agree to our trading rules and safety guidelines.
        </p>
      </section>
    </div>
  );
}
