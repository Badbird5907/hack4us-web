"use client";

import { cn } from "@/lib/utils";
import type { RubricField } from "@/lib/review/rubric";
import { Bot } from "lucide-react";
import { useMemo } from "react";

interface RubricScoreFieldProps {
  field: RubricField;
  value: number | undefined;
  onChange: (value: number) => void;
  disabled?: boolean;
  aiScore?: number;
}

export function RubricScoreField({
  field,
  value,
  onChange,
  disabled,
  aiScore,
}: RubricScoreFieldProps) {
  const { options, max } = useMemo(() => {
    const min = field.scale?.min ?? 1;
    const max = field.scale?.max ?? 5;
    const step = field.scale?.step ?? 1;
    const opts = [];
    for (let i = min; i <= max; i += step) {
      opts.push(i);
    }
    return { options: opts, max };
  }, [field.scale]);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-bold tracking-wide uppercase">
            {field.label}
          </span>
          {field.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
        {aiScore !== undefined && (
          <span
            className="flex items-center gap-1 shrink-0 rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
            title="AI pre-score (for reference only)"
          >
            <Bot className="size-3" />
            {aiScore}/{max}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {options.map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            className={cn(
              "flex size-10 items-center justify-center rounded-md border text-sm font-bold transition-colors",
              "hover:border-primary hover:bg-primary/10",
              "disabled:cursor-not-allowed disabled:opacity-50",
              value === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
