"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";
import {
  ShoppingCart,
  Trash2,
  MessageCircle,
  Minus,
  Plus,
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

function groupBySeller(
  rows: (CartProduct & { cartQty: number })[],
  profiles: Map<string, SellerProfile>
) {
  const bySeller = new Map<string, (typeof rows)[0][]>();

  for (const row of rows) {
    const list = bySeller.get(row.seller_id) ?? [];
    list.push(row);
    bySeller.set(row.seller_id, list);
  }

  return Array.from(bySeller.entries()).map(([sellerId, sellerRows]) => {
    const profile = profiles.get(sellerId);
    const sellerSubtotal = sellerRows.reduce(
      (sum, r) => sum + r.price * r.cartQty,
      0
    );

    return {
      sellerId,
      sellerName:
        profile?.discord_username
          ? `@${profile.discord_username}`
          : profile?.username ?? "Seller",
      discordId: profile?.discord_id ?? null,
      rows: sellerRows,
      sellerSubtotal,
    };
  });
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, itemCount } = useCart();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [profiles, setProfiles] = useState<Map<string, SellerProfile>>(
    new Map()
  );
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
      const { data: productData } = await supabase
        .from("products")
        .select("id, name, price, quantity, seller_id")
        .in("id", productIds);

      const prods = (productData as CartProduct[]) ?? [];
      setProducts(prods);

      const sellerIds = [
        ...new Set(prods.map((p) => p.seller_id).filter(Boolean)),
      ];

      if (sellerIds.length === 0) {
        setProfiles(new Map());
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, discord_username, discord_id")
        .in("id", sellerIds);

      const map = new Map<string, SellerProfile>();
      (profileData as SellerProfile[])?.forEach((p) => map.set(p.id, p));

      setProfiles(map);
      setLoading(false);
    };

    void fetchData();
  }, [productIds.join(",")]);

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.from(".cart-hero", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
        });

        gsap.from(".cart-group", {
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
        });

        gsap.from(".cart-summary", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          delay: 0.3,
          ease: "power3.out",
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, [loading]);

  const rows = products
    .map((p) => ({ ...p, cartQty: items[p.id] ?? 0 }))
    .filter((r) => r.cartQty > 0);

  const groups = groupBySeller(rows, profiles);
  const subtotal = rows.reduce((sum, r) => sum + r.price * r.cartQty, 0);

  return (
    <div
      ref={containerRef}
      className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-4xl flex-col gap-10 px-6 py-14"
    >
      {/* HEADER */}
      <div className="cart-hero space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
          Your Cart
        </h1>
        <p className="text-sm text-zinc-500">
          {itemCount === 0
            ? "Your cart is empty."
            : `${itemCount} item${
                itemCount === 1 ? "" : "s"
              } — contact sellers directly on Discord.`}
        </p>
      </div>

      {itemCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-200 bg-white p-16 text-center shadow-sm">
          <ShoppingCart className="mb-6 h-14 w-14 text-zinc-300" />
          <Button asChild className="rounded-full px-6">
            <Link href="/marketplace">Explore marketplace</Link>
          </Button>
        </div>
      ) : loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* SELLER GROUPS */}
          <div className="space-y-8">
            {groups.map((group) => (
              <div
                key={group.sellerId}
                className="cart-group rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {group.sellerName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      ${group.sellerSubtotal.toFixed(2)}
                    </p>
                  </div>

                  {group.discordId && (
                    <a
                      href={`https://discord.com/users/${group.discordId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-indigo-600 px-4 py-2 text-xs text-white hover:bg-indigo-500"
                    >
                      Contact
                    </a>
                  )}
                </div>

                <ul className="divide-y divide-zinc-100">
                  {group.rows.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between px-6 py-5"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {row.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          ${row.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                row.id,
                                row.cartQty - 1,
                                row.quantity
                              )
                            }
                            className="rounded-lg border border-zinc-200 p-2"
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span className="text-sm font-medium">
                            {row.cartQty}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                row.id,
                                row.cartQty + 1,
                                row.quantity
                              )
                            }
                            className="rounded-lg border border-zinc-200 p-2"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="w-20 text-right text-sm font-semibold">
                          ${(row.price * row.cartQty).toFixed(2)}
                        </span>

                        <button
                          onClick={() => removeItem(row.id)}
                          className="rounded-lg p-2 text-zinc-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="cart-summary rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700">
                Total
              </span>
              <span className="text-2xl font-semibold text-zinc-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              OwnMarket does not process payments. Contact sellers to complete
              your trade.
            </p>

            <div className="mt-6 flex gap-4">
              <Button asChild className="rounded-full">
                <Link href="/discord">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Open Discord
                </Link>
              </Button>

              <Button asChild variant="outline" className="rounded-full">
                <Link href="/marketplace">Continue shopping</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
