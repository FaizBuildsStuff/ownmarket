"use client";

import Link from "next/link";
import {
  MessageCircleMore,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  FileQuestion,
  ArrowRight,
} from "lucide-react";

const supportTopics = [
  {
    icon: MessageCircleMore,
    title: "Join our Discord",
    description: "Get instant help from staff and the community. Open a ticket for disputes or account issues.",
    href: "/discord",
    label: "Join Discord",
  },
  {
    icon: HelpCircle,
    title: "Contact us",
    description: "Send a message and we'll get back to you. Use this for non-urgent questions or feedback.",
    href: "/contact",
    label: "Contact form",
  },
  {
    icon: ShieldCheck,
    title: "Trading & disputes",
    description: "Learn how escrow works, how to report a problem, and how we resolve disputes.",
    href: "/safety",
    label: "Safety guide",
  },
  {
    icon: CreditCard,
    title: "Payments & delivery",
    description: "We don't process payments. Trades are between you and the seller; we recommend clear terms and trusted methods.",
    href: "/safety",
    label: "Safety guide",
  },
  {
    icon: FileQuestion,
    title: "FAQs",
    description: "Quick answers about verification, safety, and how OwnMarket works.",
    href: "/#faq",
    label: "View FAQs",
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-4xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Customer support
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          How can we help?
        </h1>
        <p className="text-sm text-zinc-600">
          Find answers, open a ticket in Discord, or send us a message. We’re here to help with trading, account issues, and disputes.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {supportTopics.map((topic) => {
          const Icon = topic.icon;
          return (
            <Link
              key={topic.title}
              href={topic.href}
              className="group flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:border-indigo-200 hover:shadow-[0_18px_45px_rgba(99,102,241,0.08)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-zinc-900">{topic.title}</h2>
                <p className="mt-1 text-xs text-zinc-600">{topic.description}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:underline">
                  {topic.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Quick links</h2>
        <ul className="mt-3 space-y-2 text-xs">
          <li>
            <Link href="/contact" className="font-medium text-indigo-600 hover:underline">
              Contact form
            </Link>
            {" "}
            — Send a message and we’ll reply via email or Discord.
          </li>
          <li>
            <Link href="/discord" className="font-medium text-indigo-600 hover:underline">
              Join Discord
            </Link>
            {" "}
            — Fastest way to get help; open a support ticket there.
          </li>
          <li>
            <Link href="/safety" className="font-medium text-indigo-600 hover:underline">
              Safety & disputes
            </Link>
            {" "}
            — Escrow, verified sellers, and dispute resolution.
          </li>
        </ul>
      </section>
    </div>
  );
}
