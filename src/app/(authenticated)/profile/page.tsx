"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "@/hooks/convex";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type ParticipantRole = "attendee" | "mentor" | "volunteer";
type EducationLevel = "high_school" | "university";

interface ProfileFormData {
  role: ParticipantRole | "";
  educationLevel: EducationLevel | "";
  name: string;
  birthdate: string;
  school: string;
  year: string;
  bio: string;
  skills: string[];
  interests: string[];
  links: {
    instagram: string;
    twitter: string;
    linkedin: string;
    github: string;
    external: string[];
  };
}

const STEPS = [
  {
    title: "Getting Started",
    description: "Tell us how you'd like to participate.",
  },
  { title: "Name", description: "What should we call you?" },
  {
    title: "School & Year",
    description: "Tell us where you study.",
  },
  { title: "About You", description: "Write a short bio about yourself." },
  {
    title: "Skills & Interests",
    description: "What are you good at, and what excites you?",
  },
  {
    title: "Links",
    description: "Connect your socials and share your work.",
  },
] as const;

const DEBOUNCE_MS = 800;

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && input === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 pr-1 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={placeholder}
      />
    </div>
  );
}

function SaveIndicator({
  status,
  lastSavedAt,
}: {
  status: SaveStatus;
  lastSavedAt: Date | null;
}) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {status === "saving" && (
        <>
          <Loader2 className="size-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="size-3 text-emerald-500" />
          <span>
            Last saved{" "}
            {lastSavedAt ? `at ${formatTime(lastSavedAt)}` : "just now"}
          </span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="size-3 text-destructive" />
          <span className="text-destructive">Failed to save</span>
        </>
      )}
      {status === "idle" && lastSavedAt && (
        <>
          <Check className="size-3 text-muted-foreground/60" />
          <span>Last saved at {formatTime(lastSavedAt)}</span>
        </>
      )}
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-all
        ${
          selected
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
        }
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  );
}

// TODO: Once applications are implemented, disable this step (make it read-only)
// when the user has already submitted an application. The selected role and education
// level should be locked in after submission. Additionally, different application forms
// should be rendered based on the selected role (attendee vs mentor vs volunteer).
function StepRoleAndEducation({
  role,
  educationLevel,
  onChangeRole,
  onChangeEducationLevel,
}: {
  role: ParticipantRole | "";
  educationLevel: EducationLevel | "";
  onChangeRole: (role: ParticipantRole) => void;
  onChangeEducationLevel: (level: EducationLevel) => void;
}) {
  const isUniversityAttendee = role === "attendee" && educationLevel === "university";
  const isHighSchoolMentor = role === "mentor" && educationLevel === "high_school";
  const isInvalidCombo = isUniversityAttendee || isHighSchoolMentor;

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-3 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          I want to apply as
        </label>
        <div className="flex gap-2">
          <OptionButton
            selected={role === "attendee"}
            onClick={() => onChangeRole("attendee")}
            disabled={educationLevel === "university"}
          >
            Attendee
          </OptionButton>
          <OptionButton
            selected={role === "mentor"}
            onClick={() => onChangeRole("mentor")}
            disabled={educationLevel === "high_school"}
          >
            Mentor
          </OptionButton>
          <OptionButton
            selected={role === "volunteer"}
            onClick={() => onChangeRole("volunteer")}
          >
            Volunteer
          </OptionButton>
        </div>
      </div>

      <div>
        <label className="mb-3 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          I am in
        </label>
        <div className="flex gap-2">
          <OptionButton
            selected={educationLevel === "high_school"}
            onClick={() => onChangeEducationLevel("high_school")}
          >
            High School
          </OptionButton>
          <OptionButton
            selected={educationLevel === "university"}
            onClick={() => onChangeEducationLevel("university")}
          >
            University
          </OptionButton>
        </div>
      </div>

      <AnimatePresence>
        {isInvalidCombo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <div className="text-sm text-amber-200">
                {isUniversityAttendee && (
                  <>
                    <p className="font-medium">
                      hack4us is a high school hackathon.
                    </p>
                    <p className="mt-1 text-amber-200/80">
                      University students are welcome to apply as a{" "}
                      <button
                        type="button"
                        onClick={() => onChangeRole("mentor")}
                        className="font-semibold underline underline-offset-2 hover:text-amber-100 transition-colors"
                      >
                        mentor
                      </button>{" "}
                      or{" "}
                      <button
                        type="button"
                        onClick={() => onChangeRole("volunteer")}
                        className="font-semibold underline underline-offset-2 hover:text-amber-100 transition-colors"
                      >
                        volunteer
                      </button>
                      !
                    </p>
                  </>
                )}
                {isHighSchoolMentor && (
                  <>
                    <p className="font-medium">
                      Mentors must be university students or older.
                    </p>
                    <p className="mt-1 text-amber-200/80">
                      High school students can apply as an{" "}
                      <button
                        type="button"
                        onClick={() => onChangeRole("attendee")}
                        className="font-semibold underline underline-offset-2 hover:text-amber-100 transition-colors"
                      >
                        attendee
                      </button>{" "}
                      or{" "}
                      <button
                        type="button"
                        onClick={() => onChangeRole("volunteer")}
                        className="font-semibold underline underline-offset-2 hover:text-amber-100 transition-colors"
                      >
                        volunteer
                      </button>
                      !
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepName({
  name,
  birthdate,
  onChangeName,
  onChangeBirthdate,
}: {
  name: string;
  birthdate: string;
  onChangeName: (name: string) => void;
  onChangeBirthdate: (birthdate: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          Full Name
        </label>
        <Input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Your full name"
          autoFocus
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          Date of Birth
        </label>
        <Input
          type="date"
          value={birthdate}
          onChange={(e) => onChangeBirthdate(e.target.value)}
        />
      </div>
    </div>
  );
}

function StepSchool({
  school,
  year,
  educationLevel,
  onChangeSchool,
  onChangeYear,
}: {
  school: string;
  year: string;
  educationLevel: EducationLevel | "";
  onChangeSchool: (v: string) => void;
  onChangeYear: (v: string) => void;
}) {
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
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          {isUni ? "University" : "School"}
        </label>
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
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          {isUni ? "Year of Study" : "Grade"}
        </label>
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

function StepBio({
  bio,
  onChange,
}: {
  bio: string;
  onChange: (bio: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          Bio
        </label>
        <Textarea
          value={bio}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tell us a bit about yourself..."
          className="min-h-32"
          autoFocus
        />
      </div>
    </div>
  );
}

function StepSkills({
  skills,
  interests,
  onChangeSkills,
  onChangeInterests,
}: {
  skills: string[];
  interests: string[];
  onChangeSkills: (v: string[]) => void;
  onChangeInterests: (v: string[]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          Skills
        </label>
        <p className="mb-2 text-xs text-muted-foreground">
          Press Enter to add a skill.
        </p>
        <TagInput
          value={skills}
          onChange={onChangeSkills}
          placeholder="e.g. React, Python, UI Design"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          Interests
        </label>
        <p className="mb-2 text-xs text-muted-foreground">
          Press Enter to add an interest.
        </p>
        <TagInput
          value={interests}
          onChange={onChangeInterests}
          placeholder="e.g. AI, Web3, Healthcare"
        />
      </div>
    </div>
  );
}

function StepLinks({
  links,
  onChange,
}: {
  links: ProfileFormData["links"];
  onChange: (links: ProfileFormData["links"]) => void;
}) {
  const updateField = (field: keyof Omit<typeof links, "external">, value: string) => {
    onChange({ ...links, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          GitHub
        </label>
        <Input
          value={links.github}
          onChange={(e) => updateField("github", e.target.value)}
          placeholder="https://github.com/username"
          autoFocus
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          LinkedIn
        </label>
        <Input
          value={links.linkedin}
          onChange={(e) => updateField("linkedin", e.target.value)}
          placeholder="https://linkedin.com/in/username"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          Twitter / X
        </label>
        <Input
          value={links.twitter}
          onChange={(e) => updateField("twitter", e.target.value)}
          placeholder="https://x.com/username"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          Instagram
        </label>
        <Input
          value={links.instagram}
          onChange={(e) => updateField("instagram", e.target.value)}
          placeholder="https://instagram.com/username"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          Other Links
        </label>
        <p className="mb-2 text-xs text-muted-foreground">
          Press Enter to add a link.
        </p>
        <TagInput
          value={links.external}
          onChange={(external) => onChange({ ...links, external })}
          placeholder="https://your-portfolio.com"
        />
      </div>
    </div>
  );
}

function StepIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full rounded-full bg-primary"
        animate={{ width: `${((current + 1) / total) * 100}%` }}
        transition={{ type: "spring", stiffness: 180, damping: 28 }}
      />
    </div>
  );
}

const DEFAULT_FORM_DATA: ProfileFormData = {
  role: "",
  educationLevel: "",
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

export default function ProfilePage() {
  const session = authClient.useSession();
  const profileResult = useQuery(api.fn.profile.getMyProfile, {});
  const updateProfile = useMutation(api.fn.profile.updateMyProfile);
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<ProfileFormData>(DEFAULT_FORM_DATA);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Track whether the initial data has loaded so we can pre-fill
  const hasPreFilled = useRef(false);

  // profileResult is undefined while loading, { data: profile | null } once resolved
  const isLoading = session.isPending || !profileResult;

  // Pre-fill form when data loads
  useEffect(() => {
    if (hasPreFilled.current) return;
    if (isLoading) return;

    const user = session.data?.user;
    const profile = profileResult.data;

    hasPreFilled.current = true;

    const initialData: ProfileFormData = {
      role: (profile?.role === "attendee" || profile?.role === "mentor" || profile?.role === "volunteer")
        ? profile.role
        : "",
      educationLevel: profile?.educationLevel || "",
      name: user?.name || "",
      birthdate: profile?.birthdate || "",
      school: profile?.school || "",
      year: profile?.year || "",
      bio: profile?.bio || "",
      skills: profile?.skills || [],
      interests: profile?.interests || [],
      links: {
        instagram: profile?.links?.instagram || "",
        twitter: profile?.links?.twitter || "",
        linkedin: profile?.links?.linkedin || "",
        github: profile?.links?.github || "",
        external: profile?.links?.external || [],
      },
    };

    setFormData(initialData);
    setInitialized(true);
  }, [isLoading, session.data?.user, profileResult]);

  const saveNameToAuth = useCallback(
    async (name: string) => {
      if (!name.trim()) return;
      setSaveStatus("saving");
      try {
        await authClient.updateUser({ name: name.trim() });
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        setSaveStatus("error");
      }
    },
    []
  );

  const saveProfileToConvex = useCallback(
    async (data: Partial<Omit<ProfileFormData, "name">>) => {
      setSaveStatus("saving");
      try {
        const args: Record<string, unknown> = {};

        if ("role" in data && data.role) args.role = data.role;
        if ("educationLevel" in data && data.educationLevel) args.educationLevel = data.educationLevel;
        if ("birthdate" in data) args.birthdate = data.birthdate;
        if ("school" in data) args.school = data.school;
        if ("year" in data) args.year = data.year;
        if ("bio" in data) args.bio = data.bio;
        if ("skills" in data) args.skills = data.skills;
        if ("interests" in data) args.interests = data.interests;
        if ("links" in data && data.links) {
          args.links = {
            instagram: data.links.instagram || undefined,
            twitter: data.links.twitter || undefined,
            linkedin: data.links.linkedin || undefined,
            github: data.links.github || undefined,
            external: data.links.external || [],
          };
        }

        await updateProfile(args);
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        setSaveStatus("error");
      }
    },
    [updateProfile]
  );

  const debouncedSaveName = useDebouncedCallback(saveNameToAuth, DEBOUNCE_MS);
  const debouncedSaveProfile = useDebouncedCallback(
    saveProfileToConvex,
    DEBOUNCE_MS
  );

  const updateName = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
    debouncedSaveName(name);
  };

  const updateBirthdate = (birthdate: string) => {
    setFormData((prev) => ({ ...prev, birthdate }));
    // Date picker is a discrete selection -- save immediately
    saveProfileToConvex({ birthdate });
  };

  const updateRole = (role: ParticipantRole) => {
    setFormData((prev) => ({ ...prev, role }));
    // Discrete selection -- save immediately
    saveProfileToConvex({ role });
  };

  const updateEducationLevel = (educationLevel: EducationLevel) => {
    setFormData((prev) => ({ ...prev, educationLevel }));
    // Discrete selection -- save immediately
    saveProfileToConvex({ educationLevel });
  };

  const updateSchool = (school: string) => {
    setFormData((prev) => {
      debouncedSaveProfile({ school, year: prev.year });
      return { ...prev, school };
    });
  };

  const updateYear = (year: string) => {
    setFormData((prev) => {
      debouncedSaveProfile({ school: prev.school, year });
      return { ...prev, year };
    });
  };

  const updateBio = (bio: string) => {
    setFormData((prev) => ({ ...prev, bio }));
    debouncedSaveProfile({ bio });
  };

  const updateSkills = (skills: string[]) => {
    setFormData((prev) => ({ ...prev, skills }));
    // Tag add/remove is a discrete action -- save immediately
    saveProfileToConvex({ skills });
  };

  const updateInterests = (interests: string[]) => {
    setFormData((prev) => ({ ...prev, interests }));
    saveProfileToConvex({ interests });
  };

  const updateLinks = (links: ProfileFormData["links"]) => {
    setFormData((prev) => ({ ...prev, links }));
    debouncedSaveProfile({ links });
  };

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  if (!initialized) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="border border-border bg-card p-8 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    );
  }

  const isRoleEducationValid =
    !!formData.role &&
    !!formData.educationLevel &&
    !(formData.role === "attendee" && formData.educationLevel === "university") &&
    !(formData.role === "mentor" && formData.educationLevel === "high_school");

  const isFormComplete =
    isRoleEducationValid &&
    formData.name.trim().length > 0 &&
    formData.birthdate.length > 0 &&
    formData.school.trim().length > 0 &&
    formData.year.length > 0 &&
    formData.bio.trim().length > 0;

  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 32 : -32,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 280, damping: 28 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -32 : 32,
      opacity: 0,
      transition: { duration: 0.15 },
    }),
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight uppercase">
          Profile
        </h1>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            className="mt-1 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {STEPS[step].description}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} total={STEPS.length} />

      {/* Form card */}
      <div className="border border-border bg-card p-8">
        <div className="mb-6 flex items-center justify-between overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.h2
              key={step}
              className="text-sm font-bold tracking-widest uppercase"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
            >
              {STEPS[step].title}
            </motion.h2>
          </AnimatePresence>
          <span className="text-xs text-muted-foreground">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Step content */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {step === 0 && (
                <StepRoleAndEducation
                  role={formData.role}
                  educationLevel={formData.educationLevel}
                  onChangeRole={updateRole}
                  onChangeEducationLevel={updateEducationLevel}
                />
              )}
              {step === 1 && (
                <StepName
                  name={formData.name}
                  birthdate={formData.birthdate}
                  onChangeName={updateName}
                  onChangeBirthdate={updateBirthdate}
                />
              )}
              {step === 2 && (
                <StepSchool
                  school={formData.school}
                  year={formData.year}
                  educationLevel={formData.educationLevel}
                  onChangeSchool={updateSchool}
                  onChangeYear={updateYear}
                />
              )}
              {step === 3 && <StepBio bio={formData.bio} onChange={updateBio} />}
              {step === 4 && (
                <StepSkills
                  skills={formData.skills}
                  interests={formData.interests}
                  onChangeSkills={updateSkills}
                  onChangeInterests={updateInterests}
                />
              )}
              {step === 5 && (
                <StepLinks links={formData.links} onChange={updateLinks} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            disabled={step === 0}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <AnimatePresence mode="wait">
            {step < STEPS.length - 1 ? (
              <motion.div
                key="next"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  size="sm"
                  onClick={goNext}
                  disabled={step === 0 && !isRoleEducationValid}
                >
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  size="sm"
                  disabled={!isFormComplete}
                  onClick={async () => {
                    await updateProfile({ completedOnboarding: true });
                    router.push("/dashboard");
                  }}
                >
                  <Check className="size-4" />
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Save status */}
      <div className="flex justify-end">
        <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
      </div>
    </div>
  );
}
