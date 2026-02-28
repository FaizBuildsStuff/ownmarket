"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardSpotlight } from "@/components/ui/card-spotlight";

type ProductCard = {
  id: string;
  seller_id: string;
  name: string;
  price: number;
  quantity: number;
  description: string | null;
  discord_channel_link: string | null;
  seller_username?: string | null;
};

export default function MarketplacePage() {
  const { addItem, items } = useCart();
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);


  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select(
          "id, seller_id, name, price, quantity, description, discord_channel_link"
        )
        .order("created_at", { ascending: false });

      const baseProducts = ((data as any) ?? []) as ProductCard[];

      if (baseProducts.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const sellerIds = Array.from(
        new Set(baseProducts.map((p) => p.seller_id).filter(Boolean))
      );

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", sellerIds);

      const profileMap = new Map<string, string | null>();
      (profileData as any)?.forEach(
        (p: { id: string; username: string | null }) =>
          profileMap.set(p.id, p.username)
      );

      const enriched = baseProducts.map((p) => ({
        ...p,
        seller_username: profileMap.get(p.seller_id) ?? null,
      }));

      setProducts(enriched);
      setLoading(false);
    };

    void fetchProducts();
  }, []);

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-6xl flex-col gap-12 px-6 py-12 lg:px-10">

      {/* HEADER */}
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">
          Marketplace
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
          Discover Digital Assets
          <span className="block bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 bg-clip-text text-transparent">
            Premium Discord Perks
          </span>
        </h1>
        <p className="max-w-xl text-sm text-zinc-600">
          Browse Nitro, boosts, OG handles, and more from trusted sellers.
          All trades happen directly via Discord.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading marketplace...</p>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-900">
            No listings yet
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Sellers will start posting here soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <CardSpotlight
              key={p.id}
              className="relative rounded-3xl bg-zinc-900 p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.25)]"
            >
              <Link
                href={`/products/${p.id}`}
                className="relative z-20 block space-y-4"
              >
                {/* Title + Price */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">
                    {p.name}
                  </h3>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                    ${p.price.toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                <p className="line-clamp-2 text-sm text-zinc-300">
                  {p.description ||
                    "Premium Discord digital asset from a trusted seller."}
                </p>

                {/* Stock + Escrow */}
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>
                    {p.quantity > 0
                      ? `${p.quantity} in stock`
                      : "Out of stock"}
                  </span>

                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Escrow safe
                  </span>
                </div>

                {/* Seller */}
                <div className="text-xs text-zinc-400">
                  by{" "}
                  <span className="font-medium text-zinc-200">
                    {p.seller_username || "unknown seller"}
                  </span>
                </div>
              </Link>

              {/* CTA */}
              {p.quantity > 0 && (
                <div className="relative z-20 mt-6">
                  <Button
                    size="sm"
                    className="w-full rounded-full bg-white text-black hover:bg-indigo-400 hover:text-white transition"
                    onClick={() => addItem(p.id, 1, p.quantity)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to cart
                    {(items[p.id] ?? 0) > 0 && (
                      <span className="ml-2 text-xs opacity-70">
                        ({items[p.id]})
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </CardSpotlight>
          ))}
        </div>
      )}
    </div>
  );
}
