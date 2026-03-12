"use client"

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, 
  Bell, 
  Command, 
  ChevronRight, 
  User as UserIcon,
  LogOut,
  Zap,
  ShieldCheck,
  MessageSquare // Added for the Seller Chat button
} from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from 'sonner'

export default function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<{ id: string; name: string; email: string; image?: string; role: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (err) {
        console.error("Header identity fetch failed")
      }
    }
    fetchUser()

    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/signout", { method: "POST" })
      if (res.ok) {
        toast.success("Signed out successfully")
        router.push("/signin")
        router.refresh()
      }
    } catch (err) {
      toast.error("Sign out failed")
    }
  }

  const segments = pathname.split('/').filter(Boolean)

  const openSellerChat = () => {
    toast.info("Opening Seller Inbox", {
      description: "Loading your active buyer threads..."
    })
    router.push("/dashboard/messages")
  }

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-500 border-b ${
      scrolled 
      ? "bg-white/70 backdrop-blur-xl border-gray-100 py-3 shadow-sm" 
      : "bg-transparent border-transparent py-6"
    }`}>
      <div className="flex items-center justify-between px-8">
        
        {/* LEFT: INTERACTIVE BREADCRUMBS */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-[#767F88] uppercase tracking-[0.2em]">
            <Link href="/" className="hover:text-black transition-colors">
              OWNMARKET
            </Link>

            {segments.map((segment, i) => {
              const url = `/${segments.slice(0, i + 1).join('/')}`
              const isLast = i === segments.length - 1

              return (
                <React.Fragment key={i}>
                  <ChevronRight size={10} className="text-gray-300" />
                  {isLast ? (
                    <span className="text-black">{segment.replace(/-/g, ' ')}</span>
                  ) : (
                    <Link 
                      href={url} 
                      className="hover:text-black transition-colors"
                    >
                      {segment.replace(/-/g, ' ')}
                    </Link>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-6">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#48E44B] transition-colors" size={14} />
            <Input 
              placeholder="Search node..." 
              className="h-10 w-[200px] pl-9 rounded-xl bg-gray-100/50 border-none focus-visible:ring-2 focus-visible:ring-[#48E44B]/20 transition-all text-xs font-bold"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-20 group-focus-within:opacity-0 transition-opacity">
              <Command size={10} />
              <span className="text-[10px] font-black">K</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* --- SELLER CHAT INBOX BUTTON --- */}
            {(user?.role === "SELLER" || user?.role === "ADMIN") && (
              <button 
                onClick={openSellerChat}
                className="relative p-2 text-gray-400 hover:text-black transition-colors group"
                title="Seller Messages"
              >
                <MessageSquare size={20} strokeWidth={2} />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-blue-500 rounded-full ring-2 ring-white" />
              </button>
            )}

            {/* NOTIFICATIONS */}
            <button className="relative p-2 text-gray-400 hover:text-black transition-colors group">
              <Bell size={20} strokeWidth={2} />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-[#48E44B] rounded-full ring-2 ring-white group-hover:animate-ping" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all outline-none border border-transparent hover:border-gray-100">
                <Avatar className="h-9 w-9 rounded-xl border-2 border-white shadow-sm overflow-hidden">
                  <AvatarImage src={user?.image} />
                  <AvatarFallback className="bg-black text-white text-[10px] font-black">
                    {user?.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-black text-[#141519] leading-tight">{user?.name ?? "Loading..."}</p>
                  <div className="flex items-center gap-1">
                    <ShieldCheck size={10} className="text-[#48E44B]" />
                    <p className="text-[9px] font-bold text-[#767F88] uppercase tracking-tighter">{user?.role ?? "User"}</p>
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-60 mt-2 rounded-[24px] border-gray-100 p-2 shadow-2xl backdrop-blur-xl bg-white/90" align="end">
              <DropdownMenuLabel className="px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Identity Node</p>
                <p className="text-xs font-bold text-[#141519] truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-50" />
              
              <Link href="/dashboard/profile">
                <DropdownMenuItem className="rounded-xl p-3 cursor-pointer group">
                  <UserIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                  <span className="font-bold text-sm">Profile Settings</span>
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuItem className="rounded-xl p-3 cursor-pointer group">
                <Zap className="mr-3 h-4 w-4 text-gray-400 group-hover:text-[#48E44B] transition-colors" />
                <span className="font-bold text-sm">System Logs</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-50" />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="rounded-xl p-3 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 group"
              >
                <LogOut className="mr-3 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="font-bold text-sm">Sign Out Node</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}