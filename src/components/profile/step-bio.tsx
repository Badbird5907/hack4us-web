"use client";

import { Textarea } from "@/components/ui/textarea";
import { FieldLabel } from "./field-label";
import type { StepBioProps } from "./types";

export function StepBio({ bio, maxLength, onChange }: StepBioProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Bio</FieldLabel>
        <Textarea
          value={bio}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          placeholder="Tell us a bit about yourself..."
          className="min-h-32"
          autoFocus
        />
        {typeof maxLength === "number" && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {bio.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
