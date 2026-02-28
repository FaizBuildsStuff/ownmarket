"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  UserCircle2,
  ShoppingCart,
  Check,
  Lock,
  Zap,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

type ProductDetail = {
  id: string;
  seller_id: string;
  name: string;
  price: number;
  quantity: number;
  description: string | null;
  badge: string | null;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerProfile, setSellerProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get the product
      const { data: prod } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (!prod) {
        router.push("/");
        return;
      }
      setProduct(prod);

      // 2. Get the seller details (Discord info included)
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, discord_id, discord_avatar, discord_username, created_at")
        .eq("id", prod.seller_id)
        .maybeSingle();

      setSellerProfile(profile);
      setLoading(false);
    };

    if (params.id) fetchData();
  }, [params.id, router]);

  if (loading || !product) {
    return <div className="p-20 text-center font-medium">Loading...</div>;
  }

  // Proper Discord Avatar Link
  const avatarUrl = sellerProfile?.discord_id && sellerProfile?.discord_avatar
    ? `https://cdn.discordapp.com/avatars/${sellerProfile.discord_id}/${sellerProfile.discord_avatar}.png`
    : null;

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        
        {/* BACK BUTTON */}
        <button
          onClick={() => router.back()}
          className="mb-10 flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </button>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_360px]">
          
          {/* MAIN SECTION */}
          <main className="space-y-12">
            <header className="space-y-4">
              <div className="inline-block rounded-full bg-zinc-100 px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                {product.badge || "Verified Item"}
              </div>
              <h1 className="text-5xl font-bold tracking-tight md:text-6xl italic">
                {product.name}
              </h1>
            </header>

            <div className="space-y-4 border-t border-zinc-100 pt-10">
              <h2 className="text-xl font-bold">About this item</h2>
              <p className="text-lg leading-relaxed text-zinc-500">
                {product.description || "The seller hasn't added a description yet. Use the chat to ask for details."}
              </p>
            </div>

            {/* TRUST BOXES - SIMPLE WORDS */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-zinc-50 p-8">
                <ShieldCheck className="mb-4 h-6 w-6 text-black" />
                <h3 className="font-bold">Money-Back Guarantee</h3>
                <p className="text-sm text-zinc-500 mt-2">We hold your money safely until you get your item. If they don't deliver, you get a refund.</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-8">
                <Zap className="mb-4 h-6 w-6 text-black" />
                <h3 className="font-bold">Instant Access</h3>
                <p className="text-sm text-zinc-500 mt-2">Most items are delivered right after you pay. No waiting around for days.</p>
              </div>
            </div>
          </main>

          {/* SIDEBAR - ACTION AREA */}
          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-zinc-100 bg-white p-8 shadow-2xl shadow-zinc-200/50">
              <div className="mb-8">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Price</p>
                <p className="text-5xl font-bold tracking-tighter">${product.price.toLocaleString()}</p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => addItem(product.id, 1, product.quantity)}
                  className="w-full rounded-2xl py-7 text-sm font-bold uppercase tracking-widest bg-black text-white hover:bg-zinc-800"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {items[product.id] ? "In your cart" : "Add to Cart"}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full rounded-2xl py-7 text-sm font-bold uppercase tracking-widest border-zinc-200"
                  onClick={() => router.push(`/messages?seller=${product.seller_id}`)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat with Seller
                </Button>
              </div>

              {/* SELLER CARD */}
              <div className="mt-10 pt-10 border-t border-zinc-50">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-zinc-100 ring-2 ring-zinc-50">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Seller" className="h-full w-full object-cover" />
                    ) : (
                      <UserCircle2 className="h-full w-full text-zinc-300" />
                    )}
                  </div>
                  <div>
                    <Link href={`/users/${product.seller_id}`} className="block font-bold hover:underline">
                      {sellerProfile?.discord_username || sellerProfile?.username || "Verified Seller"}
                    </Link>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Online Now</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2 rounded-2xl bg-zinc-50 p-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400">
                    <span>Seller ID</span>
                    <span className="text-zinc-900 tracking-tighter">{sellerProfile?.discord_id || "Private"}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400">
                    <span>Status</span>
                    <span className="text-zinc-900">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECURITY WARNING - DIRECT WORDS */}
            <div className="flex items-center gap-3 rounded-2xl bg-black p-5 text-white">
              <Lock className="h-5 w-5 text-zinc-400 shrink-0" />
              <p className="text-[10px] leading-relaxed font-medium">
                Keep your chat on this site. If you move to Discord or Telegram, we cannot help you if you get scammed.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}