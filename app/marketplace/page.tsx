"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, seller_id, name, price, quantity, description, discord_channel_link")
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
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Marketplace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Browse all listings
        </h1>
        <p className="text-sm text-zinc-600">
          Discover Nitro, boosts, OG handles, and more from verified sellers.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading marketplace...</p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-900">No listings yet</p>
          <p className="mt-1 text-xs text-zinc-500">
            Sellers will start posting here soon. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 text-xs text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-indigo-200/80 hover:shadow-[0_22px_55px_rgba(15,23,42,0.12)]"
            >
              <Link href={`/products/${p.id}`} className="block">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-semibold text-zinc-900">
                    {p.name}
                  </p>
                  <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-50">
                    ${p.price.toFixed(2)}
                  </span>
                </div>
                <p className="line-clamp-2 text-[11px] text-zinc-500">
                  {p.description || "Premium Discord perk from a verified seller."}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>{p.quantity} in stock</span>
                  {p.discord_channel_link && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
                      Discord channel
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="truncate">
                    by{" "}
                    <span className="font-medium text-zinc-600">
                      {p.seller_username || "unknown seller"}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-500">
                    <ShieldCheck className="h-3 w-3" />
                    Escrow safe
                  </span>
                </div>
              </Link>
              {p.quantity > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-100">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full rounded-full border-zinc-200 text-[11px]"
                    onClick={() => addItem(p.id, 1, p.quantity)}
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
    </div>
  );
}
