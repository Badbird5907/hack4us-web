"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";

interface ProfileStep {
  title: string;
  description: string;
}

interface ProfileSectionNavProps {
  steps: readonly ProfileStep[];
  currentIndex: number;
  completedSteps: Set<number>;
  onNavigate: (index: number) => void;
}

export function ProfileSectionNav({
  steps,
  currentIndex,
  completedSteps,
  onNavigate,
}: ProfileSectionNavProps) {
  return (
    <nav className="space-y-1">
      <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3">
        Sections
      </p>

      {steps.map((step, i) => {
        const isActive = currentIndex === i;
        const isCompleted = completedSteps.has(i);

        return (
          <button
            key={step.title}
            type="button"
            onClick={() => onNavigate(i)}
            className={`
              group relative flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs transition-all
              ${
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : isCompleted
                    ? "text-foreground hover:bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }
            `}
          >
            <span
              className={`
                relative flex size-5 shrink-0 items-center justify-center border text-[9px] font-mono font-bold
                ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-500"
                      : "border-border text-muted-foreground"
                }
              `}
            >
              {isCompleted && !isActive ? (
                <Check className="size-3" />
              ) : (
                <span>{i + 1}</span>
              )}
            </span>

            <span className="tracking-wider uppercase truncate">
              {step.title}
            </span>

            {isActive && (
              <motion.div
                layoutId="profile-section-active"
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}

      <div className="mx-3 mt-4">
        <div className="h-0.5 w-full bg-border overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{
              width: `${((currentIndex + 1) / steps.length) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
        <p className="mt-1.5 text-[10px] font-mono text-muted-foreground/60">
          {currentIndex + 1} / {steps.length}
        </p>
      </div>
    </nav>
  );
}
