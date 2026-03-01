"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchSellerProfileAndProductsAction } from "@/app/actions";
import {
  ArrowLeft,
  UserCircle2,
  CalendarDays,
  ShoppingBag,
  MessageCircleMore,
  ExternalLink,
} from "lucide-react";

type UserProfile = {
  id: string;
  username: string | null;
  discord_handle: string | null;
  discord_id: string | null;
  discord_username: string | null;
  discord_avatar: string | null;
  created_at: string | null;
  badge: string | null;
  banned: boolean;
  banned_until: string | null;
};

type UserProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  created_at: string;
};

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await fetchSellerProfileAndProductsAction(params.id as string);

        if (!data || !data.seller) {
          router.push("/");
          return;
        }

        const { seller, products: sellerProducts } = data;

        setProfile({
          id: seller.id,
          username: seller.username,
          discord_handle: seller.discordUsername,
          discord_id: seller.discordId,
          discord_username: seller.discordUsername,
          discord_avatar: seller.discordAvatar,
          created_at: seller.createdAt ? seller.createdAt.toISOString() : null,
          badge: null, // The db schema for users might not have a badge field, so defaulting to null
          banned: false, // Defaulting to false since User auth is handled independently
          banned_until: null,
        });
        setProducts(sellerProducts.map(p => ({
          ...p,
          price: Number(p.price),
          created_at: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString()
        })) as any[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [params.id, router]);

  if (loading || !profile) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-5xl flex-col gap-4 px-6 py-8 lg:px-10 lg:py-12">
        <p className="text-sm text-zinc-500">Loading profile...</p>
      </div>
    );
  }

  const totalServices = products.length;
  const isBanned = profile.banned || (profile.banned_until && new Date(profile.banned_until) > new Date());
  const banStatus = profile.banned ? "Banned" : profile.banned_until && new Date(profile.banned_until) > new Date()
    ? `Timeout until ${new Date(profile.banned_until).toLocaleDateString()}`
    : null;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-5xl flex-col gap-6 px-6 py-8 lg:px-10 lg:py-12">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-800 shadow-[0_22px_55px_rgba(15,23,42,0.08)]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {profile.discord_id && profile.discord_avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${profile.discord_id}/${profile.discord_avatar}.png?size=80`}
                alt=""
                className="h-14 w-14 rounded-2xl border border-zinc-200"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-50">
                <UserCircle2 className="h-7 w-7" />
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                Seller profile
              </p>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                {profile.discord_username ? `@${profile.discord_username}` : profile.username || "Unnamed seller"}
              </h1>
              {profile.badge && (
                <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{profile.badge}</span>
              )}
              {banStatus && (
                <p className="mt-1 text-xs font-medium text-amber-600">{banStatus}</p>
              )}
              {profile.discord_handle && !profile.discord_username && (
                <p className="text-xs text-zinc-500">
                  Discord:{" "}
                  <span className="font-medium text-zinc-800">
                    {profile.discord_handle}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="space-y-1 text-xs text-zinc-600 text-right">
              {profile.created_at && (
                <p className="flex items-center justify-end gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
                  Onboarded{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              )}
              <p className="flex items-center justify-end gap-1">
                <ShoppingBag className="h-3.5 w-3.5 text-zinc-500" />
                {totalServices} active service{totalServices === 1 ? "" : "s"}
              </p>
            </div>
            {profile.discord_id && (
              <a
                href={`https://discord.com/users/${profile.discord_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-500"
              >
                <MessageCircleMore className="h-4 w-4" />
                Contact on Discord
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </header>

        <div className="mt-4 space-y-2 text-xs text-zinc-600">
          <p>
            This page shows a public snapshot of this seller: when their profile
            was created and how many listings they currently have on OwnMarket.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900">
            Services posted
          </h2>
          <span className="text-[11px] text-zinc-500">
            {totalServices === 0
              ? "No listings yet."
              : `${totalServices} listing${totalServices === 1 ? "" : "s"} visible`}
          </span>
        </div>

        {totalServices === 0 ? (
          <p className="text-xs text-zinc-500">
            This seller hasn&apos;t posted any services yet. Check back later or
            look at other marketplace listings on the home page.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-700 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-indigo-200/80 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-semibold text-zinc-900">
                    {p.name}
                  </p>
                  <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-50">
                    ${p.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  {p.quantity} in stock ·{" "}
                  {new Date(p.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

