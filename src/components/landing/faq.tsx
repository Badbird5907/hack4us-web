"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence,
motion } from "motion/react";

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
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm md:text-base leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="relative min-h-screen flex items-center"
    >
      <div className="absolute top-16 right-12 h-40 w-40 rotate-45 border border-primary/10 hidden lg:block" />
      <div className="absolute bottom-24 left-8 h-24 w-24 -rotate-12 border border-border/20 hidden lg:block" />

      <div className="absolute top-1/3 right-8 hidden lg:block">
        <div className="h-px w-8 bg-primary/30" />
        <div className="absolute top-1/2 left-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 bg-primary/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl w-full px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 md:mb-20 text-center"
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="border-t border-border"
        >
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
