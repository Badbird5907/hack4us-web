"use client";

import { Input } from "@/components/ui/input";
import { FieldLabel } from "./field-label";
import type { StepSchoolProps } from "./types";

export function StepSchool({
  school,
  year,
  educationLevel,
  onChangeSchool,
  onChangeYear,
}: StepSchoolProps) {
  const isUni = educationLevel === "university";

  // Extract the raw number from the formatted string (e.g. "Grade 10" -> "10")
  const rawNumber = year.replace(/^(Grade|Year)\s*/i, "");

  const handleYearChange = (value: string) => {
    if (value === "") {
      onChangeYear("");
      return;
    }
    const prefix = isUni ? "Year" : "Grade";
    onChangeYear(`${prefix} ${value}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>{isUni ? "University" : "School"}</FieldLabel>
        <Input
          value={school}
          onChange={(e) => onChangeSchool(e.target.value)}
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
