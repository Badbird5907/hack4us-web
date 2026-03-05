"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@/hooks/convex";
import { applicationTypes } from "@/lib/questions";
import { api } from "@convex/_generated/api";
import { CheckCircle2, Clock3, FileText, Hourglass, XCircle } from "lucide-react";

const statuses = {
  draft: {
    label: "Draft",
    badgeClassName: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    summary: "You have an in-progress application. Continue where you left off.",
    detail: "Complete all required sections, then submit to be reviewed.",
    icon: Clock3,
  },
  submitted: {
    label: "Under Review",
    badgeClassName: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    summary: "Your application has been submitted and is now under review.",
    detail: "We will notify you once a decision is available.",
    icon: FileText,
  },
  accepted: {
    label: "Accepted",
    badgeClassName: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    summary: "Great news! Your application has been accepted.",
    detail: "Check your email and dashboard for next-step instructions.",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    badgeClassName: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    summary: "Your application has been reviewed and was not accepted.",
    detail: "If you need help or have questions, contact the organizing team.",
    icon: XCircle,
  },
  waitlist: {
    label: "Waitlisted",
    badgeClassName: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    summary: "You have been placed on the waitlist.",
    detail: "We will reach out if a spot opens up. Keep an eye on your email.",
    icon: Hourglass,
  },
} as const;

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDraftCompletion(application: {
  type: keyof typeof applicationTypes;
  answers?: Record<string, string>;
}): number {
  const config = applicationTypes[application.type];
  if (!config) return 0;

  const requiredQuestions = Object.values(config.questions).filter(
    (question) => question.field.required
  );
  if (requiredQuestions.length === 0) return 100;

  const answers = application.answers ?? {};
  const completedCount = requiredQuestions.filter((question) => {
    const value = answers[question.id];
    return !!value && value !== "" && value !== "[]" && value !== "null";
  }).length;

  return Math.round((completedCount / requiredQuestions.length) * 100);
}

export function MyApplicationWidget() {
  const applicationResult = useQuery(api.fn.application.getMyApplication, {});
  const applicationsState = useQuery(api.fn.siteSettings.getApplicationsState, {}) ?? "open";
  const application = applicationResult?.application;
  const profileRole = applicationResult?.profileRole;
  const applicationsUnavailable = applicationsState !== "open";
  const applicationsMessage =
    applicationsState === "ended"
      ? "Applications have ended."
      : "Applications will open soon.";

  if (applicationResult === undefined) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }
  
  if (!application) {
    return (
      <Card className="self-start overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-background">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl">My Application</CardTitle>
          <p className="text-sm text-muted-foreground">
            You have not started an application yet
            {profileRole ? ` for ${profileRole.charAt(0).toUpperCase() + profileRole.slice(1)}` : ""}.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed bg-background/70 p-4 text-sm text-muted-foreground">
            {applicationsUnavailable
              ? applicationsMessage
              : "Start your application to track status updates and review progress here."}
          </div>
        </CardContent>
        <CardFooter>
          {applicationsUnavailable ? (
            <Button disabled className="w-full">
              Applications Unavailable
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/apply">Start Application</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  const effectiveStatus: keyof typeof statuses =
    application.decision?.status ?? application.status;
  const status = statuses[effectiveStatus];
  const StatusIcon = status.icon;
  const draftCompletion = application.status === "draft" ? getDraftCompletion(application) : null;
  const submissionDate =
    application.submittedAt ??
    (application.status === "draft" ? application._creationTime : undefined);

  return (
    <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 via-background to-background">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">My Application</CardTitle>
          <Badge variant="outline" className={status.badgeClassName}>
            <StatusIcon className="size-3.5" />
            {status.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{status.summary}</p>
        {applicationsUnavailable && (
          <div className="rounded-lg border border-border bg-background/80 p-3 text-xs text-muted-foreground">
            {applicationsMessage}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 min-h-0 space-y-4">
        {application.status === "draft" ? (
          <div className="rounded-lg border bg-background/80 p-4">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
              <span>Application completion</span>
              <span>{draftCompletion}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${draftCompletion}%` }} />
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border bg-background/80 p-4">
          <p className="text-sm font-medium">{status.detail}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-background/80 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
            <p className="mt-1 text-sm font-semibold">
              {application.type.charAt(0).toUpperCase() + application.type.slice(1)}
            </p>
          </div>
          <div className="rounded-lg border bg-background/80 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {application.status === "draft" ? "Started" : "Submitted"}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {submissionDate ? formatDate(submissionDate) : "Not available"}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">You will be notified via email when your application is reviewed.</p>
      </CardContent>
      <CardFooter className="mt-auto justify-between gap-3 border-t">
        <Button
          asChild
          variant={application.status === "draft" && !applicationsUnavailable ? "default" : "outline"}
          className="w-full"
        >
          <Link href="/apply">
            {application.status === "draft" && !applicationsUnavailable
              ? "Continue Application"
              : "View Application"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 
