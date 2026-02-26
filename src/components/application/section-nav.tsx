"use client";

import { motion } from "motion/react";
import { Check, FileText } from "lucide-react";
import type { ApplicationSection } from "@/lib/questions/schemas";

interface SectionNavProps {
  sections: ApplicationSection[];
  currentIndex: number;
  completedSections: Set<string>;
  onNavigate: (index: number) => void;
  hasReview?: boolean;
}

export function SectionNav({
  sections,
  currentIndex,
  completedSections,
  onNavigate,
  hasReview = true,
}: SectionNavProps) {
  const totalItems = hasReview ? sections.length + 1 : sections.length;
  const isReviewActive = currentIndex === sections.length;

  return (
    <nav className="space-y-1">
      <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3">
        Sections
      </p>

      {sections.map((section, i) => {
        const isActive = currentIndex === i;
        const isCompleted = completedSections.has(section.id);

        return (
          <button
            key={section.id}
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
              {section.title}
            </span>

            {isActive && (
              <motion.div
                layoutId="section-active"
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}

      {hasReview && (
        <>
          <div className="mx-3 my-2 border-t border-border/50" />
          <button
            type="button"
            onClick={() => onNavigate(sections.length)}
            className={`
              group relative flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs transition-all
              ${
                isReviewActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }
            `}
          >
            <span
              className={`
                flex size-5 shrink-0 items-center justify-center border text-[9px]
                ${
                  isReviewActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }
              `}
            >
              <FileText className="size-3" />
            </span>
            <span className="tracking-wider uppercase">Review & Submit</span>

            {isReviewActive && (
              <motion.div
                layoutId="section-active"
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        </>
      )}

      <div className="mx-3 mt-4">
        <div className="h-0.5 w-full bg-border overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{
              width: `${((currentIndex + 1) / totalItems) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
        <p className="mt-1.5 text-[10px] font-mono text-muted-foreground/60">
          {currentIndex + 1} / {totalItems}
        </p>
      </div>
    </nav>
  );
}
