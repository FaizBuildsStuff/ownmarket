"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { fetchMarketplaceProductsAction } from "@/app/actions";
import { useCart } from "@/context/CartContext";
import { Plus, ShoppingBag, ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";

type ProductCard = {
  id: string;
  seller_id: string;
  name: string;
  price: number;
  quantity: number;
  description: string | null;
  seller_username?: string | null;
};

export default function MarketplacePage() {
  const { addItem, items } = useCart();
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  // GSAP: Smooth Staggered Reveal
  useEffect(() => {
    if (!loading && products.length > 0) {
      gsap.fromTo(
        ".product-item",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.05,
          ease: "expo.out",
          delay: 0.1
        }
      );
    }
  }, [loading, products]);

  const fetchProducts = async () => {
    try {
      const data = await fetchMarketplaceProductsAction();
      const enriched = data.map((p) => ({
        id: p.id,
        seller_id: p.sellerId,
        name: p.name,
        price: Number(p.price),
        quantity: p.quantity,
        description: p.description,
        seller_username: p.sellerUsername || 'Verified',
      }));

      setProducts(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-black selection:text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">

        {/* MINIMALIST NAVIGATION */}
        <header className="mb-32 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-4">
            <h1 className="text-6xl font-light tracking-tighter md:text-8xl">
              Market <span className="text-zinc-300 italic">Place</span>
            </h1>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-400">
              Curated Digital Goods
            </p>
          </div>
          <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span className="text-zinc-900 border-b border-zinc-900 pb-1 cursor-pointer">All Assets</span>
            <span className="hover:text-zinc-900 cursor-pointer transition-colors">Recent Drops</span>
            <span className="hover:text-zinc-900 cursor-pointer transition-colors">Verified Only</span>
          </div>
        </header>

        {/* 4-COLUMN MINIMAL GRID */}
        {loading ? (
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse bg-zinc-50 rounded-sm" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 border-t border-zinc-100">
            <ShoppingBag className="h-8 w-8 text-zinc-200 mb-4" strokeWidth={1} />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 italic">No inventory available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <div key={p.id} className="product-item group flex flex-col">

                {/* 1. IMAGE CANVAS */}
                <div className="relative mb-6 aspect-[4/5] overflow-hidden bg-zinc-50 transition-colors group-hover:bg-zinc-100">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-8xl font-black">{p.name[0]}</span>
                  </div>

                  {/* Hover Quick-Action */}
                  <div className="absolute inset-0 flex items-end p-6 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <Button
                      onClick={() => addItem(p.id, 1, p.quantity)}
                      className="h-12 w-full rounded-none bg-black text-white hover:bg-zinc-800 transition-colors text-[10px] font-bold uppercase tracking-widest"
                    >
                      {items[p.id] ? <span className="flex items-center gap-2"><Check className="h-3 w-3" /> Added to Cart</span> : "Add to Cart"}
                    </Button>
                  </div>

                  <Link href={`/products/${p.id}`} className="absolute top-6 right-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </Link>
                </div>

                {/* 2. PRODUCT INFO */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-tight text-zinc-900">
                      {p.name}
                    </h3>
                    <span className="text-xs font-medium text-zinc-400">
                      ${p.price.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-zinc-400 line-clamp-1 font-medium italic">
                    {p.description || "Verified Digital Asset"}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-300">
                      Merchant: {p.seller_username}
                    </div>
                    {items[p.id] && (
                      <div className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MINIMAL FOOTER */}
        <footer className="mt-60 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-zinc-100 pt-10 pb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300">
            Secure Digital Infrastructure
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span className="hover:text-black transition-colors cursor-pointer">Support</span>
            <span className="hover:text-black transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-black transition-colors cursor-pointer">Terms</span>
          </div>
        </footer>
      </div>
    </div>
  );
}