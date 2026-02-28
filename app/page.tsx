"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import IntegrationsSection from "@/components/integrations-3";
import FAQsTwo from "@/components/faqs-2";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import HeroStats from "@/components/hero-stats";

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
  const { addItem, items } = useCart();
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
        
        {/* ADD THE NEW COMPONENT HERE */}
        <HeroStats />

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
                <div
                  key={p.id}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/70 p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-indigo-300/60 hover:shadow-[0_30px_80px_rgba(15,23,42,0.12)]"
                >
                <Link href={`/products/${p.id}`} className="block">
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
                {p.quantity > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-200/60">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full rounded-full border-zinc-200 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        addItem(p.id, 1, p.quantity);
                      }}
                    >
                      <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                      Add to cart
                      {(items[p.id] ?? 0) > 0 && ` (${items[p.id]})`}
                    </Button>
                  </div>
                )}
                </div>
              ))}
            </div>
          )}
        </section>

        <IntegrationsSection />
        <FAQsTwo />
      </main>
    </div>
  );
}