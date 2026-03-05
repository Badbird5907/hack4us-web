"use client";

import { useMemo } from "react";
import { applicationTypes, type ParticipantRole } from "@/lib/questions";
import type { ApplicationQuestion, ApplicationField } from "@/lib/questions/schemas";

interface ApplicationResponseViewProps {
  answers: Record<string, unknown>;
  showAll: boolean;
  applicationType: ParticipantRole;
}

function parseValue(raw: unknown): unknown {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function resolveOptionLabel(
  field: ApplicationField,
  value: unknown,
): string | null {
  if (typeof value !== "string") return null;
  if (field.type === "select" || field.type === "radio") {
    const match = field.options.find((o) => o.value === value);
    return match?.label ?? value;
  }
  return null;
}

interface QuestionEntry {
  key: string;
  question: ApplicationQuestion;
  value: unknown;
}

export function ApplicationResponseView({
  answers,
  showAll,
  applicationType,
}: ApplicationResponseViewProps) {
  const config = applicationTypes[applicationType];
  const questions = config?.questions;

  const entries = useMemo<QuestionEntry[]>(() => {
    if (!questions) {
      return Object.entries(answers).map(([key, value]) => ({
        key,
        question: {
          id: key,
          field: { type: "text" as const, label: key },
        } as ApplicationQuestion,
        value,
      }));
    }

    return Object.entries(answers)
      .map(([key, value]) => ({
        key,
        question: questions[key] ?? ({
          id: key,
          field: { type: "text" as const, label: key },
        } as ApplicationQuestion),
        value,
      }))
      .sort(
        (a, b) => (a.question.order ?? 999) - (b.question.order ?? 999),
      )
      .filter(({ question }) => question.showToReviewer || showAll);
  }, [answers, questions, showAll]);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No responses submitted.</p>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(({ key, question, value }) => {
        const { field } = question;
        const parsed = parseValue(value);

        return (
          <div key={key} className="space-y-1">
            <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
              {field.label}
            </span>
            {field.description && (
              <p className="text-[11px] text-muted-foreground/70">
                {field.description}
              </p>
            )}
            <div className="text-sm leading-relaxed text-foreground">
              <ResponseValue field={field} value={parsed} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ResponseValue({
  field,
  value,
}: {
  field: ApplicationField;
  value: unknown;
}) {
  if (value === undefined || value === null || value === "") {
    return <span className="italic text-muted-foreground">No answer</span>;
  }

  if (field.type === "custom" && field.viewComponent) {
    const ViewComponent = field.viewComponent;
    return <ViewComponent value={value} />;
  }

  const optionLabel = resolveOptionLabel(field, value);
  if (optionLabel) {
    return <span>{optionLabel}</span>;
  }

  if (field.type === "checkbox" && Array.isArray(value)) {
    const labels = value.map((v) => {
      const match = field.options.find((o) => o.value === v);
      return match?.label ?? v;
    });
    return <span>{labels.join(", ")}</span>;
  }

  if (typeof value === "object") {
    return (
      <pre className="whitespace-pre-wrap text-xs font-mono bg-muted/50 rounded p-2">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return (
    <p className="whitespace-pre-wrap">{String(value)}</p>
  );
}
