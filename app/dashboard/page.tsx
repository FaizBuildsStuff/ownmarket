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
  Award,
  Ban,
  Clock,
  ShoppingCart,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
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
  badge?: string | null;
  seller_id?: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
  discord_username: string | null;
  role: string;
  badge: string | null;
  banned: boolean;
  banned_until: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { itemCount: cartItemCount } = useCart();
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

  // Admin: all products and users
  const [allProducts, setAllProducts] = useState<ProductRow[]>([]);
  const [allUsers, setAllUsers] = useState<ProfileRow[]>([]);
  const [adminProductsLoading, setAdminProductsLoading] = useState(false);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  // Badge dialog: for product or user
  const [badgeTarget, setBadgeTarget] = useState<{ type: "product"; id: string } | { type: "user"; id: string } | null>(null);
  const [badgeInput, setBadgeInput] = useState("");
  const [timeoutTarget, setTimeoutTarget] = useState<{ userId: string } | null>(null);
  const [timeoutDays, setTimeoutDays] = useState("1");
  const [banConfirmUserId, setBanConfirmUserId] = useState<string | null>(null);

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
      .select("id, name, price, quantity, description, discord_channel_link, badge")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    setProducts((data as any) ?? []);
    setProductsLoading(false);
  };

  const fetchAllProducts = async () => {
    setAdminProductsLoading(true);
    setAdminError(null);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, quantity, description, discord_channel_link, badge, seller_id")
      .order("created_at", { ascending: false });
    if (error) {
      setAdminError(error.message);
      setAdminProductsLoading(false);
      return;
    }
    setAllProducts((data as ProductRow[]) ?? []);
    setAdminProductsLoading(false);
  };

  const fetchAllUsers = async () => {
    setAdminUsersLoading(true);
    setAdminError(null);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, discord_username, role, badge, banned, banned_until")
      .order("created_at", { ascending: false });
    if (error) {
      setAdminError(error.message);
      setAdminUsersLoading(false);
      return;
    }
    setAllUsers((data as ProfileRow[]) ?? []);
    setAdminUsersLoading(false);
  };

  useEffect(() => {
    void fetchProducts();
  }, [userId, role]);

  useEffect(() => {
    if (role === "admin") {
      void fetchAllProducts();
      void fetchAllUsers();
    }
  }, [role]);

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
      if (role === "admin") await fetchAllProducts();
      else await fetchProducts();
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
      if (role === "admin") await fetchAllProducts();
      else await fetchProducts();
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

  const handleSetProductBadge = async () => {
    if (!badgeTarget || badgeTarget.type !== "product") return;
    setAdminError(null);
    setAdminProductsLoading(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ badge: badgeInput.trim() || null })
        .eq("id", badgeTarget.id);
      if (error) throw error;
      setBadgeTarget(null);
      setBadgeInput("");
      await fetchAllProducts();
    } catch (err: any) {
      setAdminError(err?.message ?? "Failed to set badge");
    } finally {
      setAdminProductsLoading(false);
    }
  };

  const handleSetUserBadge = async () => {
    if (!badgeTarget || badgeTarget.type !== "user") return;
    setAdminError(null);
    setAdminUsersLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ badge: badgeInput.trim() || null })
        .eq("id", badgeTarget.id);
      if (error) throw error;
      setBadgeTarget(null);
      setBadgeInput("");
      await fetchAllUsers();
    } catch (err: any) {
      setAdminError(err?.message ?? "Failed to set badge");
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const handleBanUser = async (targetUserId: string) => {
    setAdminError(null);
    setAdminUsersLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ banned: true, banned_until: null })
        .eq("id", targetUserId);
      if (error) throw error;
      setBanConfirmUserId(null);
      await fetchAllUsers();
    } catch (err: any) {
      setAdminError(err?.message ?? "Failed to ban user");
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const handleTimeoutUser = async () => {
    if (!timeoutTarget) return;
    const days = parseInt(timeoutDays, 10);
    if (Number.isNaN(days) || days < 1) {
      setAdminError("Enter a valid number of days (1 or more).");
      return;
    }
    setAdminError(null);
    setAdminUsersLoading(true);
    try {
      const until = new Date();
      until.setDate(until.getDate() + days);
      const { error } = await supabase
        .from("profiles")
        .update({ banned: false, banned_until: until.toISOString() })
        .eq("id", timeoutTarget.userId);
      if (error) throw error;
      setTimeoutTarget(null);
      setTimeoutDays("1");
      await fetchAllUsers();
    } catch (err: any) {
      setAdminError(err?.message ?? "Failed to set timeout");
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const handleUnbanUser = async (targetUserId: string) => {
    setAdminError(null);
    setAdminUsersLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ banned: false, banned_until: null })
        .eq("id", targetUserId);
      if (error) throw error;
      await fetchAllUsers();
    } catch (err: any) {
      setAdminError(err?.message ?? "Failed to unban");
    } finally {
      setAdminUsersLoading(false);
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
              className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-indigo-500" />
                  <p className="text-sm font-semibold text-zinc-900">
                    Your cart
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                  {cartItemCount} item{cartItemCount === 1 ? "" : "s"}
                </span>
              </div>
              {cartItemCount === 0 ? (
                <p className="text-xs text-zinc-600 mb-4">
                  Your cart is empty. Browse the marketplace to add Nitro, boosts, OG handles, and more. When you’re ready, you’ll contact each seller on Discord to complete your trade.
                </p>
              ) : (
                <p className="text-xs text-zinc-600 mb-4">
                  You have items from different sellers. In your cart you can see each seller’s items and contact them on Discord to complete each trade (escrow recommended).
                </p>
              )}
              <Button asChild size="sm" className="rounded-full" variant={cartItemCount > 0 ? "default" : "outline"}>
                <Link href="/cart" className="inline-flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {cartItemCount > 0 ? "View cart" : "Go to cart"}
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-3 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-500" />
                <p className="text-sm font-semibold text-zinc-900">
                  Quick actions
                </p>
              </div>
              <nav className="space-y-2">
                <Link
                  href="/marketplace"
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-xs font-medium text-zinc-700 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <ShoppingBag className="h-4 w-4 text-zinc-500" />
                  Browse marketplace
                </Link>
                <Link
                  href="/safety"
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-xs font-medium text-zinc-700 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <ShieldCheck className="h-4 w-4 text-zinc-500" />
                  Safety & escrow guide
                </Link>
                <Link
                  href="/discord"
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-xs font-medium text-zinc-700 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <MessageCircle className="h-4 w-4 text-zinc-500" />
                  Join Discord
                </Link>
                <Link
                  href="/support"
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-xs font-medium text-zinc-700 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <HelpCircle className="h-4 w-4 text-zinc-500" />
                  Support & contact
                </Link>
              </nav>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                <p className="text-sm font-semibold text-zinc-900">
                  How buying works
                </p>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-600">
                <li>Add items to your cart from the marketplace or product pages.</li>
                <li>Open your cart to see items grouped by seller.</li>
                <li>Contact each seller on Discord (use the &quot;Contact this seller&quot; button).</li>
                <li>Agree on price and delivery; use escrow for larger trades.</li>
                <li>Complete the trade in Discord with staff support if needed.</li>
              </ol>
              <p className="mt-3 text-[11px] text-zinc-500">
                OwnMarket doesn’t process payments. All trades happen between you and the seller on Discord. Always use the official server and escrow when recommended.
              </p>
            </motion.div>

            {/* Connect Discord - buyers */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
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
                      Sellers will see your Discord when you contact them.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-zinc-600 mb-3">
                    Connect Discord so sellers recognize you when you message them.
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
            {adminError && (
              <p className="text-sm font-medium text-red-500">{adminError}</p>
            )}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-rose-500" />
                <p className="text-sm font-semibold text-zinc-900">
                  Manage products
                </p>
                <span className="text-[11px] text-zinc-500">{allProducts.length} total</span>
              </div>
              {adminProductsLoading ? (
                <p className="text-[11px] text-zinc-500">Loading products...</p>
              ) : allProducts.length === 0 ? (
                <p className="text-[11px] text-zinc-500">No products yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-500">
                        <th className="pb-2 pr-2 font-medium">Product</th>
                        <th className="pb-2 pr-2 font-medium">Seller</th>
                        <th className="pb-2 pr-2 font-medium">Price</th>
                        <th className="pb-2 pr-2 font-medium">Qty</th>
                        <th className="pb-2 pr-2 font-medium">Badge</th>
                        <th className="pb-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProducts.map((p) => {
                        const seller = allUsers.find((u) => u.id === p.seller_id);
                        const sellerName = seller?.username || seller?.discord_username || p.seller_id?.slice(0, 8) || "—";
                        return (
                          <tr key={p.id} className="border-b border-zinc-100">
                            <td className="py-2.5 pr-2">
                              <Link href={`/products/${p.id}`} className="font-medium text-zinc-900 hover:underline">
                                {p.name}
                              </Link>
                            </td>
                            <td className="py-2.5 pr-2 text-zinc-600">
                              <Link href={`/users/${p.seller_id}`} className="hover:underline">{sellerName}</Link>
                            </td>
                            <td className="py-2.5 pr-2">${Number(p.price).toFixed(2)}</td>
                            <td className="py-2.5 pr-2">{p.quantity}</td>
                            <td className="py-2.5 pr-2">
                              {p.badge ? (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">{p.badge}</span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="py-2.5 flex items-center gap-1">
                              <Button variant="ghost" size="icon-xs" className="h-7 w-7 rounded-lg text-zinc-500 hover:text-indigo-600" onClick={() => openEdit(p)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon-xs" className="h-7 w-7 rounded-lg text-zinc-500 hover:text-amber-600" onClick={() => { setBadgeTarget({ type: "product", id: p.id }); setBadgeInput(p.badge ?? ""); }}>
                                <Award className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon-xs" className="h-7 w-7 rounded-lg text-zinc-500 hover:text-red-600" onClick={() => setDeleteConfirmId(p.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                              <Link href={`/products/${p.id}`} className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50">View</Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-4 flex items-center gap-2">
                <UserCircle2 className="h-5 w-5 text-indigo-500" />
                <p className="text-sm font-semibold text-zinc-900">
                  Manage users
                </p>
                <span className="text-[11px] text-zinc-500">{allUsers.length} total</span>
              </div>
              {adminUsersLoading ? (
                <p className="text-[11px] text-zinc-500">Loading users...</p>
              ) : allUsers.length === 0 ? (
                <p className="text-[11px] text-zinc-500">No users yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-500">
                        <th className="pb-2 pr-2 font-medium">User</th>
                        <th className="pb-2 pr-2 font-medium">Role</th>
                        <th className="pb-2 pr-2 font-medium">Badge</th>
                        <th className="pb-2 pr-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((u) => {
                        const displayName = u.username || u.discord_username || u.id.slice(0, 8) || "—";
                        const isBanned = u.banned || (u.banned_until && new Date(u.banned_until) > new Date());
                        const status = u.banned ? "Banned" : u.banned_until && new Date(u.banned_until) > new Date() ? `Timeout until ${new Date(u.banned_until).toLocaleDateString()}` : "Active";
                        return (
                          <tr key={u.id} className="border-b border-zinc-100">
                            <td className="py-2.5 pr-2">
                              <Link href={`/users/${u.id}`} className="font-medium text-zinc-900 hover:underline">
                                {displayName}
                              </Link>
                            </td>
                            <td className="py-2.5 pr-2 text-zinc-600">{u.role}</td>
                            <td className="py-2.5 pr-2">
                              {u.badge ? (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">{u.badge}</span>
                              ) : "—"}
                            </td>
                            <td className="py-2.5 pr-2">
                              {isBanned ? <span className="text-red-600 font-medium">{status}</span> : <span className="text-emerald-600">{status}</span>}
                            </td>
                            <td className="py-2.5 flex flex-wrap items-center gap-1">
                              <Button variant="ghost" size="icon-xs" className="h-7 w-7 rounded-lg text-zinc-500 hover:text-amber-600" onClick={() => { setBadgeTarget({ type: "user", id: u.id }); setBadgeInput(u.badge ?? ""); }}>
                                <Award className="h-3.5 w-3.5" />
                              </Button>
                              {isBanned ? (
                                <Button variant="ghost" size="icon-xs" className="h-7 w-7 rounded-lg text-zinc-500 hover:text-emerald-600" onClick={() => handleUnbanUser(u.id)} title="Unban">
                                  <Ban className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <>
                                  <Button variant="ghost" size="icon-xs" className="h-7 w-7 rounded-lg text-zinc-500 hover:text-orange-600" onClick={() => setTimeoutTarget({ userId: u.id })} title="Timeout">
                                    <Clock className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon-xs" className="h-7 w-7 rounded-lg text-zinc-500 hover:text-red-600" onClick={() => setBanConfirmUserId(u.id)} title="Ban">
                                    <Ban className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                              <Link href={`/users/${u.id}`} className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50">View</Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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

      {/* Admin: Badge dialog (product or user) */}
      <Dialog open={!!badgeTarget} onOpenChange={(o) => !o && setBadgeTarget(null)}>
        <DialogContent className="max-w-sm border-zinc-200">
          <DialogHeader>
            <DialogTitle>{badgeTarget?.type === "product" ? "Product badge" : "User badge"}</DialogTitle>
            <DialogDescription>Set a short badge label (e.g. Verified, Featured). Leave empty to clear.</DialogDescription>
          </DialogHeader>
          <input
            value={badgeInput}
            onChange={(e) => setBadgeInput(e.target.value)}
            placeholder="e.g. Featured"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs"
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBadgeTarget(null)}>Cancel</Button>
            <Button size="sm" disabled={adminProductsLoading || adminUsersLoading} onClick={() => badgeTarget?.type === "product" ? handleSetProductBadge() : handleSetUserBadge()}>
              {adminProductsLoading || adminUsersLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin: Timeout dialog */}
      <Dialog open={!!timeoutTarget} onOpenChange={(o) => !o && setTimeoutTarget(null)}>
        <DialogContent className="max-w-sm border-zinc-200">
          <DialogHeader>
            <DialogTitle>Timeout user</DialogTitle>
            <DialogDescription>User will be restricted until the timeout period ends. Enter number of days.</DialogDescription>
          </DialogHeader>
          <input
            type="number"
            min={1}
            value={timeoutDays}
            onChange={(e) => setTimeoutDays(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs"
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setTimeoutTarget(null)}>Cancel</Button>
            <Button size="sm" disabled={adminUsersLoading} onClick={handleTimeoutUser}>
              {adminUsersLoading ? "Saving..." : "Set timeout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin: Ban confirm dialog */}
      <Dialog open={!!banConfirmUserId} onOpenChange={(o) => !o && setBanConfirmUserId(null)}>
        <DialogContent className="max-w-sm border-zinc-200">
          <DialogHeader>
            <DialogTitle>Ban user?</DialogTitle>
            <DialogDescription>Banned users are restricted until you unban them. You can unban from the user table.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBanConfirmUserId(null)}>Cancel</Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-500" disabled={adminUsersLoading} onClick={() => banConfirmUserId && handleBanUser(banConfirmUserId)}>
              {adminUsersLoading ? "Saving..." : "Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

