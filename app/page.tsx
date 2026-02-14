"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import IntegrationsSection from "@/components/integrations-3";

const heroVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.19, 1, 0.22, 1] as any },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.6,
      ease: [0.19, 1, 0.22, 1] as any,
    },
  },
};

const cardsContainer = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.4,
      duration: 0.8,
      ease: [0.19, 1, 0.22, 1] as any,
      when: "beforeChildren",
      staggerChildren: 0.12,
    },
  },
};

const card = {
  hidden: { opacity: 0, y: 26, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] as any },
  },
};

type ProductCard = {
  id: string;
  seller_id: string;
  name: string;
  price: number;
  quantity: number;
  description: string | null;
  discord_channel_link: string | null;
  seller_username?: string | null;
  seller_created_at?: string | null;
};

export default function Home() {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const spotlight = useMotionTemplate`radial-gradient(520px at ${cursorX}px ${cursorY}px, rgba(129,140,248,0.15), transparent 70%)`;

  useEffect(() => {
    if (!backdropRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".floating-orb",
        { y: 0, x: 0 },
        {
          y: 22,
          x: -18,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.18,
        }
      );

    }, backdropRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select(
          "id, seller_id, name, price, quantity, description, discord_channel_link"
        )
        .order("created_at", { ascending: false })
        .limit(6);

      const baseProducts = ((data as any) ?? []) as ProductCard[];

      if (baseProducts.length === 0) {
        setProducts([]);
        setProductsLoading(false);
        return;
      }

      const sellerIds = Array.from(
        new Set(baseProducts.map((p) => p.seller_id).filter(Boolean))
      );

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, created_at")
        .in("id", sellerIds);

      const profileMap = new Map<
        string,
        { username: string | null; created_at: string | null }
      >();

      (profileData as any)?.forEach(
        (p: { id: string; username: string | null; created_at: string | null }) =>
          profileMap.set(p.id, {
            username: p.username,
            created_at: p.created_at,
          })
      );

      const enriched = baseProducts.map((p) => {
        const prof = profileMap.get(p.seller_id);
        return {
          ...p,
          seller_username: prof?.username ?? null,
          seller_created_at: prof?.created_at ?? null,
        };
      });

      setProducts(enriched);
      setProductsLoading(false);
    };

    void fetchProducts();
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  return (
    <div
      className="relative flex min-h-[calc(100vh-120px)] items-center justify-center overflow-hidden"
      onPointerMove={handlePointerMove}
    >
      <main className="relative z-10 w-full max-w-6xl px-6 py-8 mx-auto lg:px-10 lg:py-12">
        <div className="flex flex-col gap-14 md:flex-row md:items-center md:justify-between lg:gap-20">
          {/* Left column: copy */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="max-w-xl space-y-8"
          >
            <motion.div
              variants={badgeVariants}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-1 text-xs font-medium text-zinc-700 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.45)]" />
              Live Discord marketplace
              <span className="h-[1px] w-5 bg-zinc-700" />
              Nitro · boosts · OG tags
            </motion.div>

            <div className="space-y-5">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
                Discord marketplace
                <span className="block bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-300 bg-clip-text text-transparent">
                  for everything you actually want.
                </span>
              </h1>

              <p className="max-w-lg text-balance text-sm leading-relaxed text-zinc-600 sm:text-base">
                Own and trade premium Discord perks in a single, curated
                marketplace. Nitro, boosts, vanity tags, server slots, and more
                — verified listings, instant delivery, and pricing that finally
                makes sense.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-50 shadow-[0_18px_45px_rgba(15,23,42,0.35)] transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50"
              >
                Browse marketplaces
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[11px] text-zinc-200 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-zinc-800 shadow-[0_16px_40px_rgba(15,23,42,0.16)] backdrop-blur transition-colors hover:border-zinc-300 hover:bg-white"
              >
                <ShieldCheck
                  className="h-4 w-4 text-indigo-500"
                  aria-hidden="true"
                />
                Join Discord
              </motion.button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-[10px] font-medium text-zinc-500">
                    <CheckCircle2
                      className="h-3.5 w-3.5 text-emerald-500"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="h-6 w-6 rounded-full border border-zinc-200 bg-zinc-200" />
                  <div className="h-6 w-6 rounded-full border border-zinc-900/80 bg-indigo-500" />
                </div>
                <span>2,900+ trusted members trading daily</span>
              </div>
              <span className="h-[1px] w-5 bg-zinc-700" />
              <span>Escrow-first · Anti-scam tooling · Live dispute team</span>
            </div>
          </motion.section>

          {/* Right column: animated cards */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={cardsContainer}
            className="relative mt-4 w-full max-w-md md:mt-0"
          >
            <motion.div
              variants={card}
              className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.15)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-zinc-900 text-xs font-semibold text-zinc-50">
                    OM
                  </span>
                  <div>
                    <p className="text-xs font-medium text-zinc-800">
                      OwnMarket · Nitro Board
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Live orderbook · updated in real time
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-500">
                  99.4% fill rate
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs text-zinc-700">
                <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-2.5">
                  <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                    Nitro Yearly
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Instant key · auto-delivery</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-zinc-900">
                      from $19.80
                    </p>
                    <p className="text-[10px] text-emerald-500">-32% vs Discord</p>
                  </div>
                </div>

                <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-2.5">
                  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                    Server boosts
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    <span>Level 3 stacks · 30d minimum</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-zinc-900">
                      from $0.95
                    </p>
                    <p className="text-[10px] text-zinc-500">24 offers live</p>
                  </div>
                </div>

                <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-2.5">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    OG handles
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Escrow-only · verified ownership</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-zinc-900">
                      from $42
                    </p>
                    <p className="text-[10px] text-emerald-500">
                      0 scam reports
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-[11px] text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Escrow is mandatory above $50</span>
                </div>
                <span>Last fill · 12s ago</span>
              </div>
            </motion.div>

            {/* Stacked subtle cards */}
            <motion.div
              variants={card}
              className="pointer-events-none absolute right-0 -top-6 hidden h-32 w-32 rounded-3xl border border-zinc-200 bg-gradient-to-br from-indigo-500/10 via-white to-violet-100 shadow-[0_18px_45px_rgba(15,23,42,0.15)] ring-1 ring-indigo-500/25 backdrop-blur-xl md:block"
            >
              <div className="flex h-full flex-col justify-between p-3 text-[11px] text-zinc-900">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                    Trust score
                  </p>
                  <p className="text-lg font-semibold text-zinc-900">4.9</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="h-1 w-5 rounded-full bg-emerald-400" />
                    <span className="h-1 w-4 rounded-full bg-emerald-300/80" />
                    <span className="h-1 w-3 rounded-full bg-emerald-300/60" />
                  </div>
                  <p className="text-[9px] text-zinc-500">3,100+ deals closed</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={card}
              className="pointer-events-none absolute bottom-0 left-4 hidden w-40 rounded-3xl border border-zinc-200 bg-white/90 p-3 text-[10px] text-zinc-700 shadow-[0_22px_55px_rgba(15,23,42,0.14)] backdrop-blur-xl md:block"
            >
              <p className="mb-1 text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                Live security
              </p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.35)]" />
                  Online
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] text-zinc-600">
                  human + AI
                </span>
              </div>
              <p className="mt-2 text-[9px] text-zinc-500">
                Every trade is monitored in real-time across Discord and on-site.
              </p>
            </motion.div>
          </motion.section>
        </div>

        {/* ================= MODERN PRODUCT SHOWCASE ================= */}
        <section className="relative mt-28 space-y-14">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-400 italic">
              Live marketplace
            </p>

            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">
              Curated listings.
              <span className="block italic bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 bg-clip-text text-transparent">
                Designed for modern Discord traders.
              </span>
            </h2>

            <p className="mx-auto max-w-xl text-sm text-zinc-500 italic">
              Real sellers. Transparent pricing. Escrow-first execution.
              Every listing is optimized for clarity and trust.
            </p>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <p className="text-center text-sm text-zinc-400 italic">
              Loading premium listings...
            </p>
          ) : products.length === 0 ? (
            <p className="text-center text-sm text-zinc-400 italic">
              No listings yet. Marketplace will activate soon.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/70 p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-indigo-300/60 hover:shadow-[0_30px_80px_rgba(15,23,42,0.12)]"
                >
                  {/* Glow Border Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-sky-400/10 to-emerald-400/10 blur-2xl" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold tracking-tight text-zinc-900 group-hover:text-indigo-600 transition">
                        {p.name}
                      </h3>

                      <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
                        ${p.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-sm italic text-zinc-500">
                      {p.description ||
                        "Premium Discord perk listed by a verified seller."}
                    </p>

                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>{p.quantity} in stock</span>

                      {p.discord_channel_link && (
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-medium text-indigo-600">
                          Discord channel
                        </span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-zinc-200/60 flex items-center justify-between text-xs">
                      <span className="italic text-zinc-400">
                        by{" "}
                        <span className="font-medium text-zinc-600 not-italic">
                          {p.seller_username || "unknown seller"}
                        </span>
                      </span>

                      <span className="flex items-center gap-1 text-emerald-500">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Escrow safe
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <IntegrationsSection />
      </main>
    </div>
  );
}