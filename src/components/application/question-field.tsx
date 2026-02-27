"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Nudge } from "./nudge";
import type {
  ApplicationField,
  ApplicationQuestion,
  CustomFieldProps,
} from "@/lib/questions/schemas";

function OptionCard({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full border px-4 py-3 text-left text-sm font-medium transition-all
        ${selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
        }
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      `}
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex size-4 shrink-0 items-center justify-center border ${selected
              ? "border-primary bg-primary"
              : "border-muted-foreground/40"
            }`}
        >
          {selected && (
            <span className="block size-1.5 bg-primary-foreground" />
          )}
        </span>
        {label}
      </span>
    </button>
  );
}

function TextField({
  field,
  value,
  onChange,
}: {
  field: Extract<ApplicationField, { type: "text" | "email" | "url" }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Input
      type={field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      maxLength={
        "maxLength" in field ? (field.maxLength as number) : undefined
      }
      disabled={field.disabled}
    />
  );
}

function NumberFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Extract<ApplicationField, { type: "number" }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      min={field.min}
      max={field.max}
      step={field.step}
      disabled={field.disabled}
    />
  );
}

function TextareaFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Extract<ApplicationField, { type: "textarea" }>;
  value: string;
  onChange: (v: string) => void;
}) {
  const charCount = value.length;
  const maxLength = field.maxLength;

  return (
    <div className="space-y-1.5">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={field.rows ?? 4}
        maxLength={maxLength}
        disabled={field.disabled}
        className="min-h-24 resize-y"
      />
      {maxLength && (
        <div className="flex justify-end">
          <span
            className={`text-[10px] font-mono tracking-wider ${charCount > maxLength * 0.9
                ? "text-amber-500"
                : "text-muted-foreground/50"
              }`}
          >
            {charCount} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
}

function RadioFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Extract<ApplicationField, { type: "radio" }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {field.options.map((opt) => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          disabled={field.disabled || opt.disabled}
        />
      ))}
    </div>
  );
}

function CheckboxFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Extract<ApplicationField, { type: "checkbox" }>;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (optValue: string) => {
    const next = value.includes(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {field.options.map((opt) => (
        <label
          key={opt.value}
          className={`
            flex items-center gap-3 border px-4 py-3 text-sm transition-all cursor-pointer
            ${value.includes(opt.value)
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }
            ${field.disabled || opt.disabled ? "cursor-not-allowed opacity-50" : ""}
          `}
        >
          <Checkbox
            checked={value.includes(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
            disabled={field.disabled || opt.disabled}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function SelectFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Extract<ApplicationField, { type: "select" }>;
  value: string;
  onChange: (v: string) => void;
}) {
  // Use option cards for small option sets (≤8), native select for larger
  if (field.options.length <= 8) {
    return (
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
        {field.options.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={value === opt.value}
            onClick={() => onChange(opt.value)}
            disabled={field.disabled || opt.disabled}
          />
        ))}
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={field.disabled}
      className="w-full border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
    >
      <option value="">{field.placeholder ?? "Select..."}</option>
      {field.options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function CustomFieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: Extract<ApplicationField, { type: "custom" }>;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
}) {
  const Component = field.component as React.ComponentType<CustomFieldProps>;
  return (
    <Component
      value={value}
      onChange={onChange}
      error={error}
      disabled={field.disabled}
    />
  );
}

function deserializeValue(
  field: ApplicationField,
  raw: string | undefined
): unknown {
  if (raw === undefined || raw === "") {
    if (field.type === "checkbox") return [];
    if (field.type === "custom") return undefined;
    if (field.type === "number") return "";
    return "";
  }
  if (field.type === "checkbox") {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (field.type === "custom") {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

function serializeValue(field: ApplicationField, value: unknown): string {
  if (field.type === "checkbox") return JSON.stringify(value ?? []);
  if (field.type === "custom") return JSON.stringify(value ?? null);
  return String(value ?? "");
}

export function QuestionField({
  question,
  index,
  answers,
  errors,
  onAnswer,
  disabled,
}: {
  question: ApplicationQuestion;
  index: number;
  answers: Record<string, string>;
  errors: Record<string, string>;
  onAnswer: (questionId: string, serialized: string) => void;
  disabled: boolean;
}) {
  const { field } = question;
  const rawValue = answers[question.id];
  const value = deserializeValue(field, rawValue);
  const error = errors[question.id];
  const [touched, setTouched] = useState(rawValue !== undefined);

  const handleChange = (v: unknown) => {
    if (disabled) return;
    setTouched(true);
    onAnswer(question.id, serializeValue(field, v));
  };

  const nudge = touched && field.nudge ? field.nudge(value) : null;

  const selectAllProps = (() => {
    if (field.type !== "checkbox" || !field.selectAll) return null;
    const enabledOptions = field.options.filter((o) => !o.disabled && !field.disabled);
    if (field.maxSelected && field.maxSelected < enabledOptions.length) return null;
    const selected = value as string[];
    const allSelected = enabledOptions.length > 0 && enabledOptions.every((o) => selected.includes(o.value));
    const handleSelectAll = () => {
      if (allSelected) {
        handleChange(selected.filter((v) => !enabledOptions.some((o) => o.value === v)));
      } else {
        handleChange([...new Set([...selected, ...enabledOptions.map((o) => o.value)])]);
      }
    };
    return { allSelected, handleSelectAll };
  })();

  return (
    <div className="space-y-3">
      <div>
        <span className="font-mono text-xs font-bold text-primary mt-0.5 shrink-0 block md:hidden">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex items-start gap-3">
          <span className="font-mono text-xs font-bold text-primary mt-0.5 shrink-0 hidden md:block">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold tracking-wide uppercase">
                {field.label}
                {field.required && (
                  <span className="ml-1 text-primary">*</span>
                )}
              </h3>
              {selectAllProps && (
                <button
                  type="button"
                  onClick={selectAllProps.handleSelectAll}
                  className="text-[10px] cursor-pointer font-mono font-bold tracking-widest uppercase text-primary hover:text-primary/70 transition-colors shrink-0"
                >
                  {selectAllProps.allSelected ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="pl-0 md:pl-7">
        {(field.type === "text" ||
          field.type === "email" ||
          field.type === "url") && (
            <TextField
              field={field}
              value={value as string}
              onChange={handleChange}
            />
          )}
        {field.type === "number" && (
          <NumberFieldRenderer
            field={field}
            value={value as string}
            onChange={handleChange}
          />
        )}
        {field.type === "textarea" && (
          <TextareaFieldRenderer
            field={field}
            value={value as string}
            onChange={handleChange}
          />
        )}
        {field.type === "radio" && (
          <RadioFieldRenderer
            field={field}
            value={value as string}
            onChange={handleChange}
          />
        )}
        {field.type === "checkbox" && (
          <CheckboxFieldRenderer
            field={field}
            value={value as string[]}
            onChange={handleChange}
          />
        )}
        {field.type === "select" && (
          <SelectFieldRenderer
            field={field}
            value={value as string}
            onChange={handleChange}
          />
        )}
        {field.type === "custom" && (
          <CustomFieldRenderer
            field={field}
            value={value}
            onChange={handleChange}
            error={error}
          />
        )}

        <div className="mt-2">
          <Nudge nudge={nudge} />
        </div>

        {error && (
          <p className="mt-1.5 text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export { deserializeValue, serializeValue };
