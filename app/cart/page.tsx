"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { fetchCartProductsAction } from "@/app/actions";
import { fetchUserConversationsAction, getOrCreateConversationAction } from "@/app/chat-actions";
import { ChatSidebar } from "@/components/ChatSidebar";
import { useCart } from "@/context/CartContext";
import {
  ShoppingCart,
  Trash2,
  MessageSquare,
  Minus,
  Plus,
  ArrowLeft,
  ShieldCheck,
  User,
  MessageCircleMore,
  UserCircle2,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";

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

export default function CartPage() {
  const { items, removeItem, updateQuantity, itemCount } = useCart();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [profiles, setProfiles] = useState<Map<string, SellerProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Chat Inbox States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<any>(null);
  const [activeChatProduct, setActiveChatProduct] = useState<string | null>(null);
  const [activeChatStatus, setActiveChatStatus] = useState<any>("open");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatStartingId, setChatStartingId] = useState<string | null>(null);

  const productIds = Object.keys(items);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    let mounted = true;
    const fetchChatInbox = async () => {
      try {
        if (mounted && conversations.length === 0) setInboxLoading(true);
        const data = await fetchUserConversationsAction();
        if (mounted) {
          setConversations(data);
          setInboxLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setInboxLoading(false);
      }
    };

    fetchChatInbox();
    const interval = setInterval(fetchChatInbox, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      setProfiles(new Map());
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const cartProductsData = await fetchCartProductsAction(productIds);

        const prods: CartProduct[] = cartProductsData.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          quantity: p.quantity,
          seller_id: p.sellerId,
        }));

        setProducts(prods);

        const map = new Map<string, SellerProfile>();
        cartProductsData.forEach((p) => {
          if (p.sellerId && !map.has(p.sellerId)) {
            map.set(p.sellerId, {
              id: p.sellerId,
              username: p.sellerUsername,
              discord_username: p.sellerDiscordUsername,
              discord_id: p.sellerDiscordId,
            });
          }
        });

        setProfiles(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [productIds.join(",")]);

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.from(".cart-item", {
          opacity: 0,
          x: -20,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out"
        });
        gsap.from(".summary-card", {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: 0.3
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleStartOrder = async (sellerId: string, productId: string) => {
    if (!currentUser?.id) {
      alert("Please log in to start an order.");
      return;
    }

    if (currentUser.id === sellerId) {
      alert("You cannot start an order with yourself.");
      return;
    }

    setChatStartingId(productId);
    try {
      const conv = await getOrCreateConversationAction(sellerId, productId);

      setActiveChatId(conv.id);

      // Try to find user from existing maps or it will resolve on load
      const s = profiles.get(sellerId);
      setActiveChatUser(s ? {
        id: s.id,
        username: s.username,
        discordUsername: s.discord_username,
        discordId: s.discord_id,
      } : null);

      const p = products.find(prod => prod.id === productId);
      setActiveChatProduct(p?.name || null);
      setActiveChatStatus(conv.status);
      setIsChatOpen(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to start chat.");
    } finally {
      setChatStartingId(null);
    }
  };

  const rows = products
    .map((p) => ({ ...p, cartQty: items[p.id] ?? 0 }))
    .filter((r) => r.cartQty > 0);

  const subtotal = rows.reduce((sum, r) => sum + r.price * r.cartQty, 0);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-black" />
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAFAFA] text-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">

        {/* HEADER */}
        <header className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/marketplace" className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
              <ArrowLeft className="h-3 w-3" /> Continue Shopping
            </Link>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Your Selection</h1>
          </div>
          <div className="text-sm font-medium text-zinc-500">
            {itemCount} items ready for acquisition
          </div>
        </header>

        {itemCount === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-zinc-200 bg-white py-32 text-center shadow-sm">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50">
              <ShoppingCart className="h-10 w-10 text-zinc-200" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Your cart is empty</h2>
            <p className="mb-8 text-zinc-500 max-w-xs">Looks like you haven't added any premium assets to your cart yet.</p>
            <Button asChild className="rounded-full px-8 py-6 text-sm font-bold uppercase tracking-widest">
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">

            {/* ITEMS LIST */}
            <div className="space-y-6">
              {rows.map((row) => {
                const seller = profiles.get(row.seller_id);
                return (
                  <div key={row.id} className="cart-item group relative overflow-hidden rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">

                      {/* PRODUCT ICON/IMAGE PLACEHOLDER */}
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300 transition-colors group-hover:bg-zinc-100 group-hover:text-zinc-400">
                        <ShoppingCart className="h-8 w-8" />
                      </div>

                      {/* DETAILS */}
                      <div className="flex flex-grow flex-col justify-center">
                        <div className="mb-1 flex items-center justify-between">
                          <h3 className="text-lg font-bold tracking-tight">{row.name}</h3>
                          <span className="text-lg font-bold">${(row.price * row.cartQty).toLocaleString()}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-zinc-400">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            By <span className="text-zinc-900">{seller?.discord_username || seller?.username || "Verified Seller"}</span>
                          </div>
                          <div className="h-1 w-1 rounded-full bg-zinc-200" />
                          <span>${row.price.toLocaleString()} / unit</span>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center justify-between border-t border-zinc-50 pt-4 md:border-none md:pt-0 gap-4">
                        <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-1">
                          <button
                            onClick={() => updateQuantity(row.id, row.cartQty - 1, row.quantity)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm transition-hover hover:text-black"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{row.cartQty}</span>
                          <button
                            onClick={() => updateQuantity(row.id, row.cartQty + 1, row.quantity)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm transition-hover hover:text-black"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 border-t border-zinc-50 pt-4 md:border-none md:pt-0">
                          <button
                            onClick={() => removeItem(row.id)}
                            className="flex h-10 w-10 items-center justify-center text-zinc-300 hover:text-red-500 transition-all"
                            title="Remove completely"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>

                          <Button
                            onClick={() => handleStartOrder(row.seller_id, row.id)}
                            disabled={chatStartingId === row.id}
                            variant="secondary"
                            size="sm"
                            className="rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold"
                          >
                            <MessageSquare className="mr-2 h-3.5 w-3.5" />
                            {chatStartingId === row.id ? "Starting..." : "Start Order"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BUYER INBOX */}
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageCircleMore className="h-5 w-5 text-indigo-500" />
                  Your Orders & Inbox
                </h2>
                {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    {conversations.filter(c => c.unreadCount > 0).length} Updates
                  </span>
                )}
              </div>

              {inboxLoading ? (
                <p className="text-sm text-zinc-500">Loading inbox...</p>
              ) : conversations.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-center">
                  <p className="text-sm font-medium text-zinc-600">No active orders</p>
                  <p className="mt-1 text-xs text-zinc-400">Click "Start Order" on any item above to contact the seller.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveChatId(conv.id);
                        setActiveChatUser(conv.otherUser);
                        setActiveChatProduct(conv.productName);
                        setActiveChatStatus(conv.status);
                        setIsChatOpen(true);
                      }}
                      className="group flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {conv.otherUser?.discordAvatar && conv.otherUser?.discordId ? (
                            <img
                              src={`https://cdn.discordapp.com/avatars/${conv.otherUser.discordId}/${conv.otherUser.discordAvatar}.png`}
                              className="h-10 w-10 rounded-full bg-zinc-200 object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-300 shadow-sm">
                              <UserCircle2 className="h-5 w-5" />
                            </div>
                          )}
                          {conv.unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-[9px] font-bold text-white">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                            {conv.otherUser?.discordUsername || conv.otherUser?.username || "Verified Seller"}
                          </p>
                          <p className="text-xs font-medium text-zinc-500 line-clamp-1 max-w-[150px]">
                            {conv.productName ? `${conv.productName}` : "Order inquiry"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {conv.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            <Award className="h-3 w-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SIDEBAR SUMMARY */}
            <aside className="relative">
              <div className="summary-card sticky top-12 space-y-8 rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold">Order Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-zinc-900">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Platform Fee</span>
                    <span className="font-bold text-zinc-900">$0.00</span>
                  </div>
                  <div className="h-px bg-zinc-100" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-2xl tracking-tighter">${subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full rounded-2xl py-7 text-sm font-bold uppercase tracking-widest shadow-xl shadow-zinc-200"
                    onClick={() => {
                      if (conversations.length > 0) {
                        const first = conversations[0];
                        setActiveChatId(first.id);
                        setActiveChatUser(first.otherUser);
                        setActiveChatProduct(first.productName);
                        setActiveChatStatus(first.status);
                        setIsChatOpen(true);
                      } else {
                        alert("Start an order from an item to open your inbox.");
                      }
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Open Inbox
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    <ShieldCheck className="h-3 w-3" /> Secured by Agency Protocol
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-4">
                  <p className="text-[11px] leading-relaxed text-zinc-500">
                    <span className="font-bold text-zinc-900">Direct Delivery:</span> Contact the sellers directly to finalize payment and receive your digital assets.
                  </p>
                </div>
              </div>
            </aside>

          </div>
        )}
      </div>

      {/* OVERLAYS */}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setActiveChatId(null);
        }}
        conversationId={activeChatId}
        currentUserId={currentUser?.id}
        otherUser={activeChatUser}
        productName={activeChatProduct}
        status={activeChatStatus}
        isBuyer={true}
      />
    </div>
  );
}