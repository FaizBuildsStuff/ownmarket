"use client"

import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, Package, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

type Stats = {
  userCount: number
  productCount: number
  purchaseCount: number
  totalRevenue: number
}

type RecentPurchase = {
  id: string
  createdAt: string
  pricePaid: number
  user: { name: string | null }
  product: { title: string | null }
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<RecentPurchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setRecent(data.recentPurchases)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="p-8 text-center text-sm text-[#767F88]">Calculating insights...</div>
  if (!stats) return null

  const cards = [
    { label: "Total Revenue", val: `$${stats.totalRevenue.toLocaleString()}`, icon: <CreditCard />, trend: "+12%", up: true },
    { label: "Platform Users", val: stats.userCount.toString(), icon: <Users />, trend: "+5%", up: true },
    { label: "Active Assets", val: stats.productCount.toString(), icon: <Package />, trend: "+8%", up: true },
    { label: "Total Sales", val: stats.purchaseCount.toString(), icon: <TrendingUp />, trend: "-2%", up: false },
  ]

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Card key={i} className="p-6 rounded-[32px] border-none bg-white shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#FAFAFB] flex items-center justify-center text-[#141519]">
                {React.cloneElement(card.icon as any, { size: 20 })}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${card.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {card.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {card.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#767F88] mb-1">{card.label}</p>
              <p className="text-2xl font-black text-[#141519]">{card.val}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 rounded-[40px] border-none bg-[#141519] text-white shadow-2xl">
          <h3 className="text-lg font-bold mb-6">Recent Platform Activity</h3>
          <div className="space-y-6">
            {recent.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black italic">
                    {item.user.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.user.name || 'Anonymous'}</p>
                    <p className="text-[10px] text-gray-500">Bought {item.product.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#48E44B]">${item.pricePaid.toFixed(2)}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {recent.length === 0 && <p className="text-sm text-gray-500 italic">No recent sales detected.</p>}
          </div>
        </Card>

        <Card className="p-8 rounded-[40px] border-none bg-white shadow-sm flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-3xl bg-[#48E44B]/10 flex items-center justify-center text-[#48E44B] mb-6">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-xl font-black text-[#141519] mb-2">Growth Spurt</h3>
          <p className="text-sm text-[#767F88] max-w-[280px]">
            Platform engagement is up 14% this week. Maintain current node health protocols.
          </p>
          <div className="mt-10 h-32 w-full bg-[#FAFAFB] rounded-2xl flex items-end gap-1 p-2">
            {[40, 70, 45, 90, 65, 80, 50, 95, 75, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-[#48E44B] rounded-t-sm opacity-20 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
