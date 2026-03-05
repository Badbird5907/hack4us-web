"use client";

import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";

import { QuestionField } from "@/components/application/question-field";
import { SectionNav } from "@/components/application/section-nav";
import { SaveIndicator } from "@/components/application/save-indicator";
import { ReviewScreen } from "@/components/application/review-screen";
import { SubmitOverlay } from "@/components/application/submit-overlay";
import { NavbarSlot } from "@/components/navbar-slot";
import { cn } from "@/lib/utils";

import { useApplicationForm } from "./hook";

function SubmittedView({ applicationType, setIsViewingApplication }: { applicationType: string, setIsViewingApplication: (value: boolean) => void }) {
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
      <div className="flex items-center justify-center gap-4 flex-row">
        <Button
          onClick={() => router.push("/dashboard")}
          className="font-bold tracking-widest uppercase text-xs"
        >
          Go to Dashboard
          <ArrowRight className="ml-1 size-3" />
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsViewingApplication(true)}
          className="font-bold tracking-widest uppercase text-xs"
        >
          View Application
          <ArrowRight className="ml-1 size-3" />
        </Button>
      </div>
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

export default function ApplyPage() {
  const router = useRouter();
  const {
    initialized,
    isProfileLoading,
    applicationsState,
    isApplicationsOpen,
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
    handleAnswer,
    goToSection,
    goNext,
    goBack,
    handleSubmit,
    isViewingApplication,
    setIsViewingApplication,
  } = useApplicationForm();

  if (!initialized) {
    return (
      <>
        <NavbarSlot>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black tracking-widest uppercase leading-none">
              Apply
            </span>
            {isProfileLoading ? (
              <span className="inline-block h-3 w-20 bg-muted animate-pulse" />
            ) : profileRole ? (
              <>
                <span className="text-muted-foreground text-sm leading-none">
                  &mdash;
                </span>
                <span className="text-sm font-black tracking-widest uppercase leading-none text-primary">
                  {profileRole}
                </span>
              </>
            ) : null}
          </div>
        </NavbarSlot>
        <LoadingSkeleton />
      </>
    );
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

  if (!isApplicationsOpen) {
    const message =
      applicationsState === "ended"
        ? "Applications have ended."
        : "Applications will open soon.";

    return (
      <div className="mx-auto max-w-xl text-center py-16 space-y-4">
        <h1 className="text-2xl font-black tracking-tight uppercase">
          Applications {applicationsState === "closed" ? "Opening Soon" : "Ended"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
        <Button
          onClick={() => router.push("/dashboard")}
          className="font-bold tracking-widest uppercase text-xs"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (isSubmitted && !isViewingApplication) {
    return <SubmittedView applicationType={profileRole} setIsViewingApplication={setIsViewingApplication} />;
  }

  return (
    <>
      <NavbarSlot>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-black tracking-widest uppercase leading-none">
            Apply
          </span>
          {isProfileLoading ? (
            <span className="inline-block h-3 w-20 bg-muted animate-pulse" />
          ) : profileRole ? (
            <>
              <span className="text-muted-foreground text-sm leading-none">
                &mdash;
              </span>
              <span className="text-sm font-black tracking-widest uppercase leading-none text-primary">
                {profileRole}
              </span>
            </>
          ) : null}
        </div>
      </NavbarSlot>
      <div className="mx-auto max-w-4xl">
        {isViewingApplication && isSubmitted && (
          <Alert className="mb-4 border-destructive/40">
            <AlertTriangle className="size-4" />
            <AlertTitle>Application submitted</AlertTitle>
            <AlertDescription>
              <p>
                Your application has been submitted. We&apos;ll review it and get back to you
                soon.
              </p>
            </AlertDescription>
          </Alert>
        )}
        {hasExternalEdit && !isViewingApplication && (
          <Alert className="mb-4 border-destructive/40">
            <AlertTriangle className="size-4" />
            <AlertTitle>Application updated in another tab or device</AlertTitle>
            <AlertDescription>
              <p>
                This application changed elsewhere. Reload to continue with the
                latest data.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 text-xs tracking-wider uppercase"
                onClick={() => window.location.reload()}
              >
                Reload latest
              </Button>
            </AlertDescription>
          </Alert>
        )}
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
                {isOnReview ? "Review" : currentSectionData?.title ?? ""}
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
                      <SaveIndicator
                        status={saveStatus}
                        lastSavedAt={lastSavedAt}
                      />
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

                  <div
                    className={cn(
                      "space-y-4",
                      (hasExternalEdit || isSubmitted || isViewingApplication) && "pointer-events-none opacity-60"
                    )}
                  >
                    {currentQuestions.map((question, qi) => (
                      <QuestionField
                        key={question.id}
                        question={question}
                        index={qi}
                        answers={answers}
                        errors={errors}
                        onAnswer={handleAnswer}
                        disabled={hasExternalEdit || isSubmitted || isViewingApplication}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goBack}
                      disabled={currentSection === 0 || hasExternalEdit}
                      className="text-xs tracking-wider uppercase"
                    >
                      <ArrowLeft className="size-3 mr-1" />
                      Prev Section
                    </Button>
                    <Button
                      size="sm"
                      onClick={goNext}
                      disabled={hasExternalEdit}
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
                    isViewingApplication={isViewingApplication}
                  />

                  <div className="mt-6 pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goBack}
                      disabled={hasExternalEdit}
                      className="text-xs tracking-wider uppercase"
                    >
                      <ArrowLeft className="size-3 mr-1" />
                      Back to {sections[sections.length - 1]?.title ?? "Previous"}
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
