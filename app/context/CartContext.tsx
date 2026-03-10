"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Product = {
  id: string
  title: string
  price: number
  image: string
  category: string
  sellerId?: string
  sellerName?: string | null
}

interface CartContextType {
  cart: Product[]
  addToCart: (product: Product) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Product[]>([])

  // 1. Load cart from localStorage on startup
  useEffect(() => {
    const savedCart = localStorage.getItem('ownmarket_cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  // 2. Save to localStorage every time cart changes
  useEffect(() => {
    localStorage.setItem('ownmarket_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product) => {
    setCart((prev) => [...prev, product])
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}