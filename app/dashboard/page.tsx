"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import {
  ShieldCheck,
  ShoppingBag,
  UserCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type UserRole = "admin" | "buyer" | "seller" | null;

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [productsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState<
    {
      id: string;
      name: string;
      price: number;
      quantity: number;
      description: string | null;
      discord_channel_link: string | null;
    }[]
  >([]);

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    quantity: "1",
    description: "",
    discordChannel: "",
  });
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.push("/");
        return;
      }

      setUserId(authData.user.id);
      setEmail(authData.user.email ?? null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, username")
        .eq("id", authData.user.id)
        .maybeSingle();

      setRole((profile?.role as UserRole) ?? null);
      setUsername(profile?.username ?? null);
      setLoading(false);
    };

    void fetchProfile();
  }, [router]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userId || role !== "seller") return;
      setProductsLoading(true);
      const { data } = await supabase
        .from("products")
        .select("id, name, price, quantity, description, discord_channel_link")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false });

      setProducts((data as any) ?? []);
      setProductsLoading(false);
    };

    void fetchProducts();
  }, [userId, role]);

  const handleProductChange =
    (field: keyof typeof productForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProductForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setProductError(null);
    setProductsLoading(true);

    try {
      const price = parseFloat(productForm.price);
      const quantity = parseInt(productForm.quantity || "1", 10);

      const { data, error } = await supabase
        .from("products")
        .insert({
          seller_id: userId,
          name: productForm.name,
          price,
          quantity: Number.isNaN(quantity) ? 1 : quantity,
          description: productForm.description || null,
          discord_channel_link: productForm.discordChannel || null,
        })
        .select("id, name, price, quantity, description, discord_channel_link")
        .single();

      if (error) throw error;

      setProducts((prev) => (data ? [data as any, ...prev] : prev));
      setProductForm({
        name: "",
        price: "",
        quantity: "1",
        description: "",
        discordChannel: "",
      });
    } catch (err: any) {
      setProductError(err?.message ?? "Failed to create product");
    } finally {
      setProductsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center text-sm text-zinc-500">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Dashboard
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Welcome back{username ? `, ${username}` : ""}.
        </h1>
        <p className="text-xs text-zinc-500">
          Signed in as{" "}
          <span className="font-medium text-zinc-700">{email}</span>{" "}
          {role && (
            <>
              · role:{" "}
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/5 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                {role}
              </span>
            </>
          )}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {/* Buyer view */}
        {role === "buyer" && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-xs text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur"
            >
              <div className="mb-2 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-indigo-500" />
                <p className="text-sm font-semibold text-zinc-900">
                  Buyer overview
                </p>
              </div>
              <p className="text-zinc-500">
                You don&apos;t have any active purchases yet. Use the marketplace
                on the home page to start buying Nitro, boosts or OG handles.
              </p>
            </motion.div>
          </>
        )}

        {/* Seller view */}
        {role === "seller" && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white/80 p-4 text-xs text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <UserCircle2 className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-semibold text-zinc-900">
                    Create a new product
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                  Seller tools
                </span>
              </div>

              <form
                onSubmit={handleCreateProduct}
                className="grid gap-3 sm:grid-cols-2"
              >
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-medium text-zinc-700">
                    Product name
                  </label>
                  <input
                    required
                    value={productForm.name}
                    onChange={handleProductChange("name")}
                    placeholder="Nitro yearly key, server boosts pack..."
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none ring-0 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-700">
                    Price (USD)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={handleProductChange("price")}
                    placeholder="19.80"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none ring-0 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-700">
                    Quantity
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={productForm.quantity}
                    onChange={handleProductChange("quantity")}
                    placeholder="1"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none ring-0 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-medium text-zinc-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={handleProductChange("description")}
                    placeholder="Short description of what&apos;s included, region locks, TOS, etc."
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none ring-0 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-medium text-zinc-700">
                    Discord channel link (optional)
                  </label>
                  <input
                    type="url"
                    value={productForm.discordChannel}
                    onChange={handleProductChange("discordChannel")}
                    placeholder="https://discord.gg/your-channel"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none ring-0 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {productError && (
                  <p className="sm:col-span-2 text-[11px] font-medium text-red-500">
                    {productError}
                  </p>
                )}

                <div className="sm:col-span-2 flex justify-end">
                  <Button
                    type="submit"
                    size="xs"
                    disabled={productsLoading}
                    className="rounded-full px-4 py-2 text-[11px]"
                  >
                    {productsLoading ? "Saving..." : "Create product"}
                  </Button>
                </div>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-xs text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-900">
                  Your listings
                </p>
              </div>

              {products.length === 0 ? (
                <p className="text-[11px] text-zinc-500">
                  You haven&apos;t listed anything yet. Create a product on the left
                  to start selling.
                </p>
              ) : (
                <ul className="space-y-2">
                  {products.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-zinc-900">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          ${p.price.toFixed(2)} · {p.quantity} in stock
                        </p>
                      </div>
                      <Link
                        href={`/products/${p.id}`}
                        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </>
        )}

        {/* Admin view */}
        {role === "admin" && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-xs text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur"
            >
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-rose-500" />
                <p className="text-sm font-semibold text-zinc-900">
                  Admin panel
                </p>
              </div>
              <p className="text-zinc-500">
                You&apos;ll plug in real moderation and marketplace controls here
                (user flags, disputes, listings).
              </p>
            </motion.div>
          </>
        )}

        {/* Fallback when no role yet */}
        {!role && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-4 text-xs text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.03)] backdrop-blur"
          >
            <div className="mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold text-zinc-900">
                No role assigned yet
              </p>
            </div>
            <p className="text-zinc-500">
              Ask an admin to set your role to <b>admin</b>, <b>buyer</b>, or{" "}
              <b>seller</b> in the Supabase `profiles` table to unlock the full
              dashboard.
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
}

