import Link from "next/link"
import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// 1. In Next.js 15, params is a Promise
type Props = {
  params: Promise<{ id: string }>
}

export default async function UserPage({ params }: Props) {
  // 2. Await the params
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
        <p className="text-sm text-[#767F88]">User not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB] px-4 md:px-8 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#141519] text-white flex items-center justify-center text-xl font-bold">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#141519]">
                {user.name ?? "Marketplace seller"}
              </h1>
              <p className="text-xs text-[#767F88]">{user.email}</p>
            </div>
          </div>
          <Badge className="bg-black text-white border-none text-xs font-semibold px-3 py-1 rounded-full">
            {user.role}
          </Badge>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#141519]">Published products</h2>
          {user.products.length === 0 ? (
            <p className="text-sm text-[#767F88]">This creator has not published any products yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 3. Explicitly typing the map parameter fixes the 'any' error */}
              {user.products.map((product: any) => (
                <Card key={product.id} className="rounded-3xl border border-[#E5E5E7] bg-white shadow-sm">
                  <CardContent className="p-6 space-y-3">
                    <Badge className="bg-[#FAFAFB] text-[#141519] border-none text-[10px] font-semibold px-2 py-1 rounded-full">
                      {product.category}
                    </Badge>
                    <h3 className="font-semibold text-[#141519] text-lg">
                      {product.title}
                    </h3>
                    <p className="text-sm text-[#767F88] line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-[#F1F1F3]">
                      <span className="text-base font-bold text-[#141519]">
                        ${product.price.toFixed(2)}
                      </span>
                      <Link href={`/product/${product.id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl text-xs">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}