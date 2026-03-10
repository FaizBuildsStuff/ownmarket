import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ShieldCheck, 
  Zap, 
  Star, 
  Clock, 
  FileCode, 
  ArrowRight,
  MessageSquare,
  RefreshCw,
  MoreHorizontal
} from "lucide-react"
import { ProductPurchaseActions } from "@/components/ProductPurchaseActions"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id: id },
    include: { seller: true },
  })

  if (!product) notFound()

  return (
    <div className="min-h-screen bg-[#FAFAFB] selection:bg-[#48E44B]/30 pb-32 font-sans antialiased">
      
      {/* 1. TOP NAV STRIP */}
      <nav className="border-b border-gray-100 bg-white px-8 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/marketplace" className="text-[11px] font-black uppercase tracking-widest text-[#767F88] hover:text-black transition-colors">
            ← Marketplace
          </Link>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-[11px] font-bold text-gray-400 truncate max-w-[200px]">{product.title}</span>
        </div>
        <div className="flex items-center gap-4">
           <button className="text-[#767F88] hover:text-black"><MoreHorizontal size={20} /></button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-8 py-12 flex flex-col lg:flex-row gap-24">
        
        {/* LEFT SIDE: THE ARTWORK (RECTANGLE) */}
        <div className="w-full lg:w-[460px] flex-shrink-0">
          <div className="lg:sticky lg:top-24 space-y-10">
            
            {/* THE RECTANGLE IMAGE */}
            <div className="relative aspect-[1.6/1] w-full overflow-hidden rounded-[32px] bg-white border border-gray-100 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] group">
              <Image
                src={product.image}
                alt={product.title}
                fill
                priority
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute top-5 left-5">
                <Badge className="bg-black/90 backdrop-blur-xl text-white border-none font-bold text-[9px] px-3 py-1 rounded-full uppercase tracking-tighter">
                  {product.category}
                </Badge>
              </div>
            </div>

            {/* CREATOR CARD */}
            <div className="w-full rounded-[28px] border border-gray-100 bg-white p-5 flex items-center gap-4 hover:shadow-xl hover:shadow-black/[0.02] transition-all group">
                <div className="h-12 w-12 rounded-[18px] bg-[#141519] flex items-center justify-center text-lg font-black text-white group-hover:rotate-6 transition-transform">
                  {product.seller?.name?.[0]?.toUpperCase() ?? "O"}
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#767F88]">Curated By</p>
                  <p className="text-lg font-bold text-[#141519]">
                    {product.seller?.name ?? "Design Node"}
                  </p>
                </div>
                <Link href={`/user/${product.seller?.id}`}>
                   <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#48E44B]/10">
                     <ArrowRight size={18} className="text-[#141519]" />
                   </Button>
                </Link>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: THE SCROLLING CANVAS */}
        <div className="flex-1 space-y-16">
          
          {/* HEADER */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-8xl font-bold tracking-[-0.06em] text-[#141519] leading-[0.85] max-w-[900px]">
              {product.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-8 text-[12px] font-bold text-[#767F88] uppercase tracking-widest pt-4">
              <span className="flex items-center gap-2 text-black">
                <Star size={14} className="text-yellow-400 fill-yellow-400" /> 4.9 Rating
              </span>
              <span className="flex items-center gap-2 text-[#48E44B]">
                <ShieldCheck size={16} /> Verified Asset
              </span>
            </div>
          </div>

          {/* PRICING BLOCK */}
          <div className="rounded-[40px] bg-white border border-gray-100 p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-black/[0.02] gap-10">
             <div className="flex flex-col">
                <p className="text-[10px] font-black text-[#767F88] uppercase tracking-[0.3em] mb-3">Price Point</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-8xl font-black tracking-tighter text-[#141519]">${product.price.toFixed(0)}</span>
                  <span className="text-2xl font-bold text-[#767F88]">.00</span>
                </div>
             </div>
             <ProductPurchaseActions
               id={product.id}
               title={product.title}
               price={product.price}
               image={product.image}
               category={product.category}
               sellerId={product.sellerId}
               sellerName={product.seller?.name}
             />
          </div>

          {/* BENTO SPECS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: "Version", value: product.version, icon: <RefreshCw size={14}/> },
               { label: "Delivery", value: "Instant", icon: <Zap size={14}/> },
               { label: "Format", value: "TS Source", icon: <FileCode size={14}/> },
               { label: "Updates", value: "Lifetime", icon: <Clock size={14}/> },
             ].map((spec, i) => (
               <div key={i} className="p-6 rounded-[24px] bg-white border border-gray-100 hover:border-black transition-all group">
                 <div className="flex items-center gap-2 text-[#767F88] mb-3 group-hover:text-black">
                   {spec.icon}
                   <span className="text-[9px] font-black uppercase tracking-[0.2em]">{spec.label}</span>
                 </div>
                 <p className="font-bold text-[#141519] text-lg">{spec.value}</p>
               </div>
             ))}
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-8 max-w-[850px] pt-10">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black text-[#141519] uppercase tracking-tighter">Overview</h3>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <p className="text-2xl text-[#5E6D55] leading-[1.6] font-medium tracking-tight">
              {product.description}
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}