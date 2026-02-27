"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useQuery } from "@/hooks/convex";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import {
  DEFAULT_FORM_DATA,
  type ProfileFormData,
  type ParticipantRole,
  type EducationLevel,
} from "@/components/profile";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
type ProfileUpdatePayload = Partial<Omit<ProfileFormData, "name">>;

const DEBOUNCE_MS = 800;

function buildInitialFormData(
  name: string | undefined,
  profile: {
    role?: string;
    educationLevel?: string;
    birthdate?: string;
    school?: string;
    year?: string;
    bio?: string;
    skills?: string[];
    interests?: string[];
    links?: {
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      github?: string;
      external?: string[];
    };
  } | null | undefined
): ProfileFormData {
  return {
    role:
      profile?.role === "attendee" ||
      profile?.role === "mentor" ||
      profile?.role === "volunteer"
        ? profile.role
        : "",
    educationLevel:
      profile?.educationLevel === "high_school" ||
      profile?.educationLevel === "university"
        ? profile.educationLevel
        : "",
    name: name || "",
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
}

function serializeProfileFormData(data: ProfileFormData) {
  return JSON.stringify({
    ...data,
    skills: [...data.skills].sort(),
    interests: [...data.interests].sort(),
    links: {
      ...data.links,
      external: [...data.links.external].sort(),
    },
  });
}

function buildProfileUpdateArgs(
  data: ProfileUpdatePayload
): Record<string, unknown> {
  const args: Record<string, unknown> = {};

  if ("role" in data && data.role) args.role = data.role;
  if ("educationLevel" in data && data.educationLevel) {
    args.educationLevel = data.educationLevel;
  }
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

  return args;
}

function getIsRoleEducationValid(data: ProfileFormData) {
  return (
    !!data.role &&
    !!data.educationLevel &&
    !(data.role === "attendee" && data.educationLevel === "university") &&
    !(data.role === "mentor" && data.educationLevel === "high_school")
  );
}

function getIsFormComplete(data: ProfileFormData) {
  return (
    getIsRoleEducationValid(data) &&
    data.name.trim().length > 0 &&
    data.birthdate.length > 0 &&
    data.school.trim().length > 0 &&
    data.year.length > 0 &&
    data.bio.trim().length > 0
  );
}

export function useProfileForm() {
  const session = authClient.useSession();
  const profileResult = useQuery(api.fn.profile.getMyProfile, {});
  const applicationResult = useQuery(api.fn.application.getMyApplication, {});
  const updateProfile = useMutation(api.fn.profile.updateMyProfile);
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<ProfileFormData>(DEFAULT_FORM_DATA);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [pendingRole, setPendingRole] = useState<ParticipantRole | null>(null);
  const [hasExternalEdit, setHasExternalEdit] = useState(false);

  const hasPreFilled = useRef(false);
  const lastSyncedProfileRef = useRef("");
  const latestFormDataRef = useRef<ProfileFormData>(DEFAULT_FORM_DATA);

  const isLoading = session.isPending || !profileResult;
  const profile = profileResult?.data;
  const existingApplication = applicationResult?.application;
  const isRoleEducationLocked =
    !!existingApplication && existingApplication.status !== "draft";

  useEffect(() => {
    latestFormDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    if (hasPreFilled.current || isLoading) return;

    hasPreFilled.current = true;
    const initialData = buildInitialFormData(session.data?.user?.name, profile);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(initialData);
    latestFormDataRef.current = initialData;
    lastSyncedProfileRef.current = serializeProfileFormData(initialData);
    setInitialized(true);
  }, [isLoading, session.data?.user?.name, profile]);

  useEffect(() => {
    if (!initialized) return;
    const remoteData = buildInitialFormData(session.data?.user?.name, profile);
    const remoteSerialized = serializeProfileFormData(remoteData);
    if (!lastSyncedProfileRef.current) {
      lastSyncedProfileRef.current = remoteSerialized;
      return;
    }
    if (remoteSerialized !== lastSyncedProfileRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasExternalEdit(true);
    }
  }, [initialized, profile, session.data?.user?.name]);

  const saveNameToAuth = useCallback(async (name: string) => {
    if (!name.trim() || hasExternalEdit) return;
    setSaveStatus("saving");
    const previousSynced = lastSyncedProfileRef.current;
    const nextState = { ...latestFormDataRef.current, name };
    const nextSynced = serializeProfileFormData(nextState);
    lastSyncedProfileRef.current = nextSynced;
    try {
      await authClient.updateUser({ name: name.trim() });
      lastSyncedProfileRef.current = nextSynced;
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } catch {
      lastSyncedProfileRef.current = previousSynced;
      setSaveStatus("error");
    }
  }, [hasExternalEdit]);

  const saveProfileToConvex = useCallback(
    async (data: ProfileUpdatePayload, nextState?: ProfileFormData) => {
      if (hasExternalEdit) return;
      setSaveStatus("saving");
      const previousSynced = lastSyncedProfileRef.current;
      const syncedState = nextState ?? latestFormDataRef.current;
      const nextSynced = serializeProfileFormData(syncedState);
      lastSyncedProfileRef.current = nextSynced;
      try {
        await updateProfile(buildProfileUpdateArgs(data));
        lastSyncedProfileRef.current = nextSynced;
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        lastSyncedProfileRef.current = previousSynced;
        setSaveStatus("error");
      }
    },
    [hasExternalEdit, updateProfile]
  );

  const debouncedSaveName = useDebouncedCallback(saveNameToAuth, DEBOUNCE_MS);
  const debouncedSaveProfile = useDebouncedCallback(
    saveProfileToConvex,
    DEBOUNCE_MS
  );

  const updateProfileField = useCallback(
    <K extends keyof Omit<ProfileFormData, "name">>(
      key: K,
      value: ProfileFormData[K],
      mode: "immediate" | "debounced",
      getPayload?: (nextState: ProfileFormData) => ProfileUpdatePayload
    ) => {
      if (hasExternalEdit) return;
      setFormData((prev) => {
        const nextState = { ...prev, [key]: value };
        const payload = getPayload
          ? getPayload(nextState)
          : ({ [key]: value } as ProfileUpdatePayload);

        if (mode === "immediate") {
          void saveProfileToConvex(payload, nextState);
        } else {
          debouncedSaveProfile(payload, nextState);
        }

        return nextState;
      });
    },
    [debouncedSaveProfile, hasExternalEdit, saveProfileToConvex]
  );

  const updateName = useCallback(
    (name: string) => {
      if (hasExternalEdit) return;
      setFormData((prev) => ({ ...prev, name }));
      debouncedSaveName(name);
    },
    [debouncedSaveName, hasExternalEdit]
  );

  const updateBirthdate = useCallback(
    (birthdate: string) => {
      updateProfileField("birthdate", birthdate, "immediate");
    },
    [updateProfileField]
  );

  const updateRole = useCallback(
    (role: ParticipantRole) => {
      if (hasExternalEdit) return;
      if (isRoleEducationLocked) return;
      if (existingApplication && existingApplication.type !== role) {
        setPendingRole(role);
        return;
      }
      updateProfileField("role", role, "immediate");
    },
    [existingApplication, hasExternalEdit, isRoleEducationLocked, updateProfileField]
  );

  const confirmRoleSwitch = useCallback(() => {
    if (hasExternalEdit) return;
    if (!pendingRole) return;
    updateProfileField("role", pendingRole, "immediate");
    setPendingRole(null);
  }, [hasExternalEdit, pendingRole, updateProfileField]);

  const updateEducationLevel = useCallback(
    (educationLevel: EducationLevel) => {
      if (isRoleEducationLocked) return;
      updateProfileField("educationLevel", educationLevel, "immediate");
    },
    [isRoleEducationLocked, updateProfileField]
  );

  const updateSchool = useCallback(
    (school: string) => {
      updateProfileField("school", school, "debounced", (nextState) => ({
        school: nextState.school,
        year: nextState.year,
      }));
    },
    [updateProfileField]
  );

  const updateYear = useCallback(
    (year: string) => {
      updateProfileField("year", year, "debounced", (nextState) => ({
        school: nextState.school,
        year: nextState.year,
      }));
    },
    [updateProfileField]
  );

  const updateBio = useCallback(
    (bio: string) => {
      updateProfileField("bio", bio, "debounced");
    },
    [updateProfileField]
  );

  const updateSkills = useCallback(
    (skills: string[]) => {
      updateProfileField("skills", skills, "immediate");
    },
    [updateProfileField]
  );

  const updateInterests = useCallback(
    (interests: string[]) => {
      updateProfileField("interests", interests, "immediate");
    },
    [updateProfileField]
  );

  const updateLinks = useCallback(
    (links: ProfileFormData["links"]) => {
      updateProfileField("links", links, "debounced");
    },
    [updateProfileField]
  );

  const goNext = useCallback((stepsLength: number) => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, stepsLength - 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const completeOnboarding = useCallback(async () => {
    if (hasExternalEdit) return;
    await updateProfile({ completedOnboarding: true });
    router.push("/dashboard");
  }, [hasExternalEdit, router, updateProfile]);

  const isRoleEducationValid = useMemo(
    () => getIsRoleEducationValid(formData),
    [formData]
  );
  const isFormComplete = useMemo(() => getIsFormComplete(formData), [formData]);

  return {
    // State
    step,
    direction,
    formData,
    initialized,
    saveStatus,
    lastSavedAt,
    pendingRole,
    existingApplication,
    isRoleEducationLocked,
    hasExternalEdit,
    // Derived
    isRoleEducationValid,
    isFormComplete,
    // Handlers
    updateRole,
    updateEducationLevel,
    updateName,
    updateBirthdate,
    updateSchool,
    updateYear,
    updateBio,
    updateSkills,
    updateInterests,
    updateLinks,
    goNext,
    goBack,
    completeOnboarding,
    confirmRoleSwitch,
    setPendingRole,
  };
}
