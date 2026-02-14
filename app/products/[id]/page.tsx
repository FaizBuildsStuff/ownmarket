"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowLeft,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  UserCircle2,
  CalendarDays,
  ShoppingBag,
} from "lucide-react";

type ProductDetail = {
  id: string;
  seller_id: string;
  name: string;
  price: number;
  quantity: number;
  description: string | null;
  discord_channel_link: string | null;
  badge: string | null;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerProfile, setSellerProfile] = useState<{
    username: string | null;
    discord_handle: string | null;
    discord_id: string | null;
    discord_username: string | null;
    discord_avatar: string | null;
    created_at: string | null;
    total_products: number;
    badge: string | null;
    banned: boolean;
    banned_until: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select(
          "id, seller_id, name, price, quantity, description, discord_channel_link, badge"
        )
        .eq("id", params.id)
        .maybeSingle();

      if (!data) {
        router.push("/");
        return;
      }

      const prod = data as ProductDetail;
      setProduct(prod);

      const [{ data: profile }, { count }] = await Promise.all([
        supabase
          .from("profiles")
          .select("username, discord_handle, discord_id, discord_username, discord_avatar, created_at, badge, banned, banned_until")
          .eq("id", prod.seller_id)
          .maybeSingle(),
        supabase
          .from("products")
          .select("*", { head: true, count: "exact" })
          .eq("seller_id", prod.seller_id),
      ]);

      setSellerProfile({
        username: (profile as any)?.username ?? null,
        discord_handle: (profile as any)?.discord_handle ?? null,
        discord_id: (profile as any)?.discord_id ?? null,
        discord_username: (profile as any)?.discord_username ?? null,
        discord_avatar: (profile as any)?.discord_avatar ?? null,
        created_at: (profile as any)?.created_at ?? null,
        total_products: count ?? 0,
        badge: (profile as any)?.badge ?? null,
        banned: (profile as any)?.banned ?? false,
        banned_until: (profile as any)?.banned_until ?? null,
      });

      setLoading(false);
    };

    void fetchProduct();
  }, [params.id, router]);

  if (loading || !product) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-5xl flex-col gap-4 px-6 py-8 lg:px-10 lg:py-12">
        <p className="text-sm text-zinc-500">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-5xl flex-col gap-6 px-6 py-8 lg:px-10 lg:py-12">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to marketplace
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-800 shadow-[0_22px_55px_rgba(15,23,42,0.08)]">
          <header className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Listing
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                  {product.name}
                </h1>
                {product.badge && (
                  <span className="mt-1.5 inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-zinc-50">
                  ${product.price.toFixed(2)}
                </span>
                {product.quantity === 0 ? (
                  <p className="mt-1 text-[11px] font-medium text-amber-600">
                    Out of stock
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {product.quantity} in stock
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              <ShieldCheck className="mr-1 inline h-3 w-3 text-emerald-500" />
              This listing is traded through OwnMarket&apos;s Discord marketplace.
              Always follow staff instructions and use escrow for safety.
            </p>
          </header>

          <div className="space-y-4 text-xs text-zinc-700">
            <div>
              <p className="mb-1 text-[11px] font-medium text-zinc-900">
                What you&apos;re getting
              </p>
              <p className="whitespace-pre-line text-zinc-600">
                {product.description ||
                  "Seller has not added a description yet. Ask for full details in the Discord channel before trading."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-zinc-50 p-3 text-[11px] text-zinc-600">
                <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-zinc-900">
                  <ShoppingBag className="h-3.5 w-3.5 text-indigo-500" />
                  Trade flow
                </p>
                <p>
                  Coordinate in the seller&apos;s Discord channel, confirm terms with
                  staff, then complete the trade using the agreed escrow flow.
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 text-[11px] text-zinc-600">
                <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-zinc-900">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Safety tips
                </p>
                <p>
                  Never trade in DMs without staff. Always verify the staff tag and
                  don&apos;t click unknown links outside official channels.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            {product.quantity > 0 && (
              <>
                {product.discord_channel_link && (
                  <Link
                    href={product.discord_channel_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-indigo-50 shadow-sm transition hover:bg-indigo-500"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Open Discord channel
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </>
            )}
            {product.quantity === 0 && (
              <p className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-700">
                Out of stock — contact seller to ask about restock
              </p>
            )}
            <p className="text-[11px] text-zinc-500">
              Contact staff in the main Discord if anything feels off, and never
              trade outside official channels.
            </p>
          </div>
        </section>

        <aside className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 text-xs text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-2 flex items-center gap-3">
            {sellerProfile?.discord_id && sellerProfile?.discord_avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${sellerProfile.discord_id}/${sellerProfile.discord_avatar}.png?size=80`}
                alt=""
                className="h-12 w-12 rounded-full border border-zinc-200"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                <UserCircle2 className="h-6 w-6 text-zinc-400" />
              </div>
            )}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                Seller
              </p>
              <Link
                href={`/users/${product.seller_id}`}
                className="text-sm font-semibold text-zinc-900 hover:underline"
              >
                {sellerProfile?.discord_username ? `@${sellerProfile.discord_username}` : sellerProfile?.username || "Unknown seller"}
              </Link>
              {sellerProfile?.badge && (
                <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">{sellerProfile.badge}</span>
              )}
              {sellerProfile && (sellerProfile.banned || (sellerProfile.banned_until && new Date(sellerProfile.banned_until) > new Date())) && (
                <p className="mt-1 text-[11px] font-medium text-amber-600">Seller currently restricted</p>
              )}
            </div>
          </div>

          <div className="space-y-2 text-[11px] text-zinc-600">
            {sellerProfile?.discord_handle && !sellerProfile?.discord_username && (
              <p>
                Discord:{" "}
                <span className="font-medium text-zinc-800">
                  {sellerProfile.discord_handle}
                </span>
              </p>
            )}
            {sellerProfile?.created_at && (
              <p className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
                Onboarded{" "}
                {new Date(sellerProfile.created_at).toLocaleDateString()}
              </p>
            )}
            <p className="flex items-center gap-1">
              <ShoppingBag className="h-3.5 w-3.5 text-zinc-500" />
              {sellerProfile?.total_products ?? 0} active listing
              {(sellerProfile?.total_products ?? 0) === 1 ? "" : "s"}
            </p>
          </div>

          {/* Contact seller - buyers */}
          {(sellerProfile?.discord_id || product.discord_channel_link) && (
            <div className="pt-3 border-t border-zinc-200">
              <p className="mb-2 text-[11px] font-medium text-zinc-900">Contact seller</p>
              {sellerProfile?.discord_id ? (
                <a
                  href={`https://discord.com/users/${sellerProfile.discord_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-500"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact on Discord
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : product.discord_channel_link ? (
                <Link
                  href={product.discord_channel_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-500"
                >
                  <MessageCircle className="h-4 w-4" />
                  Open seller channel
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

