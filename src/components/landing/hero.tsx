"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { InteractiveGrid } from "@/components/bg-grid";

const GRID_SPACING = 60;
const RULER_SIZE = 300;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [brRulerPos, setBrRulerPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    const snap = () => {
      const section = sectionRef.current;
      if (!section) return;
      const { width, height } = section.getBoundingClientRect();
      const snapX = Math.floor(width / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.floor(height / GRID_SPACING) * GRID_SPACING;
      setBrRulerPos({ left: snapX - RULER_SIZE, top: snapY - RULER_SIZE });
    };
    snap();
    window.addEventListener("resize", snap);
    return () => window.removeEventListener("resize", snap);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-background pt-16"
    >
      <InteractiveGrid sectionRef={sectionRef} />

      {/* Those shapes on the left and right */}
      <div className="absolute -right-27.5 top-1/4 translate-y-10.5 h-[600px] w-[600px] rotate-45 border border-primary/25" />
      <div className="absolute -left-28.5 bottom-1/4 h-[400px] w-[400px] rotate-12 border border-primary/15" />

      {/* Top right and bottom left gradients */}
      <div className="absolute top-0 right-0 h-2/3 w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(205,45,45,0.09)_0%,rgba(205,45,45,0.03)_40%,transparent_70%)]" />
      <div className="absolute bottom-0 left-0 h-2/3 w-1/2 bg-[radial-gradient(ellipse_at_bottom_left,rgba(205,45,45,0.09)_0%,rgba(205,45,45,0.03)_40%,transparent_70%)]" />

      {/* <svg
        className="absolute top-20 left-8 h-24 w-24 text-primary/40 md:h-40 md:w-40 lg:left-20"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <path d="M100 0 L0 0 L0 100" stroke="currentColor" strokeWidth="1" />
        <path
          d="M80 0 L0 0 L0 80"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </svg> */}

      {/* <svg
        className="absolute top-20 right-8 h-24 w-24 text-primary/40 md:h-40 md:w-40 lg:right-20"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <path d="M0 0 L100 0 L100 100" stroke="currentColor" strokeWidth="1" />
        <path
          d="M20 0 L100 0 L100 80"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </svg> */}

      {/* Right Angle Triangle Ruler - Top Left: right angle at (0,0), legs along x=0 and y=0 grid lines */}
      <svg
        className="absolute top-px left-px hidden lg:block h-[300px] w-[300px] text-primary/50"
        viewBox="0 0 100 100"
        fill="none"
        overflow="visible"
        aria-hidden="true"
      >
        {/* Outer triangle: right angle at top-left (0,0) */}
        <path d="M100 0 L0 0 L0 100 Z" stroke="currentColor" strokeWidth="1" fill="none" />
        {/* Inner cutout */}
        <path d="M80 10 L10 10 L10 80 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
        {/* Tick marks along top horizontal edge (y=0) — every 20 units = 1 grid cell at lg:300px */}
        {[...Array(4)].map((_, i) => (
          <line key={`t-${i}`} x1={20 * (i + 1)} y1="0" x2={20 * (i + 1)} y2={i % 2 === 0 ? "7" : "4"} stroke="currentColor" strokeWidth={i % 2 === 0 ? "0.75" : "0.4"} />
        ))}
        {/* Tick marks along left vertical edge (x=0) */}
        {[...Array(4)].map((_, i) => (
          <line key={`l-${i}`} x1="0" y1={20 * (i + 1)} x2={i % 2 === 0 ? "7" : "4"} y2={20 * (i + 1)} stroke="currentColor" strokeWidth={i % 2 === 0 ? "0.75" : "0.4"} />
        ))}
      </svg>

      {/* Right Angle Triangle Ruler - Bottom Right: right angle snapped to nearest grid intersection */}
      <svg
        className="absolute hidden lg:block h-[300px] w-[300px] text-primary/40 rotate-180"
        style={brRulerPos ?? { display: "none" }}
        viewBox="0 0 100 100"
        fill="none"
        overflow="visible"
        aria-hidden="true"
      >
       {/* Outer triangle: right angle at top-left (0,0) */}
       <path d="M100 0 L0 0 L0 100 Z" stroke="currentColor" strokeWidth="1" fill="none" />
        {/* Inner cutout */}
        <path d="M80 10 L10 10 L10 80 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
        {/* Tick marks along top horizontal edge (y=0) — every 20 units = 1 grid cell at lg:300px */}
        {[...Array(4)].map((_, i) => (
          <line key={`t-${i}`} x1={20 * (i + 1)} y1="0" x2={20 * (i + 1)} y2={i % 2 === 0 ? "7" : "4"} stroke="currentColor" strokeWidth={i % 2 === 0 ? "0.75" : "0.4"} />
        ))}
        {/* Tick marks along left vertical edge (x=0) */}
        {[...Array(4)].map((_, i) => (
          <line key={`l-${i}`} x1="0" y1={20 * (i + 1)} x2={i % 2 === 0 ? "7" : "4"} y2={20 * (i + 1)} stroke="currentColor" strokeWidth={i % 2 === 0 ? "0.75" : "0.4"} />
        ))}
      </svg>

      {/* Scattered 4-Pointed Stars Background */}
      {/* Large star - top right area */}
      <svg
        className="absolute top-32 right-1/4 h-32 w-32 text-white/90 lg:h-48 lg:w-48"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z" />
      </svg>

      {/* Medium star - left side */}
      <svg
        className="absolute top-1/4 left-1/3 h-20 w-20 text-white/80 lg:h-28 lg:w-28"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z" />
      </svg>

      {/* Small star - bottom area */}
      <svg
        className="absolute bottom-1/3 right-1/3 h-12 w-12 text-white/85"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z" />
      </svg>

      {/* Tiny stars scattered */}
      <svg
        className="absolute top-40 right-20 h-6 w-6 text-white/100"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z" />
      </svg>

      <svg
        className="absolute top-2/3 left-20 h-8 w-8 text-white/90"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z" />
      </svg>

      <svg
        className="absolute top-1/2 right-40 h-10 w-10 text-white/85 hidden md:block"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z" />
      </svg>

      {/* Elongated star/sparkle */}
      <svg
        className="absolute top-1/3 right-1/2 h-16 w-8 text-white/80 rotate-12"
        viewBox="0 0 50 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M25 0 L28 45 L50 50 L28 55 L25 100 L22 55 L0 50 L22 45 Z" />
      </svg>

      {/* Primary colored stars for accent */}
      <svg
        className="absolute bottom-1/4 left-1/4 h-6 w-6 text-primary/100"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z" />
      </svg>

      <svg
        className="absolute top-1/4 right-16 h-4 w-4 text-primary/100 hidden lg:block"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z" />
      </svg>

      {/* Additional larger stars for more visibility */}
      <svg
        className="absolute top-20 right-1/3 h-24 w-24 text-white/75"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z" />
      </svg>

      <svg
        className="absolute bottom-40 right-20 h-16 w-16 text-white/80 hidden md:block"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z" />
      </svg>

      <svg
        className="absolute top-1/2 left-1/4 h-10 w-10 text-primary/95"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z" />
      </svg>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-6">
        <div className="max-w-4xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px w-12 bg-primary" />
            <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
              32-Hour Hackathon
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-balance">
            <span className="text-foreground">HACK</span>
            <span className="text-primary">4</span>
            <span className="text-foreground">US</span>
          </h1>

          <p className="mb-12 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            A premier 36-hour hackathon bringing students together to design innovative solutions for sustainable and inclusive cities. Where software meets hardware to tackle real environmental challenges.
          </p>


          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="#register"
              className="group inline-flex items-center gap-3 bg-primary px-8 py-4 text-sm font-bold tracking-widest text-primary-foreground uppercase transition-all hover:bg-primary/90"
            >
              Register Now
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#about"
              className="inline-flex items-center gap-3 border border-border px-8 py-4 text-sm font-bold tracking-widest text-foreground uppercase transition-all hover:border-foreground"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-x border-border">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border md:grid-cols-4">
            {[
              { label: "DATE", value: "XYZ 32-34, 2026" },
              { label: "LOCATION", value: "TORONTO" },
              { label: "PARTICIPANTS", value: "67+" },
              { label: "IN PRIZES", value: "$69,420" },
            ].map((item) => (
              <div key={item.label} className="bg-background px-6 py-5">
                <span className="mb-1 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
                  {item.label}
                </span>
                <span className="text-sm font-bold tracking-wide text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
