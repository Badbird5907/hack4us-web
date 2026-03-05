import type { ReactNode } from "react";

export type ParticipantRole = "attendee" | "mentor" | "volunteer";
export type EducationLevel = "high_school" | "university";

export interface ProfileLinks {
  instagram: string;
  twitter: string;
  linkedin: string;
  github: string;
  external: string[];
}

export interface ProfileFormData {
  role: ParticipantRole | "";
  educationLevel: EducationLevel | "";
  marketingOptIn: boolean;
  name: string;
  birthdate: string;
  school: string;
  year: string;
  bio: string;
  skills: string[];
  interests: string[];
  links: ProfileLinks;
}

export const DEFAULT_FORM_DATA: ProfileFormData = {
  role: "",
  educationLevel: "",
  marketingOptIn: false,
  name: "",
  birthdate: "",
  school: "",
  year: "",
  bio: "",
  skills: [],
  interests: [],
  links: {
    instagram: "",
    twitter: "",
    linkedin: "",
    github: "",
    external: [],
  },
};

export interface StepRoleAndEducationProps {
  role: ParticipantRole | "";
  educationLevel: EducationLevel | "";
  marketingOptIn: boolean;
  onChangeRole: (role: ParticipantRole) => void;
  onChangeEducationLevel: (level: EducationLevel) => void;
  onChangeMarketingOptIn: (value: boolean) => void;
  isSelectionLocked?: boolean;
  onGoNext?: () => void;
}

export interface StepNameProps {
  name: string;
  birthdate: string;
  onChangeName: (name: string) => void;
  onChangeBirthdate: (birthdate: string) => void;
}

export interface StepSchoolProps {
  school: string;
  year: string;
  educationLevel: EducationLevel | "";
  maxLength?: number;
  onChangeSchool: (value: string) => void;
  onChangeYear: (value: string) => void;
}

export interface StepBioProps {
  bio: string;
  maxLength?: number;
  onChange: (bio: string) => void;
}

export interface StepSkillsProps {
  skills: string[];
  interests: string[];
  onChangeSkills: (value: string[]) => void;
  onChangeInterests: (value: string[]) => void;
}

export interface StepLinksProps {
  links: ProfileLinks;
  onChange: (links: ProfileLinks) => void;
}

export interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}
