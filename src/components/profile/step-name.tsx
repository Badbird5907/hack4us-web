"use client";

import { Input } from "@/components/ui/input";
import { FieldLabel } from "./field-label";
import type { StepNameProps } from "./types";

export function StepName({
  name,
  birthdate,
  onChangeName,
  onChangeBirthdate,
}: StepNameProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Full Name</FieldLabel>
        <Input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Your full name"
          autoFocus
        />
      </div>
      <div>
        <FieldLabel>Date of Birth</FieldLabel>
        <Input
          type="date"
          value={birthdate}
          onChange={(e) => onChangeBirthdate(e.target.value)}
        />
      </div>
    </div>
  );
}
