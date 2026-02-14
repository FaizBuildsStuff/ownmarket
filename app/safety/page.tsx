"use client";

import { ShieldCheck, AlertTriangle, CheckCircle2, Lock } from "lucide-react";

export default function SafetyPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-4xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Safety & Security
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Trade safely on OwnMarket
        </h1>
        <p className="text-sm text-zinc-600">
          We prioritize your security with escrow, verified sellers, and 24/7
          dispute resolution.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h2 className="text-base font-semibold text-zinc-900">
              Mandatory escrow
            </h2>
          </div>
          <p className="text-xs text-zinc-600">
            All trades above $50 use our escrow system. Funds are held securely
            until both parties confirm completion. This protects buyers from
            scams and sellers from chargebacks.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-500" />
            <h2 className="text-base font-semibold text-zinc-900">
              Verified sellers
            </h2>
          </div>
          <p className="text-xs text-zinc-600">
            Every seller is verified through our Discord server. We check
            account age, trading history, and require identity confirmation
            before allowing listings.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5 text-rose-500" />
            <h2 className="text-base font-semibold text-zinc-900">
              Dispute resolution
            </h2>
          </div>
          <p className="text-xs text-zinc-600">
            Our team monitors every trade in real-time. If something goes wrong,
            open a ticket in Discord and we&apos;ll investigate within hours. We
            have a 99.4% successful resolution rate.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-zinc-900">
              Red flags to avoid
            </h2>
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-600">
            <li>• Never trade in DMs without staff present</li>
            <li>• Don&apos;t click links outside official channels</li>
            <li>• Verify staff tags before sending payment</li>
            <li>• Report suspicious behavior immediately</li>
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <h2 className="mb-3 text-base font-semibold text-zinc-900">
          How escrow works
        </h2>
        <ol className="space-y-2 text-xs text-zinc-600">
          <li className="flex gap-2">
            <span className="font-semibold text-zinc-900">1.</span>
            <span>
              Buyer initiates trade and funds are locked in escrow (you
              don&apos;t pay until confirmed)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-zinc-900">2.</span>
            <span>
              Seller delivers the product (Nitro key, boost activation, etc.)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-zinc-900">3.</span>
            <span>
              Buyer confirms receipt and funds are released to the seller
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-zinc-900">4.</span>
            <span>
              If there&apos;s a dispute, staff reviews evidence and makes a fair
              decision
            </span>
          </li>
        </ol>
      </section>
    </div>
  );
}
