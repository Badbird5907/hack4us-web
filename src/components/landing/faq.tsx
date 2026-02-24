"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FAQ_ITEMS = [
  {
    question: "Who can participate in HACK4US?",
    answer:
      "HACK4US is open to all university and college students, regardless of their field of study or experience level. Whether you're a seasoned developer or just getting started, there's a place for you here.",
  },
  {
    question: "Do I need a team to register?",
    answer:
      "You can register as an individual or as a team of up to 4 members. If you register solo, we'll help you find teammates during our team formation event before hacking begins.",
  },
  {
    question: "What should I bring?",
    answer:
      "Bring your laptop, charger, and any hardware you plan to use. We'll provide food, drinks, WiFi, power strips, and a comfortable hacking space. A sleeping bag or blanket is recommended if you plan to rest during the 36 hours.",
  },
  {
    question: "Is there a cost to participate?",
    answer:
      "HACK4US is completely free for all participants. This includes meals, snacks, swag, and access to all workshops and events throughout the hackathon.",
  }
];

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof FAQ_ITEMS)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const answerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between py-6 text-left transition-colors"
      >
        <span
          className={`text-base md:text-lg font-bold tracking-wide transition-colors ${
            isOpen ? "text-primary" : "text-foreground group-hover:text-primary"
          }`}
        >
          {item.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 ml-4 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>
      <div
        ref={answerRef}
        className="overflow-hidden transition-all duration-300"
        style={{
          // eslint-disable-next-line react-hooks/refs
          maxHeight: isOpen ? `${answerRef.current?.scrollHeight ?? 200}px` : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p className="pb-6 text-sm md:text-base leading-relaxed text-muted-foreground">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export function Faq() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

      if (listRef.current) {
        gsap.fromTo(
          listRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: section,
              start: "top 60%",
              end: "top 20%",
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
      <div className="absolute top-16 right-12 h-40 w-40 rotate-45 border border-primary/10 hidden lg:block" />
      <div className="absolute bottom-24 left-8 h-24 w-24 -rotate-12 border border-border/20 hidden lg:block" />

      <div className="absolute top-1/3 right-8 hidden lg:block">
        <div className="h-px w-8 bg-primary/30" />
        <div className="absolute top-1/2 left-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 bg-primary/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl w-full px-6 py-24">
        <div ref={headingRef} className="mb-16 md:mb-20 text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-primary" />
            <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
              Got Questions?
            </span>
            <div className="h-px w-12 bg-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            F<span className="text-primary">A</span>Q
          </h2>
        </div>

        <div ref={listRef} className="border-t border-border">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
