import type React from "react";
import { z } from "zod";

export const FieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disabled: z.boolean().optional(),
});

const BaseFieldSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
});

export const ShortTextFieldSchema = BaseFieldSchema.extend({
  type: z.literal("text"),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
});

export const EmailFieldSchema = BaseFieldSchema.extend({
  type: z.literal("email"),
});

export const UrlFieldSchema = BaseFieldSchema.extend({
  type: z.literal("url"),
});

export const NumberFieldSchema = BaseFieldSchema.extend({
  type: z.literal("number"),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
});

export const TextareaFieldSchema = BaseFieldSchema.extend({
  type: z.literal("textarea"),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  rows: z.number().int().positive().optional(),
});

export const RadioFieldSchema = BaseFieldSchema.extend({
  type: z.literal("radio"),
  options: z.array(FieldOptionSchema).min(1),
});

export const CheckboxFieldSchema = BaseFieldSchema.extend({
  type: z.literal("checkbox"),
  options: z.array(FieldOptionSchema).min(1),
  minSelected: z.number().int().nonnegative().optional(),
  maxSelected: z.number().int().positive().optional(),
});

export const SelectFieldSchema = BaseFieldSchema.extend({
  type: z.literal("select"),
  options: z.array(FieldOptionSchema).min(1),
});

/**
 * Custom field: bring your own React component.
 * Zod cannot validate a React component at runtime, so `component` is typed
 * via the TypeScript interface below and passed through as `z.custom`.
 */
export interface CustomFieldProps<TValue = unknown> {
  value: TValue;
  onChange: (value: TValue) => void;
  error?: string;
  disabled?: boolean;
}

export const CustomFieldSchema = BaseFieldSchema.extend({
  type: z.literal("custom"),
  component: z.custom<React.ComponentType<CustomFieldProps>>(),
});

export const ApplicationFieldSchema = z.discriminatedUnion("type", [
  ShortTextFieldSchema,
  EmailFieldSchema,
  UrlFieldSchema,
  NumberFieldSchema,
  TextareaFieldSchema,
  RadioFieldSchema,
  CheckboxFieldSchema,
  SelectFieldSchema,
  CustomFieldSchema,
]);

export type FieldOption = z.infer<typeof FieldOptionSchema>;
export type ShortTextField = z.infer<typeof ShortTextFieldSchema>;
export type EmailField = z.infer<typeof EmailFieldSchema>;
export type UrlField = z.infer<typeof UrlFieldSchema>;
export type NumberField = z.infer<typeof NumberFieldSchema>;
export type TextareaField = z.infer<typeof TextareaFieldSchema>;
export type RadioField = z.infer<typeof RadioFieldSchema>;
export type CheckboxField = z.infer<typeof CheckboxFieldSchema>;
export type SelectField = z.infer<typeof SelectFieldSchema>;
export type CustomField = z.infer<typeof CustomFieldSchema>;
export type ApplicationField = z.infer<typeof ApplicationFieldSchema>;

/**
 * Maps a concrete field type to the value type it produces at runtime.
 */
export type FieldValue<T extends ApplicationField> =
  T extends ShortTextField | EmailField | UrlField | TextareaField ? string
  : T extends NumberField ? number
  : T extends RadioField ? string
  : T extends CheckboxField ? string[]
  : T extends SelectField ? string
  : T extends CustomField ? unknown
  : never;

export const ApplicationSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

/**
 * A custom validator for a question's value.
 * Return a string to show as an error, or void/undefined if the value is valid.
 * May be async for server-side checks (e.g. username availability).
 */
export type ValidatorFn<TValue = unknown> = (
  value: TValue,
) => string | null | undefined | Promise<string | null | undefined>;

export const ApplicationQuestionSchema = z.object({
  id: z.string(),
  sectionId: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
  field: ApplicationFieldSchema,
  validate: z.custom<ValidatorFn>().optional(),
});

export type ApplicationSection = z.infer<typeof ApplicationSectionSchema>;
export type ApplicationQuestion = z.infer<typeof ApplicationQuestionSchema>;

export const ApplicationQuestionsSchema = z.record(z.string(), ApplicationQuestionSchema);
export type ApplicationQuestionsSchema = z.infer<typeof ApplicationQuestionsSchema>;

export interface ApplicationConfig {
  sections: Record<string, ApplicationSection>;
  questions: ApplicationQuestionsSchema;
}
