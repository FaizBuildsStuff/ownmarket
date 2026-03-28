"use client"

import React, { useLayoutEffect, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { 
  ArrowRight, Mail, Lock, User, 
  Github, Chrome, Sparkles, Check, 
  ShieldCheck, Camera, Loader2, Disc as DiscordIcon
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: ""
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            router.replace("/dashboard")
          }
        }
      } catch {
        // ignore
      }
    }
    checkAuth()
  }, [router])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } })
      tl.from(".signup-card", { y: 20, opacity: 0, duration: 1 })
        .from(".signup-reveal", { y: 15, opacity: 0, duration: 0.8, stagger: 0.08, clearProps: "all" }, "-=0.6")
      
      gsap.to(".bg-glow", { x: "random(-60, 60)", y: "random(-30, 30)", duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const nextStep = () => {
    if (!formData.email || !formData.password) return alert("Please fill in all fields")
    gsap.to(formRef.current, { opacity: 0, y: -10, duration: 0.2, onComplete: () => {
      setStep(2)
      gsap.fromTo(formRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 })
    }})
  }

  const handleFinalSignup = async () => {
    const email = formData.email.trim()
    const password = formData.password
    if (!email || !password) {
      alert("Please enter email and password. Use the previous step if needed.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username: formData.username?.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({ message: "Something went wrong" }))

      if (res.ok) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("om_logged_in", "true")
        }
        router.push("/dashboard")
      } else {
        alert(data.message || "Something went wrong")
      }
    } catch (error) {
      console.error(error)
      alert("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="relative min-h-screen w-full flex items-center justify-center bg-[#FAFAFB] px-6 selection:bg-[#48E44B]/30 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-glow absolute top-[10%] left-[20%] h-[400px] w-[400px] rounded-full bg-[#48E44B]/5 blur-[100px]" />
        <div className="bg-glow absolute bottom-[10%] right-[20%] h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="signup-card relative w-full max-w-[420px] rounded-[32px] border border-gray-100 bg-white p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
        <div className="flex justify-center mb-8">
          <Link href="/" className="signup-reveal group flex flex-col items-center">
            <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12">O</div>
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="signup-reveal text-3xl font-bold tracking-tighter text-[#141519]">Create Account</h1>
          <p className="signup-reveal mt-2 text-sm text-[#767F88] font-medium">Join the 2026 creative standard.</p>
        </div>

        <div ref={formRef} className="space-y-6">
          {step === 1 ? (
            <>
              <div className="space-y-4">
                <div className="signup-reveal space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#141519] ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#48E44B] transition-colors" size={16} />
                    <Input 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="hello@ownmarket.com" 
                      className="h-12 pl-11 rounded-xl border-[#E5E5E7] bg-[#FAFAFB]/50 text-sm focus-visible:ring-2 focus-visible:ring-[#48E44B]/10" 
                    />
                  </div>
                </div>

                <div className="signup-reveal space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#141519] ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#48E44B] transition-colors" size={16} />
                    <Input 
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••" 
                      className="h-12 pl-11 rounded-xl border-[#E5E5E7] bg-[#FAFAFB]/50 text-sm focus-visible:ring-2 focus-visible:ring-[#48E44B]/10" 
                    />
                  </div>
                </div>
              </div>

              <Button onClick={nextStep} className="signup-reveal w-full h-12 rounded-xl bg-black text-white font-bold text-sm hover:bg-black/90 transition-all group">
                Next Step <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="signup-reveal flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">social</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <div className="signup-reveal grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => router.push("/api/auth/discord")}
                  variant="outline" 
                  className="h-11 rounded-xl border-[#E5E5E7] text-xs font-bold gap-2 hover:bg-[#5865F2] hover:text-white hover:border-[#5865F2] transition-all"
                >
                  <DiscordIcon size={14} /> Discord
                </Button>
                <Button variant="outline" className="h-11 rounded-xl border-[#E5E5E7] text-xs font-bold gap-2 opacity-60 cursor-not-allowed">
                  <Github size={14} /> GitHub
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-6">
                <div className="signup-reveal relative group">
                  <div className="h-20 w-20 rounded-2xl bg-[#48E44B]/10 border border-[#48E44B]/20 flex items-center justify-center text-2xl group-hover:bg-[#48E44B]/20 transition-colors cursor-pointer">✨</div>
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-black rounded-full border-2 border-white flex items-center justify-center text-white"><Camera size={12} /></div>
                </div>
                <div className="w-full space-y-4 text-left">
                  <div className="signup-reveal space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-[#141519]">Username</label>
                    <Input 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="creator_id" 
                      className="h-12 px-4 rounded-xl border-[#E5E5E7] bg-[#FAFAFB]/50 text-sm" 
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleFinalSignup}
                disabled={loading}
                className="signup-reveal w-full h-12 rounded-xl bg-[#48E44B] text-black font-bold text-sm hover:bg-[#3ec741] shadow-lg shadow-[#48E44B]/20 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Complete Setup"}
              </Button>
              
              <button onClick={() => setStep(1)} className="signup-reveal w-full text-[11px] font-bold text-[#767F88] hover:text-black">Go back</button>
            </>
          )}
        </div>

        <p className="signup-reveal mt-8 text-center text-xs font-medium text-[#767F88]">
          Already a member? <Link href="/signin" className="text-black font-bold ml-1">Log in</Link>
        </p>
      </div>
    </div>
  )
}