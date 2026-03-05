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
  background: {
    id: "background",
    title: "Background",
    description: "Tell us a bit about yourself.",
  },
  volunteering: {
    id: "volunteering",
    title: "Volunteering",
    description: "Help us understand how you'd like to contribute.",
  },
  logistics: {
    id: "logistics",
    title: "Logistics",
    description: "A few last things so we can plan the event.",
  },
} satisfies Record<string, ApplicationSection>;

const questions = {
  previousVolunteering: {
    id: "previousVolunteering",
    sectionId: "background",
    order: 1,
    showToReviewer: true,
    field: {
      type: "radio",
      label: "Have you volunteered at a hackathon or similar event before?",
      required: true,
      options: [
        { label: "Yes", value: "yes" },
        { label: "No, but I've volunteered elsewhere", value: "other" },
        { label: "No, this would be my first time volunteering", value: "no" },
      ],
    } satisfies RadioField,
  },

  whyVolunteer: {
    id: "whyVolunteer",
    sectionId: "volunteering",
    order: 2,
    showToReviewer: true,
    field: {
      type: "textarea",
      label: "Why do you want to volunteer at hack4us?",
      placeholder: "Tell us what motivates you to help out at the event.",
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

  preferredRoles: {
    id: "preferredRoles",
    sectionId: "volunteering",
    order: 3,
    showToReviewer: true,
    field: {
      type: "checkbox",
      label: "Preferred Volunteer Roles",
      description: "Select all roles you'd be comfortable with.",
      required: true,
      minSelected: 1,
      selectAll: true,
      options: [
        { label: "Registration & Check-in", value: "checkin" },
        { label: "Tech Support / AV Setup", value: "tech_support" },
        { label: "Food & Beverage Coordination", value: "food" },
        { label: "Judging Logistics", value: "judging" },
        { label: "Workshop Facilitation", value: "workshops" },
        { label: "Photography / Social Media", value: "media" },
        { label: "General Support (wherever needed)", value: "general" },
      ],
    } satisfies CheckboxField,
  },

  availability: {
    id: "availability",
    sectionId: "volunteering",
    order: 4,
    showToReviewer: true,
    field: {
      type: "checkbox",
      label: "Availability",
      description: "Which time blocks can you attend? Select all that apply.",
      required: true,
      minSelected: 1,
      selectAll: true,
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
    order: 5,
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
    order: 6,
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

export const volunteerConfig: ApplicationConfig = {
  sections,
  questions,
};
