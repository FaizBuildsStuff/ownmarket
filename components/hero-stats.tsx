"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, Zap, Globe, Cpu, Terminal, Box } from "lucide-react";
import gsap from "gsap";

export default function HeroExtreme() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Animate the background SVG circuit lines
      gsap.fromTo(
        ".circuit-path",
        { strokeDashoffset: 1000, opacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 0.4,
          duration: 3,
          ease: "power2.inOut",
          stagger: 0.2,
          repeat: -1,
          yoyo: true,
        }
      );

      // 2. Mouse Parallax Effect for the Bento Cards
      const handleMouseMove = (e: MouseEvent) => {
        if (window.innerWidth < 1024) return;
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 20;
        const yPos = (clientY / window.innerHeight - 0.5) * 20;

        gsap.to(".parallax-card", {
          x: xPos,
          y: yPos,
          duration: 1,
          ease: "power2.out",
          stagger: 0.05,
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full min-h-screen lg:min-h-[85vh] flex items-center justify-center overflow-hidden pt-20 lg:pt-4 pb-20 px-4 md:px-6 -mt-10">
      
      {/* --- BACKGROUND LAYER: ANIMATED SVG LINES --- */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 lg:opacity-40">
        <svg ref={svgRef} className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="circuit-path" d="M0 200H200V400H400V0H600V800H1000" stroke="url(#grad1)" strokeWidth="1" strokeDasharray="10 10" />
          <path className="circuit-path" d="M1000 300H800V600H400V1000" stroke="url(#grad2)" strokeWidth="1" strokeDasharray="5 5" />
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* --- LEFT: MISSION CONTROL --- */}
        <div className="lg:col-span-5 space-y-6 lg:space-y-8 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-xl shadow-sm mx-auto lg:mx-0"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Global Node: PK-772</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-zinc-900 leading-[0.8] mb-4 lg:mb-6 uppercase">
            DIGITAL <br />
            <span className="text-transparent bg-clip-text bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXF6Znd6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z/3o7TKVUn7iM8FMEU24/giphy.gif')] bg-cover bg-center">
              MARKET
            </span> <br />
            AUTHORITY.
          </h1>

          <p className="max-w-sm mx-auto lg:mx-0 text-zinc-500 text-base lg:text-lg font-medium leading-relaxed italic">
            Software licenses, premium accounts, and game assets delivered via <span className="text-indigo-600 font-bold">Verified Neural Pipelines</span>.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4">
            <button className="group relative h-14 lg:h-16 px-8 lg:px-10 rounded-2xl bg-zinc-900 text-white overflow-hidden transition-all hover:scale-105 active:scale-95 hover:shadow-[0_20px_40px_rgba(99,102,241,0.3)]">
              <span className="relative z-10 flex items-center gap-3 font-bold uppercase tracking-wider text-sm lg:text-base">
                EXPLORE ASSETS <Box className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-sky-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* --- RIGHT: THE BENTO TERMINAL --- */}
        <div className="lg:col-span-7 grid grid-cols-4 md:grid-cols-6 grid-rows-none lg:grid-rows-6 gap-3 lg:gap-4 h-auto lg:h-[600px]">
          
          <div className="parallax-card col-span-4 row-span-1 lg:row-span-4 rounded-3xl lg:rounded-[2.5rem] border border-zinc-200 bg-white/40 backdrop-blur-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 lg:w-40 lg:h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
            <Cpu className="w-8 h-8 lg:w-10 lg:h-10 text-indigo-600 mb-4 lg:mb-6" />
            <h3 className="text-2xl lg:text-3xl font-bold text-zinc-900 leading-tight uppercase italic">Universal <br className="hidden lg:block" /> Asset Core</h3>
            <p className="text-zinc-500 mt-2 lg:mt-4 text-xs lg:text-sm max-w-[240px]">Automated license delivery for software, games, and premium tools.</p>
            
            <div className="mt-6 lg:mt-12 space-y-2">
              <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "94%" }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                  }}
                  className="h-full bg-emerald-500" 
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                <span>SYSTEM UPTIME</span>
                <span>99.9%</span>
              </div>
            </div>
          </div>

          <div className="parallax-card col-span-2 md:col-span-3 lg:col-span-2 row-span-1 lg:row-span-3 rounded-3xl lg:rounded-[2.5rem] border border-zinc-200 bg-zinc-900 p-5 lg:p-6 flex flex-col justify-between shadow-xl group min-h-[140px] lg:min-h-0">
            <Globe className="w-6 h-6 text-emerald-400 group-hover:rotate-180 transition-transform duration-1000" />
            <div>
              <div className="text-2xl lg:text-3xl font-black text-white italic">24/7</div>
              <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Global Commerce</div>
            </div>
          </div>

          <div className="parallax-card col-span-2 md:col-span-3 lg:col-span-2 row-span-1 lg:row-span-3 rounded-3xl lg:rounded-[2.5rem] border border-zinc-200 bg-white/80 backdrop-blur-xl p-5 lg:p-6 shadow-lg flex flex-col justify-center items-center text-center">
            <ShieldCheck className="w-8 h-8 lg:w-10 lg:h-10 text-sky-500 mb-2" />
            <div className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter">Escrow <br /> Protected</div>
          </div>

          <div className="parallax-card col-span-4 row-span-1 lg:row-span-2 rounded-3xl lg:rounded-[2.5rem] border border-zinc-800 bg-zinc-900 p-6 lg:p-8 flex items-center justify-around shadow-2xl">
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-white">45k+</div>
              <div className="text-[9px] lg:text-[10px] text-zinc-500 font-bold uppercase">Sold</div>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <div className="text-xl lg:text-2xl font-bold text-white">4.9/5</div>
              <div className="text-[9px] lg:text-[10px] text-zinc-500 font-bold uppercase">Trust</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}