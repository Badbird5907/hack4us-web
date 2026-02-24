"use client";

import { motion } from "motion/react";

export function Schedule() {
  return (
    <section className="relative min-h-screen flex items-center">
      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 py-24">
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
              XYZ 32-34, 2026
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            EVENT <span className="text-primary">SCHEDULE</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="border border-dashed border-border flex items-center justify-center py-32"
        >
          <span className="text-xs font-bold tracking-[0.3em] text-muted-foreground uppercase">
            WIP
          </span>
        </motion.div>
      </div>
    </section>
  );
}
