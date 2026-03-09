"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function Hero() {
    const heroRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {

            gsap.from(".hero-badge", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out",
            })

            gsap.from(".hero-title", {
                y: 40,
                opacity: 0,
                duration: 0.8,
                delay: 0.1,
                ease: "power3.out",
            })

            gsap.from(".hero-desc", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                delay: 0.25,
                ease: "power3.out",
            })

            gsap.from(".hero-cta", {
                y: 25,
                opacity: 0,
                duration: 0.7,
                delay: 0.4,
                ease: "power3.out",
            })

            gsap.from(".hero-trust", {
                y: 20,
                opacity: 0,
                duration: 0.7,
                delay: 0.55,
                ease: "power3.out",
            })

            gsap.to(".hero-glow", {
                x: 40,
                y: 20,
                duration: 10,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            })

            

        }, heroRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={heroRef} className="relative overflow-hidden">

            {/* ambient glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 flex justify-center">
                <div className="hero-glow h-[500px] w-[900px] rounded-full bg-gradient-to-r from-[#48E44B]/25 via-[#9EFF3E]/20 to-transparent blur-[120px]" />
            </div>

            {/* secondary glow */}
            <div className="pointer-events-none absolute left-1/2 top-[120px] -z-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#48E44B]/10 blur-[100px]" />

            <div className="mx-auto max-w-[1100px] px-6 pt-28 pb-24 text-center md:pt-32 md:pb-28">

                {/* badge */}
                <div className="hero-badge mb-8 inline-flex items-center rounded-full border border-[#E5E5E7] bg-white/70 px-4 py-1.5 text-sm text-[#767F88] backdrop-blur-sm">
                    Trusted Digital Marketplace
                </div>

                {/* headline */}
                <h1 className="hero-title mx-auto max-w-[820px] text-[40px] leading-[1.05] tracking-tight text-[#141519] sm:text-[48px] md:text-[64px]">
                    The modern marketplace
                    <span className="block">
                        for digital products
                    </span>
                </h1>

                {/* description */}
                <p className="hero-desc mx-auto mt-6 max-w-[560px] text-[16px] text-[#767F88] md:text-[17px]">
                    Buy, sell, and discover high-quality digital assets from trusted
                    creators. Built for developers, designers, and modern internet businesses.
                </p>

                {/* CTA */}
                <div className="hero-cta mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">

                    <Link href="/marketplace">
                    <Button
                        size="lg"
                        className="h-12 rounded-xl bg-[#141519] px-7 text-[15px] text-white hover:bg-black"
                    >
                        Explore Marketplace
                    </Button></Link>

                    <Link
                        href="/signup"
                        className="text-[15px] text-[#767F88] transition hover:text-[#141519]"
                    >
                        Start selling →
                    </Link>

                </div>

                {/* trust indicators */}
                <div className="hero-trust mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-[#767F88] md:gap-8">

                    <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#48E44B]" />
                        Secure payments
                    </span>

                    <span className="h-4 w-px bg-[#E5E5E7]" />

                    <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#48E44B]" />
                        Verified sellers
                    </span>

                    <span className="h-4 w-px bg-[#E5E5E7]" />

                    <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#48E44B]" />
                        Instant delivery
                    </span>

                    <span className="h-4 w-px bg-[#E5E5E7]" />

                    <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#48E44B]" />
                        Global marketplace
                    </span>

                </div>

                {/* feature cards */}
                <div className="hero-cards mx-auto mt-20 grid max-w-[900px] grid-cols-1 gap-6 md:grid-cols-3">

                    {/* card 1 */}
                    <div className="card group relative rounded-2xl border border-[#E5E5E7] bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-lg">

                        <div className="mb-4 h-10 w-10 rounded-lg bg-[#48E44B]/10 flex items-center justify-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-[#48E44B]" />
                        </div>

                        <h3 className="text-[16px] font-medium text-[#141519]">
                            Secure Transactions
                        </h3>

                        <p className="mt-2 text-sm text-[#767F88]">
                            Built with secure payments and verified sellers to keep every transaction safe.
                        </p>

                    </div>

                    {/* card 2 */}
                    <div className="card group relative rounded-2xl border border-[#E5E5E7] bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-lg">

                        <div className="mb-4 h-10 w-10 rounded-lg bg-[#48E44B]/10 flex items-center justify-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-[#48E44B]" />
                        </div>

                        <h3 className="text-[16px] font-medium text-[#141519]">
                            Instant Delivery
                        </h3>

                        <p className="mt-2 text-sm text-[#767F88]">
                            Digital assets are delivered instantly after purchase without any delays.
                        </p>

                    </div>

                    {/* card 3 */}
                    <div className="card group relative rounded-2xl border border-[#E5E5E7] bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-lg">

                        <div className="mb-4 h-10 w-10 rounded-lg bg-[#48E44B]/10 flex items-center justify-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-[#48E44B]" />
                        </div>

                        <h3 className="text-[16px] font-medium text-[#141519]">
                            Global Marketplace
                        </h3>

                        <p className="mt-2 text-sm text-[#767F88]">
                            Discover digital products from creators and developers around the world.
                        </p>

                    </div>

                </div>

            </div>

        </section>
    )
}