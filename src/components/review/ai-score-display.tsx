"use client";

import { Badge } from "@/components/ui/badge";
import { RUBRIC } from "@/lib/review/rubric";

interface AiScoreDisplayProps {
  aiScore: {
    scores: Record<string, number>;
    total: number;
    summary: string;
    flags: string[];
  };
}

export function AiScoreDisplay({ aiScore }: AiScoreDisplayProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          AI Pre-Score
        </span>
        <span className="font-mono text-sm font-bold text-primary">
          {aiScore.total}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {RUBRIC.map((field) => {
          const score = aiScore.scores[field.id];
          if (score === undefined) return null;
          return (
            <div key={field.id} className="text-center">
              <div className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
                {field.label}
              </div>
              <div className="font-mono text-sm font-bold">{score}/{field.scale?.max ?? 5}</div>
            </div>
          );
        })}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {aiScore.summary}
      </p>

      {aiScore.flags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {aiScore.flags.map((flag, i) => (
            <Badge key={i} variant="destructive" className="text-[10px]">
              {flag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
