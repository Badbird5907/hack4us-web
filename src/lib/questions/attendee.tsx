import type {
  ApplicationConfig,
  ApplicationSection,
  ApplicationQuestionsSchema,
  ShortTextField,
  TextareaField,
  RadioField,
  SelectField,
} from "./schemas";

const sections = {
  personal: {
    id: "personal",
    title: "Personal Information",
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
  experience: {
    id: "experience",
    sectionId: "personal",
    order: 1,
    field: {
      type: "select",
      label: "Coding Experience",
      description: "How would you describe your current coding experience?",
      required: true,
      options: [
        { label: "No experience — this is my first time!", value: "none" },
        { label: "Beginner — I've done a few tutorials or school projects", value: "beginner" },
        { label: "Intermediate — I've built personal or school projects", value: "intermediate" },
        { label: "Advanced — I code regularly and have shipped projects", value: "advanced" },
      ],
    } satisfies SelectField,
  },

  whyAttend: {
    id: "whyAttend",
    sectionId: "project",
    order: 2,
    field: {
      type: "textarea",
      label: "Why do you want to attend hack4us?",
      placeholder: "Tell us what excites you about hackathons, what you hope to learn, etc.",
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

  projectIdea: {
    id: "projectIdea",
    sectionId: "project",
    order: 3,
    field: {
      type: "textarea",
      label: "Project Idea",
      description:
        "Do you have a project idea in mind? Don't worry if you don't — you can always decide at the event!",
      placeholder: "Describe what you'd like to build, the problem it solves, and any technologies you're considering.",
      maxLength: 1500,
      rows: 5,
    } satisfies TextareaField,
  },

  teamPreference: {
    id: "teamPreference",
    sectionId: "project",
    order: 4,
    field: {
      type: "radio",
      label: "Team Preference",
      description: "How do you plan to participate?",
      required: true,
      options: [
        { label: "I already have a team", value: "have_team" },
        { label: "I'm looking for teammates", value: "looking" },
        { label: "I'd like to work solo", value: "solo" },
      ],
    } satisfies RadioField,
  },

  dietaryRestrictions: {
    id: "dietaryRestrictions",
    sectionId: "logistics",
    order: 5,
    field: {
      type: "text",
      label: "Dietary Restrictions",
      placeholder: "e.g. Vegetarian, Halal, Nut allergy, None",
      maxLength: 200,
    } satisfies ShortTextField,
  },

  tshirtSize: {
    id: "tshirtSize",
    sectionId: "logistics",
    order: 6,
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
    order: 7,
    field: {
      type: "text",
      label: "Emergency Contact",
      description: "Name and phone number of a parent or guardian we can reach in an emergency.",
      placeholder: "e.g. Jane Smith — (416) 555-0123",
      required: true,
      maxLength: 200,
    } satisfies ShortTextField,
  },
} satisfies ApplicationQuestionsSchema;

export const attendeeConfig: ApplicationConfig = {
  sections,
  questions,
};
