"use client";

import { useRef, useEffect, useState } from "react";
import { Github, Linkedin, ArrowLeft, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TEAM_MEMBERS = [
  {
    name: "Alex Chen",
    role: "Lead Organizer",
    initials: "AC",
    bio: "CS senior with a passion for building communities and shipping products that matter.",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Priya Sharma",
    role: "Technical Director",
    initials: "PS",
    bio: "Full-stack engineer and open-source contributor. Loves distributed systems and mentoring.",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Marcus Johnson",
    role: "Design Lead",
    initials: "MJ",
    bio: "UI/UX designer who believes great design is invisible. Obsessed with pixel-perfect interfaces.",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Sarah Kim",
    role: "Sponsorship Lead",
    initials: "SK",
    bio: "Business student bridging the gap between industry and innovation. Connects people to opportunities.",
    github: "#",
    linkedin: "#",
  },
  {
    name: "David Okafor",
    role: "Logistics Coordinator",
    initials: "DO",
    bio: "Operations mastermind who keeps everything running smoothly. Turns chaos into clockwork.",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Emma Torres",
    role: "Marketing Lead",
    initials: "ET",
    bio: "Creative storyteller and brand strategist. Makes sure the world knows about HACK4US.",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Ryan Patel",
    role: "Workshop Lead",
    initials: "RP",
    bio: "ML researcher and educator. Designs workshops that turn beginners into builders in hours.",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Chloe Nguyen",
    role: "Community Manager",
    initials: "CN",
    bio: "People person and community builder. Creates spaces where everyone feels welcome to hack.",
    github: "#",
    linkedin: "#",
  },
];

export function Team() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "top 30%",
              scrub: 0.5,
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  const updateScrollState = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(":scope > div")?.offsetWidth ?? 320;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * 2;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center"
    >
      <div className="absolute bottom-12 right-16 h-36 w-36 rotate-45 border border-primary/10 hidden lg:block" />
      <div className="absolute top-20 left-12 h-20 w-20 -rotate-12 border border-border/20 hidden lg:block" />

      <div className="relative z-10 w-full py-24">
        <div ref={headingRef} className="mx-auto max-w-7xl px-6 mb-16 md:mb-20">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-6 flex items-center gap-4">
                <div className="h-px w-12 bg-primary" />
                <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
                  The People Behind HACK4US
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
                MEET THE <span className="text-primary">TEAM</span>
              </h2>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="flex h-10 w-10 items-center justify-center border border-border transition-all hover:border-foreground disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-border"
                aria-label="Scroll left"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="flex h-10 w-10 items-center justify-center border border-border transition-all hover:border-foreground disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-border"
                aria-label="Scroll right"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="shrink-0 w-[max(0px,calc((100vw-80rem)/2))]" />

          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="group relative shrink-0 w-[280px] md:w-[320px] border border-border bg-card/30 transition-all hover:border-primary/50 hover:bg-card/60"
            >
              <div className="relative h-48 md:h-56 bg-secondary/50 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 geometric-grid opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/80" />
                <span className="relative text-5xl md:text-6xl font-black tracking-tight text-foreground/10 group-hover:text-primary/20 transition-colors">
                  {member.initials}
                </span>

                <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-t-background border-l-[24px] border-l-transparent" />
              </div>

              <div className="p-6">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
                  {member.role}
                </span>

                <h3 className="mt-2 text-lg font-bold tracking-wide text-foreground">
                  {member.name}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>

                <div className="mt-5 flex gap-3">
                  <a
                    href={member.github}
                    className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
                    aria-label={`${member.name}'s GitHub`}
                  >
                    <Github className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={member.linkedin}
                    className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
                    aria-label={`${member.name}'s LinkedIn`}
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" />
            </div>
          ))}

          <div className="shrink-0 w-[max(24px,calc((100vw-80rem)/2))]" />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 md:hidden px-6">
          <div className="h-px w-8 bg-muted-foreground/30" />
          <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Swipe to explore
          </span>
          <div className="h-px w-8 bg-muted-foreground/30" />
        </div>
      </div>
    </section>
  );
}
