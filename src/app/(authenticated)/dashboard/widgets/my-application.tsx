"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@/hooks/convex";
import { api } from "@convex/_generated/api";
import { CheckCircle2, Clock3, FileText, XCircle } from "lucide-react";

const statuses = {
  draft: {
    label: "Draft",
    badgeClassName: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    summary: "You have an in-progress application. Continue where you left off.",
    detail: "Complete all required sections, then submit to be reviewed.",
    icon: Clock3,
  },
  submitted: {
    label: "Submitted",
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
} as const;

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MyApplicationWidget() {
  const applicationResult = useQuery(api.fn.application.getMyApplication, {});
  const application = applicationResult?.application;
  const profileRole = applicationResult?.profileRole;

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
            Start your application to track status updates and review progress here.
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/apply">Start Application</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const status = statuses[application.status];
  const StatusIcon = status.icon;
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
      </CardHeader>

      <CardContent className="flex-1 min-h-0 space-y-4">
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
        <Button asChild variant={application.status === "draft" ? "default" : "outline"} className="w-full">
          <Link href="/apply">
            {application.status === "draft" ? "Continue Application" : "View Application"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 