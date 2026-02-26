"use client";

import { motion, AnimatePresence } from "motion/react";
import type { FieldNudge } from "@/lib/questions/schemas";

const toneConfig = {
  encouraging: {
    styles: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    icon: "//",
  },
  info: {
    styles: "border-sky-500/20 bg-sky-500/5 text-sky-400",
    icon: ">>",
  },
  tip: {
    styles: "border-amber-500/20 bg-amber-500/5 text-amber-400",
    icon: "//",
  },
} as const;

export function Nudge({ nudge }: { nudge: FieldNudge | null }) {
  return (
    <AnimatePresence mode="wait">
      {nudge && (
        <motion.div
          key={nudge.message}
          initial={{ opacity: 0, y: 4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div
            className={`flex items-center gap-2 border px-3 py-2 text-xs ${toneConfig[nudge.tone].styles}`}
          >
            <span className="font-mono font-bold shrink-0 leading-none">
              {toneConfig[nudge.tone].icon}
            </span>
            <span>{nudge.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
