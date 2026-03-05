export type ApplicationType = "attendee" | "mentor" | "volunteer";

export type RubricFieldType = "score" | "boolean" | "select" | "text";

export interface RubricField {
  id: string;
  label: string;
  description?: string;
  type: RubricFieldType;
  scale?: { min: number; max: number; step?: number };
  weight?: number;
  applicationTypes?: ApplicationType[];
  affectsRanking?: boolean;
}

export const FLAG_REASONS = [
  { id: "dietary_followup", label: "Needs dietary follow-up" },
  { id: "suspicious", label: "Suspicious response" },
  { id: "incomplete_promising", label: "Incomplete but promising" },
  { id: "other", label: "Other" },
] as const;

export type FlagReasonId = (typeof FLAG_REASONS)[number]["id"];

export const RUBRIC: RubricField[] = [
  {
    id: "effort",
    label: "Effort & Thoughtfulness",
    description: "Did the applicant put care into their responses?",
    type: "score",
    scale: { min: 1, max: 5, step: 1 },
    weight: 1,
    affectsRanking: true,
  },
  {
    id: "motivation",
    label: "Motivation & Growth Mindset",
    description: "Do they genuinely want to learn and grow?",
    type: "score",
    scale: { min: 1, max: 5, step: 1 },
    weight: 1,
    affectsRanking: true,
  },
  {
    id: "communityFit",
    label: "Community Fit",
    description: "Do they seem collaborative and respectful?",
    type: "score",
    scale: { min: 1, max: 5, step: 1 },
    weight: 1,
    affectsRanking: true,
  },
];
