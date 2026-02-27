"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@/hooks/convex";
import { api } from "@convex/_generated/api";
import { CheckCircle2, CircleDashed, UserRound } from "lucide-react";


function getCompletion(profile: {
  role?: string;
  educationLevel?: string;
  birthdate?: string;
  school?: string;
  year?: string;
  bio?: string;
  completedOnboarding?: boolean;
} | null | undefined) {
  if (!profile) return { percent: 0, complete: false };

  const checks = [
    !!profile.role,
    !!profile.educationLevel,
    !!profile.birthdate,
    !!profile.school?.trim(),
    !!profile.year?.trim(),
    !!profile.bio?.trim(),
  ];
  const completed = checks.filter(Boolean).length;
  const percent = Math.round((completed / checks.length) * 100);
  return { percent, complete: completed === checks.length };
}

export function MyProfileWidget() {
  const profileResult = useQuery(api.fn.profile.getMyProfile, {});
  const profile = profileResult?.data;
  const { percent, complete } = getCompletion(profile);

  if (profileResult === undefined) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="h-6 w-36 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-56 animate-pulse rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const statusLabel = complete ? "Complete" : "In Progress";
  const statusClassName = complete
    ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
    : "bg-amber-500/15 text-amber-700 border-amber-500/30";
  
  const roleLabel = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Not set";

  return (
    <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 via-background to-background flex flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">My Profile</CardTitle>
          <Badge variant="outline" className={statusClassName}>
            {complete ? <CheckCircle2 className="size-3.5" /> : <CircleDashed className="size-3.5" />}
            {statusLabel}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Make sure your profile is complete and up to date.
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {percent < 100 ? (
          <div className="rounded-lg border bg-background/80 p-4">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
              <span>Profile completion</span>
              <span>{percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-background/80 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
              <p className="mt-1 text-sm font-semibold">{roleLabel}</p>
            </div>
            <div className="rounded-lg border bg-background/80 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">School</p>
              <p className="mt-1 text-sm font-semibold truncate">
                {profile?.school
                  ? profile.year
                    ? `${profile.school}, ${profile.year}`
                    : profile.school
                  : "Not set"}
              </p>
            </div>
          </div>
        )}

        {complete && profile?.bio && (
          <div className="rounded-lg border bg-background/80 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Bio</p>
            <p className="mt-1 text-sm line-clamp-2 font-semibold truncate">{profile.bio}</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserRound className="size-4" />
          {complete
            ? "Profile is complete and ready."
            : "Finish your profile to unlock the best dashboard experience."}
        </div>
      </CardContent>

      <CardFooter className="justify-end border-t mt-auto">
        <Button asChild variant={complete ? "outline" : "default"} className="w-full">
          <Link href="/profile">{complete ? "View Profile" : "Complete Profile"}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
