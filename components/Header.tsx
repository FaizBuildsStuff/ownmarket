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
  Menu,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/marketplace", icon: Grid3X3, label: "Marketplace" },
    { href: "/safety", icon: ShieldCheck, label: "Safety" },
    { href: "/perks", icon: Sparkles, label: "Perks" },
  ];

  return (
    <>
      <motion.header
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:mb-6 sm:px-4 sm:py-3 md:mb-10 md:px-5"
      >
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <img
            src="/logo.png"
            alt="OwnMarket"
            className="h-8 w-8 shrink-0 rounded-xl object-contain sm:h-9 sm:w-9 sm:rounded-2xl"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="truncate text-sm font-semibold text-zinc-900">OwnMarket</span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 sm:px-2 sm:text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <p className="hidden truncate text-[11px] text-zinc-500 sm:block">
              Discord marketplace for Nitro, boosts & more
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-3 text-xs font-medium text-zinc-500 md:flex md:gap-5">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-zinc-900"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 text-[10px]">
                <Icon className="h-3 w-3 text-zinc-700" aria-hidden />
              </span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/cart"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 sm:h-9 sm:w-9"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex md:items-center md:gap-2">
            {!userId ? (
              <>
                <Button
                  onClick={() => openAuth("login")}
                  variant="outline"
                  size="xs"
                  className="rounded-full border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 shadow-sm hover:border-zinc-300 hover:text-zinc-900"
                >
                  <LogIn className="h-3.5 w-3.5 text-zinc-700" aria-hidden />
                  Log in
                </Button>
                <Button
                  onClick={() => openAuth("signup")}
                  size="xs"
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-[11px] font-medium text-zinc-50 shadow-sm hover:bg-zinc-800"
                >
                  <UserPlus className="h-3.5 w-3.5 text-zinc-50" aria-hidden />
                  Sign up
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  size="xs"
                  className="items-center gap-1.5 rounded-full border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 shadow-sm hover:border-zinc-300 hover:text-zinc-900"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-zinc-700" aria-hidden />
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
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-[11px] font-medium text-zinc-50 shadow-sm hover:bg-zinc-800"
                >
                  <LogOut className="h-3.5 w-3.5 text-zinc-50" aria-hidden />
                  Logout
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-zinc-200 bg-white sm:h-9 sm:w-9 md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[12%] left-1/2 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 translate-y-0 border-zinc-200 bg-white p-0 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <span className="text-sm font-semibold text-zinc-900">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex flex-col py-2">
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100">
                  <Icon className="h-4 w-4 text-zinc-600" />
                </span>
                {label}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100">
                <ShoppingCart className="h-4 w-4 text-zinc-600" />
              </span>
              Cart
              {itemCount > 0 && (
                <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>
          <div className="border-t border-zinc-200 p-4">
            {!userId ? (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => openAuth("login")}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Button>
                <Button
                  onClick={() => openAuth("signup")}
                  size="sm"
                  className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign up
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/dashboard");
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                  {userRole && (
                    <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] uppercase text-zinc-600">
                      {userRole}
                    </span>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  size="sm"
                  className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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


