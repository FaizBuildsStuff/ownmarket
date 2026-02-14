"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";
import {
  ShoppingCart,
  Trash2,
  MessageCircle,
  ExternalLink,
  Minus,
  Plus,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    const sellerItemCount = sellerRows.reduce((sum, r) => sum + r.cartQty, 0);
    return {
      sellerId,
      sellerName:
        profile?.discord_username
          ? `@${profile.discord_username}`
          : profile?.username ?? "Seller",
      discordId: profile?.discord_id ?? null,
      profile,
      rows: sellerRows,
      sellerSubtotal,
      sellerItemCount,
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

  const rows = products
    .map((p) => ({ ...p, cartQty: items[p.id] ?? 0 }))
    .filter((r) => r.cartQty > 0);

  const groups = groupBySeller(rows, profiles);
  const subtotal = rows.reduce((sum, r) => sum + r.price * r.cartQty, 0);
  const sellerCount = groups.length;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-3xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Your cart
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {itemCount === 0
              ? "No items yet. Add listings from the marketplace."
              : `${itemCount} item${itemCount === 1 ? "" : "s"} from ${sellerCount} seller${sellerCount === 1 ? "" : "s"} — contact each seller on Discord to complete your trade.`}
          </p>
        </div>
        <Link
          href="/marketplace"
          className="text-xs font-medium text-indigo-600 hover:underline"
        >
          Continue shopping
        </Link>
      </header>

      {itemCount === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-900">Cart is empty</p>
          <p className="mt-1 text-xs text-zinc-500">
            Browse the marketplace and add Nitro, boosts, or OG handles to get
            started.
          </p>
          <Button asChild size="sm" className="mt-4 rounded-full">
            <Link href="/marketplace">Go to marketplace</Link>
          </Button>
        </div>
      ) : loading ? (
        <p className="text-sm text-zinc-500">Loading cart...</p>
      ) : (
        <>
          <div className="space-y-6">
            {groups.map((group) => (
              <section
                key={group.sellerId}
                className="rounded-2xl border border-zinc-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] overflow-hidden"
              >
                <div className="border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/users/${group.sellerId}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:text-indigo-600 hover:underline"
                  >
                    <UserCircle2 className="h-4 w-4 text-zinc-500" />
                    {group.sellerName}
                  </Link>
                  <span className="text-[11px] text-zinc-500">
                    {group.sellerItemCount} item
                    {group.sellerItemCount === 1 ? "" : "s"} · $
                    {group.sellerSubtotal.toFixed(2)} total
                  </span>
                  {group.discordId ? (
                    <a
                      href={`https://discord.com/users/${group.discordId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#5865F2] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#4752C4]"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Contact this seller
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link
                      href={`/users/${group.sellerId}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      View profile
                    </Link>
                  )}
                </div>
                <ul className="divide-y divide-zinc-100">
                  {group.rows.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-wrap items-center gap-4 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${row.id}`}
                          className="font-medium text-zinc-900 hover:text-indigo-600 hover:underline"
                        >
                          {row.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          ${row.price.toFixed(2)} each · max {row.quantity} in
                          stock
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(row.id, row.cartQty - 1, row.quantity)
                            }
                            disabled={row.cartQty <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-l-lg text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-medium text-zinc-900">
                            {row.cartQty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(row.id, row.cartQty + 1, row.quantity)
                            }
                            disabled={row.cartQty >= row.quantity}
                            className="flex h-8 w-8 items-center justify-center rounded-r-lg text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="w-16 text-right text-sm font-semibold text-zinc-900">
                          ${(row.price * row.cartQty).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(row.id)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Remove from cart"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700">
                Total ({sellerCount} seller{sellerCount === 1 ? "" : "s"})
              </span>
              <span className="text-lg font-semibold text-zinc-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              OwnMarket doesn’t process payments. Contact each seller above to
              complete your trades on Discord (escrow recommended for larger
              amounts).
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-500">
                <Link href="/discord" className="inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Open OwnMarket Discord
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/marketplace">Keep shopping</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
