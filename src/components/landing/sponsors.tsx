"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

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

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const tierVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export function Sponsors() {
  return (
    <section
      className="relative min-h-screen flex items-center"
    >
      {/* Horizontal rule accents */}
      <div className="absolute top-1/4 left-0 w-24 h-px bg-primary/20 hidden lg:block" />
      <div className="absolute bottom-1/4 right-0 w-24 h-px bg-primary/20 hidden lg:block" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 py-24">
        {/* Section heading */}
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
              Made possible by our sponsors
            </span>
            <div className="h-px w-12 bg-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            OUR <span className="text-primary">SPONSORS</span>
          </h2>
        </motion.div>

        {/* Sponsor tiers */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-12 md:space-y-16"
        >
          {SPONSOR_TIERS.map((tier) => (
            <motion.div
              key={tier.name}
              variants={tierVariants}
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
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-16 md:mt-20 text-center"
        >
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
        </motion.div>
      </div>
    </section>
  );
}
