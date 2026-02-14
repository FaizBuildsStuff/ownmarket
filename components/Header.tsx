"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Grid3X3,
  ShieldCheck,
  Sparkles,
  LogIn,
  LogOut,
  UserPlus,
  LayoutDashboard,
  ShoppingCart,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

type UserRole = "admin" | "buyer" | "seller" | null;

type AuthMode = "login" | "signup";

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] as any },
  },
};

const LOCAL_KEY = "ownmarket-auth";

export function Header() {
  const router = useRouter();
  const { itemCount } = useCart();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    discordHandle: "",
  });

  // Hydrate from localStorage + Supabase
  useEffect(() => {
    const stored = typeof window !== "undefined"
      ? window.localStorage.getItem(LOCAL_KEY)
      : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { userId?: string; role?: UserRole };
        if (parsed.userId) {
          setUserId(parsed.userId);
          setUserRole(parsed.role ?? null);
        }
      } catch {
        // ignore parse errors
      }
    }

    const syncFromSupabase = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      const role = (profile?.role as UserRole) ?? null;

      setUserId(authData.user.id);
      setUserRole(role);
      window.localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify({ userId: authData.user.id, role })
      );
    };

    void syncFromSupabase();
  }, []);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const resetForm = () => {
    setForm({
      email: "",
      password: "",
      username: "",
      discordHandle: "",
    });
    setError(null);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authMode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });

        if (signUpError || !data.user) {
          throw signUpError ?? new Error("Sign up failed");
        }

        await supabase.from("profiles").upsert({
          id: data.user.id,
          username: form.username,
          discord_handle: form.discordHandle,
        });

        setUserId(data.user.id);
        setUserRole(null);
        window.localStorage.setItem(
          LOCAL_KEY,
          JSON.stringify({ userId: data.user.id, role: null })
        );
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword(
          {
            email: form.email,
            password: form.password,
          }
        );

        if (signInError || !data.user) {
          throw signInError ?? new Error("Login failed");
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        const role = (profile?.role as UserRole) ?? null;

        setUserId(data.user.id);
        setUserRole(role);
        window.localStorage.setItem(
          LOCAL_KEY,
          JSON.stringify({ userId: data.user.id, role })
        );
      }

      resetForm();
      setIsAuthOpen(false);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.localStorage.removeItem(LOCAL_KEY);
    setUserId(null);
    setUserRole(null);
    router.push("/");
  };

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <>
      <motion.header
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        className="mb-6 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur md:mb-10 md:px-5"
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-zinc-900 text-xs font-semibold text-zinc-50 shadow-sm">
            OM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-zinc-900">OwnMarket</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Discord marketplace for Nitro, boosts & more
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-5 text-xs font-medium text-zinc-500 md:flex">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-zinc-900"
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 text-[10px]">
              <Grid3X3 className="h-3 w-3 text-zinc-700" aria-hidden="true" />
            </span>
            Marketplace
          </Link>
          <Link
            href="/safety"
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-zinc-900"
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 text-[10px]">
              <ShieldCheck className="h-3 w-3 text-zinc-700" aria-hidden="true" />
            </span>
            Safety
          </Link>
          <Link
            href="/perks"
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-zinc-900"
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 text-[10px]">
              <Sparkles className="h-3 w-3 text-zinc-700" aria-hidden="true" />
            </span>
            Perks
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
          {!userId ? (
            <>
              <Button
                onClick={() => openAuth("login")}
                variant="outline"
                size="xs"
                className="hidden rounded-full border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 shadow-sm hover:border-zinc-300 hover:text-zinc-900 md:inline-flex"
              >
                <LogIn
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-zinc-700"
                />
                Log in
              </Button>
              <Button
                onClick={() => openAuth("signup")}
                size="xs"
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-[11px] font-medium text-zinc-50 shadow-sm transition-colors hover:bg-zinc-800"
              >
                <UserPlus
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-zinc-50"
                />
                Sign up
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                size="xs"
                className="hidden items-center gap-1.5 rounded-full border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:text-zinc-900 md:inline-flex"
              >
                <LayoutDashboard
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-zinc-700"
                />
                Dashboard
                {userRole && (
                  <span className="ml-1 rounded-full bg-zinc-900/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-zinc-500">
                    {userRole}
                  </span>
                )}
              </Button>
              <Button
                onClick={handleLogout}
                size="xs"
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-[11px] font-medium text-zinc-50 shadow-sm transition-colors hover:bg-zinc-800"
              >
                <LogOut
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-zinc-50"
                />
                Logout
              </Button>
            </>
          )}
        </div>
      </motion.header>

      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="w-full max-w-md border-zinc-200 bg-white text-sm text-zinc-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">
              {authMode === "signup" ? "Create your account" : "Welcome back"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              {authMode === "signup"
                ? "Sign up with your Discord handle and email."
                : "Log in to access your dashboard."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAuthSubmit} className="mt-2 space-y-3">
            {authMode === "signup" && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">
                    Discord handle
                  </label>
                  <input
                    required
                    value={form.discordHandle}
                    onChange={handleChange("discordHandle")}
                    placeholder="e.g. ownmarket#0001"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none ring-0 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">
                    Username
                  </label>
                  <input
                    required
                    value={form.username}
                    onChange={handleChange("username")}
                    placeholder="Choose a marketplace username"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none ring-0 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                Email
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none ring-0 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                Password
              </label>
              <input
                required
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none ring-0 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-500">
                {error}
              </p>
            )}

            <DialogFooter className="mt-1 gap-2 sm:justify-between">
              <span className="text-[11px] text-zinc-500">
                {authMode === "signup"
                  ? "Already have an account?"
                  : "Need an account?"}{" "}
                <button
                  type="button"
                  onClick={() =>
                    setAuthMode((m) => (m === "signup" ? "login" : "signup"))
                  }
                  className="font-medium text-zinc-900 underline-offset-2 hover:underline"
                >
                  {authMode === "signup" ? "Log in" : "Sign up"}
                </button>
              </span>

              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="rounded-full px-4 py-2 text-xs"
              >
                {loading
                  ? "Please wait..."
                  : authMode === "signup"
                  ? "Sign up"
                  : "Log in"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Header;


