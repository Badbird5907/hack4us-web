"use client";

import { Clock } from "lucide-react";
import { motion } from "motion/react";

const PLACEHOLDER_EVENTS = [
  { time: "09:00", title: "Check-in & Breakfast", type: "logistics" },
  { time: "10:00", title: "Opening Ceremony", type: "ceremony" },
  { time: "11:00", title: "Hacking Begins", type: "hacking" },
  { time: "13:00", title: "Lunch", type: "logistics" },
  { time: "15:00", title: "Workshop #1", type: "workshop" },
  { time: "19:00", title: "Dinner", type: "logistics" },
  { time: "22:00", title: "Midnight Snack", type: "logistics" },
];

const typeColors: Record<string, string> = {
  logistics: "border-muted-foreground/30 text-muted-foreground",
  ceremony: "border-primary text-primary",
  hacking: "border-primary text-primary",
  workshop: "border-foreground/50 text-foreground",
};

export function Schedule() {
  return (
    <section
      className="relative min-h-screen flex items-center"
    >
      {/* Geometric accents */}
      <div className="absolute bottom-8 right-8 h-32 w-32 rotate-45 border border-primary/10 hidden lg:block" />
      <div className="absolute top-12 right-16 h-20 w-20 rotate-12 border border-border/30 hidden lg:block" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 py-24">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 md:mb-20"
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px w-12 bg-primary" />
            <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
              36 Hours of Innovation
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            EVENT <span className="text-primary">SCHEDULE</span>
          </h2>
        </motion.div>

        {/* Placeholder schedule content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          {/* Day tabs (dummy) */}
          <div className="mb-10 flex gap-px">
            <button className="bg-primary px-6 py-3 text-xs font-bold tracking-widest text-primary-foreground uppercase">
              Day 1
            </button>
            <button className="border border-border bg-background px-6 py-3 text-xs font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground hover:border-foreground">
              Day 2
            </button>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[39px] top-0 bottom-0 w-px bg-border hidden md:block" />

            <div className="space-y-1">
              {PLACEHOLDER_EVENTS.map((event) => (
                <div
                  key={event.time + event.title}
                  className="group flex items-stretch gap-4 md:gap-6"
                >
                  {/* Time */}
                  <div className="flex w-16 shrink-0 items-center justify-end md:w-20">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground tabular-nums">
                      {event.time}
                    </span>
                  </div>

                  {/* Dot */}
                  <div className="relative hidden md:flex items-center">
                    <div className={`h-2.5 w-2.5 border ${event.type === "hacking" || event.type === "ceremony" ? "border-primary bg-primary/30" : "border-border bg-background"}`} />
                  </div>

                  {/* Event card */}
                  <div
                    className={`flex-1 border-l-2 ${typeColors[event.type]} bg-card/30 px-5 py-4 transition-colors group-hover:bg-card/60`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-3.5 w-3.5 opacity-50" />
                      <span className="text-sm font-bold tracking-wide uppercase">
                        {event.title}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coming soon overlay */}
          <div className="mt-12 border border-dashed border-primary/30 bg-primary/5 px-8 py-6 text-center">
            <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
              Full schedule coming soon
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              The detailed schedule with workshops, speakers, and activities will
              be announced shortly.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
