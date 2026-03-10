"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useCart } from "@/app/context/CartContext"
import { ChatWidget } from "@/components/ChatWidget"

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
  const { addToCart } = useCart()
  const [adding, setAdding] = useState(false)

  const handleAddToCart = () => {
    setAdding(true)
    try {
      addToCart({ id, title, price, image, category })
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
      <ChatWidget productId={id} sellerId={sellerId} sellerName={sellerName} />
      <Button
        onClick={handleAddToCart}
        disabled={adding}
        className="h-20 px-14 rounded-[24px] bg-[#141519] text-white font-bold text-xl hover:bg-black transition-all hover:scale-[1.02] shadow-2xl shadow-black/10 group disabled:opacity-60"
      >
        {adding ? "Adding..." : "Buy Asset"}
        <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  )
}

