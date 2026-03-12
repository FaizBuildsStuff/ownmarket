"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Check, 
  Plus, 
  Sparkles,
  Loader2,
  ShoppingBag
} from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { ChatWidget } from "@/components/ChatWidget"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

type Props = {
  id: string
  title: string
  price: number
  image: string
  category: string
  sellerId: string
  sellerName?: string | null
}

export function ProductPurchaseActions({ id, title, price, image, category, sellerId, sellerName }: Props) {
  const { addToCart, cart } = useCart()
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const isInCart = cart.some((item) => item.id === id)

  const handleAddToCart = () => {
    if (isInCart) {
      setShowConfirm(true)
      return
    }

    setAdding(true)
    // Simulated "Network Sync" delay for premium feel
    setTimeout(() => {
      addToCart({ id, title, price, image, category, sellerId, sellerName })
      setAdding(false)
      setShowConfirm(true)
    }, 800)
  }

  const openDrawer = () => {
    setShowConfirm(false)
    // Dispatching the global event to wake up the CartDrawer
    window.dispatchEvent(new CustomEvent('openCartDrawer'))
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
      
      {/* --- ELITE CONFIRMATION MODAL --- */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[440px] rounded-[48px] border-none p-12 bg-white/80 backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-500">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="h-24 w-24 rounded-[32px] bg-[#48E44B] flex items-center justify-center text-white shadow-2xl shadow-[#48E44B]/40 animate-bounce">
                <ShoppingBag size={40} />
              </div>
              <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#48E44B] shadow-lg">
                <Check size={24} strokeWidth={3} />
              </div>
            </div>
            
            <DialogTitle className="text-4xl font-black tracking-tighter text-[#141519] leading-none">
              Asset Secured
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-[#767F88] mt-4 leading-relaxed">
              <span className="text-black font-bold">{title}</span> is now initialized in your bag and ready for deployment.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-10">
          <Button 
  onClick={() => {
    setShowConfirm(false); // Close the modal first
    router.push('/cart');  // Redirect to the minimalist cart page
  }}
  className="h-16 rounded-2xl bg-[#141519] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-black hover:scale-[1.02] transition-all group"
>
  Checkout Now
  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
</Button>
            
            <Button 
              variant="ghost"
              onClick={() => {
                setShowConfirm(false)
                router.push("/marketplace")
              }}
              className="h-16 rounded-2xl border border-gray-100 font-black text-xs uppercase tracking-[0.2em] text-[#767F88] hover:bg-gray-50 transition-all"
            >
              Explore More
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- INTERACTIVE ACTION BUTTONS --- */}
      <ChatWidget productId={id} sellerId={sellerId} sellerName={sellerName} />
      
      <Button
        onClick={handleAddToCart}
        disabled={adding}
        className={`h-20 px-16 rounded-[28px] font-black text-xl transition-all duration-500 shadow-2xl group min-w-[300px] flex items-center justify-center ${
          isInCart 
          ? "bg-[#48E44B] text-white hover:bg-[#3ec441] scale-[1.02]" 
          : "bg-[#141519] text-white hover:bg-black hover:scale-[1.05]"
        }`}
      >
        {adding ? (
          <span className="flex items-center gap-3">
            <Loader2 size={24} className="animate-spin" /> 
            <span className="uppercase tracking-widest text-sm">Syncing Node...</span>
          </span>
        ) : isInCart ? (
          <span className="flex items-center gap-3">
            <Check size={24} strokeWidth={3} /> 
            <span>In Bag</span>
          </span>
        ) : (
          <span className="flex items-center">
            Buy Asset
            <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
          </span>
        )}
      </Button>
    </div>
  )
}