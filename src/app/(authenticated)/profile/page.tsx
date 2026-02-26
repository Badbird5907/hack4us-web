"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  StepIndicator,
  StepRoleAndEducation,
  StepName,
  StepSchool,
  StepBio,
  StepSkills,
  StepLinks,
} from "@/components/profile";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
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

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 32 : -32,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 28 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -32 : 32,
    opacity: 0,
    transition: { duration: 0.15 },
  }),
};

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
    isRoleEducationValid,
    isFormComplete,
    updateRole,
    updateEducationLevel,
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
    completeOnboarding,
    confirmRoleSwitch,
    setPendingRole,
  } = useProfileForm();

  const stepContent = useMemo(() => {
    if (step === 0) {
      return (
        <StepRoleAndEducation
          role={formData.role}
          educationLevel={formData.educationLevel}
          onChangeRole={updateRole}
          onChangeEducationLevel={updateEducationLevel}
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
          onChangeSchool={updateSchool}
          onChangeYear={updateYear}
        />
      );
    }
    if (step === 3) {
      return <StepBio bio={formData.bio} onChange={updateBio} />;
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
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="border border-border bg-card p-8 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight uppercase">
          Profile
        </h1>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            className="mt-1 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {STEPS[step].description}
          </motion.p>
        </AnimatePresence>
      </div>

      <StepIndicator current={step} total={STEPS.length} />

      <div className="border border-border bg-card p-8">
        <div className="mb-6 flex items-center justify-between overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.h2
              key={step}
              className="text-sm font-bold tracking-widest uppercase"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
            >
              {STEPS[step].title}
            </motion.h2>
          </AnimatePresence>
          <span className="text-xs text-muted-foreground">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {stepContent}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            disabled={step === 0}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <AnimatePresence mode="wait">
            {step < STEPS.length - 1 ? (
              <motion.div
                key="next"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  size="sm"
                  onClick={() => goNext(STEPS.length)}
                  disabled={step === 0 && !isRoleEducationValid}
                >
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  size="sm"
                  disabled={!isFormComplete}
                  onClick={completeOnboarding}
                >
                  <Check className="size-4" />
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
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
    </div>
  );
}
