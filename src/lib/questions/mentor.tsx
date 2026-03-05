"use client";

import type {
  ApplicationConfig,
  ApplicationSection,
  ApplicationQuestionsSchema,
  TextareaField,
  RadioField,
  CheckboxField,
  SelectField,
  CustomField,
  CustomFieldProps,
  CustomFieldViewProps,
} from "./schemas";
import {
  DietaryForm,
  DietaryView,
  parseDietaryValue,
} from "./components/dietary";

const sections = {
  experience: {
    id: "experience",
    title: "Experience",
    description: "Tell us about your technical background.",
  },
  mentoring: {
    id: "mentoring",
    title: "Mentoring",
    description: "Help us understand how you'd like to support attendees.",
  },
  logistics: {
    id: "logistics",
    title: "Logistics",
    description: "A few last things so we can plan the event.",
  },
} satisfies Record<string, ApplicationSection>;

const questions = {
  expertise: {
    id: "expertise",
    sectionId: "experience",
    order: 1,
    showToReviewer: true,
    field: {
      type: "checkbox",
      label: "Areas of Expertise",
      description: "Select all that apply.",
      required: true,
      minSelected: 1,
      options: [
        { label: "Frontend Development", value: "frontend" },
        { label: "Backend Development", value: "backend" },
        { label: "Mobile Development", value: "mobile" },
        { label: "AI / Machine Learning", value: "ai_ml" },
        { label: "Data Science", value: "data_science" },
        { label: "DevOps / Cloud", value: "devops" },
        { label: "UI / UX Design", value: "design" },
        { label: "Hardware / IoT", value: "hardware" },
        { label: "Game Development", value: "game_dev" },
        { label: "Cybersecurity", value: "cybersecurity" },
      ],
    } satisfies CheckboxField,
  },

  yearsExperience: {
    id: "yearsExperience",
    sectionId: "experience",
    order: 2,
    showToReviewer: true,
    field: {
      type: "select",
      label: "Years of Technical Experience",
      required: true,
      options: [
        { label: "Less than 1 year", value: "0" },
        { label: "1–2 years", value: "1-2" },
        { label: "3–5 years", value: "3-5" },
        { label: "5+ years", value: "5+" },
      ],
    } satisfies SelectField,
  },

  previousMentoring: {
    id: "previousMentoring",
    sectionId: "mentoring",
    order: 3,
    showToReviewer: true,
    field: {
      type: "radio",
      label: "Have you mentored at a hackathon before?",
      required: true,
      options: [
        { label: "Yes", value: "yes" },
        { label: "No, but I've mentored in other settings", value: "other" },
        { label: "No, this would be my first time", value: "no" },
      ],
    } satisfies RadioField,
  },

  whyMentor: {
    id: "whyMentor",
    sectionId: "mentoring",
    order: 4,
    showToReviewer: true,
    field: {
      type: "textarea",
      label: "Why do you want to mentor at hack4us?",
      placeholder: "Tell us what motivates you to mentor high school students.",
      required: true,
      minLength: 50,
      maxLength: 1000,
      rows: 4,
    } satisfies TextareaField,
    validate: (value) => {
      if (typeof value === "string" && value.trim().length < 50) {
        return "Please write at least 50 characters.";
      }
    },
  },

  availability: {
    id: "availability",
    sectionId: "mentoring",
    order: 5,
    showToReviewer: true,
    field: {
      type: "checkbox",
      label: "Availability",
      description: "Which time blocks can you attend? Select all that apply.",
      required: true,
      minSelected: 1,
      options: [
        { label: "Saturday morning (9 AM – 12 PM)", value: "sat_morning" },
        { label: "Saturday afternoon (12 PM – 5 PM)", value: "sat_afternoon" },
        { label: "Saturday evening (5 PM – 10 PM)", value: "sat_evening" },
        { label: "Sunday morning (9 AM – 12 PM)", value: "sun_morning" },
        { label: "Sunday afternoon (12 PM – 5 PM)", value: "sun_afternoon" },
      ],
    } satisfies CheckboxField,
  },

  dietaryRestrictions: {
    id: "dietaryRestrictions",
    sectionId: "logistics",
    order: 6,
    showToReviewer: true,
    field: {
      type: "custom",
      label: "Dietary Restrictions",
      description: "Select any that apply, or leave blank if none.",
      component: DietaryForm as React.ComponentType<CustomFieldProps>,
      viewComponent: DietaryView as React.ComponentType<CustomFieldViewProps>,
      nudge: (value) => {
        const val = parseDietaryValue(value);
        if (val.selected.length === 0 && !val.other.trim())
          return {
            message: "We want everyone to enjoy the food! Don't be shy!",
            tone: "info",
          };
        return null;
      },
    } satisfies CustomField,
  },

  tshirtSize: {
    id: "tshirtSize",
    sectionId: "logistics",
    order: 7,
    showToReviewer: false,
    field: {
      type: "select",
      label: "T-Shirt Size",
      required: true,
      options: [
        { label: "XS", value: "xs" },
        { label: "S", value: "s" },
        { label: "M", value: "m" },
        { label: "L", value: "l" },
        { label: "XL", value: "xl" },
        { label: "XXL", value: "xxl" },
      ],
    } satisfies SelectField,
  },
} satisfies ApplicationQuestionsSchema;

export const mentorConfig: ApplicationConfig = {
  sections,
  questions,
};
