"use client";

import { useCallback } from "react";
import { FieldLabel } from "./field-label";
import { TagInput } from "./tag-input";
import type { StepSkillsProps } from "./types";

export function StepSkills({
  skills,
  interests,
  onChangeSkills,
  onChangeInterests,
}: StepSkillsProps) {
  const handleSkillsChange = useCallback(
    (nextSkills: string[]) => {
      onChangeSkills(nextSkills);
    },
    [onChangeSkills]
  );

  const handleInterestsChange = useCallback(
    (nextInterests: string[]) => {
      onChangeInterests(nextInterests);
    },
    [onChangeInterests]
  );

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Skills</FieldLabel>
        <p className="mb-2 text-xs text-muted-foreground">
          Press Enter to add a skill.
        </p>
        <TagInput
          value={skills}
          onChange={handleSkillsChange}
          placeholder="e.g. React, Python, UI Design"
        />
      </div>
      <div>
        <FieldLabel>Interests</FieldLabel>
        <p className="mb-2 text-xs text-muted-foreground">
          Press Enter to add an interest.
        </p>
        <TagInput
          value={interests}
          onChange={handleInterestsChange}
          placeholder="e.g. AI, Web3, Healthcare"
        />
      </div>
    </div>
  );
}
