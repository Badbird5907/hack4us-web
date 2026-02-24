"use client";

import { useRef } from "react";
import { Brain, Shield, Globe, HeartPulse } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TRACKS = [
  {
    icon: Brain,
    name: "AI / ML",
    description:
      "Build intelligent systems that learn, adapt, and solve complex problems. From natural language processing to computer vision — push the boundaries of what machines can do.",
  },
  {
    icon: Shield,
    name: "Cybersecurity",
    description:
      "Defend the digital frontier. Develop tools and solutions that protect infrastructure, detect threats, and secure data in an increasingly connected world.",
  },
  {
    icon: Globe,
    name: "Sustainability",
    description:
      "Tackle environmental challenges head-on. Create technology that reduces waste, optimizes energy, and builds a more sustainable future for communities.",
  },
  {
    icon: HeartPulse,
    name: "HealthTech",
    description:
      "Innovate at the intersection of healthcare and technology. Design solutions that improve patient outcomes, accessibility, and the delivery of care.",
  },
];

export function Tracks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "top 30%",
              scrub: 0.5,
            },
          }
        );
      }

      const validCards = cardsRef.current.filter(Boolean);
      if (validCards.length > 0) {
        gsap.fromTo(
          validCards,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            scrollTrigger: {
              trigger: section,
              start: "top 60%",
              end: "top 10%",
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
      <div className="absolute top-8 left-8 right-8 h-px bg-border/50 hidden lg:block" />
      <div className="absolute bottom-8 left-8 right-8 h-px bg-border/50 hidden lg:block" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 py-24">
        <div ref={headingRef} className="mb-16 md:mb-20">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px w-12 bg-primary" />
            <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
              What You&apos;ll Build
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            CHOOSE YOUR
            <br />
            <span className="text-primary">TRACK</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {TRACKS.map((track, i) => {
            const Icon = track.icon;
            return (
              <div
                key={track.name}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="group relative bg-background p-8 transition-colors hover:bg-card"
              >
                <span className="absolute top-4 right-4 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/40 uppercase">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-primary/30 transition-colors group-hover:border-primary group-hover:bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>

                <h3 className="mb-3 text-lg font-bold tracking-wide text-foreground uppercase">
                  {track.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {track.description}
                </p>

                <div className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
