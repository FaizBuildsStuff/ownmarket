import Link from "next/link"
import Image from "next/image"
import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, ShieldCheck, Globe } from "lucide-react"

type Props = {
  params: Promise<{ id: string }>
}

export default async function UserPage({ params }: Props) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      products: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFB] px-4">
        <div className="text-center space-y-4">
          <p className="text-sm font-bold text-[#767F88] uppercase tracking-widest">404 Error</p>
          <h1 className="text-2xl font-black text-[#141519]">Creator not found</h1>
          <Link href="/">
            <Button variant="outline" className="rounded-full">Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB] selection:bg-[#48E44B]/30 pb-32">
      
      {/* 1. HERO HEADER SECTION */}
      <section className="bg-white border-b border-gray-100 pt-32 pb-20">
        <div className="mx-auto max-w-[800px] px-6 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="h-24 w-24 rounded-[32px] bg-black text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-black/20">
              {user.name?.[0]?.toUpperCase() ?? "O"}
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#48E44B] border-4 border-white rounded-full flex items-center justify-center">
              <ShieldCheck size={16} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#141519] mb-4">
            {user.name ?? "Marketplace Creator"}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-[#767F88] mb-8">
            <span className="flex items-center gap-1.5"><Star size={14} className="fill-yellow-400 text-yellow-400" /> Top Rated</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5"><Globe size={14} /> Global License</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <Badge className="bg-[#48E44B]/10 text-[#2d8a2f] border-none font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
              {user.role}
            </Badge>
          </div>

          <p className="max-w-[500px] text-lg text-[#767F88] font-medium leading-relaxed">
            Professional creator distributing high-end digital assets on OwnMarket. 
            All products are verified for quality and compatibility.
          </p>
        </div>
      </section>

      {/* 2. PRODUCTS GRID */}
      <main className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-sm font-black text-[#141519] uppercase tracking-[0.2em]">
            Published Assets ({user.products.length})
          </h2>
          <div className="h-px flex-1 bg-gray-100 ml-8" />
        </div>

        {user.products.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
            <p className="text-sm font-bold text-[#767F88] uppercase tracking-widest">No assets available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {user.products.map((product: any) => (
              <Card key={product.id} className="group relative overflow-hidden rounded-[40px] border-none bg-white shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
                  {product.image ? (
                    <Image 
                      src={product.image} 
                      alt={product.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-200">
                      <Star size={40} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 backdrop-blur-md text-black border-none font-bold text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">
                      {product.category}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-[#141519] tracking-tight mb-3 group-hover:text-[#48E44B] transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-[#767F88] font-medium leading-relaxed mb-8 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#767F88] uppercase tracking-widest">License</span>
                      <span className="text-xl font-black text-[#141519]">
                        ${product.price.toFixed(0)}<span className="text-sm">.00</span>
                      </span>
                    </div>
                    <Link href={`/product/${product.id}`}>
                      <Button className="rounded-2xl bg-[#141519] text-white font-bold h-12 px-6 hover:bg-black transition-all group/btn">
                        Details
                        <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}