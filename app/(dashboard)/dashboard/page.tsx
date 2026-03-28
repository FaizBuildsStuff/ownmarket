"use client"

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import {
  Download,
  ExternalLink,
  Clock,
  Shield,
  ShieldCheck,
  Search,
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Settings,
  Star,
  Trash2,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  History,
  ArrowDownToLine,
  Box,
  Disc as DiscordIcon,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Plus
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from '@/app/context/CartContext'
import { toast } from 'sonner'

// --- SHADCN ALERT DIALOG IMPORTS ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

import AdminOverview from '@/components/dashboard/AdminOverview'
import AdminUsers from '@/components/dashboard/AdminUsers'
import AdminProducts from '@/components/dashboard/AdminProducts'

type UserRole = "ADMIN" | "SELLER" | "BUYER"

type CurrentUser = {
  id: string
  name: string | null
  email: string | null
  role: UserRole
  discordId?: string | null
  discordUsername?: string | null
  discordAvatar?: string | null
}

type Product = {
  id: string
  title: string
  price: number
  category: string
  createdAt: string
}

const purchases = [
  {
    id: 1,
    title: "Next.js SaaS Starter Kit",
    price: "$49",
    date: "March 2, 2026",
    version: "v2.4.0",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    category: "Template"
  },
  {
    id: 2,
    title: "Modern Landing Pages Pack",
    price: "$19",
    date: "Feb 28, 2026",
    version: "v1.1.0",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    category: "Design"
  },
  {
    id: 3,
    title: "Framer Motion Animations",
    price: "$32",
    date: "Jan 15, 2026",
    version: "v3.0.1",
    image: "https://images.unsplash.com/photo-1550439062-609e1531270e",
    category: "Animation"
  }
]

export default function DashboardPage() {

  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("purchases")
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [sellerProducts, setSellerProducts] = useState<Product[]>([])
  const [creating, setCreating] = useState(false)
  const { cart } = useCart()
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalSpent: 0,
    monthlySpent: 0,
    itemsBoughtThisMonth: 0
  })

  // --- EDIT PRODUCT STATE ---
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // --- STATE FOR SHADCN ALERT ---
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    image: "",
    isVisible: true,
  })

  const isSeller = user?.role === "SELLER"

  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        if (!res.ok) {
          router.replace("/signin")
          return
        }
        const data = await res.json()
        if (!data.user) {
          router.replace("/signin")
          return
        }
        setUser(data.user)

        // Fetch real buyer data if applicable
        if (data.user.role === "BUYER" || data.user.role === "ADMIN") {
          const buyerRes = await fetch("/api/dashboard/buyer", { cache: "no-store" })
          if (buyerRes.ok) {
            const buyerData = await buyerRes.json()
            setStats(buyerData.stats)
            setPurchaseHistory(buyerData.library)
          }
        }

        if (data.user.role === "SELLER" || data.user.role === "ADMIN") {
          const prodRes = await fetch("/api/products?mine=1", { cache: "no-store" })
          if (prodRes.ok) {
            const prodData = await prodRes.json()
            setSellerProducts(prodData.products ?? [])
          }
        }
      } catch {
        router.replace("/signin")
      } finally {
        setLoadingUser(false)
      }
    }
    loadUserAndData()
  }, [router])

  const handleCreateProduct = async () => {
    if (!newProduct.title || !newProduct.price || !newProduct.category) {
      alert("Title, price and category are required")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProduct.title,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          description: newProduct.description,
          image: newProduct.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
          isVisible: newProduct.isVisible,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setSellerProducts((prev) => [data.product, ...prev])
        setNewProduct({ title: "", price: "", category: "", description: "", image: "", isVisible: true })
      } else {
        alert(data.message || "Could not create product")
      }
    } catch {
      alert("Could not create product")
    } finally {
      setCreating(false)
    }
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingProduct.title,
          price: parseFloat(editingProduct.price),
          category: editingProduct.category,
          description: editingProduct.description,
          image: editingProduct.image,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSellerProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? data.product : p))
        )
        setEditingProduct(null)
        toast.success("Product updated successfully")
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || "Could not update product")
      }
    } catch {
      toast.error("Could not update product")
    } finally {
      setIsUpdating(false)
    }
  }

  // --- UPDATED DELETE LOGIC FOR SHADCN ---
  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/products/${productToDelete}`, { method: "DELETE" })
      if (res.ok) {
        setSellerProducts((prev) => prev.filter((p) => p.id !== productToDelete))
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.message || "Could not delete product")
      }
    } catch {
      alert("Could not delete product")
    } finally {
      setIsDeleting(false)
      setProductToDelete(null)
    }
  }

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } })

      tl.from(".sidebar-item", {
        x: -20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05
      })
        .from(".dashboard-header", {
          y: 20,
          opacity: 0,
          duration: 1
        }, "-=0.6")
        .from(".purchase-card", {
          scale: 0.95,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          clearProps: "all"
        }, "-=0.6")
    }, containerRef)

    return () => ctx.revert()
  }, [])

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFB]">
        <p className="text-sm text-[#767F88]">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAFAFB] flex selection:bg-[#48E44B]/30 font-sans">

      {/* SHADCN ALERT DIALOG COMPONENT */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent className="rounded-[32px] border-none p-8 max-w-[420px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight text-[#141519]">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#767F88] font-medium mt-2">
              This will permanently delete your product from the marketplace. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="h-12 rounded-xl border-gray-100 font-bold text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/20"
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 1. MINIMALIST SIDEBAR */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-gray-100 bg-white/50 backdrop-blur-xl p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-12">
          <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">O</div>
          <span className="font-black tracking-tighter text-lg">OwnMarket</span>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            {
               id: "purchases",
               icon: user?.role === 'ADMIN' ? <Shield size={18} /> : <ShoppingBag size={18} />,
               label: user?.role === 'ADMIN' ? "Admin Command" : "My Library",
               path: "/dashboard"
             },
             {
               id: "messages",
               icon: <MessageSquare size={18} />,
               label: "Messages",
               path: "/dashboard/messages",
               hasNotification: true 
             },
          ].map((item) => {
            // Check if the current route matches the item path
            const isActive = window.location.pathname === item.path || activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  router.push(item.path); // Handles the redirect
                }}
                className={`sidebar-item w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${isActive
                    ? "bg-black text-white shadow-xl shadow-black/10 scale-[1.02]"
                    : "text-[#767F88] hover:bg-black/5 hover:text-black"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </div>

                {item.hasNotification && !isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-[#48E44B] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-item p-4 rounded-2xl bg-[#48E44B]/10 border border-[#48E44B]/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#2d8a2f] mb-1">Pro Member</p>
          <p className="text-xs font-bold text-black">Unlimited cloud storage enabled.</p>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto">

        {/* HEADER */}
        <header className="dashboard-header flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-[#141519]">
              {user?.role === "ADMIN" ? "Admin Console" : user?.role === "SELLER" ? "Seller Studio" : "Library"}
            </h1>
            <p className="text-[#767F88] font-medium mt-1">
              {user?.role === "ADMIN"
                ? "Manage platform users, assets, and global protocols."
                : user?.role === "SELLER"
                ? "Create and manage your marketplace products."
                : `Manage your ${purchases.length} digital assets.`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767F88] group-focus-within:text-black" size={18} />
              <Input
                placeholder={user?.role === "SELLER" ? "Search your products..." : "Search platform..."}
                className="h-12 pl-12 w-full md:w-[300px] rounded-2xl border-none bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-[#48E44B]/20"
              />
            </div>
            {(user?.role === "SELLER" || user?.role === "ADMIN") && (
              <Button className="h-12 rounded-2xl bg-[#141519] text-white px-8 font-bold gap-2 hover:bg-black transition-all">
                <Plus size={18} /> Create Asset
              </Button>
            )}
          </div>
        </header>

        {/* CONTENT */}
        {isSeller ? (
          <section className="space-y-10">
            {/* Seller stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
              {[
                { label: "Active Products", val: String(sellerProducts.length), icon: <Box size={16} /> },
                { label: "Role", val: user?.role ?? "SELLER", icon: <LayoutDashboard size={16} /> },
                { label: "Drafts", val: "0", icon: <ArrowDownToLine size={16} /> },
              ].map((stat, i) => (
                <div key={i} className="dashboard-header p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[#FAFAFB] flex items-center justify-center text-black">{stat.icon}</div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#767F88]">{stat.label}</p>
                    <p className="text-xl font-bold text-[#141519]">{stat.val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Create product */}
            <Card className="p-6 md:p-8 rounded-3xl border border-gray-100 bg-white shadow-sm">
              <h2 className="text-lg font-bold text-[#141519] mb-4">Create new product</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#767F88] mb-1">Title</label>
                  <Input
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    placeholder="OwnMarket Starter Kit"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#767F88] mb-1">Price (USD)</label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="49"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#767F88] mb-1">Category</label>
                  <Input
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    placeholder="Template, UI Kit..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#767F88] mb-1">Product Media</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setNewProduct({ ...newProduct, image: reader.result as string })
                            toast.success("Image initialized locally")
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="hidden" 
                      id="product-image-upload"
                    />
                    <label 
                      htmlFor="product-image-upload"
                      className="flex items-center justify-center gap-2 h-10 w-full rounded-xl border border-dashed border-gray-200 bg-[#FAFAFB] text-xs font-bold text-[#767F88] cursor-pointer hover:bg-gray-50 transition-all"
                    >
                      {newProduct.image ? (
                        <span className="text-black flex items-center gap-2 truncate px-4">
                          <CheckCircle2 size={12} className="text-[#48E44B]" /> Image Loaded
                        </span>
                      ) : (
                        <>
                          <Upload size={14} /> Upload Local Image
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-3 h-10 px-4 rounded-xl border border-gray-100 bg-[#FAFAFB]">
                   <Switch 
                     checked={newProduct.isVisible}
                     onCheckedChange={(checked) => setNewProduct({ ...newProduct, isVisible: checked })}
                     className="data-[state=checked]:bg-[#48E44B]"
                   />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[#767F88]">
                     {newProduct.isVisible ? "Visible on Marketplace" : "Hidden (Draft Mode)"}
                   </span>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold text-[#767F88] mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full min-h-[80px] rounded-2xl border border-gray-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#48E44B]/20"
                  placeholder="Describe what buyers get…"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleCreateProduct}
                  disabled={creating}
                  className="rounded-xl bg-[#141519] text-white font-bold px-6 h-11 disabled:opacity-60"
                >
                  {creating ? "Publishing..." : "Publish product"}
                </Button>
              </div>
            </Card>

            {/* Seller products list */}
            <div className="mt-10">
              <h2 className="text-lg font-bold text-[#141519] mb-4">Your products</h2>
              {sellerProducts.length === 0 ? (
                <p className="text-sm text-[#767F88]">You haven&apos;t published any products yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {sellerProducts.map((item) => (
                    <Card key={item.id} className="group overflow-hidden border-none bg-white rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 hover:-translate-y-2">
                      <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-[#141519] leading-tight group-hover:text-[#48E44B] transition-colors">
                            {item.title}
                          </h3>
                          <span className="text-sm font-bold text-[#141519]">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-[#767F88] mb-4">{item.category}</p>
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-xl text-xs"
                            onClick={() => router.push(`/product/${item.id}`)}
                          >
                            <ExternalLink size={14} className="mr-1" /> View
                          </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 rounded-xl text-xs"
                              onClick={() => handleEditProduct(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 rounded-xl text-xs text-red-500 border-red-200 hover:bg-red-50"
                              // --- UPDATED TO TRIGGER SHADCN MODAL ---
                              onClick={() => setProductToDelete(item.id)}
                            >
                              Delete
                            </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* STATS STRIP */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
              {[
                { label: "Total Spent", val: `$${stats.totalSpent.toFixed(2)}`, icon: <CreditCard size={16} /> },
                { label: "Spent (Month)", val: `$${stats.monthlySpent.toFixed(2)}`, icon: <TrendingUp size={16} /> },
                { label: "Bought (Month)", val: String(stats.itemsBoughtThisMonth), icon: <History size={16} /> },
                { label: "Items in Cart", val: String(cart.length), icon: <ShoppingCart size={16} /> },
              ].map((stat, i) => (
                <div key={i} className="dashboard-header p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[#FAFAFB] flex items-center justify-center text-black">{stat.icon}</div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#767F88]">{stat.label}</p>
                    <p className="text-xl font-bold text-[#141519]">{stat.val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* TABS FOR BUYER */}
            <div className="flex items-center gap-8 mb-8 border-b border-gray-100">
              <button 
                onClick={() => setActiveTab("purchases")}
                className={`pb-4 text-sm font-bold transition-all ${activeTab === "purchases" ? "text-black border-b-2 border-black" : "text-[#767F88] hover:text-black"}`}
              >
                My Library
              </button>
              <button 
                onClick={() => setActiveTab("cart")}
                className={`pb-4 text-sm font-bold transition-all ${activeTab === "cart" ? "text-black border-b-2 border-black" : "text-[#767F88] hover:text-black"}`}
              >
                Active Cart ({cart.length})
              </button>
            </div>

            {activeTab === "purchases" ? (
              user?.role === "ADMIN" ? (
                <div className="space-y-12">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                         <h2 className="text-2xl font-black tracking-tight">Platform Command</h2>
                         <p className="text-sm text-[#767F88] font-medium">Manage node protocols and marketplace integrity.</p>
                      </div>
                   </div>

                   <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="bg-transparent border-b border-gray-100 w-full justify-start rounded-none h-auto p-0 mb-8 overflow-x-auto">
                         <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-6 pb-4 pt-0 font-bold text-sm">Overview</TabsTrigger>
                         <TabsTrigger value="users" className="data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-6 pb-4 pt-0 font-bold text-sm">Users</TabsTrigger>
                         <TabsTrigger value="products" className="data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-6 pb-4 pt-0 font-bold text-sm">All Assets</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview">
                         <AdminOverview />
                      </TabsContent>
                      <TabsContent value="users">
                         <AdminUsers />
                      </TabsContent>
                      <TabsContent value="products">
                         <AdminProducts />
                      </TabsContent>
                   </Tabs>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {purchaseHistory.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                      <p className="text-sm font-bold text-[#767F88] uppercase tracking-widest">No assets acquired yet.</p>
                    </div>
                  ) : (
                    purchaseHistory.map((item) => (
                      <Card key={item.id} className="purchase-card group overflow-hidden border-none bg-white rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 hover:-translate-y-2">
                        <div className="relative h-48 w-full">
                          <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-black border-none font-bold py-1 px-3">
                            {item.category}
                          </Badge>
                        </div>
                        <CardContent className="p-8">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-[#141519] leading-tight group-hover:text-[#48E44B] transition-colors">{item.title}</h3>
                          </div>

                          <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#767F88]">
                              <Clock size={14} /> {item.date}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#48E44B] bg-[#48E44B]/10 px-2 py-0.5 rounded-full">
                              <ShieldCheck size={14} /> License v1
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                            <Button className="flex-1 h-12 rounded-xl bg-[#141519] text-white font-bold text-sm gap-2 hover:bg-black transition-all">
                              <Download size={16} /> Download
                            </Button>
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-gray-100 hover:bg-gray-50">
                              <Star size={18} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {cart.length === 0 ? (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                    <p className="text-sm font-bold text-[#767F88] uppercase tracking-widest">Your cart is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <Card key={item.id} className="purchase-card group overflow-hidden border-none bg-white rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 hover:-translate-y-2">
                      <div className="relative h-48 w-full">
                        <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-black border-none font-bold py-1 px-3">
                          {item.category}
                        </Badge>
                      </div>
                      <CardContent className="p-8">
                        <h3 className="font-bold text-lg text-[#141519] leading-tight group-hover:text-[#48E44B] transition-colors mb-4">{item.title}</h3>
                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                          <span className="text-xl font-black text-[#141519]">${item.price.toFixed(2)}</span>
                          <Button 
                            variant="outline" 
                            className="h-10 rounded-xl"
                            onClick={() => router.push(`/product/${item.id}`)}
                          >
                            View Product
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* 3. SELLER RIGHT SIDEBAR */}
      {isSeller && (
        <aside className="hidden xl:flex w-80 flex-col border-l border-gray-100 bg-white p-8 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-10">
            <h2 className="text-sm font-black text-[#141519] uppercase tracking-[0.2em] mb-6">Integrations</h2>
            
            <Card className="p-6 rounded-3xl border border-gray-100 bg-[#FAFAFB] shadow-sm overflow-hidden relative group">
              <div className="relative z-10">
                <div className="h-10 w-10 bg-[#5865F2] rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-[#5865F2]/20 shrink-0">
                  {user.discordAvatar ? (
                    <Image 
                      src={user.discordAvatar} 
                      alt="Discord" 
                      width={40} 
                      height={40} 
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <DiscordIcon size={20} />
                  )}
                </div>
                <h3 className="font-bold text-[#141519] mb-1">
                  {user.discordUsername ? `Connected: ${user.discordUsername}` : "Discord Community"}
                </h3>
                <p className="text-[11px] text-[#767F88] font-medium leading-relaxed mb-6">
                  {user.discordUsername 
                    ? "Your profile is synced. You have access to automated roles and member-only channels."
                    : "Sync your creator profile with Discord to unlock automated roles and member-only channels."}
                </p>
                <Button 
                  onClick={() => router.push("/api/auth/discord")}
                  className={`w-full h-11 rounded-xl font-bold text-xs ${
                    user.discordId 
                      ? "bg-white border border-gray-200 text-[#141519] hover:bg-gray-50" 
                      : "bg-[#5865F2] hover:bg-[#4752c4] text-white"
                  }`}
                >
                  {user.discordId ? "Reconnect Discord" : "Connect Profile"}
                </Button>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <DiscordIcon size={80} />
              </div>
            </Card>
          </div>

          <div className="flex-1" />

          <div className="p-6 rounded-3xl bg-[#141519] text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Creator Insights</p>
            <p className="text-sm font-medium leading-relaxed">
              Maintain a high rating to get featured on the main marketplace.
            </p>
          </div>
        </aside>
      )}
      {/* 4. EDIT PRODUCT MODAL */}
      <AlertDialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <AlertDialogContent className="sm:max-w-[500px] rounded-[40px] border-none p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black tracking-tight">Modify Asset</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-[#767F88]">
              Update your product parameters. These changes will reflect instantly across the node.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6 my-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#767F88] mb-1">Title</label>
                <Input
                  value={editingProduct?.title || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#767F88] mb-1">Price ($)</label>
                <Input
                  type="number"
                  value={editingProduct?.price || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#767F88] mb-1">Category</label>
              <Input
                value={editingProduct?.category || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#767F88] mb-1">Product Media</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setEditingProduct({ ...editingProduct, image: reader.result as string })
                        toast.success("Modified media loaded")
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="hidden" 
                  id="edit-product-image-upload"
                />
                <label 
                  htmlFor="edit-product-image-upload"
                  className="flex items-center justify-center gap-2 h-10 w-full rounded-xl border border-dashed border-gray-200 bg-[#FAFAFB] text-xs font-bold text-[#767F88] cursor-pointer hover:bg-gray-50 transition-all"
                >
                  <Upload size={14} /> Update Media
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#767F88] mb-1">Description</label>
              <textarea
                value={editingProduct?.description || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                className="w-full min-h-[80px] rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="h-12 rounded-xl text-xs font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleUpdateProduct()
              }}
              disabled={isUpdating}
              className="h-12 px-8 rounded-xl bg-[#141519] text-white font-bold text-xs"
            >
              {isUpdating ? "Syncing..." : "Apply Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}