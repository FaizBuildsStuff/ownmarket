"use client"

import React, { useEffect, useState } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  History,
  Box,
  RotateCcw,
  User,
  DollarSign,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Package,
  Check,
  X,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type HistoryData = {
  sales: any[]
  allProducts: any[]
  activeProducts: any[]
  refunds: any[]
  stats: {
    totalSales: number
    totalProducts: number
    activeProducts: number
    totalRefunds: number
  }
}

export default function HistoryView({ role }: { role: string }) {
  const [data, setData] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState("all")

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/dashboard/history")
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error("Failed to fetch history", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleRefundAction = async (refundId: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdating(refundId)
    try {
      const res = await fetch("/api/dashboard/history", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundId, status }),
      })

      if (res.ok) {
        toast.success(`Refund ${status.toLowerCase()} successfully`)
        fetchHistory()
      } else {
        const err = await res.json()
        toast.error(err.message || "Action failed")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
      <div className="h-12 w-12 rounded-full border-t-2 border-black animate-spin" />
      <p className="text-sm font-bold text-[#767F88] uppercase tracking-widest">Reconstructing platform records...</p>
    </div>
  )

  if (!data) return null

  const statsCards = [
    { label: "Total Sales", val: data.stats.totalSales.toString(), icon: <TrendingUp className="text-green-500" /> },
    { label: "Active Products", val: data.stats.activeProducts.toString(), icon: <ShieldCheck className="text-[#48E44B]" /> },
    { label: "All Assets", val: data.stats.totalProducts.toString(), icon: <Package className="text-blue-500" /> },
    { label: "Refunds", val: data.stats.totalRefunds.toString(), icon: <RotateCcw className="text-red-500" /> },
  ]

  const filters = [
    { id: "all", label: "All History", icon: <History size={14} /> },
    { id: "sales", label: "Sale History", icon: <TrendingUp size={14} /> },
    { id: "active", label: "Active Products", icon: <ShieldCheck size={14} /> },
    { id: "products", label: "All Products", icon: <Package size={14} /> },
    { id: "refunds", label: "Refunds", icon: <RotateCcw size={14} /> },
  ]

  return (
    <div className="space-y-12 animate-in fade-in duration-700">

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-gray-100">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeFilter === f.id
                ? "bg-[#141519] text-white shadow-lg shadow-black/10"
                : "bg-white text-[#767F88] hover:bg-gray-50 border border-gray-100"
              }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* STATS OVERVIEW (Only show on 'all') */}
      {activeFilter === "all" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, i) => (
            <Card key={i} className="p-6 rounded-[32px] border-none bg-white shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#FAFAFB] flex items-center justify-center text-[#141519]">
                  {React.cloneElement(stat.icon as any, { size: 18 })}
                </div>
                <div className="text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">Live</div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#767F88] mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-[#141519]">{stat.val}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* SALES HISTORY */}
      {(activeFilter === "all" || activeFilter === "sales") && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <h2 className="text-xl font-bold tracking-tight">Sales History</h2>
          </div>
          <Card className="rounded-[32px] border border-gray-100 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-[#FAFAFB]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold py-5">Asset Sold</TableHead>
                  <TableHead className="font-bold">Acquirer</TableHead>
                  <TableHead className="font-bold">Transaction Value</TableHead>
                  <TableHead className="font-bold text-right">Protocol Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sales.length > 0 ? data.sales.map((sale) => (
                  <TableRow key={sale.id} className="group hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#141519]">{sale.product.title}</span>
                        <span className="text-[10px] text-[#767F88] font-black uppercase tracking-widest">{sale.product.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-[#767F88]" />
                        <span className="text-sm font-bold">{sale.user.name || "Anon"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-black text-green-600">+${sale.pricePaid.toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-[10px] font-black text-[#767F88] uppercase tracking-widest">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-[#767F88] italic">No transaction records detected.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}

      {/* PRODUCT PERFORMANCE / HISTORY */}
      {(activeFilter === "all" || activeFilter === "products" || activeFilter === "active") && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-2 w-2 rounded-full bg-[#48E44B]" />
            <h2 className="text-xl font-bold tracking-tight">
              {activeFilter === "active" ? "Active Assets" : "Product Log"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(activeFilter === "active" ? data.activeProducts : data.allProducts).map((p) => (
              <Card key={p.id} className="p-6 rounded-[32px] border-none bg-white shadow-sm hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-lg leading-tight mb-1">{p.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#767F88]">{p.category}</p>
                  </div>
                  <Badge className={p.isVisible ? "bg-[#48E44B]/10 text-[#48E44B] border-none" : "bg-gray-100 text-[#767F88] border-none"}>
                    {p.isVisible ? "ACTIVE" : "DRAFT"}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-50">
                  <div>
                    <p className="text-[9px] font-bold text-[#767F88] uppercase mb-1">Total Sales</p>
                    <p className="text-sm font-black italic">{p._count?.purchases || 0}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#767F88] uppercase mb-1">Node Value</p>
                    <p className="text-sm font-black italic">${p.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-[#767F88] uppercase mb-1">Created</p>
                    <p className="text-sm font-black italic">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* REFUNDS */}
      {(activeFilter === "all" || activeFilter === "refunds") && (
        <section className="pb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <h2 className="text-xl font-bold tracking-tight">Refund Protocols</h2>
          </div>
          <Card className="rounded-[32px] border border-gray-100 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-[#FAFAFB]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold py-5">Purchaser Info</TableHead>
                  <TableHead className="font-bold">Asset ID</TableHead>
                  <TableHead className="font-bold">Reasoning</TableHead>
                  <TableHead className="font-bold text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.refunds.length > 0 ? data.refunds.map((refund) => (
                  <TableRow key={refund.id} className="hover:bg-gray-100/50 transition-colors">
                    <TableCell className="py-5">
                      <span className="text-sm font-bold text-[#141519]">{refund.purchase.user.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-black text-[#767F88] uppercase tracking-widest leading-none">{refund.purchase.product.title}</span>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="text-xs text-[#767F88] truncate block">{refund.reason}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Badge className={
                          refund.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            refund.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              'bg-orange-100 text-orange-700'
                        }>
                          {refund.status}
                        </Badge>

                        {role === "ADMIN" && refund.status === "PENDING" && (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={!!updating}
                              onClick={() => handleRefundAction(refund.id, 'APPROVED')}
                              className="h-8 w-8 text-green-600 hover:bg-green-50"
                            >
                              {updating === refund.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={!!updating}
                              onClick={() => handleRefundAction(refund.id, 'REJECTED')}
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                            >
                              {updating === refund.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={role === "ADMIN" ? 5 : 4} className="py-10 text-center text-sm text-[#767F88] italic uppercase tracking-widest">Zero refund requests initialized.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}

    </div>
  )
}
