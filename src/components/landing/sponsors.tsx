"use client";

import { ArrowUpRight, HeartHandshake, Mail } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
      id="about"
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
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="group inline-flex items-center gap-3 border border-primary bg-primary/10 px-8 py-4 text-sm font-bold tracking-widest text-primary uppercase transition-all hover:bg-primary hover:text-primary-foreground"
              >
                Become a Sponsor
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            </DialogTrigger>
            <DialogContent className="gap-0 sm:max-w-md">
              <DialogHeader className="space-y-3 text-left">
                <DialogTitle className="text-xl font-black tracking-tight sm:text-2xl">
                  Sponsor Us
                </DialogTitle>
                <DialogDescription className="text-base leading-relaxed">
                  Thank you for your interest in sponsoring Hack4Us!
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 grid gap-4">
                <div className="flex gap-4 rounded-lg border border-border bg-card/60 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Sponsorship inquiries
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">
                      For packages and partnership details, email{" "}
                      <a
                        href="mailto:sponsors@hack4us.ca"
                        className="font-semibold text-primary underline-offset-4 hover:underline break-all"
                      >
                        sponsors@hack4us.ca
                      </a>
                      .
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-lg border border-border bg-card/60 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    <HeartHandshake className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex flex-col gap-3">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Small donations
                      </p>
                      <p className="text-sm leading-relaxed text-foreground">
                        Prefer to contribute a one-time or smaller amount? You can donate securely here:
                      </p>
                    </div>
                    <Button asChild className="w-full font-bold tracking-wide sm:w-fit">
                      <a
                        href="https://hcb.hackclub.com/donations/start/hack4us"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Donate now
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </section>
  );
}
