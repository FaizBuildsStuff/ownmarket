"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { fetchCartProductsAction } from "@/app/actions";
import { useCart } from "@/context/CartContext";
import {
  ShoppingCart,
  Trash2,
  MessageSquare,
  Minus,
  Plus,
  ArrowLeft,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";

type CartProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  seller_id: string;
};

type SellerProfile = {
  id: string;
  username: string | null;
  discord_username: string | null;
  discord_id: string | null;
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, itemCount } = useCart();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [profiles, setProfiles] = useState<Map<string, SellerProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const productIds = Object.keys(items);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      setProfiles(new Map());
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const cartProductsData = await fetchCartProductsAction(productIds);

        const prods: CartProduct[] = cartProductsData.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          quantity: p.quantity,
          seller_id: p.sellerId,
        }));

        setProducts(prods);

        const map = new Map<string, SellerProfile>();
        cartProductsData.forEach((p) => {
          if (p.sellerId && !map.has(p.sellerId)) {
            map.set(p.sellerId, {
              id: p.sellerId,
              username: p.sellerUsername,
              discord_username: p.sellerDiscordUsername,
              discord_id: p.sellerDiscordId,
            });
          }
        });

        setProfiles(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [productIds.join(",")]);

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.from(".cart-item", {
          opacity: 0,
          x: -20,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out"
        });
        gsap.from(".summary-card", {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: 0.3
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const rows = products
    .map((p) => ({ ...p, cartQty: items[p.id] ?? 0 }))
    .filter((r) => r.cartQty > 0);

  const subtotal = rows.reduce((sum, r) => sum + r.price * r.cartQty, 0);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-black" />
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAFAFA] text-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">

        {/* HEADER */}
        <header className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/marketplace" className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
              <ArrowLeft className="h-3 w-3" /> Continue Shopping
            </Link>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Your Selection</h1>
          </div>
          <div className="text-sm font-medium text-zinc-500">
            {itemCount} items ready for acquisition
          </div>
        </header>

        {itemCount === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-zinc-200 bg-white py-32 text-center shadow-sm">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50">
              <ShoppingCart className="h-10 w-10 text-zinc-200" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Your cart is empty</h2>
            <p className="mb-8 text-zinc-500 max-w-xs">Looks like you haven't added any premium assets to your cart yet.</p>
            <Button asChild className="rounded-full px-8 py-6 text-sm font-bold uppercase tracking-widest">
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">

            {/* ITEMS LIST */}
            <div className="space-y-6">
              {rows.map((row) => {
                const seller = profiles.get(row.seller_id);
                return (
                  <div key={row.id} className="cart-item group relative overflow-hidden rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">

                      {/* PRODUCT ICON/IMAGE PLACEHOLDER */}
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300 transition-colors group-hover:bg-zinc-100 group-hover:text-zinc-400">
                        <ShoppingCart className="h-8 w-8" />
                      </div>

                      {/* DETAILS */}
                      <div className="flex flex-grow flex-col justify-center">
                        <div className="mb-1 flex items-center justify-between">
                          <h3 className="text-lg font-bold tracking-tight">{row.name}</h3>
                          <span className="text-lg font-bold">${(row.price * row.cartQty).toLocaleString()}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-zinc-400">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            By <span className="text-zinc-900">{seller?.discord_username || seller?.username || "Verified Seller"}</span>
                          </div>
                          <div className="h-1 w-1 rounded-full bg-zinc-200" />
                          <span>${row.price.toLocaleString()} / unit</span>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center justify-between border-t border-zinc-50 pt-4 md:border-none md:pt-0 gap-4">
                        <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-1">
                          <button
                            onClick={() => updateQuantity(row.id, row.cartQty - 1, row.quantity)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm transition-hover hover:text-black"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{row.cartQty}</span>
                          <button
                            onClick={() => updateQuantity(row.id, row.cartQty + 1, row.quantity)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm transition-hover hover:text-black"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(row.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SIDEBAR SUMMARY */}
            <aside className="relative">
              <div className="summary-card sticky top-12 space-y-8 rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold">Order Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-zinc-900">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Platform Fee</span>
                    <span className="font-bold text-zinc-900">$0.00</span>
                  </div>
                  <div className="h-px bg-zinc-100" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-2xl tracking-tighter">${subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full rounded-2xl py-7 text-sm font-bold uppercase tracking-widest shadow-xl shadow-zinc-200">
                    <Link href="/messages">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat to Acquire
                    </Link>
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    <ShieldCheck className="h-3 w-3" /> Secured by Agency Protocol
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-4">
                  <p className="text-[11px] leading-relaxed text-zinc-500">
                    <span className="font-bold text-zinc-900">Direct Delivery:</span> Contact the sellers directly to finalize payment and receive your digital assets.
                  </p>
                </div>
              </div>
            </aside>

          </div>
        )}
      </div>
    </div>
  );
}