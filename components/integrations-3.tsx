import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  Sparkles,
  BadgeCheck,
} from 'lucide-react'

export default function IntegrationsSection() {
  return (
    <section>
      <div className="py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid items-center sm:grid-cols-2">
            <div className="relative mx-auto w-fit">
              <div aria-hidden className="absolute inset-0 z-10" />
              <div className="mx-auto mb-2 flex w-fit justify-center gap-2">
                <IntegrationCard>
                  <MessageCircle className="size-8 text-[#5865F2]" />
                </IntegrationCard>
                <IntegrationCard>
                  <ShieldCheck className="size-8 text-emerald-500" />
                </IntegrationCard>
              </div>
              <div className="mx-auto my-2 flex w-fit justify-center gap-2">
                <IntegrationCard>
                  <ShoppingBag className="size-8 text-indigo-500" />
                </IntegrationCard>
                <IntegrationCard borderClassName="shadow-black-950/10 shadow-xl border-black/25 dark:border-white/25">
                  <CreditCard className="size-8 text-zinc-700 dark:text-zinc-300" />
                </IntegrationCard>
                <IntegrationCard>
                  <Sparkles className="size-8 text-amber-500" />
                </IntegrationCard>
              </div>
              <div className="mx-auto flex w-fit justify-center gap-2">
                <IntegrationCard>
                  <BadgeCheck className="size-8 text-sky-500" />
                </IntegrationCard>
              </div>
            </div>
            <div className="mx-auto mt-6 max-w-lg space-y-6 text-center sm:mt-0 sm:text-left">
              <h2 className="text-balance text-3xl font-semibold md:text-4xl">
                Discord-first, trade with confidence
              </h2>
              <p className="text-muted-foreground">
                Connect with sellers on Discord, use staff-backed escrow, and browse Nitro, boosts, and OG handles in one curated marketplace.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">Browse marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const IntegrationCard = ({
  children,
  className,
  borderClassName,
}: {
  children: React.ReactNode
  className?: string
  borderClassName?: string
}) => {
  return (
    <div className={cn('relative flex size-20 rounded-xl', className)}>
      <div
        role="presentation"
        className={cn(
          'absolute inset-0 rounded-xl border border-black/20 dark:border-white/25',
          borderClassName
        )}
      />
      <div className="relative z-20 m-auto size-fit flex items-center justify-center [&>svg]:size-8">
        {children}
      </div>
    </div>
  )
}
