"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Trash2, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Lock, 
  ShoppingBag,
  ChevronRight,
  ArrowRight,
  CreditCard,
  MessageSquare,
  Sparkles,
  Loader2
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/app/context/CartContext"
import { ChatWidget } from "@/components/ChatWidget"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function CartPage() {
  const { cart, removeFromCart } = useCart()
  const [isSyncing, setIsSyncing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const subtotal = cart.reduce((acc, item) => acc + item.price, 0)
  const total = subtotal

  const handleConfirmSync = () => {
    setIsSyncing(true)
    // Simulated "Node Handshake" delay
    setTimeout(() => {
      setIsSyncing(false)
      setShowPaymentModal(true)
    }, 1500)
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFB] flex flex-col items-center justify-center p-8">
        <div className="h-24 w-24 bg-white rounded-[40px] shadow-sm border border-gray-100 flex items-center justify-center mb-8 animate-in fade-in zoom-in duration-700 text-gray-200">
          <ShoppingBag size={32} />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-[#141519] mb-4">Bag is empty</h1>
        <p className="text-[#767F88] font-medium max-w-[320px] text-center mb-10 leading-relaxed text-sm">
          Your digital environment is currently clear. Sync new assets to proceed.
        </p>
        <Link href="/marketplace">
          <Button className="h-14 px-10 rounded-2xl bg-[#141519] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-black transition-all">
            Enter Marketplace
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB] selection:bg-[#48E44B]/30 font-sans antialiased">
      
      {/* 1. PAYMENTS COMING SOON MODAL */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[440px] rounded-[48px] border-none p-12 bg-white/90 backdrop-blur-3xl shadow-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-[28px] bg-black flex items-center justify-center text-[#48E44B] mb-8 shadow-2xl shadow-black/20">
              <CreditCard size={32} />
            </div>
            <DialogTitle className="text-4xl font-black tracking-tighter text-[#141519] leading-none">
              Payment Gateway <br/> <span className="text-[#767F88]">Initializing Soon</span>
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-[#767F88] mt-6 leading-relaxed">
              We are currently finalizing the <span className="text-black font-bold">Stripe & Crypto Node</span> integration to ensure 100% secure asset transfers.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-10">
            <Button 
              onClick={() => setShowPaymentModal(false)}
              className="h-16 rounded-2xl bg-[#141519] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
            >
              Okay I Understand..
            </Button>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Sparkles size={14} className="text-[#48E44B]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Beta Version 1.0.4</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FIXED ACTION: RETURN */}
      <div className="fixed top-12 left-12 z-50">
        <Link href="/marketplace">
          <button className="group flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
              <ArrowLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#767F88] group-hover:text-black transition-colors">Return</span>
          </button>
        </Link>
      </div>

      <main className="max-w-[1400px] mx-auto px-12 py-24 min-h-screen flex items-center">
        <div className="w-full flex flex-col lg:flex-row gap-16 items-start justify-center">
          
          {/* LEFT: CENTERED INVENTORY CANVAS */}
          <div className="w-full lg:max-w-[700px] space-y-12 animate-in slide-in-from-left-8 duration-700">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <Badge className="bg-[#48E44B]/10 text-[#2d8a2f] border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">
                   System Ready
                 </Badge>
                 <div className="h-px flex-1 bg-gray-100" />
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-[#141519]">
                Bag <span className="text-[#767F88]">/{cart.length}</span>
              </h1>
            </div>

            <div className="space-y-4">
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative flex items-center gap-8 p-6 bg-white rounded-[32px] border border-transparent hover:border-gray-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] transition-all duration-700"
                >
                  <div className="relative h-24 w-24 rounded-[20px] overflow-hidden bg-gray-50 shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover transition-transform group-hover:scale-110 duration-1000" />
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-black tracking-tight text-[#141519] truncate max-w-[300px] group-hover:text-[#48E44B] transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <ChatWidget 
                          productId={item.id} 
                          sellerId={item.sellerId} 
                          sellerName={item.sellerName} 
                        />
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-black text-[#141519]">${item.price.toFixed(2)}</p>
                      <span className="h-1 w-1 rounded-full bg-gray-200" />
                      <p className="text-[10px] font-bold text-[#767F88] uppercase tracking-widest">{item.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: FLOATING SUMMARY TERMINAL */}
          <aside className="w-full lg:w-[460px] lg:sticky lg:top-24 animate-in slide-in-from-right-8 duration-700">
            <div className="p-12 rounded-[48px] bg-white border border-gray-100 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.06)] space-y-10">
              <div className="flex items-center justify-between">
                 <h2 className="text-xs font-black tracking-[0.2em] text-[#141519] uppercase">Checkout Protocol</h2>
                 <Lock size={14} className="text-gray-300" />
              </div>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-[#767F88]">Subtotal</span>
                  <span className="font-black text-[#141519]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-[#767F88]">Network Fee</span>
                  <span className="font-black text-[#48E44B]">0.00</span>
                </div>
                <Separator className="bg-gray-50" />
                <div className="pt-2">
                  <div className="flex justify-between items-end">
                    <p className="text-5xl font-black tracking-tighter text-[#141519]">${total.toFixed(2)}</p>
                    <p className="text-[10px] font-black text-[#48E44B] uppercase tracking-widest mb-1">Tax Inc.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleConfirmSync}
                  disabled={isSyncing}
                  className="w-full h-18 rounded-3xl bg-[#141519] text-white font-black text-xs uppercase tracking-[0.3em] group shadow-2xl shadow-black/10 hover:bg-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                >
                  {isSyncing ? (
                    <span className="flex items-center gap-3">
                      <Loader2 size={18} className="animate-spin" /> Syncing Node...
                    </span>
                  ) : (
                    <>
                      Confirm & Sync
                      <ArrowRight size={16} className="ml-auto group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </Button>
                
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#FAFAFB] border border-gray-50">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-black shadow-sm">
                    <CreditCard size={18} />
                  </div>
                  <p className="text-[9px] font-bold text-[#767F88] leading-relaxed uppercase tracking-widest">
                    AES-256 Encrypted Payment Node. Instant Asset Unlock.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                 <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-50">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#48E44B] animate-pulse" />
                    <span className="text-[8px] font-black text-[#767F88] uppercase tracking-[0.2em]">Secure Node Active</span>
                 </div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}