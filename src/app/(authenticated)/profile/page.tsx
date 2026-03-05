"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SaveIndicator } from "@/components/application/save-indicator";
import {
  ProfileSectionNav,
  StepRoleAndEducation,
  StepName,
  StepSchool,
  StepBio,
  StepSkills,
  StepLinks,
} from "@/components/profile";
import { NavbarSlot } from "@/components/navbar-slot";
import { ArrowLeft, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileForm } from "./hooks";

const STEPS = [
  {
    title: "Getting Started",
    description: "Tell us how you'd like to participate.",
  },
  { title: "Name", description: "What should we call you?" },
  {
    title: "School & Year",
    description: "Tell us where you study.",
  },
  { title: "About You", description: "Write a short bio about yourself." },
  {
    title: "Skills & Interests",
    description: "What are you good at, and what excites you?",
  },
  {
    title: "Links",
    description: "Connect your socials and share your work.",
  },
] as const;

const SCHOOL_MAX_LENGTH = 50;
const BIO_MAX_LENGTH = 300;

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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="flex-1 space-y-6">
          <div className="border border-border p-6 space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="border border-border p-6 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const {
    step,
    direction,
    formData,
    initialized,
    saveStatus,
    lastSavedAt,
    pendingRole,
    existingApplication,
    isRoleEducationLocked,
    hasExternalEdit,
    isRoleEducationValid,
    isFormComplete,
    updateRole,
    updateEducationLevel,
    updateMarketingOptIn,
    updateName,
    updateBirthdate,
    updateSchool,
    updateYear,
    updateBio,
    updateSkills,
    updateInterests,
    updateLinks,
    goNext,
    goBack,
    goToStep,
    completeOnboarding,
    confirmRoleSwitch,
    setPendingRole,
  } = useProfileForm();

  const completedSteps = useMemo(() => {
    const set = new Set<number>();
    if (isRoleEducationValid) set.add(0);
    if (formData.name.trim().length > 0 && formData.birthdate.length > 0) set.add(1);
    if (formData.school.trim().length > 0 && formData.year.length > 0) set.add(2);
    if (formData.bio.trim().length > 0) set.add(3);
    if (formData.skills.length > 0 || formData.interests.length > 0) set.add(4);
    const hasAnyLink =
      formData.links.instagram ||
      formData.links.twitter ||
      formData.links.linkedin ||
      formData.links.github ||
      formData.links.external.length > 0;
    if (hasAnyLink) set.add(5);
    return set;
  }, [formData, isRoleEducationValid]);

  const stepContent = useMemo(() => {
    if (step === 0) {
      return (
        <StepRoleAndEducation
          role={formData.role}
          educationLevel={formData.educationLevel}
          marketingOptIn={formData.marketingOptIn}
          onChangeRole={updateRole}
          onChangeEducationLevel={updateEducationLevel}
          onChangeMarketingOptIn={updateMarketingOptIn}
          isSelectionLocked={isRoleEducationLocked}
          onGoNext={() => goNext(STEPS.length)}
        />
      );
    }
    if (step === 1) {
      return (
        <StepName
          name={formData.name}
          birthdate={formData.birthdate}
          onChangeName={updateName}
          onChangeBirthdate={updateBirthdate}
        />
      );
    }
    if (step === 2) {
      return (
        <StepSchool
          school={formData.school}
          year={formData.year}
          educationLevel={formData.educationLevel}
          maxLength={SCHOOL_MAX_LENGTH}
          onChangeSchool={(value) => updateSchool(value.slice(0, SCHOOL_MAX_LENGTH))}
          onChangeYear={updateYear}
        />
      );
    }
    if (step === 3) {
      return (
        <StepBio
          bio={formData.bio}
          maxLength={BIO_MAX_LENGTH}
          onChange={(value) => updateBio(value.slice(0, BIO_MAX_LENGTH))}
        />
      );
    }
    if (step === 4) {
      return (
        <StepSkills
          skills={formData.skills}
          interests={formData.interests}
          onChangeSkills={updateSkills}
          onChangeInterests={updateInterests}
        />
      );
    }
    return <StepLinks links={formData.links} onChange={updateLinks} />;
  }, [
    step,
    formData,
    updateRole,
    updateEducationLevel,
    updateMarketingOptIn,
    goNext,
    updateName,
    updateBirthdate,
    updateSchool,
    updateYear,
    updateBio,
    updateSkills,
    updateInterests,
    updateLinks,
    isRoleEducationLocked,
  ]);

  if (!initialized) {
    return (
      <>
        <NavbarSlot>
          <span className="text-sm font-black tracking-widest uppercase leading-none">
            Profile
          </span>
        </NavbarSlot>
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <>
      <NavbarSlot>
        <span className="text-sm font-black tracking-widest uppercase leading-none">
          Profile
        </span>
      </NavbarSlot>

      <div className="mx-auto max-w-4xl">
        {hasExternalEdit && (
          <Alert className="mb-4 border-destructive/40">
            <AlertTriangle className="size-4" />
            <AlertTitle>Profile updated in another tab or device</AlertTitle>
            <AlertDescription>
              <p>This profile changed elsewhere. Reload to continue with the latest data.</p>
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
              <ProfileSectionNav
                steps={STEPS}
                currentIndex={step}
                completedSteps={completedSteps}
                onNavigate={goToStep}
              />
            </div>
          </div>

          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-muted-foreground">
                {step + 1} / {STEPS.length}
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                {STEPS[step].title}
              </span>
            </div>
            <div className="h-1 w-full bg-border overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                animate={{
                  width: `${((step + 1) / STEPS.length) * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 pb-24 lg:pb-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -24 : 24 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-8"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-primary uppercase">
                      Section {String(step + 1).padStart(2, "0")}
                    </span>
                    <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
                  </div>
                  <h2 className="text-lg font-black tracking-wider uppercase mt-1">
                    {STEPS[step].title}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {STEPS[step].description}
                  </p>
                  <div className="mt-3 h-px bg-border" />
                </div>

                <div
                  className={cn(
                    hasExternalEdit && "pointer-events-none opacity-60"
                  )}
                >
                  {stepContent}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBack}
                    disabled={step === 0 || hasExternalEdit}
                    className="text-xs tracking-wider uppercase"
                  >
                    <ArrowLeft className="size-3 mr-1" />
                    Back
                  </Button>

                  {step < STEPS.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => goNext(STEPS.length)}
                      disabled={hasExternalEdit || (step === 0 && !isRoleEducationValid)}
                      className="text-xs tracking-wider uppercase"
                    >
                      Next
                      <ArrowRight className="size-3 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={hasExternalEdit || !isFormComplete}
                      onClick={completeOnboarding}
                      className="text-xs tracking-wider uppercase"
                    >
                      <Check className="size-3 mr-1" />
                      Done
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AlertDialog
        open={!!pendingRole}
        onOpenChange={(open) => {
          if (!open) setPendingRole(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch application type?</AlertDialogTitle>
            <AlertDialogDescription>
              You have an existing{" "}
              <span className="font-medium text-foreground">
                {existingApplication?.type}
              </span>{" "}
              application. Switching to{" "}
              <span className="font-medium text-foreground">{pendingRole}</span>{" "}
              will discard your current application. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleSwitch}>
              Switch & Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
