"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  fetchUserProducts,
  fetchAllProductsAction,
  fetchAllUsersAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  setProductBadgeAction,
  setUserBadgeAction,
  banUserAction,
  timeoutUserAction,
  unbanUserAction
} from "@/app/actions";
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
import gsap from "gsap";


type UserRole = "admin" | "buyer" | "seller" | null;

type ProductRow = {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
  description: string | null;
  discordChannelLink: string | null;
  badge?: string | null;
  sellerId?: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
  discordUsername: string | null;
  role: string;
  badge: string | null;
  banned: boolean;
  bannedUntil: string | null;
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".seller-title", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power4.out",
      });

      gsap.from(".seller-card", {
        opacity: 0,
        y: 50,
        duration: 0.9,
        stagger: 0.12,
        ease: "power4.out",
      });

      gsap.to(".floating-orb", {
        y: 40,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 1,
      });
    });

    return () => ctx.revert();
  }, []);
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
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push("/");
          return;
        }

        const { user } = await res.json();
        if (!user) {
          router.push("/");
          return;
        }

        setUserId(user.id);
        setEmail(user.email);
        setRole(user.role);
        setUsername(user.username);
        setDiscordId(user.discordId);
        setDiscordUsername(user.discordUsername);
        setDiscordAvatar(user.discordAvatar);
      } catch (err) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [router]);

  const fetchProducts = async () => {
    if (!userId || role !== "seller") return;
    setProductsLoading(true);
    try {
      const data = await fetchUserProducts();
      setProducts(data as any[]);
    } catch (e) {
      console.error(e);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    setAdminProductsLoading(true);
    setAdminError(null);
    try {
      const data = await fetchAllProductsAction();
      setAllProducts(data as unknown as ProductRow[]);
    } catch (error: any) {
      setAdminError(error.message);
    } finally {
      setAdminProductsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setAdminUsersLoading(true);
    setAdminError(null);
    try {
      const data = await fetchAllUsersAction();
      setAllUsers(data as unknown as ProfileRow[]);
    } catch (error: any) {
      setAdminError(error.message);
    } finally {
      setAdminUsersLoading(false);
    }
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
      discordChannel: p.discordChannelLink ?? "",
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setProductsLoading(true);
    try {
      const price = parseFloat(editForm.price);
      const quantity = parseInt(editForm.quantity ?? "0", 10);

      await updateProductAction(editingId, {
        name: editForm.name,
        price: Number.isNaN(price) ? 0 : price,
        quantity: Number.isNaN(quantity) ? 0 : quantity,
        description: editForm.description || undefined,
        discordChannel: editForm.discordChannel || undefined,
      });

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
      await deleteProductAction(id);
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

      const data = await createProductAction({
        name: productForm.name,
        price: Number.isNaN(price) ? 0 : price,
        quantity: Number.isNaN(quantity) ? 0 : Math.max(0, quantity),
        description: productForm.description || undefined,
        discordChannel: productForm.discordChannel || undefined,
      });

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
      await setProductBadgeAction(badgeTarget.id, badgeInput.trim() || null);
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
      await setUserBadgeAction(badgeTarget.id, badgeInput.trim() || null);
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
      await banUserAction(targetUserId);
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
      await timeoutUserAction(timeoutTarget.userId, days);
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
      await unbanUserAction(targetUserId);
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
            <div className="relative md:col-span-3 overflow-hidden rounded-3xl border border-zinc-200/70 bg-gradient-to-br from-white via-zinc-50 to-indigo-50/40 p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">

              {/* Grid overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
                <div className="h-full w-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:60px_60px]" />
              </div>

              {/* Floating gradient orbs */}
              <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl floating-orb" />
              <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl floating-orb" />

              <div className="relative z-10 space-y-16">

                {/* ================= HEADER ================= */}
                <div className="space-y-6 seller-title">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-400">
                    Seller Workspace
                  </p>

                  <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
                    Manage Your Digital Assets
                    <span className="block bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 bg-clip-text text-transparent">
                      Sell smarter. Grow faster.
                    </span>
                  </h1>

                  <p className="max-w-xl text-sm text-zinc-600 leading-relaxed">
                    Create listings, manage stock, and build buyer trust —
                    all inside your premium OwnMarket dashboard.
                  </p>
                </div>

                {/* ================= STATS ================= */}
                <div className="grid gap-6 md:grid-cols-3">
                  {[
                    { label: "Total Listings", value: products.length },
                    { label: "In Stock", value: products.filter(p => p.quantity > 0).length },
                    { label: "Out of Stock", value: products.filter(p => p.quantity === 0).length },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="seller-card rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(15,23,42,0.12)]"
                    >
                      <p className="text-xs uppercase tracking-widest text-zinc-400">
                        {item.label}
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-zinc-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ================= MAIN GRID ================= */}
                <div className="grid gap-10 lg:grid-cols-3">

                  {/* CREATE PRODUCT */}
                  <div className="seller-card lg:col-span-2 rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                    <div className="mb-8 flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-zinc-900">
                        Create New Listing
                      </h2>
                      <span className="rounded-full bg-emerald-50 px-4 py-1 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200">
                        Seller Tools
                      </span>
                    </div>

                    <form
                      onSubmit={handleCreateProduct}
                      className="grid gap-6 md:grid-cols-2"
                    >
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-medium text-zinc-600">
                          Product Name
                        </label>
                        <input
                          required
                          value={productForm.name}
                          onChange={handleProductChange("name")}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-600">
                          Price (USD)
                        </label>
                        <input
                          required
                          type="number"
                          step="0.01"
                          min="0"
                          value={productForm.price}
                          onChange={handleProductChange("price")}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-600">
                          Quantity
                        </label>
                        <input
                          required
                          type="number"
                          min="0"
                          value={productForm.quantity}
                          onChange={handleProductChange("quantity")}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-medium text-zinc-600">
                          Description
                        </label>
                        <textarea
                          rows={4}
                          value={productForm.description}
                          onChange={handleProductChange("description")}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-medium text-zinc-600">
                          Discord Channel (Optional)
                        </label>
                        <input
                          type="url"
                          value={productForm.discordChannel}
                          onChange={handleProductChange("discordChannel")}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                        />
                      </div>

                      <div className="md:col-span-2 flex justify-end">
                        <Button
                          type="submit"
                          disabled={productsLoading}
                          className="rounded-full px-8 py-2 text-sm shadow-lg"
                        >
                          {productsLoading ? "Saving..." : "Create Product"}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* DISCORD PROFILE */}
                  <div className="seller-card rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                    <h2 className="mb-6 text-lg font-semibold text-zinc-900">
                      Discord Profile
                    </h2>

                    {discordUsername ? (
                      <div className="space-y-4">
                        {discordId && (
                          <img
                            src={
                              discordAvatar
                                ? `https://cdn.discordapp.com/avatars/${discordId}/${discordAvatar}.${discordAvatar.startsWith("a_") ? "gif" : "png"}?size=256`
                                : `https://cdn.discordapp.com/embed/avatars/${Number(discordId) % 5}.png`
                            }
                            alt="Discord avatar"
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        )}

                        <p className="text-sm font-medium text-zinc-900">
                          @{discordUsername}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Buyers can contact you directly.
                        </p>
                      </div>
                    ) : (
                      <Button
                        className="rounded-full bg-indigo-600 hover:bg-indigo-500"
                        asChild
                      >
                        <a href={`/api/auth/discord?userId=${encodeURIComponent(userId ?? "")}`}>
                          Connect Discord
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* ================= LISTINGS ================= */}
                <div className="seller-card rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl p-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                  <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">
                      Your Listings
                    </h2>
                    <span className="rounded-full bg-zinc-100 px-4 py-1 text-xs text-zinc-600">
                      {products.length} total
                    </span>
                  </div>

                  {products.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      You haven’t listed anything yet.
                    </p>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className="group relative rounded-3xl border border-zinc-200 bg-zinc-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-zinc-900">
                                {p.name}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                ${Number(p.price).toFixed(2)} ·{" "}
                                {p.quantity === 0
                                  ? "Out of stock"
                                  : `${p.quantity} in stock`}
                              </p>
                            </div>

                            {/* Status Badge */}
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-medium ${p.quantity === 0
                                ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                                : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                                }`}
                            >
                              {p.quantity === 0 ? "Out" : "Active"}
                            </span>
                          </div>

                          {/* Divider */}
                          <div className="my-5 h-px bg-zinc-200/70" />

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <Link
                              href={`/products/${p.id}`}
                              className="rounded-xl border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
                            >
                              View
                            </Link>

                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-indigo-600"
                                onClick={() => openEdit(p)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-red-600"
                                onClick={() => setDeleteConfirmId(p.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        )}





        {/* Admin view */}
        {role === "admin" && (
          <>
            {adminError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {adminError}
              </div>
            )}

            {/* ================= PRODUCTS ================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-zinc-200/70 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50">
                    <ShieldCheck className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-400">
                      Administration
                    </p>
                    <p className="text-lg font-semibold text-zinc-900">
                      Manage Products
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-zinc-100 px-4 py-1 text-xs font-medium text-zinc-600">
                  {allProducts.length} total
                </span>
              </div>

              {adminProductsLoading ? (
                <p className="text-sm text-zinc-500">Loading products...</p>
              ) : allProducts.length === 0 ? (
                <p className="text-sm text-zinc-500">No products found.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-zinc-200">
                  <div className="max-h-[500px] overflow-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Seller</th>
                          <th className="px-4 py-3">Price</th>
                          <th className="px-4 py-3">Qty</th>
                          <th className="px-4 py-3">Badge</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allProducts.map((p) => {
                          const seller = allUsers.find((u) => u.id === p.sellerId);
                          const sellerName =
                            seller?.username ||
                            seller?.discordUsername ||
                            p.sellerId?.slice(0, 8) ||
                            "—";

                          return (
                            <tr
                              key={p.id}
                              className="border-t border-zinc-100 transition hover:bg-zinc-50/70"
                            >
                              <td className="px-4 py-3 font-medium text-zinc-900">
                                <Link href={`/products/${p.id}`} className="hover:underline">
                                  {p.name}
                                </Link>
                              </td>

                              <td className="px-4 py-3 text-zinc-600">
                                <Link href={`/users/${p.sellerId}`} className="hover:underline">
                                  {sellerName}
                                </Link>
                              </td>

                              <td className="px-4 py-3 font-medium">
                                ${Number(p.price).toFixed(2)}
                              </td>

                              <td className="px-4 py-3">{p.quantity}</td>

                              <td className="px-4 py-3">
                                {p.badge ? (
                                  <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600 ring-1 ring-amber-200">
                                    {p.badge}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>

                              <td className="px-4 py-3 flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-indigo-600"
                                  onClick={() => openEdit(p)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-amber-600"
                                  onClick={() => {
                                    setBadgeTarget({ type: "product", id: p.id });
                                    setBadgeInput(p.badge ?? "");
                                  }}
                                >
                                  <Award className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-red-600"
                                  onClick={() => setDeleteConfirmId(p.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>

                                <Link
                                  href={`/products/${p.id}`}
                                  className="rounded-xl border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>

            {/* ================= USERS ================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="mt-10 rounded-3xl border border-zinc-200/70 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50">
                    <UserCircle2 className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-400">
                      Administration
                    </p>
                    <p className="text-lg font-semibold text-zinc-900">
                      Manage Users
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-zinc-100 px-4 py-1 text-xs font-medium text-zinc-600">
                  {allUsers.length} total
                </span>
              </div>

              {adminUsersLoading ? (
                <p className="text-sm text-zinc-500">Loading users...</p>
              ) : allUsers.length === 0 ? (
                <p className="text-sm text-zinc-500">No users found.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-zinc-200">
                  <div className="max-h-[500px] overflow-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                        <tr>
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Badge</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((u) => {
                          const displayName =
                            u.username ||
                            u.discordUsername ||
                            u.id.slice(0, 8) ||
                            "—";

                          const isBanned =
                            u.banned ||
                            (u.bannedUntil &&
                              new Date(u.bannedUntil) > new Date());

                          const status = isBanned
                            ? "Restricted"
                            : "Active";

                          return (
                            <tr
                              key={u.id}
                              className="border-t border-zinc-100 transition hover:bg-zinc-50/70"
                            >
                              <td className="px-4 py-3 font-medium text-zinc-900">
                                <Link href={`/users/${u.id}`} className="hover:underline">
                                  {displayName}
                                </Link>
                              </td>

                              <td className="px-4 py-3 capitalize text-zinc-600">
                                {u.role}
                              </td>

                              <td className="px-4 py-3">
                                {u.badge ? (
                                  <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600 ring-1 ring-amber-200">
                                    {u.badge}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>

                              <td className="px-4 py-3">
                                {isBanned ? (
                                  <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 ring-1 ring-red-200">
                                    {status}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200">
                                    {status}
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3 flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-amber-600"
                                  onClick={() => {
                                    setBadgeTarget({ type: "user", id: u.id });
                                    setBadgeInput(u.badge ?? "");
                                  }}
                                >
                                  <Award className="h-4 w-4" />
                                </Button>

                                <Link
                                  href={`/users/${u.id}`}
                                  className="rounded-xl border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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

