"use client";

import type {
  ApplicationConfig,
  ApplicationSection,
  ApplicationQuestionsSchema,
  ShortTextField,
  TextareaField,
  RadioField,
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
  personal: {
    id: "personal",
    title: "About You",
  },
  project: {
    id: "project",
    title: "Project & Goals",
    description: "Tell us about what you'd like to build at hack4us.",
  },
  logistics: {
    id: "logistics",
    title: "Logistics",
    description: "A few last things so we can plan the best experience for you.",
  },
} satisfies Record<string, ApplicationSection>;

const questions = {
  hackathonCount: {
    id: "hackathonCount",
    sectionId: "personal",
    order: 1,
    showToReviewer: true,
    field: {
      type: "select",
      label: "How many hackathons have you been to?",
      required: true,
      options: [
        { label: "This will be my first!", value: "0" },
        { label: "1", value: "1" },
        { label: "2–5", value: "2-5" },
        { label: "5+", value: "5+" },
      ],
      nudge: (value) => {
        if (value === "0")
          return {
            message:
              "Everyone starts somewhere — we're excited to be your first!",
            tone: "encouraging",
          };
        if (value === "1")
          return {
            message:
              "Nice, you've got one under your belt! This one will be even better.",
            tone: "encouraging",
          };
        if (value === "2-5")
          return {
            message: "A seasoned hacker! We'd love to see what you build.",
            tone: "encouraging",
          };
        if (value === "5+")
          return {
            message: "Wow, a hackathon veteran! Bring your A-game.",
            tone: "encouraging",
          };
        return null;
      },
    } satisfies SelectField,
  },

  proudProject: {
    id: "proudProject",
    sectionId: "personal",
    order: 2,
    showToReviewer: true,
    field: {
      type: "textarea",
      label:
        "What is a project (technical or non-technical) that you've done that you're really proud of?",
      placeholder:
        "It doesn't have to be code — tell us about anything you've built, created, or accomplished.",
      required: true,
      minLength: 50,
      maxLength: 1000,
      rows: 4,
      nudge: (value) => {
        if (typeof value !== "string") return null;
        if (value.length >= 50)
          return {
            message: "Great response!",
            tone: "encouraging",
          };
        if (value.length >= 26)
          return {
            message: "Almost there — tell us a bit more!",
            tone: "tip",
          };
        return {
          message: "Keep writing!",
          tone: "tip",
        };
      },
    } satisfies TextareaField,
    validate: (value) => {
      if (typeof value === "string" && value.trim().length < 50) {
        return "Please write at least 50 characters.";
      }
    },
  },

  whyAttend: {
    id: "whyAttend",
    sectionId: "personal",
    order: 3,
    showToReviewer: true,
    field: {
      type: "textarea",
      label: "Why do you want to attend hack4us?",
      placeholder:
        "Tell us what excites you about hackathons, what you hope to learn, etc.",
      required: true,
      minLength: 50,
      maxLength: 1000,
      rows: 4,
      nudge: (value) => {
        if (typeof value !== "string") return null;
        if (value.length >= 50)
          return {
            message: "Great response!",
            tone: "encouraging",
          };
        if (value.length >= 26)
          return {
            message: "Almost there — tell us a bit more!",
            tone: "tip",
          };
        return {
          message: "Keep writing!",
          tone: "tip",
        };
      },
    } satisfies TextareaField,
    validate: (value) => {
      if (typeof value === "string" && value.trim().length < 50) {
        return "Please write at least 50 characters.";
      }
    },
  },

  getOutOfIt: {
    id: "getOutOfIt",
    sectionId: "project",
    order: 4,
    showToReviewer: true,
    field: {
      type: "textarea",
      label:
        "Aside from the free food, swag, and winning, what would you like to get out of Hack4Us?",
      placeholder:
        "Skills, connections, inspiration — what matters most to you?",
      required: true,
      minLength: 50,
      maxLength: 1000,
      rows: 4,
      nudge: (value) => {
        if (typeof value !== "string") return null;
        if (value.length >= 50)
          return {
            message: "Love it!",
            tone: "encouraging",
          };
        if (value.length >= 26)
          return {
            message: "Almost there — tell us a bit more!",
            tone: "tip",
          };
        return {
          message: "Keep writing!",
          tone: "tip",
        };
      },
    } satisfies TextareaField,
    validate: (value) => {
      if (typeof value === "string" && value.trim().length < 50) {
        return "Please write at least 50 characters.";
      }
    },
  },

  lifetimeGoal: {
    id: "lifetimeGoal",
    sectionId: "project",
    order: 5,
    showToReviewer: true,
    field: {
      type: "textarea",
      label: "What is a lifetime goal of yours?",
      placeholder: "Dream big — we want to know what drives you.",
      required: true,
      minLength: 50,
      maxLength: 1000,
      rows: 4,
      nudge: (value) => {
        if (typeof value !== "string") return null;
        if (value.length >= 50)
          return {
            message: "Great answer!",
            tone: "encouraging",
          };
        if (value.length >= 26)
          return {
            message: "Almost there — tell us a bit more!",
            tone: "tip",
          };
        return {
          message: "Keep writing!",
          tone: "tip",
        };
      },
    } satisfies TextareaField,
    validate: (value) => {
      if (typeof value === "string" && value.trim().length < 50) {
        return "Please write at least 50 characters.";
      }
    },
  },

  teamPreference: {
    id: "teamPreference",
    sectionId: "project",
    order: 6,
    showToReviewer: true,
    field: {
      type: "radio",
      label: "Team Preference",
      description: "How do you plan to participate?",
      required: true,
      options: [
        { label: "I'd like to work solo", value: "solo" },
        { label: "I'm looking for teammates", value: "looking" },
        { label: "I already have a team", value: "have_team" },
      ],
      nudge: (value) => {
        if (value === "solo")
          return {
            message:
              "Going solo is totally fine! You can always join a team at the event if you change your mind.",
            tone: "info",
          };
        if (value === "looking")
          return {
            message: "We'll help you find teammates during team formation!",
            tone: "encouraging",
          };
        if (value === "have_team")
          return {
            message: "Great — make sure your teammates apply too!",
            tone: "tip",
          };
        return null;
      },
    } satisfies RadioField,
  },

  dietaryRestrictions: {
    id: "dietaryRestrictions",
    sectionId: "logistics",
    order: 7,
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
            message:
              "We want everyone to enjoy the food! Don't be shy!",
            tone: "info",
          };
        return null;
      },
    } satisfies CustomField,
  },

  tshirtSize: {
    id: "tshirtSize",
    sectionId: "logistics",
    order: 8,
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

  emergencyContact: {
    id: "emergencyContact",
    sectionId: "logistics",
    order: 9,
    showToReviewer: false,
    field: {
      type: "text",
      label: "Emergency Contact",
      description:
        "Name and phone number of a parent or guardian we can reach in an emergency.",
      placeholder: "e.g. Jane Smith — (416) 555-0123",
      required: true,
      maxLength: 200,
      nudge: (value) => {
        if (typeof value === "string" && value.trim().length > 0)
          return {
            message: "Thanks! This helps us keep everyone safe.",
            tone: "info",
          };
        return null;
      },
    } satisfies ShortTextField,
  },
} satisfies ApplicationQuestionsSchema;

export const attendeeConfig: ApplicationConfig = {
  sections,
  questions,
};
