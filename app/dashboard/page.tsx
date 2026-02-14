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
  Pencil,
  Trash2,
  MessageCircleMore,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserRole = "admin" | "buyer" | "seller" | null;

type ProductRow = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string | null;
  discord_channel_link: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [discordId, setDiscordId] = useState<string | null>(null);
  const [discordUsername, setDiscordUsername] = useState<string | null>(null);
  const [discordAvatar, setDiscordAvatar] = useState<string | null>(null);

  const [productsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState<ProductRow[]>([]);

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    quantity: "1",
    description: "",
    discordChannel: "",
  });
  const [productError, setProductError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", quantity: "1", description: "", discordChannel: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
        .select("role, username, discord_id, discord_username, discord_avatar")
        .eq("id", authData.user.id)
        .maybeSingle();

      setRole((profile?.role as UserRole) ?? null);
      setUsername(profile?.username ?? null);
      setDiscordId((profile as any)?.discord_id ?? null);
      setDiscordUsername((profile as any)?.discord_username ?? null);
      setDiscordAvatar((profile as any)?.discord_avatar ?? null);
      setLoading(false);
    };

    void fetchProfile();
  }, [router]);

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

  useEffect(() => {
    void fetchProducts();
  }, [userId, role]);

  const openEdit = (p: ProductRow) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      price: String(p.price),
      quantity: String(p.quantity),
      description: p.description ?? "",
      discordChannel: p.discord_channel_link ?? "",
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setProductsLoading(true);
    try {
      const price = parseFloat(editForm.price);
      const quantity = parseInt(editForm.quantity ?? "0", 10);
      const { error } = await supabase
        .from("products")
        .update({
          name: editForm.name,
          price: Number.isNaN(price) ? 0 : price,
          quantity: Number.isNaN(quantity) ? 0 : quantity,
          description: editForm.description || null,
          discord_channel_link: editForm.discordChannel || null,
        })
        .eq("id", editingId);

      if (error) throw error;
      setEditingId(null);
      await fetchProducts();
    } catch (err: any) {
      setProductError(err?.message ?? "Failed to update");
    } finally {
      setProductsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setProductsLoading(true);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setDeleteConfirmId(null);
      await fetchProducts();
    } catch (err: any) {
      setProductError(err?.message ?? "Failed to delete");
    } finally {
      setProductsLoading(false);
    }
  };

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
          quantity: Number.isNaN(quantity) ? 0 : Math.max(0, quantity),
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
                    Quantity (0 = out of stock)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
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
              className="rounded-2xl border border-zinc-200 bg-white p-5 text-xs text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-900">
                  Your listings
                </p>
                <span className="text-[11px] text-zinc-500">{products.length} total</span>
              </div>

              {products.length === 0 ? (
                <p className="text-[11px] text-zinc-500">
                  You haven&apos;t listed anything yet. Create a product above to start selling.
                </p>
              ) : (
                <ul className="space-y-2">
                  {products.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-zinc-900">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          ${p.price.toFixed(2)} · {p.quantity === 0 ? "Out of stock" : `${p.quantity} in stock`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="h-7 w-7 rounded-lg text-zinc-500 hover:text-indigo-600"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="h-7 w-7 rounded-lg text-zinc-500 hover:text-red-600"
                          onClick={() => setDeleteConfirmId(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Link href={`/products/${p.id}`} className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50">
                          View
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            {/* Connect Discord card - sellers only */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-2 flex items-center gap-2">
                <MessageCircleMore className="h-5 w-5 text-indigo-500" />
                <p className="text-sm font-semibold text-zinc-900">
                  Discord profile
                </p>
              </div>
              {discordUsername ? (
                <div className="flex items-center gap-3">
                  {discordId && discordAvatar && (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${discordId}/${discordAvatar}.png?size=80`}
                      alt=""
                      className="h-10 w-10 rounded-full bg-zinc-200"
                    />
                  )}
                  <div>
                    <p className="text-xs font-medium text-zinc-700">
                      Connected as <span className="text-zinc-900">@{discordUsername}</span>
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Buyers can contact you via Discord. Reconnect to update.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-zinc-600 mb-3">
                    Link your Discord so buyers see your real profile and can contact you.
                  </p>
                  <Button
                    size="sm"
                    className="rounded-full bg-indigo-600 hover:bg-indigo-500"
                    asChild
                  >
                    <a href={userId ? `/api/auth/discord?userId=${encodeURIComponent(userId)}` : "#"}>
                      <MessageCircleMore className="h-4 w-4 mr-2" />
                      Connect Discord
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </>
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

      {/* Edit product dialog */}
      <Dialog open={!!editingId} onOpenChange={(o) => !o && setEditingId(null)}>
        <DialogContent className="max-w-md border-zinc-200">
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
            <DialogDescription>Update listing details. Set quantity to 0 for out of stock.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-700">Name</label>
              <input
                required
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-zinc-700">Price (USD)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-700">Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm((f) => ({ ...f, quantity: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-700">Description</label>
              <textarea
                rows={2}
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-700">Discord channel (optional)</label>
              <input
                type="url"
                value={editForm.discordChannel}
                onChange={(e) => setEditForm((f) => ({ ...f, discordChannel: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={productsLoading}>{productsLoading ? "Saving..." : "Save changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm border-zinc-200">
          <DialogHeader>
            <DialogTitle>Delete listing?</DialogTitle>
            <DialogDescription>This cannot be undone. The product will be removed from the marketplace.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-500" disabled={productsLoading} onClick={() => deleteConfirmId && handleDeleteProduct(deleteConfirmId)}>
              {productsLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

