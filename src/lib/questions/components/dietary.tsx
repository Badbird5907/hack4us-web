"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { CustomFieldProps, CustomFieldViewProps } from "../schemas";

export interface DietaryValue {
  selected: string[];
  other: string;
}

export const DIETARY_OPTIONS = [
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Vegan", value: "vegan" },
  { label: "Halal", value: "halal" },
  { label: "Kosher", value: "kosher" },
  { label: "Gluten-free", value: "gluten_free" },
  { label: "Dairy-free", value: "dairy_free" },
  { label: "Nut allergy", value: "nut_allergy" },
] as const;

export function parseDietaryValue(raw: unknown): DietaryValue {
  if (!raw || typeof raw !== "object") return { selected: [], other: "" };
  const obj = raw as Record<string, unknown>;
  return {
    selected: Array.isArray(obj.selected) ? (obj.selected as string[]) : [],
    other: typeof obj.other === "string" ? obj.other : "",
  };
}

export function formatDietarySummary(val: DietaryValue): string {
  const labels = val.selected.map((v) => {
    const opt = DIETARY_OPTIONS.find((o) => o.value === v);
    return opt?.label ?? v;
  });
  if (val.other.trim()) {
    labels.push(val.other.trim());
  }
  return labels.length > 0 ? labels.join(", ") : "None";
}

export function DietaryForm({ value, onChange, disabled }: CustomFieldProps<DietaryValue>) {
  const val = parseDietaryValue(value);

  const toggleOption = (optionValue: string) => {
    const next = val.selected.includes(optionValue)
      ? val.selected.filter((v) => v !== optionValue)
      : [...val.selected, optionValue];
    onChange({ ...val, selected: next });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {DIETARY_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <Checkbox
              checked={val.selected.includes(opt.value)}
              onCheckedChange={() => toggleOption(opt.value)}
              disabled={disabled}
            />
            {opt.label}
          </label>
        ))}
      </div>
      <div>
        <Input
          value={val.other}
          onChange={(e) => onChange({ ...val, other: e.target.value })}
          placeholder="Other / additional details"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export function DietaryView({ value }: CustomFieldViewProps<DietaryValue>) {
  const val = parseDietaryValue(value);
  return <span>{formatDietarySummary(val)}</span>;
}
