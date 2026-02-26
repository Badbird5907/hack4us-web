"use client";

import { memo } from "react";
import { motion } from "motion/react";

function StepIndicatorBase({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full rounded-full bg-primary"
        animate={{ width: `${((current + 1) / total) * 100}%` }}
        transition={{ type: "spring", stiffness: 180, damping: 28 }}
      />
    </div>
  );
}

export const StepIndicator = memo(StepIndicatorBase);
