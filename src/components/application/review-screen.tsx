"use client";

import { motion } from "motion/react";
import { AlertCircle, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ApplicationConfig,
  ApplicationQuestion,
} from "@/lib/questions/schemas";
import { deserializeValue } from "./question-field";

interface ReviewScreenProps {
  config: ApplicationConfig;
  answers: Record<string, string>;
  missingRequired: string[];
  validationErrors: Record<string, string>;
  onEditSection: (sectionIndex: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function getDisplayValue(question: ApplicationQuestion, raw: string | undefined): string {
  if (!raw || raw === "") return "";
  const { field } = question;

  if (field.type === "radio" || field.type === "select") {
    const opt = field.options.find((o) => o.value === raw);
    return opt?.label ?? raw;
  }

  if (field.type === "checkbox") {
    try {
      const arr = JSON.parse(raw) as string[];
      return arr
        .map((v) => field.options.find((o) => o.value === v)?.label ?? v)
        .join(", ");
    } catch {
      return raw;
    }
  }

  if (field.type === "custom" && field.viewComponent) {
    return "__CUSTOM__"; // won't render
  }

  if (field.type === "custom") {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        return JSON.stringify(parsed);
      }
    } catch {
      ;
    }
  }

  return raw;
}

export function ReviewScreen({
  config,
  answers,
  missingRequired,
  validationErrors,
  onEditSection,
  onSubmit,
  isSubmitting,
}: ReviewScreenProps) {
  const sections = Object.values(config.sections);
  const allQuestions = Object.values(config.questions);

  const questionsForSection = (sectionId: string) =>
    allQuestions
      .filter((q) => q.sectionId === sectionId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const canSubmit = missingRequired.length === 0 && Object.keys(validationErrors).length === 0 && !isSubmitting;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1 bg-primary/40" />
          <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-primary uppercase">
            Review
          </span>
          <div className="h-px flex-1 bg-primary/40" />
        </div>
        <h2 className="text-center text-lg font-black tracking-wider uppercase">
          Review Your Application
        </h2>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Double-check your answers before submitting.
        </p>
      </div>

      {(missingRequired.length > 0 || Object.keys(validationErrors).length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 border border-destructive/30 bg-destructive/5 px-4 py-3"
        >
          <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-bold text-destructive">
              {missingRequired.length > 0
                ? `${missingRequired.length} required ${missingRequired.length === 1 ? "field" : "fields"} missing`
                : `${Object.keys(validationErrors).length} ${Object.keys(validationErrors).length === 1 ? "field needs" : "fields need"} attention`}
            </p>
            <p className="text-xs text-destructive/70 mt-0.5">
              {missingRequired.length > 0
                ? "Complete all required fields before submitting."
                : "Fix the highlighted fields before submitting."}
            </p>
          </div>
        </motion.div>
      )}

      {sections.map((section, sectionIdx) => {
        const questions = questionsForSection(section.id);
        const sectionMissing = questions.filter(
          (q) =>
            q.field.required &&
            missingRequired.includes(q.id)
        );
        const sectionInvalid = questions.filter(
          (q) => !missingRequired.includes(q.id) && validationErrors[q.id]
        );

        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIdx * 0.05 }}
            className="border border-border"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-primary">
                  {String(sectionIdx + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xs font-bold tracking-wider uppercase">
                  {section.title}
                </h3>
                {sectionMissing.length === 0 && sectionInvalid.length === 0 && questions.some((q) => answers[q.id]) && (
                  <Check className="size-3 text-emerald-500" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditSection(sectionIdx)}
                className="h-7 text-[10px] gap-1"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            </div>

            <div className="divide-y divide-border/50">
              {questions.map((question) => {
                const raw = answers[question.id];
                const display = getDisplayValue(question, raw);
                const isMissing = missingRequired.includes(question.id);
                const validationError = !isMissing ? validationErrors[question.id] : undefined;
                const isInvalid = !!validationError;
                const isEmpty = !raw || raw === "" || raw === "[]" || raw === "null";

                return (
                  <div
                    key={question.id}
                    className={`px-4 py-3 ${isMissing || isInvalid ? "bg-destructive/5" : ""}`}
                  >
                    <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                      {question.field.label}
                      {question.field.required && (
                        <span className={(isMissing || isInvalid) ? "text-destructive ml-1" : "text-primary ml-1"}>
                          *
                        </span>
                      )}
                    </p>
                    <div className="mt-1 text-sm">
                      {isEmpty ? (
                        <span className={isMissing ? "text-destructive text-xs" : "text-muted-foreground/50 text-xs"}>
                          {isMissing ? "Required — please fill this out" : "Not answered"}
                        </span>
                      ) : display === "__CUSTOM__" ? (
                        (() => {
                          const ViewComp = question.field.type === "custom" && question.field.viewComponent;
                          if (ViewComp) {
                            const val = deserializeValue(question.field, raw);
                            return <ViewComp value={val} />;
                          }
                          return <span className="text-muted-foreground">{raw}</span>;
                        })()
                      ) : (
                        <span className="text-foreground">{display}</span>
                      )}
                    </div>
                    {validationError && (
                      <p className="mt-1 text-[10px] font-medium text-destructive">
                        {validationError}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: sections.length * 0.05 }}
        className="border border-border bg-card p-6"
      >
        <div className="text-center space-y-4">
          <p className="text-xs text-muted-foreground">
            {canSubmit
              ? "Everything looks good. Ready to submit?"
              : "Complete all required fields to submit your application."}
          </p>
          <Button
            size="lg"
            disabled={!canSubmit}
            onClick={onSubmit}
            className={"w-full sm:w-auto px-12 font-black tracking-widest uppercase text-sm h-12"}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                Submitting...
              </span>
            ) : (
              "Submit Application"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
