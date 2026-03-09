"use client"

import { Card } from "@/components/ui/card"
import {
  ArrowUpRight,
  Gamepad2,
  MessageSquare,
  User,
  Bot,
  Wrench,
  ShoppingBag
} from "lucide-react"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"

const categories = [
  {
    title: "Game Items",
    description: "Buy and sell rare skins, coins, boosts and in-game assets.",
    icon: Gamepad2,
  },
  {
    title: "Discord Assets",
    description: "Servers, roles, templates and Discord-related digital items.",
    icon: MessageSquare,
  },
  {
    title: "Accounts",
    description: "Secure marketplace for trading gaming and online accounts.",
    icon: User,
  },
  {
    title: "Bots & Scripts",
    description: "Automation bots, scripts and tools for gaming and Discord.",
    icon: Bot,
  },
  {
    title: "Digital Tools",
    description: "Useful tools, software utilities and automation products.",
    icon: Wrench,
  },
  {
    title: "Services",
    description: "Boosting, setup services and custom digital services.",
    icon: ShoppingBag,
  },
]

export default function Categories() {
  const sectionRef = useRef<HTMLDivElement>(null)



  return (
    <section ref={sectionRef} className="mx-auto max-w-[1250px] px-6 py-32">

      {/* Header */}
      <div className="categories-header mb-20 text-center">

        <div className="inline-flex items-center rounded-full border border-[#E5E5E7] bg-white px-4 py-1 text-sm text-[#767F88]">
          Categories
        </div>

        <h2 className="mt-6 text-[36px] md:text-[44px] tracking-tight text-[#141519]">
          Explore marketplace categories
        </h2>

        <p className="mt-3 max-w-[520px] mx-auto text-[15px] text-[#767F88]">
          Discover digital items sold by creators and gamers across the marketplace.
        </p>

      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">

        {categories.map((cat, index) => {
          const Icon = cat.icon

          return (
            <Card
              key={index}
              className="category-card relative overflow-hidden rounded-2xl border border-[#E5E5E7] bg-white p-8 transition-all duration-300 hover:-translate-y-[8px] hover:shadow-2xl group"
            >

              {/* glow hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-gradient-to-br from-[#48E44B]/10 via-transparent to-[#9EFF3E]/10" />

              {/* icon */}
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#48E44B]/10 ring-1 ring-[#48E44B]/20">
                <Icon size={22} className="text-[#141519]" />
              </div>

              {/* title */}
              <h3 className="text-[18px] font-medium text-[#141519]">
                {cat.title}
              </h3>

              {/* description */}
              <p className="mt-2 text-sm text-[#767F88] leading-relaxed">
                {cat.description}
              </p>
            </Card>
          )
        })}

      </div>

    </section>
  )
}