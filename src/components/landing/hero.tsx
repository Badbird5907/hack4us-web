"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { InteractiveGrid } from "@/components/bg-grid";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STAR_PATH = "M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z";
const ELONGATED_STAR_PATH =
  "M25 0 L28 45 L50 50 L28 55 L25 100 L22 55 L0 50 L22 45 Z";

interface StarIconProps {
  className: string;
  duration: string;
  delay: string;
  minOpacity: string;
  minScale: string;
  variant?: "regular" | "elongated";
}

function StarIcon({
  className,
  duration,
  delay,
  minOpacity,
  minScale,
  variant = "regular",
}: StarIconProps) {
  const isElongated = variant === "elongated";
  return (
    <svg
      className={className}
      style={
        {
          "--star-duration": duration,
          "--star-delay": delay,
          "--star-min-opacity": minOpacity,
          "--star-min-scale": minScale,
        } as React.CSSProperties
      }
      viewBox={isElongated ? "0 0 50 100" : "0 0 100 100"}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={isElongated ? ELONGATED_STAR_PATH : STAR_PATH} />
    </svg>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triangleSvgRef = useRef<SVGSVGElement>(null);
  const starsSlowRef = useRef<HTMLDivElement>(null);
  const starsMediumRef = useRef<HTMLDivElement>(null);
  const starsFastRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const scrubConfig = { scrub: 0.5 };

      // Triangle SVG overlay — fades out over first 35% of scroll
      if (triangleSvgRef.current) {
        gsap.to(triangleSvgRef.current, {
          opacity: 0,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "35% top",
            ...scrubConfig,
          },
        });
      }

      // Star Layer 1 — slow drift (y: 0 → -30, full scroll)
      if (starsSlowRef.current) {
        gsap.to(starsSlowRef.current, {
          y: -30,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            ...scrubConfig,
          },
        });
      }

      // Star Layer 2 — medium drift (y: 0 → -70, full scroll)
      if (starsMediumRef.current) {
        gsap.to(starsMediumRef.current, {
          y: -70,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            ...scrubConfig,
          },
        });
      }

      // Star Layer 3 — fast drift (y: 0 → -120, full scroll)
      if (starsFastRef.current) {
        gsap.to(starsFastRef.current, {
          y: -120,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            ...scrubConfig,
          },
        });
      }

      // Hero content — opacity 1→0 and y 0→-100, over first 35% of scroll
      if (heroContentRef.current) {
        gsap.to(heroContentRef.current, {
          opacity: 0,
          y: -100,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "35% top",
            ...scrubConfig,
          },
        });
      }

      // Stats bar — y 0→-350, over first 50% of scroll
      if (statsRef.current) {
        gsap.to(statsRef.current, {
          y: -350,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "50% top",
            ...scrubConfig,
          },
        });
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[200vh] bg-background"
    >
      <svg
        ref={triangleSvgRef}
        className="absolute top-px left-px hidden lg:block h-[300px] w-[300px] text-primary/50 z-10 pointer-events-none"
        viewBox="0 0 100 100"
        fill="none"
        overflow="visible"
        aria-hidden="true"
      >
        <path d="M100 0 L0 0 L0 100 Z" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M80 10 L10 10 L10 80 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
        {[...Array(4)].map((_, i) => (
          <line key={`t-${i}`} x1={20 * (i + 1)} y1="0" x2={20 * (i + 1)} y2={i % 2 === 0 ? "7" : "4"} stroke="currentColor" strokeWidth={i % 2 === 0 ? "0.75" : "0.4"} />
        ))}
        {[...Array(4)].map((_, i) => (
          <line key={`l-${i}`} x1="0" y1={20 * (i + 1)} x2={i % 2 === 0 ? "7" : "4"} y2={20 * (i + 1)} stroke="currentColor" strokeWidth={i % 2 === 0 ? "0.75" : "0.4"} />
        ))}
      </svg>

      <div
        ref={containerRef}
        className="sticky top-0 h-screen overflow-hidden"
      >
        <InteractiveGrid sectionRef={containerRef} />

        <div className="absolute -right-27.5 top-1/4 translate-y-10.5 h-[600px] w-[600px] rotate-45 border border-primary/25" />
        <div className="absolute -left-28.5 bottom-1/4 h-[400px] w-[400px] rotate-12 border border-primary/15" />

        <div className="absolute top-0 right-0 h-2/3 w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(205,45,45,0.09)_0%,rgba(205,45,45,0.03)_40%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 h-2/3 w-1/2 bg-[radial-gradient(ellipse_at_bottom_left,rgba(205,45,45,0.09)_0%,rgba(205,45,45,0.03)_40%,transparent_70%)]" />

        {/* Star Layer 1 — slow drift (large, distant stars) */}
        <div ref={starsSlowRef} className="absolute inset-0 pointer-events-none will-change-transform">
          <StarIcon className="star-glow absolute top-32 right-1/4 h-32 w-32 text-white/90 lg:h-48 lg:w-48" duration="8s" delay="0s" minOpacity="0.5" minScale="0.8" />
          <StarIcon className="star-glow absolute top-20 right-1/3 h-24 w-24 text-white/75" duration="9s" delay="1.4s" minOpacity="0.4" minScale="0.82" />
        </div>

        {/* Star Layer 2 — medium drift */}
        <div ref={starsMediumRef} className="absolute inset-0 pointer-events-none will-change-transform">
          <StarIcon className="star-glow absolute top-1/4 left-1/3 h-20 w-20 text-white/80 lg:h-28 lg:w-28" duration="7s" delay="2.4s" minOpacity="0.55" minScale="0.85" />
          <StarIcon className="star-glow absolute bottom-1/3 right-1/3 h-12 w-12 text-white/85" duration="6s" delay="1.2s" minOpacity="0.5" minScale="0.75" />
          <StarIcon className="star-glow absolute top-1/3 right-1/2 h-16 w-8 text-white/80 rotate-12" duration="8s" delay="4s" minOpacity="0.45" minScale="0.8" variant="elongated" />
          <StarIcon className="star-glow absolute bottom-40 right-20 h-16 w-16 text-white/80 hidden md:block" duration="6.5s" delay="4.5s" minOpacity="0.45" minScale="0.78" />
        </div>

        {/* Star Layer 3 — fast drift (small, nearby sparkles) */}
        <div ref={starsFastRef} className="absolute inset-0 pointer-events-none will-change-transform">
          <StarIcon className="star-glow absolute top-40 right-20 h-6 w-6 text-white" duration="5s" delay="0.6s" minOpacity="0.4" minScale="0.7" />
          <StarIcon className="star-glow absolute top-2/3 left-20 h-8 w-8 text-white/90" duration="7s" delay="3.5s" minOpacity="0.45" minScale="0.7" />
          <StarIcon className="star-glow absolute top-1/2 right-40 h-10 w-10 text-white/85 hidden md:block" duration="5.5s" delay="1.8s" minOpacity="0.4" minScale="0.75" />
          <StarIcon className="star-glow-primary absolute bottom-1/4 left-1/4 h-6 w-6 text-primary" duration="6s" delay="0.8s" minOpacity="0.5" minScale="0.7" />
          <StarIcon className="star-glow-primary absolute top-1/4 right-16 h-4 w-4 text-primary hidden lg:block" duration="5s" delay="3s" minOpacity="0.5" minScale="0.65" />
          <StarIcon className="star-glow-primary absolute top-1/2 left-1/4 h-10 w-10 text-primary/95" duration="7s" delay="2s" minOpacity="0.55" minScale="0.75" />
        </div>

        {/* Hero content — fades out on scroll */}
        <div
          ref={heroContentRef}
          className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-6 pt-16 will-change-transform"
        >
          <div className="max-w-4xl">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px w-12 bg-primary" />
              <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
                36-Hour Hackathon
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-balance">
              <span className="text-foreground">HACK</span>
              <span className="text-primary">4</span>
              <span className="text-foreground">US</span>
            </h1>

            <p className="mb-12 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              A premier 36-hour hackathon bringing students together to design
              innovative solutions for sustainable and inclusive cities. Where
              software meets hardware to tackle real environmental challenges.
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
        </div>

        {/* Stats bar — scrolls from bottom toward center */}
        <div
          ref={statsRef}
          className="absolute bottom-0 left-0 right-0"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border opacity-85 md:grid-cols-4 border border-border">
            {[
              { label: "DATE", value: "XYZ 32-34, 2026" },
              { label: "LOCATION", value: "TORONTO" },
              { label: "PARTICIPANTS", value: "67+" },
              { label: "IN PRIZES", value: "$69,420" },
            ].map((item) => (
              <div key={item.label} className="bg-background opacity px-6 py-5">
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
