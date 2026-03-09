"use client"

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { gsap } from 'gsap'
import { 
  Camera, Save, Zap, ShieldCheck, Globe
} from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'

export default function ProfilePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  // Added 'website' to the state so the input actually works
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "BUYER",
    image: "",
    website: "" 
  })

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok && isMounted) {
          const data = await res.json()
          setUser({
            ...data.user,
            website: data.user.website || "" // Ensure it's never undefined
          })
        } else if (isMounted) {
          router.push("/signin")
        }
      } catch (error) {
        console.error("Fetch error", error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchUser()
    return () => { isMounted = false }
  }, [router])

  useLayoutEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.2 } })
      tl.from(".reveal-header", { y: 40, opacity: 0 })
        .from(".reveal-content", { y: 20, opacity: 0 }, "-=0.8")
        .from(".reveal-row", { opacity: 0, x: -10, stagger: 0.1 }, "-=0.6")
    }, containerRef)
    return () => ctx.revert()
  }, [loading])

  // --- FIXED UPDATE LOGIC ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    
    try {
      const res = await fetch("/api/auth/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user) // Sending the full user object
      })

      const result = await res.json()

      if (res.ok) {
        toast.success("Identity Node Synced Successfully")
        // This is the key: it forces Next.js to re-fetch the data from the server
        router.refresh() 
      } else {
        toast.error(result.message || "Protocol Error: Update Failed")
      }
    } catch (err) {
      toast.error("Network connection interrupted")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return null

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAFAFB] pb-32 selection:bg-[#48E44B]/30 overflow-x-hidden font-sans">
      
      <main className="max-w-[1100px] mx-auto px-8 pt-24">
        
        <header className="reveal-header mb-16 flex items-center justify-between border-b border-gray-100 pb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-[#141519]">Account Settings</h1>
            <p className="text-sm font-medium text-[#767F88] mt-1">Manage your node identity and security protocols.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-widest text-[#767F88]" onClick={() => router.refresh()}>Reset</Button>
            <Button 
              onClick={handleUpdate}
              disabled={updating}
              className="h-10 px-8 rounded-xl bg-[#141519] text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg shadow-black/5 hover:bg-black transition-all disabled:opacity-50"
            >
              {updating ? "Syncing..." : "Save Changes"}
            </Button>
          </div>
        </header>

        <div className="reveal-content space-y-12">
          
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-[#141519]">Personal Information</h2>
              <p className="text-sm text-[#767F88] leading-relaxed">Your public identity and communication node.</p>
            </div>

            <div className="space-y-6">
              <div className="reveal-row flex items-center gap-6 p-6 bg-white border border-gray-100 rounded-[24px] shadow-sm">
                <div className="relative shrink-0">
                  <div className="h-20 w-20 rounded-2xl bg-[#141519] text-white flex items-center justify-center text-2xl font-black overflow-hidden">
                    {user.image ? <Image src={user.image} alt="Avatar" fill className="object-cover" /> : user.name?.[0]?.toUpperCase()}
                  </div>
                  <button className="absolute -bottom-1 -right-1 h-7 w-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center shadow-sm hover:bg-black hover:text-white transition-colors">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-[#141519]">{user.name || "Unnamed Node"}</h3>
                  <p className="text-xs text-[#767F88] font-medium uppercase tracking-widest mt-0.5">{user.role} Status</p>
                </div>
              </div>

              <div className="reveal-row space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767F88] ml-1">Full Signature</label>
                  <Input 
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="h-12 rounded-xl border-gray-100 bg-white px-4 font-bold text-sm focus-visible:ring-1 focus-visible:ring-black transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767F88] ml-1">Email Address</label>
                  <Input 
                    value={user.email}
                    disabled
                    className="h-12 rounded-xl border-gray-100 bg-gray-50 px-4 font-bold text-sm opacity-60 cursor-not-allowed italic" 
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-100 w-full" />

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-[#141519]">Platform Metadata</h2>
              <p className="text-sm text-[#767F88] leading-relaxed">Technical configurations for your account.</p>
            </div>

            <div className="reveal-row space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767F88] ml-1">Web Domain</label>
                  <Input 
                    placeholder="https://faizur.me" 
                    value={user.website}
                    onChange={(e) => setUser({...user, website: e.target.value})}
                    className="h-12 rounded-xl border-gray-100 bg-white px-4 font-bold text-sm focus-visible:ring-1 focus-visible:ring-black transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767F88] ml-1">System Role</label>
                  <div className="h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center px-4 gap-2">
                    <Zap size={14} className="text-[#48E44B] fill-[#48E44B]" />
                    <span className="text-sm font-bold text-[#141519] uppercase tracking-tighter">{user.role} ACCESS</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-[#48E44B]/5 border border-[#48E44B]/10 rounded-2xl">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#48E44B] shadow-sm">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-[#141519]">Node Security</p>
                       <p className="text-[11px] text-[#767F88] font-medium tracking-tight">RSA-4096 Encryption Active</p>
                    </div>
                 </div>
                 <Button variant="outline" className="h-8 rounded-lg bg-white border-gray-100 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Audit</Button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}