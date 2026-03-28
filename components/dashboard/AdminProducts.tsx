"use client"

import React, { useEffect, useState } from "react"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MoreHorizontal, Trash2, Eye, ExternalLink, MessageSquare, TrendingUp, Loader2 } from "lucide-react"
import { toast } from "sonner"
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

type Product = {
  id: string
  title: string
  price: number
  category: string
  isVisible: boolean
  seller: {
    name: string | null
    email: string | null
  }
  _count: {
    purchases: number
    chatThreads: number
  }
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products")
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
      }
    } catch (error) {
      toast.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleToggleVisibility = async (productId: string, currentVal: boolean) => {
    setActionLoading(productId)
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, isVisible: !currentVal }),
      })
      if (res.ok) {
        setProducts(products.map(p => p.id === productId ? { ...p, isVisible: !currentVal } : p))
        toast.success(`Asset ${!currentVal ? 'now public' : 'hidden from view'}`)
      } else {
        toast.error("Failed to update visibility")
      }
    } catch (error) {
      toast.error("Error updating visibility")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    setActionLoading(productToDelete)
    try {
      const res = await fetch(`/api/admin/products?productId=${productToDelete}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Product deleted")
        setProducts(products.filter(p => p.id !== productToDelete))
      } else {
        toast.error("Failed to delete product")
      }
    } catch (error) {
      toast.error("Error deleting product")
    } finally {
      setProductToDelete(null)
      setActionLoading(null)
    }
  }

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="animate-spin text-[#48E44B]" size={40} />
      <p className="text-sm font-bold text-[#767F88] uppercase tracking-widest">Scanning platform assets...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent className="rounded-[32px] border-none p-8">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will remove the asset from the marketplace forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-[32px] border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#FAFAFB]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold py-5">Product Asset</TableHead>
              <TableHead className="font-bold">Creator</TableHead>
              <TableHead className="font-bold">Price</TableHead>
              <TableHead className="font-bold">Engagement</TableHead>
              <TableHead className="font-bold">Visibility Control</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#141519]">{product.title}</span>
                    <span className="text-[10px] text-[#767F88] font-black uppercase tracking-widest">{product.category}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{product.seller.name || "Unknown"}</span>
                    <span className="text-[10px] text-[#767F88]">{product.seller.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-black text-[#141519]">${product.price.toFixed(2)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#767F88]">
                      <TrendingUp size={14} className="text-green-500" /> {product._count.purchases} sales
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#767F88]">
                      <MessageSquare size={14} className="text-[#48E44B]" /> {product._count.chatThreads} chats
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {actionLoading === product.id ? (
                      <Loader2 className="animate-spin text-gray-400" size={16} />
                    ) : (
                      <Switch 
                        checked={product.isVisible} 
                        onCheckedChange={() => handleToggleVisibility(product.id, product.isVisible)}
                        className="data-[state=checked]:bg-[#48E44B]"
                      />
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${product.isVisible ? 'text-[#48E44B]' : 'text-[#767F88]'}`}>
                      {product.isVisible ? 'ACTIVE' : 'OFFLINE'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#FAFAFB] rounded-lg" onClick={() => window.open(`/product/${product.id}`, '_blank')}>
                      <ExternalLink size={14} />
                    </Button>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => setProductToDelete(product.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
