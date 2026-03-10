"use client"

import React, { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Lock,
  Sparkles
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
  const { cart, removeFromCart, clearCart } = useCart()

  // Kinetic stagger for cart items when drawer opens
  const animateItems = () => {
    gsap.from(".cart-item", {
      x: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "expo.out",
      delay: 0.2
    })
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price, 0)

  return (
    <Sheet onOpenChange={(open) => open && animateItems()}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative h-12 w-12 rounded-2xl hover:bg-white hover:shadow-sm group">
          <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
          <span className="absolute top-2 right-2 h-4 w-4 bg-[#48E44B] text-[9px] font-black text-white rounded-full flex items-center justify-center ring-2 ring-white">
            {cart.length}
          </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent ref={containerRef} className="w-full sm:max-w-[480px] bg-[#FAFAFB] border-l border-gray-100 p-0 flex flex-col">
        
        {/* --- HEADER --- */}
        <SheetHeader className="p-8 bg-white border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-black tracking-tighter flex items-center gap-2">
                Your Bag <Sparkles size={18} className="text-[#48E44B]" />
              </SheetTitle>
              <p className="text-xs font-bold text-[#767F88] uppercase tracking-widest">
                {cart.length} Assets Selected
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* --- ITEM LIST --- */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Bag is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item group relative flex gap-5 p-4 bg-white rounded-[28px] border border-transparent hover:border-gray-100 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-[#141519] leading-tight text-sm group-hover:text-[#48E44B] transition-colors">
                        {item.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <Badge variant="outline" className="mt-1 text-[9px] font-black uppercase tracking-widest border-gray-100 text-gray-400 rounded-full">
                      {item.category}
                    </Badge>
                  </div>

                    <div className="flex items-center justify-between mt-2">
                      <p className="font-black text-sm">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2">
                        {item.sellerId && (
                          <ChatWidget
                            productId={item.id}
                            sellerId={item.sellerId}
                            sellerName={item.sellerName}
                          />
                        )}
                      </div>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- CHECKOUT SECTION --- */}
        <footer className="p-8 bg-white border-t border-gray-100 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-[#767F88]">Subtotal</span>
              <span className="font-black">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-bold text-[#767F88]">Platform Fee</span>
              <span className="font-black text-[#48E44B]">FREE</span>
            </div>
            <Separator className="bg-gray-50" />
            <div className="flex justify-between items-end">
              <span className="text-lg font-black tracking-tight">Total</span>
              <div className="text-right">
                <p className="text-2xl font-black tracking-tighter">${subtotal.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-[#767F88] uppercase tracking-widest">Tax included</p>
              </div>
            </div>
          </div>

          <Button className="w-full h-16 rounded-[24px] bg-[#141519] text-white font-black text-sm uppercase tracking-[0.2em] group shadow-2xl shadow-black/10 hover:bg-black transition-all">
            Secure Checkout
            <Lock size={16} className="ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
            <ArrowRight size={18} className="ml-auto group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-[10px] text-center font-bold text-[#767F88] uppercase tracking-tighter">
            Instant Delivery via encrypted node
          </p>
        </footer>
      </SheetContent>
    </Sheet>
  )
}