"use client";

import { useRef, useEffect, useState } from "react";
import { Github, Linkedin, ArrowLeft, ArrowRight,Globe } from "lucide-react";
import { motion } from "motion/react";

const TEAM_MEMBERS = [
  {
    name: "Cindy Shi",
    role: "President",
    initials: "CS",
    bio: "President of Hack4Us.",
    links: []
  },
  {
    name: "Evan Yu",
    role: "Web Lead",
    initials: "EY",
    bio: "Math @ UofT, SWE @ ConnectAlum, Full Stack Engineer",
    links: [
      "https://github.com/Badbird5907",
      "https://www.linkedin.com/in/ev-yu",
      "https://evanyu.dev/",
    ],
  },
  {
    name: "Aaron Huang",
    role: "Logistics Lead",
    initials: "AH",
    bio: "Nerd",
    links: [
      "https://github.com/runthebot",
      "https://runthebot.me/",
    ],
  },
  {
    name: "Nolan Kotler",
    role: "Finance Lead",
    initials: "NK",
    bio: "",
    links: [],
  },
  {
    name: "Ian Rosenthal",
    role: "Outreach Lead",
    initials: "IR",
    bio: "",
    links: [],
  },
  {
    name: "Silver Wu",
    role: "Marketing Lead",
    initials: "SW",
    bio: "",
    links: [],
  }
];

export function Team() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  const getIcon = (link: string) => {
    const domain = new URL(link).hostname;
    if (domain.includes("github")) return <Github className="h-3.5 w-3.5" />;
    if (domain.includes("linkedin")) return <Linkedin className="h-3.5 w-3.5" />;
    return <Globe className="h-3.5 w-3.5" />;
  };

  return (
    <section
      className="relative min-h-screen flex items-center"
    >
      <div className="absolute bottom-12 right-16 h-36 w-36 rotate-45 border border-primary/10 hidden lg:block" />
      <div className="absolute top-20 left-12 h-20 w-20 -rotate-12 border border-border/20 hidden lg:block" />

      <div className="relative z-10 w-full py-24">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-7xl px-6 mb-16 md:mb-20"
        >
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
        </motion.div>

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
              className="group relative shrink-0 w-[280px] md:w-[320px] border border-border bg-card/30 transition-all hover:border-primary/50 hover:bg-card/60 flex flex-col"
            >
              <div className="relative h-48 md:h-56 bg-secondary/50 flex items-center justify-center overflow-hidden">
                 <span className="relative text-5xl md:text-6xl font-black tracking-tight text-foreground/10 group-hover:text-primary/20 transition-colors">
                  {member.initials}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
                  {member.role}
                </span>

                <h3 className="mt-2 text-lg font-bold tracking-wide text-foreground">
                  {member.name}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>

                <div className="mt-auto pt-5 flex gap-3"> 
                  {member.links.map((link) => (
                    <a
                      key={link}
                      href={link}
                      target="_blank"
                      className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
                      aria-label={`${member.name}'s ${link}`}
                    >
                      {getIcon(link)}
                    </a>
                  ))}
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
