"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useQuery } from "@/hooks/convex";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { applicationTypes } from "@/lib/questions";
import type {
  ApplicationConfig,
  ApplicationQuestion,
  ApplicationSection,
} from "@/lib/questions/schemas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type AppType = keyof typeof applicationTypes;

const DEBOUNCE_MS = 800;

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

function serializeAnswers(answers: Record<string, string>) {
  return JSON.stringify(
    Object.entries(answers).sort(([a], [b]) => a.localeCompare(b))
  );
}

export function useApply() {
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
  const [hasExternalEdit, setHasExternalEdit] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const hasPreFilled = useRef(false);
  const lastSyncedAnswersRef = useRef("");

  const profileRole = profileResult?.data?.role as AppType | undefined;
  const config: ApplicationConfig | null = profileRole
    ? applicationTypes[profileRole] ?? null
    : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "O") {
        e.preventDefault();
        setShowSubmitOverlay((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { // load answers
    if (hasPreFilled.current) return;
    if (!applicationResult || !profileResult) return;

    hasPreFilled.current = true;

    const existingApp = applicationResult.application;
    const initialAnswers =
      existingApp &&
      existingApp.type === profileRole &&
      existingApp.status === "draft"
        ? existingApp.answers ?? {}
        : {};
    lastSyncedAnswersRef.current = serializeAnswers(initialAnswers);

    if (Object.keys(initialAnswers).length > 0) {
      setAnswers(initialAnswers);
    }

    setInitialized(true);
  }, [applicationResult, profileResult, profileRole]);

  useEffect(() => { // detect edits from another tab/device
    if (!initialized) return;
    const remoteApp = applicationResult?.application;
    const remoteAnswers =
      remoteApp &&
      remoteApp.type === profileRole &&
      remoteApp.status === "draft"
        ? remoteApp.answers ?? {}
        : {};
    const remoteSerialized = serializeAnswers(remoteAnswers);
    if (!lastSyncedAnswersRef.current) {
      lastSyncedAnswersRef.current = remoteSerialized;
      return;
    }
    if (remoteSerialized !== lastSyncedAnswersRef.current) {
      setHasExternalEdit(true);
    }
  }, [applicationResult, initialized, profileRole]);

  const doSave = useCallback(
    async (answersToSave: Record<string, string>) => {
      if (!profileRole || !config || hasExternalEdit) return;
      setSaveStatus("saving");
      const previousSynced = lastSyncedAnswersRef.current;
      const nextSynced = serializeAnswers(answersToSave);
      lastSyncedAnswersRef.current = nextSynced;
      try {
        await saveApplication({ type: profileRole, answers: answersToSave });
        lastSyncedAnswersRef.current = nextSynced;
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        lastSyncedAnswersRef.current = previousSynced;
        setSaveStatus("error");
      }
    },
    [profileRole, config, hasExternalEdit, saveApplication]
  );

  const debouncedSave = useDebouncedCallback(doSave, DEBOUNCE_MS);

  const handleAnswer = useCallback(
    (questionId: string, serialized: string) => {
      if (hasExternalEdit) return;
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
    [debouncedSave, hasExternalEdit]
  );

  const sections = useMemo(
    () => (config ? getOrderedSections(config) : []),
    [config]
  );

  const goToSection = useCallback((index: number) => {
    setCurrentSection(index);
  }, []);

  const goNext = useCallback(() => {
    if (hasExternalEdit) return;
    const maxIndex = sections.length;
    if (currentSection < maxIndex) {
      goToSection(currentSection + 1);
    }
  }, [currentSection, sections.length, goToSection, hasExternalEdit]);

  const goBack = useCallback(() => {
    if (hasExternalEdit) return;
    if (currentSection > 0) {
      goToSection(currentSection - 1);
    }
  }, [currentSection, goToSection, hasExternalEdit]);

  const missingRequired = useMemo(
    () => (config ? getMissingRequired(config, answers) : []),
    [config, answers]
  );

  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    (async () => {
      const errs: Record<string, string> = {};
      for (const question of Object.values(config.questions)) {
        if (!question.validate) continue;
        const val = answers[question.id];
        let deserialized: unknown = val;
        if (
          question.field.type === "checkbox" ||
          question.field.type === "custom"
        ) {
          try {
            deserialized = JSON.parse(val ?? "");
          } catch {
            deserialized = val;
          }
        }
        const err = await question.validate(deserialized);
        if (err) errs[question.id] = err;
      }
      if (!cancelled) setValidationErrors(errs);
    })();
    return () => {
      cancelled = true;
    };
  }, [config, answers]);

  const completedSections = useMemo(
    () => (config ? getCompletedSections(config, answers) : new Set<string>()),
    [config, answers]
  );

  const handleSubmit = useCallback(async () => {
    if (
      hasExternalEdit ||
      !config ||
      missingRequired.length > 0 ||
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (profileRole) {
        await saveApplication({ type: profileRole, answers });
      }
      await submitApplication({});
      setShowSubmitOverlay(true);
    } catch (err) {
      setErrors({
        __submit:
          err instanceof Error ? err.message : "Failed to submit. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    hasExternalEdit,
    config,
    missingRequired,
    validationErrors,
    answers,
    profileRole,
    saveApplication,
    submitApplication,
  ]);

  const existingApp = applicationResult?.application;
  const isSubmitted =
    existingApp && existingApp.status !== "draft" && !showSubmitOverlay;

  const isProfileLoading = profileResult === undefined;

  const isOnReview = currentSection === sections.length;
  const currentSectionData = isOnReview ? null : sections[currentSection];
  const currentQuestions = currentSectionData
    ? getQuestionsForSection(config!, currentSectionData.id)
    : [];

  return {
    // Data
    initialized,
    isProfileLoading,
    profileRole,
    config,
    sections,
    answers,
    errors,
    saveStatus,
    lastSavedAt,
    isSubmitting,
    showSubmitOverlay,
    hasExternalEdit,
    missingRequired,
    validationErrors,
    completedSections,
    isSubmitted,
    isOnReview,
    currentSection,
    currentSectionData,
    currentQuestions,

    // Actions
    handleAnswer,
    goToSection,
    goNext,
    goBack,
    handleSubmit,
  };
}
