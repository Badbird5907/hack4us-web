"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import { useQuery } from "@/hooks/convex";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { applicationTypes } from "@/lib/questions";
import type {
  ApplicationConfig,
  ApplicationQuestion,
  ApplicationSection,
} from "@/lib/questions/schemas";

import { QuestionField } from "@/components/application/question-field";
import { SectionNav } from "@/components/application/section-nav";
import { SaveIndicator } from "@/components/application/save-indicator";
import { ReviewScreen } from "@/components/application/review-screen";
import { SubmitOverlay } from "@/components/application/submit-overlay";
import { useNavbarSlot } from "@/components/navbar-slot";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type AppType = keyof typeof applicationTypes;

function getOrderedSections(config: ApplicationConfig): ApplicationSection[] {
  return Object.values(config.sections);
}

function getQuestionsForSection(
  config: ApplicationConfig,
  sectionId: string
): ApplicationQuestion[] {
  return Object.values(config.questions)
    .filter((q) => q.sectionId === sectionId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function getMissingRequired(
  config: ApplicationConfig,
  answers: Record<string, string>
): string[] {
  return Object.values(config.questions)
    .filter((q) => {
      if (!q.field.required) return false;
      const val = answers[q.id];
      if (!val || val === "" || val === "[]" || val === "null") return true;
      return false;
    })
    .map((q) => q.id);
}

function getCompletedSections(
  config: ApplicationConfig,
  answers: Record<string, string>
): Set<string> {
  const completed = new Set<string>();
  const sections = Object.values(config.sections);

  for (const section of sections) {
    const questions = getQuestionsForSection(config, section.id);
    if (questions.length === 0) continue;

    const requiredQuestions = questions.filter((q) => q.field.required);

    if (requiredQuestions.length === 0) {
      if (questions.some((q) => answers[q.id] && answers[q.id] !== "")) {
        completed.add(section.id);
      }
    } else {
      const allFilled = requiredQuestions.every((q) => {
        const val = answers[q.id];
        return val && val !== "" && val !== "[]" && val !== "null";
      });
      if (allFilled) completed.add(section.id);
    }
  }

  return completed;
}

function SubmittedView({ applicationType }: { applicationType: string }) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-xl text-center py-16 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight uppercase">
          Application Submitted
        </h1>
        <p className="text-sm text-muted-foreground">
          Your <span className="font-bold text-primary">{applicationType}</span>{" "}
          application has been submitted. We&apos;ll review it and get back to you
          soon.
        </p>
      </div>
      <Button
        onClick={() => router.push("/dashboard")}
        className="font-bold tracking-widest uppercase text-xs"
      >
        Go to Dashboard
        <ArrowRight className="ml-1 size-3" />
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-8">
        <div className="hidden lg:block w-48 space-y-2 shrink-0">
          <Skeleton className="h-3 w-16 mb-3" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="flex-1 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border p-6 space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const DEBOUNCE_MS = 800;

export default function ApplyPage() {
  const router = useRouter();
  const applicationResult = useQuery(api.fn.application.getMyApplication, {});
  const profileResult = useQuery(api.fn.profile.getMyProfile, {});
  const saveApplication = useMutation(api.fn.application.saveMyApplication);
  const submitApplication = useMutation(api.fn.application.submitMyApplication);

  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitOverlay, setShowSubmitOverlay] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const hasPreFilled = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "O") {
        e.preventDefault();
        setShowSubmitOverlay((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const profileRole = profileResult?.data?.role as AppType | undefined;
  const config: ApplicationConfig | null = profileRole
    ? applicationTypes[profileRole] ?? null
    : null;

  const { setContent, clearContent } = useNavbarSlot();
  const isProfileLoading = profileResult === undefined;
  useEffect(() => {
    setContent(
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-black tracking-widest uppercase leading-none">
          Apply
        </span>
        {isProfileLoading ? (
          <span className="inline-block h-3 w-20 bg-muted animate-pulse" />
        ) : profileRole ? (
          <>
            <span className="text-muted-foreground text-sm leading-none">&mdash;</span>
            <span className="text-sm font-black tracking-widest uppercase leading-none text-primary">
              {profileRole}
            </span>
          </>
        ) : null}
      </div>
    );
    return () => clearContent();
  }, [isProfileLoading, profileRole, setContent, clearContent]);

  useEffect(() => {
    if (hasPreFilled.current) return;
    if (!applicationResult || !profileResult) return;

    hasPreFilled.current = true;

    const existingApp = applicationResult.application;

    if (existingApp && existingApp.type === profileRole && existingApp.status === "draft") {
      setAnswers(existingApp.answers ?? {});
    }

    setInitialized(true);
  }, [applicationResult, profileResult, profileRole]);

  const doSave = useCallback(
    async (answersToSave: Record<string, string>) => {
      if (!profileRole || !config) return;
      setSaveStatus("saving");
      try {
        await saveApplication({ type: profileRole, answers: answersToSave });
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        setSaveStatus("error");
      }
    },
    [profileRole, config, saveApplication]
  );

  const debouncedSave = useDebouncedCallback(doSave, DEBOUNCE_MS);

  const handleAnswer = useCallback(
    (questionId: string, serialized: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: serialized };
        debouncedSave(next);
        return next;
      });
      setErrors((prev) => {
        if (!prev[questionId]) return prev;
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    },
    [debouncedSave]
  );

  const sections = useMemo(
    () => (config ? getOrderedSections(config) : []),
    [config]
  );

  const goToSection = useCallback((index: number) => {
    setCurrentSection(index);
  }, []);

  const goNext = useCallback(() => {
    const maxIndex = sections.length;
    if (currentSection < maxIndex) {
      goToSection(currentSection + 1);
    }
  }, [currentSection, sections.length, goToSection]);

  const goBack = useCallback(() => {
    if (currentSection > 0) {
      goToSection(currentSection - 1);
    }
  }, [currentSection, goToSection]);

  const missingRequired = useMemo(
    () => (config ? getMissingRequired(config, answers) : []),
    [config, answers]
  );

  // Run all validators eagerly so the review screen can block submit
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    (async () => {
      const errs: Record<string, string> = {};
      for (const question of Object.values(config.questions)) {
        if (!question.validate) continue;
        const val = answers[question.id];
        let deserialized: unknown = val;
        if (question.field.type === "checkbox" || question.field.type === "custom") {
          try { deserialized = JSON.parse(val ?? ""); } catch { deserialized = val; }
        }
        const err = await question.validate(deserialized);
        if (err) errs[question.id] = err;
      }
      if (!cancelled) setValidationErrors(errs);
    })();
    return () => { cancelled = true; };
  }, [config, answers]);

  const completedSections = useMemo(
    () => (config ? getCompletedSections(config, answers) : new Set<string>()),
    [config, answers]
  );

  const handleSubmit = useCallback(async () => {
    if (!config || missingRequired.length > 0 || Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (profileRole) {
        await saveApplication({ type: profileRole, answers });
      }
      await submitApplication({});
      setShowSubmitOverlay(true);
    } catch (err) {
      setErrors({
        __submit: err instanceof Error ? err.message : "Failed to submit. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [config, missingRequired, validationErrors, answers, profileRole, saveApplication, submitApplication]);

  if (!initialized) {
    return <LoadingSkeleton />;
  }

  if (!profileRole || !config) {
    return (
      <div className="mx-auto max-w-xl text-center py-16 space-y-4">
        <h1 className="text-2xl font-black tracking-tight uppercase">
          Complete Your Profile First
        </h1>
        <p className="text-sm text-muted-foreground">
          Please complete your profile setup and select a role before applying.
        </p>
        <Button
          onClick={() => router.push("/profile")}
          className="font-bold tracking-widest uppercase text-xs"
        >
          Go to Profile
        </Button>
      </div>
    );
  }

  const existingApp = applicationResult?.application;
  if (existingApp && existingApp.status !== "draft" && !showSubmitOverlay) {
    return <SubmittedView applicationType={profileRole} />;
  }

  const isOnReview = currentSection === sections.length;
  const currentSectionData = isOnReview ? null : sections[currentSection];
  const currentQuestions = currentSectionData
    ? getQuestionsForSection(config, currentSectionData.id)
    : [];

  return (
    <>
      <div className="mx-auto max-w-4xl">
        <div className="flex gap-8">
          <div className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-20">
              <SectionNav
                sections={sections}
                currentIndex={currentSection}
                completedSections={completedSections}
                onNavigate={goToSection}
              />
            </div>
          </div>

          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-muted-foreground">
                {currentSection + 1} / {sections.length + 1}
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                {isOnReview
                  ? "Review"
                  : currentSectionData?.title ?? ""}
              </span>
            </div>
            <div className="h-1 w-full bg-border overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                animate={{
                  width: `${((currentSection + 1) / (sections.length + 1)) * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 pb-24 lg:pb-0">
            <AnimatePresence mode="wait">
              {!isOnReview && currentSectionData && (
                <motion.div
                  key={`section-${currentSection}`}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-8"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-primary uppercase">
                        Section {String(currentSection + 1).padStart(2, "0")}
                      </span>
                      <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
                    </div>
                    <h2 className="text-lg font-black tracking-wider uppercase mt-1">
                      {currentSectionData.title}
                    </h2>
                    {currentSectionData.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {currentSectionData.description}
                      </p>
                    )}
                    <div className="mt-3 h-px bg-border" />
                  </div>

                  {currentQuestions.map((question, qi) => (
                    <QuestionField
                      key={question.id}
                      question={question}
                      index={qi}
                      answers={answers}
                      errors={errors}
                      onAnswer={handleAnswer}
                    />
                  ))}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goBack}
                      disabled={currentSection === 0}
                      className="text-xs tracking-wider uppercase"
                    >
                      <ArrowLeft className="size-3 mr-1" />
                      Prev Section
                    </Button>
                    <Button
                      size="sm"
                      onClick={goNext}
                      className="text-xs tracking-wider uppercase"
                    >
                      {currentSection === sections.length - 1
                        ? "Review & Submit"
                        : "Next Section"}
                      <ArrowRight className="size-3 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {isOnReview && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <ReviewScreen
                    config={config}
                    answers={answers}
                    missingRequired={missingRequired}
                    validationErrors={validationErrors}
                    onEditSection={goToSection}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                  />

                  <div className="mt-6 pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goBack}
                      className="text-xs tracking-wider uppercase"
                    >
                      <ArrowLeft className="size-3 mr-1" />
                      Back to{" "}
                      {sections[sections.length - 1]?.title ?? "Previous"}
                    </Button>
                  </div>

                  {errors.__submit && (
                    <p className="mt-4 text-xs text-destructive text-center">
                      {errors.__submit}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <SubmitOverlay
        show={showSubmitOverlay}
        applicationType={profileRole}
        onGoToDashboard={() => router.push("/dashboard")}
      />
    </>
  );
}
