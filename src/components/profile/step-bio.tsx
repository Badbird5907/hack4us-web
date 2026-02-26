"use client";

import { Textarea } from "@/components/ui/textarea";
import { FieldLabel } from "./field-label";
import type { StepBioProps } from "./types";

export function StepBio({ bio, onChange }: StepBioProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Bio</FieldLabel>
        <Textarea
          value={bio}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tell us a bit about yourself..."
          className="min-h-32"
          autoFocus
        />
      </div>
    </div>
  );
}
