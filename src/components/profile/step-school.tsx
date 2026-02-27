"use client";

import { Input } from "@/components/ui/input";
import { FieldLabel } from "./field-label";
import type { StepSchoolProps } from "./types";

export function StepSchool({
  school,
  year,
  educationLevel,
  maxLength,
  onChangeSchool,
  onChangeYear,
}: StepSchoolProps) {
  const isUni = educationLevel === "university";

  const rawNumber = year.replace(/^(Grade|Year)\s*/i, "");

  const handleYearChange = (value: string) => {
    if (value === "") {
      onChangeYear("");
      return;
    }

    const digitsOnly = value.replace(/\D/g, "");
    if (!digitsOnly) {
      onChangeYear("");
      return;
    }

    const parsed = Number(digitsOnly);
    const min = isUni ? 1 : 9;
    const max = isUni ? 6 : 12;
    const clamped = Math.min(Math.max(parsed, min), max);

    const prefix = isUni ? "Year" : "Grade";
    onChangeYear(`${prefix} ${clamped}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>{isUni ? "University" : "School"}</FieldLabel>
        <Input
          value={school}
          onChange={(e) => onChangeSchool(e.target.value)}
          maxLength={maxLength}
          placeholder={
            isUni
              ? "e.g. University of Toronto"
              : "e.g. York Mills Collegiate Institute, Toronto"
          }
          autoFocus
        />
        {school.length > 0 && school.length < 10 && (
          <p className="mt-1.5 text-xs text-amber-500">
            {isUni
              ? "Please enter your full university name (e.g. University of Toronto)"
              : "Please enter your full school name (e.g. York Mills Collegiate Institute, Toronto)"}
          </p>
        )}
        {typeof maxLength === "number" && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {school.length}/{maxLength}
          </p>
        )}
      </div>
      <div>
        <FieldLabel>{isUni ? "Year of Study" : "Grade"}</FieldLabel>
        {isUni ? (
          <Input
            type="number"
            min={1}
            max={6}
            value={rawNumber}
            onChange={(e) => handleYearChange(e.target.value)}
            placeholder="e.g. 1, 2, 3, 4"
          />
        ) : (
          <Input
            type="number"
            min={9}
            max={12}
            value={rawNumber}
            onChange={(e) => handleYearChange(e.target.value)}
            placeholder="e.g. 9, 10, 11, 12"
          />
        )}
        {year && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Saved as: {year}
          </p>
        )}
      </div>
    </div>
  );
}
