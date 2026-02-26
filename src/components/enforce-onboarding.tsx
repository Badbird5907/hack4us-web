"use client";

import { useQuery } from "@/hooks/convex";
import { api } from "../../convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export const EnforceOnboarding = () => {
  const profileResult = useQuery(api.fn.profile.getMyProfile, {});
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (profileResult && !profileResult.data?.completedOnboarding && pathname !== "/profile") {
      router.push("/profile");
    }
  }, [profileResult, router, pathname]);
  return null;
};