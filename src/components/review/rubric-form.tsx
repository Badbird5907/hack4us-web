"use client";

import { useMemo, useState } from "react";
import { RubricScoreField } from "./rubric-score-field";
import { getRubricForType, getRankingFields, computeWeightedTotal } from "@/lib/review/scoring";
import type { ApplicationType } from "@/lib/review/rubric";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, ChevronDown, ChevronUp } from "lucide-react";

interface AiScore {
  scores: Record<string, number>;
  total: number;
  summary: string;
  flags: string[];
}

interface RubricFormProps {
  applicationType: ApplicationType;
  onSubmit: (scores: Record<string, number>) => void;
  disabled?: boolean;
  aiScore?: AiScore | null;
}

export function RubricForm({ applicationType, onSubmit, disabled, aiScore }: RubricFormProps) {
  const rubric = getRubricForType(applicationType);
  const rankingFields = getRankingFields(rubric);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [aiExpanded, setAiExpanded] = useState(false);

  const { allFilled, total, maxTotal } = useMemo(() => {
    const filled = rankingFields.every((f) => scores[f.id] !== undefined);
    const tot = computeWeightedTotal(scores, rubric);
    const max = rankingFields.reduce((sum, f) => sum + (f.scale?.max ?? 5) * (f.weight ?? 1), 0);
    return { allFilled: filled, total: tot, maxTotal: max };
  }, [rankingFields, scores, rubric]);

  return (
    <div className="space-y-6">
      {rankingFields.map((field) => (
        <RubricScoreField
          key={field.id}
          field={field}
          value={scores[field.id]}
          onChange={(v) => setScores((prev) => ({ ...prev, [field.id]: v }))}
          disabled={disabled}
          aiScore={aiScore?.scores[field.id]}
        />
      ))}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex flex-col gap-1">
        <div>
          <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
            Total
          </span>
          <span className="ml-2 font-mono text-lg font-bold text-primary">
            {allFilled ? total : "—"}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">
            / {maxTotal}
          </span>
        </div>
        {aiScore && (
            <span className="ml-3 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <Bot className="size-3" />
              {aiScore.total}/{maxTotal}
            </span>
          )}
        </div>
        <Button
          onClick={() => onSubmit(scores)}
          disabled={disabled || !allFilled}
          className="px-8 text-xs font-bold tracking-widest uppercase"
          >
          Submit Review
        </Button>
      </div>

      {aiScore && (
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setAiExpanded((v) => !v)}
            className="flex w-full items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bot className="size-3" />
            AI Notes
            {aiExpanded ? <ChevronUp className="size-3 ml-auto" /> : <ChevronDown className="size-3 ml-auto" />}
          </button>
          {aiExpanded && (
            <div className="mt-2 space-y-2">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {aiScore.summary}
              </p>
              {aiScore.flags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {aiScore.flags.map((flag, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] text-muted-foreground">
                      {flag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
