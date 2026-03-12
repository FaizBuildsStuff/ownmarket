"use client"

import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { 
  ShoppingBag, 
  X, 
  ArrowRight, 
  Lock,
  Sparkles,
  Trash2
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/app/context/CartContext"
import { ChatWidget } from "@/components/ChatWidget"

export default function CartDrawer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { cart, removeFromCart } = useCart()

  // Kinetic stagger for cart items when drawer opens
  const animateItems = () => {
    gsap.from(".cart-item", {
      x: 80,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "expo.out",
      clearProps: "all"
    })
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price, 0)

  // Inside CartDrawer.tsx
const [open, setOpen] = useState(false);

useEffect(() => {
  const handleOpen = () => setOpen(true);
  window.addEventListener('openCartDrawer', handleOpen);
  return () => window.removeEventListener('openCartDrawer', handleOpen);
}, []);

// Then use the 'open' state in your <Sheet open={open} onOpenChange={setOpen}>

  return (
    <Sheet onOpenChange={(open) => open && animateItems()}>
      <SheetTrigger asChild>
        {/* --- THE HEADER CART ICON --- */}
        <Button variant="ghost" className="relative h-12 w-12 rounded-2xl hover:bg-white hover:shadow-sm group transition-all">
          <ShoppingBag size={22} className="group-hover:scale-110 transition-transform text-[#141519]" />
          {cart.length > 0 && (
            <span className="absolute top-2 right-2 h-4 w-4 bg-[#48E44B] text-[9px] font-black text-white rounded-full flex items-center justify-center ring-2 ring-white animate-in zoom-in duration-300">
              {cart.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent ref={containerRef} className="w-full sm:max-w-[480px] bg-[#FAFAFB] border-l border-gray-100 p-0 flex flex-col shadow-2xl">
        
        {/* --- HEADER --- */}
        <SheetHeader className="p-8 bg-white border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-black tracking-tighter flex items-center gap-2 text-[#141519]">
                Bag <Sparkles size={18} className="text-[#48E44B]" />
              </SheetTitle>
              <p className="text-[10px] font-black text-[#767F88] uppercase tracking-[0.2em]">
                {cart.length} Assets in Protocol
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* --- ITEM LIST --- */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 bg-gray-50 rounded-[32px] flex items-center justify-center mb-4 text-gray-200">
                <ShoppingBag size={32} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-300">Empty Environment</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item group relative flex gap-5 p-5 bg-white rounded-[32px] border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-500">
                <div className="relative h-20 w-20 rounded-[22px] overflow-hidden bg-gray-50 shrink-0 border border-gray-50">
                  <Image src={item.image} alt={item.title} fill className="object-cover transition-transform group-hover:scale-110 duration-700" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-[#141519] leading-tight text-sm truncate max-w-[180px]">
                        {item.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-gray-100 text-[#767F88] bg-gray-50/50">
                      {item.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <p className="font-black text-sm text-[#141519] tracking-tight">${item.price.toFixed(2)}</p>
                    
                    {/* --- CHAT WITH SELLER TRIGGER --- */}
                    {item.sellerId && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <ChatWidget
                            productId={item.id}
                            sellerId={item.sellerId}
                            sellerName={item.sellerName}
                          />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- CHECKOUT SECTION --- */}
        <footer className="p-10 bg-white border-t border-gray-100 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#767F88] uppercase tracking-widest">Subtotal</span>
              <span className="text-[#141519]">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#767F88] uppercase tracking-widest">Protocol Fee</span>
              <span className="text-[#48E44B] uppercase tracking-widest">0.00</span>
            </div>
            <Separator className="bg-gray-50" />
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-[#767F88] uppercase tracking-[0.3em] mb-1">Total Payload</p>
                <p className="text-4xl font-black tracking-tighter text-[#141519]">${subtotal.toFixed(2)}</p>
              </div>
              <p className="text-[9px] font-black text-[#48E44B] uppercase tracking-widest mb-1 bg-[#48E44B]/10 px-3 py-1 rounded-full">Secure Link</p>
            </div>
          </div>

          <Button className="w-full h-16 rounded-[22px] bg-[#141519] text-white font-black text-xs uppercase tracking-[0.25em] group shadow-2xl shadow-black/10 hover:bg-black transition-all hover:scale-[1.02] active:scale-95">
            Secure Checkout
            <Lock size={14} className="ml-2 opacity-30 group-hover:opacity-100 transition-opacity" />
            <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="flex items-center justify-center gap-2 opacity-40">
            <div className="h-1 w-1 rounded-full bg-black" />
            <p className="text-[9px] font-black uppercase tracking-widest">End-to-End RSA Encrypted</p>
            <div className="h-1 w-1 rounded-full bg-black" />
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  )
}