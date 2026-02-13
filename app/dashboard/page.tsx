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

type UserRole = "admin" | "buyer" | "seller" | null;

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.push("/");
        return;
      }

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
              className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-xs text-zinc-700 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur"
            >
              <div className="mb-2 flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-semibold text-zinc-900">
                  Seller overview
                </p>
              </div>
              <p className="text-zinc-500">
                Once you list items, you&apos;ll see your queue, earnings and
                dispute health here.
              </p>
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

