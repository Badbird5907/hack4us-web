"use client";

import { motion, AnimatePresence } from "motion/react";
import { AlertCircle } from "lucide-react";
import { OptionButton } from "./option-button";
import type { StepRoleAndEducationProps } from "./types";

function getApplicationFormCopy(role: StepRoleAndEducationProps["role"]) {
  if (role === "attendee") {
    return "You will see the attendee application form on the Apply page.";
  }
  if (role === "mentor") {
    return "You will see the mentor application form on the Apply page.";
  }
  if (role === "volunteer") {
    return "You will see the volunteer application form on the Apply page.";
  }
  return "Your application form will be selected based on the role you choose.";
}

export function StepRoleAndEducation({
  role,
  educationLevel,
  marketingOptIn,
  onChangeRole,
  onChangeEducationLevel,
  onChangeMarketingOptIn,
  isSelectionLocked = false,
  onGoNext,
}: StepRoleAndEducationProps) {
  const isUniversityAttendee = role === "attendee" && educationLevel === "university";
  const isHighSchoolMentor = role === "mentor" && educationLevel === "high_school";
  const isInvalidCombo = isUniversityAttendee || isHighSchoolMentor;
  const roleApplicationCopy = getApplicationFormCopy(role);

  return (
    <div className="space-y-6">
      {isSelectionLocked && (
        <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <p>
            Role and education are now fixed because your application has already
            been submitted.
          </p>
          <p className="mt-1">You can still update the rest of your profile details.</p>
          {onGoNext && (
            <button
              type="button"
              onClick={onGoNext}
              className="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-primary hover:opacity-90 transition-opacity"
            >
              Go to next step
            </button>
          )}
        </div>
      )}

      <div>
        <label className="mb-3 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          I want to apply as
        </label>
        <div className="flex gap-2">
          <OptionButton
            selected={role === "attendee"}
            onClick={() => onChangeRole("attendee")}
            disabled={isSelectionLocked || educationLevel === "university"}
          >
            Attendee
          </OptionButton>
          <OptionButton
            selected={role === "mentor"}
            onClick={() => onChangeRole("mentor")}
            disabled={isSelectionLocked || educationLevel === "high_school"}
          >
            Mentor
          </OptionButton>
          <OptionButton
            selected={role === "volunteer"}
            onClick={() => onChangeRole("volunteer")}
            disabled={isSelectionLocked}
          >
            Volunteer
          </OptionButton>
        </div>
      </div>

      <div>
        <label className="mb-3 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          I am in
        </label>
        <div className="flex gap-2">
          <OptionButton
            selected={educationLevel === "high_school"}
            onClick={() => onChangeEducationLevel("high_school")}
            disabled={isSelectionLocked}
          >
            High School
          </OptionButton>
          <OptionButton
            selected={educationLevel === "university"}
            onClick={() => onChangeEducationLevel("university")}
            disabled={isSelectionLocked}
          >
            University
          </OptionButton>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{roleApplicationCopy}</p>

      <div>
        <label className="mb-3 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          Update Emails
        </label>
        <p className="mb-3 text-xs text-muted-foreground">
          Would you like updates on deadlines, prizes, and sponsors? We promise not to spam you!
        </p>
        <div className="flex gap-2">
          <OptionButton
            selected={marketingOptIn}
            onClick={() => onChangeMarketingOptIn(true)}
          >
            Yes, keep me posted
          </OptionButton>
          <OptionButton
            selected={!marketingOptIn}
            onClick={() => onChangeMarketingOptIn(false)}
          >
            No, thanks
          </OptionButton>
        </div>
      </div>

      <AnimatePresence>
        {isInvalidCombo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <div className="text-sm text-amber-200">
                {isUniversityAttendee && (
                  <>
                    <p className="font-medium">
                      Hack4Us is a high school hackathon.
                    </p>
                    <p className="mt-1 text-amber-200/80">
                      University students are welcome to apply as a{" "}
                      <button
                        type="button"
                        onClick={() => onChangeRole("mentor")}
                        className="font-semibold underline underline-offset-2 hover:text-amber-100 transition-colors"
                      >
                        mentor
                      </button>{" "}
                      or{" "}
                      <button
                        type="button"
                        onClick={() => onChangeRole("volunteer")}
                        className="font-semibold underline underline-offset-2 hover:text-amber-100 transition-colors"
                      >
                        volunteer
                      </button>
                      !
                    </p>
                  </>
                )}
                {isHighSchoolMentor && (
                  <>
                    <p className="font-medium">
                      Mentors must be university students or older.
                    </p>
                    <p className="mt-1 text-amber-200/80">
                      High school students can apply as an{" "}
                      <button
                        type="button"
                        onClick={() => onChangeRole("attendee")}
                        className="font-semibold underline underline-offset-2 hover:text-amber-100 transition-colors"
                      >
                        attendee
                      </button>{" "}
                      or{" "}
                      <button
                        type="button"
                        onClick={() => onChangeRole("volunteer")}
                        className="font-semibold underline underline-offset-2 hover:text-amber-100 transition-colors"
                      >
                        volunteer
                      </button>
                      !
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
