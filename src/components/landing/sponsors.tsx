"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface SponsorTier {
  name: string;
  size: string;
  sponsors: string[];
}

const SPONSOR_TIERS: SponsorTier[] = [
  {
    name: "Platinum",
    size: "large",
    sponsors: ["Sponsor A", "Sponsor B"],
  },
  {
    name: "Gold",
    size: "medium",
    sponsors: ["Sponsor C", "Sponsor D", "Sponsor E"],
  },
  {
    name: "Silver",
    size: "small",
    sponsors: ["Sponsor F", "Sponsor G", "Sponsor H", "Sponsor I"],
  },
];

const sizeClasses: Record<string, string> = {
  large: "h-28 md:h-32 w-52 md:w-64",
  medium: "h-20 md:h-24 w-40 md:w-48",
  small: "h-16 md:h-20 w-32 md:w-40",
};

export function Sponsors() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const tiersRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // Heading
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "top 30%",
              scrub: 0.5,
            },
          }
        );
      }

      // Tier rows stagger
      const validTiers = tiersRef.current.filter(Boolean);
      if (validTiers.length > 0) {
        gsap.fromTo(
          validTiers,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            scrollTrigger: {
              trigger: section,
              start: "top 60%",
              end: "top 10%",
              scrub: 0.5,
            },
          }
        );
      }

      // CTA
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: section,
              start: "top 40%",
              end: "top 5%",
              scrub: 0.5,
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center"
    >
      {/* Horizontal rule accents */}
      <div className="absolute top-1/4 left-0 w-24 h-px bg-primary/20 hidden lg:block" />
      <div className="absolute bottom-1/4 right-0 w-24 h-px bg-primary/20 hidden lg:block" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 py-24">
        {/* Section heading */}
        <div ref={headingRef} className="mb-16 md:mb-20 text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-primary" />
            <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
              Backed By The Best
            </span>
            <div className="h-px w-12 bg-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            OUR <span className="text-primary">SPONSORS</span>
          </h2>
        </div>

        {/* Sponsor tiers */}
        <div className="space-y-12 md:space-y-16">
          {SPONSOR_TIERS.map((tier, i) => (
            <div
              key={tier.name}
              ref={(el) => { tiersRef.current[i] = el; }}
            >
              {/* Tier label */}
              <div className="mb-6 flex items-center gap-4 justify-center">
                <div className="h-px flex-1 max-w-16 bg-border" />
                <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  {tier.name}
                </span>
                <div className="h-px flex-1 max-w-16 bg-border" />
              </div>

              {/* Sponsor logos row */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                {tier.sponsors.map((sponsor) => (
                  <div
                    key={sponsor}
                    className={`${sizeClasses[tier.size]} flex items-center justify-center border border-border bg-card/50 transition-all hover:border-primary/50 hover:bg-card`}
                  >
                    <span className="text-sm font-bold tracking-wider text-muted-foreground/60 uppercase">
                      {sponsor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="mt-16 md:mt-20 text-center">
          <p className="mb-6 text-sm text-muted-foreground">
            Interested in supporting the next generation of innovators?
          </p>
          <Link
            href="#sponsor"
            className="group inline-flex items-center gap-3 border border-primary bg-primary/10 px-8 py-4 text-sm font-bold tracking-widest text-primary uppercase transition-all hover:bg-primary hover:text-primary-foreground"
          >
            Become a Sponsor
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
